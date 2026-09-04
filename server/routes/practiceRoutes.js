/**
 * practiceRoutes.js
 * 
 * Express routes for the DSA Coding Practice Bank.
 * Uses Neon PostgreSQL Database.
 */

'use strict';

const express = require('express');
const router = express.Router();
const { simulateCodeRun } = require('../services/geminiService');
const { logger } = require('../middleware/logger');
const { pool } = require('../config/neonDb');
const staticQuestions = require('../data/questionsData');

// Helper to resolve question by ID with fallback
async function getQuestionById(qId) {
  try {
    const { rows } = await pool.query(`
      SELECT 
        id as "questionId", 
        title, 
        category, 
        difficulty, 
        description, 
        sample_test_cases as "sampleTestCases", 
        hidden_test_cases as "hiddenTestCases",
        starter_code as "starterCode", 
        supported_languages as "supportedLanguages", 
        is_active as "isActive"
      FROM questions 
      WHERE id = $1
    `, [qId]);

    if (rows.length > 0) return rows[0];
  } catch (err) {
    logger.warn('db_fetch_fallback_to_static', { qId, err: err.message });
  }

  return staticQuestions.find(q => q.questionId === qId) || null;
}

// ── GET /api/practice/questions ───────────────────────────────────────────
router.get('/questions', async (req, res) => {
  try {
    const { difficulty = 'All', category = 'All', page = 1, limit = 100, search = '' } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 100);
    const offset = (p - 1) * l;

    try {
      let query = 'SELECT id as "questionId", title, category, difficulty, is_active as "isActive" FROM questions WHERE is_active = true';
      let countQuery = 'SELECT COUNT(*) FROM questions WHERE is_active = true';
      const params = [];
      
      if (category && category !== 'All') {
        params.push(category);
        query += ` AND category = $${params.length}`;
        countQuery += ` AND category = $${params.length}`;
      }

      if (difficulty && difficulty !== 'All') {
        params.push(difficulty);
        query += ` AND difficulty = $${params.length}`;
        countQuery += ` AND difficulty = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(category) LIKE $${params.length} OR CAST(id AS TEXT) LIKE $${params.length})`;
        countQuery += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(category) LIKE $${params.length} OR CAST(id AS TEXT) LIKE $${params.length})`;
      }

      query += ` ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      if (total > 0) {
        const questionsParams = [...params, l, offset];
        const { rows: questions } = await pool.query(query, questionsParams);

        return res.json({
          ok: true,
          questions,
          total,
          page: p,
          totalPages: Math.ceil(total / l)
        });
      }
    } catch (dbErr) {
      logger.warn('db_questions_fallback_to_static', { err: dbErr.message });
    }

    // Fallback to embedded 100 curated DSA questions
    let filtered = staticQuestions;
    if (category && category !== 'All') {
      filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }
    if (difficulty && difficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(term) ||
        q.category.toLowerCase().includes(term) ||
        String(q.questionId).includes(term)
      );
    }

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + l).map(q => ({
      questionId: q.questionId,
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      isActive: q.isActive
    }));

    res.json({
      ok: true,
      questions: paged,
      total,
      page: p,
      totalPages: Math.ceil(total / l)
    });
  } catch (err) {
    logger.error('practice_questions_fetch_error', { err: err.message });
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── GET /api/practice/questions/:questionId ───────────────────────────────
router.get('/questions/:questionId', async (req, res) => {
  try {
    const qId = parseInt(req.params.questionId);
    const question = await getQuestionById(qId);

    if (!question) {
      return res.status(404).json({ error: { message: 'Question not found' } });
    }

    res.json(question);
  } catch (err) {
    logger.error('practice_question_fetch_error', { err: err.message });
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── GET /api/practice/stats ───────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { session_id = '' } = req.query;
    let total = staticQuestions.length;
    let categories = Array.from(new Set(staticQuestions.map(q => q.category)));
    let solved = 0;

    try {
      const countRes = await pool.query('SELECT COUNT(*) FROM questions WHERE is_active = true');
      const dbTotal = parseInt(countRes.rows[0].count);
      if (dbTotal > 0) total = dbTotal;

      if (session_id) {
        const sessionRes = await pool.query('SELECT solved_questions FROM user_sessions WHERE session_id = $1', [session_id]);
        if (sessionRes.rows.length > 0) {
          solved = sessionRes.rows[0].solved_questions.length;
        }
      }

      const catRes = await pool.query('SELECT DISTINCT category FROM questions');
      if (catRes.rows.length > 0) categories = catRes.rows.map(r => r.category);
    } catch {
      // Fallback
    }

    res.json({
      total,
      solved,
      attempted: solved,
      remaining: Math.max(0, total - solved),
      categories
    });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── POST /api/practice/run ────────────────────────────────────────────────
router.post('/run', async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    const question = await getQuestionById(parseInt(questionId));

    if (!question) {
      return res.status(404).json({ error: { message: 'Question not found' } });
    }
    
    const sampleTestCases = question.sampleTestCases || [];

    const testPromises = sampleTestCases.map(async (tc, i) => {
      const startTime = Date.now();
      const execResult = await simulateCodeRun(code, language, tc.input);
      const executionTimeMs = Math.max(1, Date.now() - startTime);

      const cleanActual = (execResult.stdout || '').trim().replace(/\r\n/g, '\n');
      const cleanExpected = (tc.expectedOutput || '').trim().replace(/\r\n/g, '\n');
      const hasError = Boolean(execResult.stderr && execResult.stderr.trim().length > 0);

      const passed = !hasError && (
        cleanActual.toLowerCase() === cleanExpected.toLowerCase() ||
        cleanActual.replace(/\s+/g, '') === cleanExpected.replace(/\s+/g, '')
      );

      return {
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: execResult.stdout || (hasError ? execResult.stderr : '[No Output]'),
        stderr: execResult.stderr || '',
        hasError,
        passed,
        executionTimeMs
      };
    });

    const results = await Promise.all(testPromises);
    const hasCompilationError = results.some(r => r.hasError);
    const allPassed = results.every(r => r.passed);
    const verdict = allPassed ? 'Accepted' : (hasCompilationError ? 'Compilation / Runtime Error' : 'Wrong Answer');

    res.json({
      ok: true,
      verdict,
      allPassed,
      results
    });
  } catch (err) {
    logger.error('practice_run_error', { err: err.message });
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── POST /api/practice/submit ─────────────────────────────────────────────
router.post('/submit', async (req, res) => {
  try {
    const { questionId, code, language, sessionId = '' } = req.body;
    const question = await getQuestionById(parseInt(questionId));

    if (!question) {
      return res.status(404).json({ error: { message: 'Question not found' } });
    }

    const sampleTestCases = question.sampleTestCases || [];
    const hiddenTestCases = question.hiddenTestCases || [];
    const allTestCases = [...sampleTestCases, ...hiddenTestCases];

    const testPromises = allTestCases.map(async (tc, i) => {
      const startTime = Date.now();
      const execResult = await simulateCodeRun(code, language, tc.input);
      const executionTimeMs = Math.max(1, Date.now() - startTime);

      const cleanActual = (execResult.stdout || '').trim().replace(/\r\n/g, '\n');
      const cleanExpected = (tc.expectedOutput || '').trim().replace(/\r\n/g, '\n');
      const hasError = Boolean(execResult.stderr && execResult.stderr.trim().length > 0);

      const passed = !hasError && (
        cleanActual.toLowerCase() === cleanExpected.toLowerCase() ||
        cleanActual.replace(/\s+/g, '') === cleanExpected.replace(/\s+/g, '')
      );

      return {
        testCaseIndex: i + 1,
        input: i < sampleTestCases.length ? tc.input : '[Hidden Test Case]',
        expectedOutput: i < sampleTestCases.length ? tc.expectedOutput : '[Hidden]',
        actualOutput: i < sampleTestCases.length ? (execResult.stdout || (hasError ? execResult.stderr : '[No Output]')) : (passed ? '[Hidden - Passed]' : '[Hidden - Failed]'),
        stderr: execResult.stderr || '',
        hasError,
        passed,
        executionTimeMs
      };
    });

    const results = await Promise.all(testPromises);
    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === allTestCases.length;
    const hasCompilationError = results.some(r => r.hasError);
    const verdict = allPassed ? 'Accepted' : (hasCompilationError ? 'Compilation / Runtime Error' : 'Wrong Answer');

    if (allPassed && sessionId) {
      try {
        await pool.query(`
          INSERT INTO user_sessions (session_id, solved_questions)
          VALUES ($1, $2::jsonb)
          ON CONFLICT (session_id) DO UPDATE 
          SET solved_questions = (
            SELECT jsonb_agg(DISTINCT elem)
            FROM jsonb_array_elements(user_sessions.solved_questions || $2::jsonb) elem
          )
        `, [sessionId, JSON.stringify([parseInt(questionId)])]);
      } catch {
        // Continue
      }
    }

    res.json({
      ok: true,
      verdict,
      allPassed,
      passedCount,
      totalCount: allTestCases.length,
      message: allPassed ? 'Congratulations! All test cases passed.' : `Passed ${passedCount} of ${allTestCases.length} test cases.`,
      results
    });
  } catch (err) {
    logger.error('practice_submit_error', { err: err.message });
    res.status(500).json({ error: { message: err.message } });
  }
});

module.exports = router;
