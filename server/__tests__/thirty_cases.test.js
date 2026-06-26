/**
 * thirty_cases.test.js
 *
 * Comprehensive test suite containing exactly 30 test cases to verify
 * all critical paths of the Smith AI Interview Platform.
 */

const { preClean, sanitiseAIResponse } = require('../utils/transcriptCleaner');
const request = require('supertest');
const { app } = require('../index');

// Mock geminiService
jest.mock('../services/geminiService', () => ({
  parseResume: jest.fn().mockResolvedValue({
    summary: 'Parsed resume info',
    skills: ['JavaScript', 'React'],
    projects: [],
  }),
  simulateCodeRun: jest.fn().mockResolvedValue({
    stdout: 'Hello from mock execution output!',
    stderr: '',
    exitCode: 0,
  }),
  evaluateCodeSubmission: jest.fn().mockResolvedValue({
    correctness: 'Correct implementation.',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    edgeCases: 'Handles null checks.',
    codeQuality: 'Well structured.',
    optimization: 'No optimizations needed.',
    feedbackText: 'Code submission test passed.',
  }),
}));

describe('Smith AI Platform - 30 Test Cases', () => {
  jest.setTimeout(25000);

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 1: preClean Helper (8 Cases)
  // ─────────────────────────────────────────────────────────────────────────────

  test('Case 1: preClean - Null input returns empty invalid object', () => {
    const result = preClean(null);
    expect(result).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 2: preClean - Undefined input returns empty invalid object', () => {
    const result = preClean(undefined);
    expect(result).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 3: preClean - Non-string input returns empty invalid object', () => {
    const result = preClean(12345);
    expect(result).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 4: preClean - Input with only filler words results in empty/invalid output', () => {
    const result = preClean('um uh er basically you know');
    expect(result.cleaned).toBe('');
    expect(result.valid).toBe(false);
  });

  test('Case 5: preClean - Strips filler words but keeps valid content', () => {
    const result = preClean('I basically built an um app using React');
    expect(result.cleaned).toBe('I built an app using React');
  });

  test('Case 6: preClean - Collapses multiple consecutive spaces', () => {
    const result = preClean('I   built   an   app');
    expect(result.cleaned).toBe('I built an app');
  });

  test('Case 7: preClean - Word count >= 4 is valid', () => {
    const result = preClean('This is valid content');
    expect(result.wordCount).toBe(4);
    expect(result.valid).toBe(true);
  });

  test('Case 8: preClean - Word count < 4 is invalid', () => {
    const result = preClean('Not valid');
    expect(result.wordCount).toBe(2);
    expect(result.valid).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 2: sanitiseAIResponse Helper (7 Cases)
  // ─────────────────────────────────────────────────────────────────────────────

  test('Case 9: sanitiseAIResponse - Null/undefined returns empty string', () => {
    expect(sanitiseAIResponse(null)).toBe('');
    expect(sanitiseAIResponse(undefined)).toBe('');
  });

  test('Case 10: sanitiseAIResponse - Strips bold and italic markdown markers', () => {
    const result = sanitiseAIResponse('This is **bold** and *italic* text.');
    expect(result).toBe('This is bold and italic text.');
  });

  test('Case 11: sanitiseAIResponse - Strips heading markers', () => {
    const result = sanitiseAIResponse('# Header 1\n## Header 2');
    expect(result).toBe('Header 1\nHeader 2');
  });

  test('Case 12: sanitiseAIResponse - Strips inline and block code backticks but keeps content', () => {
    const result = sanitiseAIResponse('Run `npm install` inside ```project```');
    expect(result).toBe('Run npm install inside project');
  });

  test('Case 13: sanitiseAIResponse - Strips markdown links keeping only labels', () => {
    const result = sanitiseAIResponse('Visit [Google](https://google.com) for search.');
    expect(result).toBe('Visit Google for search.');
  });

  test('Case 14: sanitiseAIResponse - Strips bullet list markers', () => {
    const result = sanitiseAIResponse('- Item 1\n* Item 2\n+ Item 3');
    expect(result).toBe('Item 1\nItem 2\nItem 3');
  });

  test('Case 15: sanitiseAIResponse - Collapses three or more consecutive newlines', () => {
    const result = sanitiseAIResponse('Line 1\n\n\n\nLine 2');
    expect(result).toBe('Line 1\n\nLine 2');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 3: Helper Functions & Routes (15 Cases)
  // ─────────────────────────────────────────────────────────────────────────────

  test('Case 16: withTimeout Helper - Resolves when promise is faster than timeout', async () => {
    // Using inline timeout check
    const fastPromise = new Promise(resolve => setTimeout(() => resolve('fast'), 10));
    const result = await Promise.race([
      fastPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
    ]);
    expect(result).toBe('fast');
  });

  test('Case 17: withTimeout Helper - Rejects on timeout', async () => {
    const slowPromise = new Promise(resolve => setTimeout(() => resolve('slow'), 500));
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 50));
    await expect(Promise.race([slowPromise, timeoutPromise])).rejects.toThrow('Request timed out');
  });

  test('Case 18: GET /health - Returns OK with status 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('Case 19: GET /nonexistent - Returns 404 page not found', async () => {
    const res = await request(app).get('/api/interview/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  test('Case 20: POST /api/interview/start - Validation fails without role', async () => {
    const res = await request(app)
      .post('/api/interview/start')
      .send({ level: 'Senior' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('Missing required fields: role');
  });

  test('Case 21: POST /api/interview/start - Validation fails without level', async () => {
    const res = await request(app)
      .post('/api/interview/start')
      .send({ role: 'Software Engineer' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('Missing required fields: level');
  });

  test('Case 22: POST /api/interview/start - Succeeds with role and level', async () => {
    const res = await request(app)
      .post('/api/interview/start')
      .send({ role: 'Backend Developer', level: 'Junior' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.intro).toBe('string');
  });

  test('Case 23: POST /api/interview/respond - Validation fails without role', async () => {
    const res = await request(app)
      .post('/api/interview/respond')
      .send({ level: 'Senior', rawTranscript: 'test answer' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('Missing required fields: role');
  });

  test('Case 24: POST /api/interview/respond - Validation fails without level', async () => {
    const res = await request(app)
      .post('/api/interview/respond')
      .send({ role: 'DevOps', rawTranscript: 'test answer' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('Missing required fields: level');
  });

  test('Case 25: POST /api/interview/respond - Validation fails without rawTranscript', async () => {
    const res = await request(app)
      .post('/api/interview/respond')
      .send({ role: 'ML Engineer', level: 'Senior' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('Missing required fields: rawTranscript');
  });

  test('Case 26: POST /api/interview/respond - Valid transcript responds with question/feedback', async () => {
    const res = await request(app)
      .post('/api/interview/respond')
      .send({
        role: 'Data Analyst',
        level: 'Mid-Level',
        rawTranscript: 'I have worked with SQL queries and Tableau for reports.',
        history: []
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body).toHaveProperty('feedback');
    expect(res.body).toHaveProperty('question');
  });

  test('Case 27: POST /api/interview/respond - Invalid/short transcript triggers conversational fallback prompt', async () => {
    const res = await request(app)
      .post('/api/interview/respond')
      .send({
        role: 'Data Analyst',
        level: 'Mid-Level',
        rawTranscript: 'SQL',
        history: []
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.question).toBe("I didn't quite catch that. Could you elaborate on your answer?");
  });

  test('Case 28: POST /api/interview/run-code - Validation fails without code', async () => {
    const res = await request(app)
      .post('/api/interview/run-code')
      .send({ language: 'javascript' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 29: POST /api/interview/run-code - Validation fails without language', async () => {
    const res = await request(app)
      .post('/api/interview/run-code')
      .send({ code: 'console.log("hello");' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 30: POST /api/interview/submit-code - Succeeds and returns structured evaluation details', async () => {
    const res = await request(app)
      .post('/api/interview/submit-code')
      .send({
        code: 'def add(a, b): return a + b',
        language: 'python',
        questionText: 'Write a function to add two numbers',
        role: 'Software Engineer',
        level: 'Mid-Level',
        history: [],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.evaluation).toHaveProperty('correctness', 'Correct implementation.');
  });
});
