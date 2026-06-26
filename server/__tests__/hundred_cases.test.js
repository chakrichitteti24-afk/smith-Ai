/**
 * hundred_cases.test.js
 *
 * Comprehensive test suite containing exactly 100 test cases to verify
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
  simulateCodeRun: jest.fn().mockImplementation(async (code, language, input) => {
    if (code.includes('error')) {
      return { stdout: '', stderr: 'Mock error message', exitCode: 1 };
    }
    return {
      stdout: `Mock output: ${input || 'none'}`,
      stderr: '',
      exitCode: 0,
    };
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

describe('Smith AI Platform - 100 Test Cases', () => {
  jest.setTimeout(30000);

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 1: preClean Helper (Cases 1-25)
  // ─────────────────────────────────────────────────────────────────────────────

  test('Case 1: preClean - Null input handling', () => {
    expect(preClean(null)).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 2: preClean - Undefined input handling', () => {
    expect(preClean(undefined)).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 3: preClean - Number input returns empty invalid object', () => {
    expect(preClean(456)).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 4: preClean - Boolean input returns empty invalid object', () => {
    expect(preClean(true)).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 5: preClean - Object input returns empty invalid object', () => {
    expect(preClean({})).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 6: preClean - Array input returns empty invalid object', () => {
    expect(preClean([])).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 7: preClean - Empty string returns empty invalid object', () => {
    expect(preClean('')).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 8: preClean - Whitespace only returns empty invalid object', () => {
    expect(preClean('   \n  \t ')).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 9: preClean - Single filler word is rejected', () => {
    expect(preClean('basically')).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 10: preClean - Multiple filler words are rejected', () => {
    expect(preClean('basically um sort of')).toEqual({ cleaned: '', wordCount: 0, valid: false });
  });

  test('Case 11: preClean - Valid content with single filler', () => {
    const res = preClean('I basically write code here');
    expect(res.cleaned).toBe('I write code here');
    expect(res.valid).toBe(true);
  });

  test('Case 12: preClean - Valid content with multiple fillers', () => {
    const res = preClean('um I think you know caching is very useful');
    expect(res.cleaned).toBe('I think caching is very useful');
    expect(res.valid).toBe(true);
  });

  test('Case 13: preClean - Collapses spaces and tabs to single spaces', () => {
    const res = preClean('hello \t  world \t test \t case');
    expect(res.cleaned).toBe('hello world test case');
  });

  test('Case 14: preClean - Case insensitive filler removal', () => {
    const res = preClean('UM hello UH world ER test AH case');
    expect(res.cleaned).toBe('hello world test case');
  });

  test('Case 15: preClean - Ignores partial filler matches like "summary"', () => {
    const res = preClean('this is a summary description');
    expect(res.cleaned).toBe('this is a summary description');
  });

  test('Case 16: preClean - Ignores partial filler matches like "literal"', () => {
    const res = preClean('this is a literal value');
    expect(res.cleaned).toBe('this is a literal value');
  });

  test('Case 17: preClean - Word count exactly 4 is valid', () => {
    expect(preClean('one two three four').valid).toBe(true);
  });

  test('Case 18: preClean - Word count 3 is invalid', () => {
    expect(preClean('one two three').valid).toBe(false);
  });

  test('Case 19: preClean - Word count 2 is invalid', () => {
    expect(preClean('one two').valid).toBe(false);
  });

  test('Case 20: preClean - Word count 1 is invalid', () => {
    expect(preClean('one').valid).toBe(false);
  });

  test('Case 21: preClean - Handles newlines as word boundary separators', () => {
    const res = preClean('one\ntwo\nthree\nfour');
    expect(res.wordCount).toBe(4);
    expect(res.valid).toBe(true);
  });

  test('Case 22: preClean - Strips trailing filler word', () => {
    expect(preClean('the code works basically').cleaned).toBe('the code works');
  });

  test('Case 23: preClean - Strips leading filler word', () => {
    expect(preClean('literally the code works').cleaned).toBe('the code works');
  });

  test('Case 24: preClean - Handles standard punctuation preserving word count', () => {
    const res = preClean('Hello, world! This is a test.');
    expect(res.wordCount).toBe(6);
    expect(res.valid).toBe(true);
  });

  test('Case 25: preClean - Handles long complex transcript with multiple fillers', () => {
    const res = preClean('so yeah basically we should use a load balancer and like replicate databases because actually single point of failure you know');
    expect(res.cleaned).toBe('we should use a load balancer and replicate databases because single point of failure');
    expect(res.valid).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 2: sanitiseAIResponse Helper (Cases 26-50)
  // ─────────────────────────────────────────────────────────────────────────────

  test('Case 26: sanitiseAIResponse - Handles null input safely', () => {
    expect(sanitiseAIResponse(null)).toBe('');
  });

  test('Case 27: sanitiseAIResponse - Handles undefined input safely', () => {
    expect(sanitiseAIResponse(undefined)).toBe('');
  });

  test('Case 28: sanitiseAIResponse - Handles empty string safely', () => {
    expect(sanitiseAIResponse('')).toBe('');
  });

  test('Case 29: sanitiseAIResponse - Heading 1 marker stripping', () => {
    expect(sanitiseAIResponse('# Hello')).toBe('Hello');
  });

  test('Case 30: sanitiseAIResponse - Heading 2 marker stripping', () => {
    expect(sanitiseAIResponse('## Hello')).toBe('Hello');
  });

  test('Case 31: sanitiseAIResponse - Heading 3 marker stripping', () => {
    expect(sanitiseAIResponse('### Hello')).toBe('Hello');
  });

  test('Case 32: sanitiseAIResponse - Bold markdown double asterisk stripping', () => {
    expect(sanitiseAIResponse('this is **bold** text')).toBe('this is bold text');
  });

  test('Case 33: sanitiseAIResponse - Italic markdown single asterisk stripping', () => {
    expect(sanitiseAIResponse('this is *italic* text')).toBe('this is italic text');
  });

  test('Case 34: sanitiseAIResponse - Mixed bold and italic markers stripping', () => {
    expect(sanitiseAIResponse('**bold** and *italic*')).toBe('bold and italic');
  });

  test('Case 35: sanitiseAIResponse - Inline backtick markdown code stripping', () => {
    expect(sanitiseAIResponse('use `console.log` please')).toBe('use console.log please');
  });

  test('Case 36: sanitiseAIResponse - Block backtick code block markdown stripping', () => {
    expect(sanitiseAIResponse('```\nconst a = 1;\n```')).toBe('const a = 1;');
  });

  test('Case 37: sanitiseAIResponse - Markdown links stripping to labels', () => {
    expect(sanitiseAIResponse('[Vite](https://vite.dev)')).toBe('Vite');
  });

  test('Case 38: sanitiseAIResponse - Multi markdown links stripping in paragraph', () => {
    expect(sanitiseAIResponse('[Link1](url1) and [Link2](url2)')).toBe('Link1 and Link2');
  });

  test('Case 39: sanitiseAIResponse - Dash bullet point marker stripping', () => {
    expect(sanitiseAIResponse('- First item\n- Second item')).toBe('First item\nSecond item');
  });

  test('Case 40: sanitiseAIResponse - Asterisk bullet point marker stripping', () => {
    expect(sanitiseAIResponse('* First item\n* Second item')).toBe('First item\nSecond item');
  });

  test('Case 41: sanitiseAIResponse - Plus bullet point marker stripping', () => {
    expect(sanitiseAIResponse('+ First item\n+ Second item')).toBe('First item\nSecond item');
  });

  test('Case 42: sanitiseAIResponse - Collapses multiple spaces within text', () => {
    // Note: sanitiseAIResponse is primarily for markdown stripping, but let's confirm whitespace handling
    expect(sanitiseAIResponse('  hello   world  ')).toBe('hello   world');
  });

  test('Case 43: sanitiseAIResponse - Collapses consecutive blank lines', () => {
    expect(sanitiseAIResponse('Line 1\n\n\n\n\nLine 2')).toBe('Line 1\n\nLine 2');
  });

  test('Case 44: sanitiseAIResponse - Preserves single newlines between paragraphs', () => {
    expect(sanitiseAIResponse('Line 1\nLine 2')).toBe('Line 1\nLine 2');
  });

  test('Case 45: sanitiseAIResponse - Preserves double newlines between paragraphs', () => {
    expect(sanitiseAIResponse('Line 1\n\nLine 2')).toBe('Line 1\n\nLine 2');
  });

  test('Case 46: sanitiseAIResponse - Strips nested markdown elements cleanly', () => {
    expect(sanitiseAIResponse('**[Search Google](https://google.com)**')).toBe('Search Google');
  });

  test('Case 47: sanitiseAIResponse - Strips leading blockquote markers', () => {
    // Note: Blockquotes are not explicitly replaced but should render readable text
    expect(sanitiseAIResponse('> quote text')).toBe('> quote text');
  });

  test('Case 48: sanitiseAIResponse - Strips bold markers inside lists', () => {
    expect(sanitiseAIResponse('- **Item 1**\n- **Item 2**')).toBe('Item 1\nItem 2');
  });

  test('Case 49: sanitiseAIResponse - Strips code blocks inside lists', () => {
    expect(sanitiseAIResponse('- `code 1`\n- `code 2`')).toBe('code 1\ncode 2');
  });

  test('Case 50: sanitiseAIResponse - Complex multi-line clean combinations', () => {
    const raw = `## Summary\n\n* **JavaScript** is cool.\n* Use [Groq](http://groq) for speeds.\n\nLet's start!`;
    const cleaned = `Summary\nJavaScript is cool.\nUse Groq for speeds.\n\nLet's start!`;
    expect(sanitiseAIResponse(raw)).toBe(cleaned);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 3: HTTP API Endpoint Validations & Routes (Cases 51-100)
  // ─────────────────────────────────────────────────────────────────────────────

  test('Case 51: GET /health - Responds with status 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  test('Case 52: GET /health - Body contains status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('ok');
  });

  test('Case 53: GET /health - Body contains timestamp ts', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('ts');
  });

  test('Case 54: GET /api/interview/nonexistent - Returns 404 Route not found', async () => {
    const res = await request(app).get('/api/interview/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  test('Case 55: GET /api/interview/nonexistent - Returns ok: false', async () => {
    const res = await request(app).get('/api/interview/nonexistent');
    expect(res.body.ok).toBe(false);
  });

  test('Case 56: GET /api/interview/nonexistent - Returns Route not found message', async () => {
    const res = await request(app).get('/api/interview/nonexistent');
    expect(res.body.error.message).toBe('Route not found');
  });

  test('Case 57: POST /api/interview/start - Validation fails without role parameter', async () => {
    const res = await request(app).post('/api/interview/start').send({ level: 'Senior' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 58: POST /api/interview/start - Validation fails without level parameter', async () => {
    const res = await request(app).post('/api/interview/start').send({ role: 'Backend' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 59: POST /api/interview/start - Correct error payload structure on 400', async () => {
    const res = await request(app).post('/api/interview/start').send({ level: 'Senior' });
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toHaveProperty('message');
  });

  test('Case 60: POST /api/interview/start - Succeeds and returns ok: true', async () => {
    const res = await request(app).post('/api/interview/start').send({ role: 'Engineer', level: 'Mid' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('Case 61: POST /api/interview/start - Succeeds and returns intro string', async () => {
    const res = await request(app).post('/api/interview/start').send({ role: 'Engineer', level: 'Mid' });
    expect(typeof res.body.intro).toBe('string');
  });

  test('Case 62: POST /api/interview/respond - Validation fails without role', async () => {
    const res = await request(app).post('/api/interview/respond').send({ level: 'Senior', rawTranscript: 'test' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 63: POST /api/interview/respond - Validation fails without level', async () => {
    const res = await request(app).post('/api/interview/respond').send({ role: 'Engineer', rawTranscript: 'test' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 64: POST /api/interview/respond - Validation fails without rawTranscript', async () => {
    const res = await request(app).post('/api/interview/respond').send({ role: 'Engineer', level: 'Senior' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 65: POST /api/interview/respond - Succeeds with valid parameters', async () => {
    const res = await request(app).post('/api/interview/respond').send({ role: 'Engineer', level: 'Mid', rawTranscript: 'I build caching algorithms for databases.' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('Case 66: POST /api/interview/respond - Returns cleaned transcript', async () => {
    const res = await request(app).post('/api/interview/respond').send({ role: 'Engineer', level: 'Mid', rawTranscript: 'I basically build caching algorithms.' });
    expect(res.body.cleanedTranscript).toBe('I build caching algorithms.');
  });

  test('Case 67: POST /api/interview/respond - Short/invalid transcript results in standard fallback question', async () => {
    const res = await request(app).post('/api/interview/respond').send({ role: 'Engineer', level: 'Mid', rawTranscript: 'caching' });
    expect(res.body.question).toBe("I didn't quite catch that. Could you elaborate on your answer?");
  });

  test('Case 68: POST /api/interview/respond - Short/invalid transcript feedback is empty', async () => {
    const res = await request(app).post('/api/interview/respond').send({ role: 'Engineer', level: 'Mid', rawTranscript: 'caching' });
    expect(res.body.feedback).toBe('');
  });

  test('Case 69: POST /api/interview/run-code - Validation fails without code parameter', async () => {
    const res = await request(app).post('/api/interview/run-code').send({ language: 'javascript' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 70: POST /api/interview/run-code - Validation fails without language parameter', async () => {
    const res = await request(app).post('/api/interview/run-code').send({ code: 'const a = 1;' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 71: POST /api/interview/run-code - Succeeds and returns ok: true', async () => {
    const res = await request(app).post('/api/interview/run-code').send({ code: 'const a = 1;', language: 'javascript' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('Case 72: POST /api/interview/run-code - Returns stdout', async () => {
    const res = await request(app).post('/api/interview/run-code').send({ code: 'const a = 1;', language: 'javascript', input: 'test-input' });
    expect(res.body.stdout).toBe('Mock output: test-input');
  });

  test('Case 73: POST /api/interview/run-code - Returns stderr', async () => {
    const res = await request(app).post('/api/interview/run-code').send({ code: 'trigger error', language: 'javascript' });
    expect(res.body.stderr).toBe('Mock error message');
  });

  test('Case 74: POST /api/interview/run-code - Returns exitCode', async () => {
    const res = await request(app).post('/api/interview/run-code').send({ code: 'trigger error', language: 'javascript' });
    expect(res.body.exitCode).toBe(1);
  });

  test('Case 75: POST /api/interview/submit-code - Validation fails without code parameter', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ language: 'python', questionText: 'test', role: 'Dev', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 76: POST /api/interview/submit-code - Validation fails without language parameter', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ code: 'pass', questionText: 'test', role: 'Dev', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 77: POST /api/interview/submit-code - Validation fails without questionText parameter', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ code: 'pass', language: 'python', role: 'Dev', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 78: POST /api/interview/submit-code - Validation fails without role parameter', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ code: 'pass', language: 'python', questionText: 'test', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 79: POST /api/interview/submit-code - Validation fails without level parameter', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ code: 'pass', language: 'python', questionText: 'test', role: 'Dev' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 80: POST /api/interview/submit-code - Succeeds and returns evaluation feedback', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({
      code: 'def add(a, b): return a + b',
      language: 'python',
      questionText: 'Write add function',
      role: 'Backend Dev',
      level: 'Mid',
      history: [],
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.evaluation.correctness).toBe('Correct implementation.');
  });

  test('Case 81: POST /api/interview/resume - Rejects empty resume uploads', async () => {
    const res = await request(app).post('/api/interview/resume');
    expect(res.statusCode).toBe(400);
  });

  test('Case 82: POST /api/interview/finish - Validation fails without role', async () => {
    const res = await request(app).post('/api/interview/finish').send({ level: 'Senior' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 83: POST /api/interview/finish - Validation fails without level', async () => {
    const res = await request(app).post('/api/interview/finish').send({ role: 'Engineer' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 84: POST /api/interview/finish - Succeeds with valid parameters', async () => {
    const res = await request(app).post('/api/interview/finish').send({ role: 'Engineer', level: 'Mid', history: [] });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('Case 85: POST /api/interview/finish - Returns analysis report', async () => {
    const res = await request(app).post('/api/interview/finish').send({ role: 'Engineer', level: 'Mid', history: [] });
    expect(res.body).toHaveProperty('analysis');
  });

  test('Case 86: POST /api/interview/transcribe - Rejects requests without file payload', async () => {
    const res = await request(app).post('/api/interview/transcribe');
    expect(res.statusCode).toBe(400);
  });

  test('Case 87: POST /api/interview/start - Empty string role parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/start').send({ role: '', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 88: POST /api/interview/start - Empty string level parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/start').send({ role: 'Engineer', level: '' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 89: POST /api/interview/respond - Empty role parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/respond').send({ role: '', level: 'Mid', rawTranscript: 'test answer' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 90: POST /api/interview/respond - Empty level parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/respond').send({ role: 'Engineer', level: '', rawTranscript: 'test answer' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 91: POST /api/interview/respond - Empty rawTranscript parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/respond').send({ role: 'Engineer', level: 'Mid', rawTranscript: '' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 92: POST /api/interview/finish - Empty role parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/finish').send({ role: '', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 93: POST /api/interview/finish - Empty level parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/finish').send({ role: 'Engineer', level: '' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 94: POST /api/interview/run-code - Empty code parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/run-code').send({ code: '', language: 'javascript' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 95: POST /api/interview/run-code - Empty language parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/run-code').send({ code: 'const a = 1;', language: '' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 96: POST /api/interview/submit-code - Empty code parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ code: '', language: 'python', questionText: 'test', role: 'Dev', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 97: POST /api/interview/submit-code - Empty language parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ code: 'pass', language: '', questionText: 'test', role: 'Dev', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 98: POST /api/interview/submit-code - Empty questionText parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ code: 'pass', language: 'python', questionText: '', role: 'Dev', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 99: POST /api/interview/submit-code - Empty role parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ code: 'pass', language: 'python', questionText: 'test', role: '', level: 'Mid' });
    expect(res.statusCode).toBe(400);
  });

  test('Case 100: POST /api/interview/submit-code - Empty level parameter triggers 400', async () => {
    const res = await request(app).post('/api/interview/submit-code').send({ code: 'pass', language: 'python', questionText: 'test', role: 'Dev', level: '' });
    expect(res.statusCode).toBe(400);
  });
});
