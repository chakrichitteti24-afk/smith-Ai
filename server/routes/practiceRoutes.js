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

// ── GET /api/practice/questions ───────────────────────────────────────────
router.get('/questions', async (req, res) => {
  try {
    const { difficulty = 'Beginner', category = 'All', page = 1, limit = 20 } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 20);
    const offset = (p - 1) * l;

    let query = 'SELECT id as "questionId", title, category, difficulty, is_active as "isActive" FROM questions WHERE is_active = true';
    let countQuery = 'SELECT COUNT(*) FROM questions WHERE is_active = true';
    const params = [];
    
    if (category && category !== 'All') {
      params.push(category);
      query += ` AND category = $${params.length}`;
      countQuery += ` AND category = $${params.length}`;
    }

    query += ` ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const questionsParams = [...params, l, offset];
    const { rows: questions } = await pool.query(query, questionsParams);

    res.json({
      ok: true,
      questions,
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
    
    const { rows } = await pool.query(`
      SELECT 
        id as "questionId", 
        title, 
        category, 
        difficulty, 
        description, 
        sample_test_cases as "sampleTestCases", 
        starter_code as "starterCode", 
        supported_languages as "supportedLanguages", 
        is_active as "isActive"
      FROM questions 
      WHERE id = $1
    `, [qId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: { message: 'Question not found' } });
    }

    res.json(rows[0]);
  } catch (err) {
    logger.error('practice_question_fetch_error', { err: err.message });
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── GET /api/practice/stats ───────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { session_id = '' } = req.query;
    
    const countRes = await pool.query('SELECT COUNT(*) FROM questions WHERE is_active = true');
    const total = parseInt(countRes.rows[0].count);
    
    let solved = 0;
    if (session_id) {
      const sessionRes = await pool.query('SELECT solved_questions FROM user_sessions WHERE session_id = $1', [session_id]);
      if (sessionRes.rows.length > 0) {
        solved = sessionRes.rows[0].solved_questions.length;
      }
    }

    const catRes = await pool.query('SELECT DISTINCT category FROM questions');
    const categories = catRes.rows.map(r => r.category);

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
    
    const { rows } = await pool.query('SELECT sample_test_cases as "sampleTestCases" FROM questions WHERE id = $1', [parseInt(questionId)]);
    if (rows.length === 0) {
      return res.status(404).json({ error: { message: 'Question not found' } });
    }
    
    const sampleTestCases = rows[0].sampleTestCases;

    const testPromises = sampleTestCases.map(async (tc, i) => {
      const execResult = await simulateCodeRun(code, language, tc.input);
      const cleanActual = (execResult.stdout || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanExpected = (tc.expectedOutput || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const passed = (!execResult.stderr || execResult.stderr === '') && (cleanActual === cleanExpected || cleanActual.includes(cleanExpected));

      return {
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: execResult.stdout || execResult.stderr,
        passed,
        executionTimeMs: 45
      };
    });

    const results = await Promise.all(testPromises);

    res.json({
      ok: true,
      allPassed: results.every(r => r.passed),
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
    
    const { rows } = await pool.query('SELECT sample_test_cases as "sampleTestCases", hidden_test_cases as "hiddenTestCases" FROM questions WHERE id = $1', [parseInt(questionId)]);
    if (rows.length === 0) {
      return res.status(404).json({ error: { message: 'Question not found' } });
    }

    const { sampleTestCases, hiddenTestCases } = rows[0];
    const allTestCases = [...sampleTestCases, ...hiddenTestCases];

    const testPromises = allTestCases.map(async (tc, i) => {
      const execResult = await simulateCodeRun(code, language, tc.input);
      const cleanActual = (execResult.stdout || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanExpected = (tc.expectedOutput || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const passed = (!execResult.stderr || execResult.stderr === '') && (cleanActual === cleanExpected || cleanActual.includes(cleanExpected));

      return {
        testCaseIndex: i + 1,
        input: i < sampleTestCases.length ? tc.input : '[Hidden]',
        expectedOutput: i < sampleTestCases.length ? tc.expectedOutput : '[Hidden]',
        actualOutput: i < sampleTestCases.length ? (execResult.stdout || execResult.stderr) : (passed ? '[Hidden - Passed]' : '[Hidden - Failed]'),
        passed,
        executionTimeMs: 42
      };
    });

    const results = await Promise.all(testPromises);
    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === allTestCases.length;
    const verdict = allPassed ? 'Accepted' : 'Wrong Answer';

    if (allPassed && sessionId) {
      await pool.query(`
        INSERT INTO user_sessions (session_id, solved_questions)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (session_id) DO UPDATE 
        SET solved_questions = (
          SELECT jsonb_agg(DISTINCT elem)
          FROM jsonb_array_elements(user_sessions.solved_questions || $2::jsonb) elem
        )
      `, [sessionId, JSON.stringify([parseInt(questionId)])]);
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
