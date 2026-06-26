/**
 * interviewRoutes.js
 *
 * All interview-related HTTP routes.
 *
 * POST /api/interview/start      — Begin session, get intro question
 * POST /api/interview/respond    — Submit answer, get feedback + next question
 * POST /api/interview/finish     — End session, get final analysis
 * POST /api/interview/transcribe — Transcribe audio via Groq Whisper Large v3
 */

'use strict';

const express = require('express');
const router  = express.Router();
const multer  = require('multer');

const { cleanTranscript, generateIntro, evaluateAndQuestion, generateFinalAnalysis, transcribeAudio } = require('../services/groqService');
const { parseResume, simulateCodeRun, evaluateCodeSubmission } = require('../services/geminiService');
const { preClean }   = require('../utils/transcriptCleaner');
const { logger }     = require('../middleware/logger');
const pdfParse       = require('pdf-parse');
const mammoth        = require('mammoth');

// Multer — store uploaded audio in memory (max 10 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function validateBody(req, ...fields) {
  const missing = fields.filter(f => !req.body[f]);
  if (missing.length > 0) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }
}

function withTimeout(promise, ms = 15000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Request timed out')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/resume
// Accepts a PDF or DOCX file, parses text, extracts information using Gemini.
// Returns: { ok, data: { summary, skills, projects, education, certifications } }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/resume', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No resume file provided');
      err.status = 400;
      throw err;
    }

    logger.info('resume_upload_request', {
      reqId: req.reqId,
      filename: req.file.originalname,
      size: req.file.size,
      mime: req.file.mimetype,
    });

    let text = '';
    const mime = req.file.mimetype;

    if (mime === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      const parsed = await pdfParse(req.file.buffer);
      text = parsed.text;
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      req.file.originalname.toLowerCase().endsWith('.docx')
    ) {
      const parsed = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = parsed.value;
    } else {
      const err = new Error('Unsupported file format. Please upload a PDF or DOCX file.');
      err.status = 400;
      throw err;
    }

    if (!text || !text.trim()) {
      const err = new Error('Could not extract text from the uploaded file.');
      err.status = 400;
      throw err;
    }

    const data = await parseResume(text);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/transcribe
// Accepts audio file upload, transcribes via Groq Whisper Large v3.
// Returns: { ok, transcript }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/transcribe', upload.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No audio file provided');
      err.status = 400;
      throw err;
    }

    logger.info('transcribe_request', {
      reqId: req.reqId,
      size: req.file.size,
      mime: req.file.mimetype,
    });

    const transcript = await withTimeout(
      transcribeAudio(req.file.buffer, req.file.mimetype || 'audio/webm'),
      30000
    );

    logger.info('transcribe_success', { reqId: req.reqId, transcript });
    res.json({ ok: true, transcript });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/start
// Body: { role, level, resumeContext, interviewType }
// Returns: { ok, intro }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/start', async (req, res, next) => {
  try {
    validateBody(req, 'role', 'level');
    const { name, role, level, language, difficulty, resumeContext, interviewType } = req.body;

    const intro = await withTimeout(generateIntro({ name, role, level, language, difficulty, resumeContext, interviewType }));

    logger.info('interview_started', { reqId: req.reqId, name, role, level, interviewType });
    res.json({ ok: true, intro });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/respond
// Body: { role, level, rawTranscript, history, resumeContext, interviewType }
// Returns: { ok, feedback, question, fullResponse, cleanedTranscript }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/respond', async (req, res, next) => {
  try {
    validateBody(req, 'role', 'level', 'rawTranscript');
    const { role, level, language, difficulty, rawTranscript, history = [], resumeContext, interviewType } = req.body;

    // 1. Local pre-clean (zero latency)
    const { cleaned: preCleanedText, valid } = preClean(rawTranscript);

    if (!valid) {
      return res.json({
        ok: true,
        feedback: '',
        question: "I didn't quite catch that. Could you elaborate on your answer?",
        fullResponse: "I didn't quite catch that. Could you elaborate on your answer?",
        cleanedTranscript: preCleanedText,
      });
    }

    // 2. Groq deep-clean (best-effort, fallback to pre-cleaned text on error)
    let cleanedTranscript;
    try {
      cleanedTranscript = await withTimeout(cleanTranscript(preCleanedText), 8000);
    } catch (err) {
      logger.warn('groq_failed', { reqId: req.reqId, err: String(err) });
      cleanedTranscript = preCleanedText;
    }

    // 3. Groq evaluate + question
    const { feedback, question, fullResponse } = await withTimeout(
      evaluateAndQuestion({ role, level, language, difficulty, history, cleanedTranscript, resumeContext, interviewType }),
      20000
    );

    logger.info('interview_responded', { reqId: req.reqId, role, level });
    res.json({ ok: true, feedback, question, fullResponse, cleanedTranscript });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/finish
// Body: { role, level, history, resumeContext, interviewType }
// Returns: { ok, analysis }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/finish', async (req, res, next) => {
  try {
    validateBody(req, 'role', 'level');
    const { role, level, language, difficulty, history = [], resumeContext, interviewType } = req.body;

    const analysis = await withTimeout(
      generateFinalAnalysis({ role, level, language, difficulty, history, resumeContext, interviewType }),
      25000
    );

    logger.info('interview_finished', { reqId: req.reqId, role, level });
    res.json({ ok: true, analysis });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/run-code
// Body: { code, language, input }
// Returns: { ok, stdout, stderr, exitCode }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/run-code', async (req, res, next) => {
  try {
    validateBody(req, 'code', 'language');
    const { code, language, input } = req.body;

    const result = await withTimeout(simulateCodeRun(code, language, input), 15000);
    logger.info('code_executed', { reqId: req.reqId, language });
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/submit-code
// Body: { code, language, questionText, role, level, history, resumeContext, interviewType }
// Returns: { ok, evaluation, feedback, question, fullResponse }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/submit-code', async (req, res, next) => {
  try {
    validateBody(req, 'code', 'language', 'questionText', 'role', 'level');
    const { code, language, questionText, role, level, difficulty, history = [], resumeContext, interviewType } = req.body;

    // 1. Evaluate submission using Gemini
    const evaluation = await withTimeout(evaluateCodeSubmission(code, language, questionText), 15000);

    // 2. Synthesize a transcript message for conversation history
    const transcriptText = `[Candidate submitted code in ${language} for the question: "${questionText}". \nEvaluation details: \n- Correctness: ${evaluation.correctness}\n- Time Complexity: ${evaluation.timeComplexity}\n- Space Complexity: ${evaluation.spaceComplexity}\n- Edge Cases: ${evaluation.edgeCases}\n- Code Quality: ${evaluation.codeQuality}\n- Optimization: ${evaluation.optimization}\n- Feedback: ${evaluation.feedbackText}]`;

    // 3. Ask Groq to generate Smith's response to the code submission
    const { feedback, question, fullResponse } = await withTimeout(
      evaluateAndQuestion({ role, level, language, difficulty, history, cleanedTranscript: transcriptText, resumeContext, interviewType }),
      20000
    );

    logger.info('code_submitted_and_evaluated', { reqId: req.reqId, language });
    res.json({
      ok: true,
      evaluation,
      feedback,
      question,
      fullResponse
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
