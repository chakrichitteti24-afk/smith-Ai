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

// Mock groqService for offline deterministic execution
jest.mock('../services/groqService', () => ({
  cleanTranscript: jest.fn().mockImplementation(async (text) => text || ''),
  generateIntro: jest.fn().mockResolvedValue("Hello, I'm Smith, your AI technical interviewer. Let's begin with your background."),
  evaluateAndQuestion: jest.fn().mockResolvedValue({
    feedback: 'Good answer on caching and architecture tradeoffs.',
    question: 'How would you handle cache invalidation across distributed nodes?',
    fullResponse: 'Good answer on caching and architecture tradeoffs. How would you handle cache invalidation across distributed nodes?',
  }),
  evaluateAndQuestionStream: jest.fn().mockImplementation(async (opts, onChunk) => {
    if (onChunk) onChunk('Mock streamed response chunk');
    return {
      feedback: 'Good answer on caching.',
      question: 'How would you handle cache invalidation?',
      fullResponse: 'Good answer on caching. How would you handle cache invalidation?',
    };
  }),
  generateFinalAnalysis: jest.fn().mockResolvedValue({
    accuracyScore: 85,
    confidenceScore: 80,
    logicalThinkingScore: 88,
    communicationScore: 82,
    codingScore: 90,
    overallScore: 85,
    overallRating: 'Excellent',
    strengths: ['Great modular code', 'Clear communication'],
    weaknesses: ['Minor edge case in empty array'],
    mostCommonMistakes: [],
    technicalGaps: [],
    codingGaps: [],
    communicationGaps: [],
    topicsToStudy: ['Distributed Locks'],
    weakAreas: ['Raft consensus'],
    suggestedPractice: ['Implement Raft leader election'],
    interviewPrepTips: ['Review consistency models'],
    hiringRecommendation: 'Strong Hire',
  }),
  transcribeAudio: jest.fn().mockResolvedValue('Mock transcribed audio text'),
}));

const request = require('supertest');
const { app } = require('../index');

describe('Server API', () => {
  jest.setTimeout(20000);

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('GET /api/interview/nonexistent returns 404', async () => {
    const res = await request(app).get('/api/interview/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  test('POST /api/interview/start responds with intro', async () => {
    const res = await request(app)
      .post('/api/interview/start')
      .send({ role: 'Test', level: 'Senior' })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(typeof res.body.intro).toBe('string');
  });

  test('POST /api/interview/respond returns feedback', async () => {
    const res = await request(app)
      .post('/api/interview/respond')
      .send({ role: 'Test', level: 'Senior', rawTranscript: 'my answer', history: [] })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('feedback');
  });

  test('POST /api/interview/run-code simulates execution', async () => {
    const res = await request(app)
      .post('/api/interview/run-code')
      .send({ code: 'console.log("test");', language: 'javascript' })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('stdout', 'Hello from mock execution output!');
  });

  test('POST /api/interview/submit-code returns code evaluations', async () => {
    const res = await request(app)
      .post('/api/interview/submit-code')
      .send({
        code: 'function solution() {}',
        language: 'javascript',
        questionText: 'Write a function solution',
        role: 'Test Engineer',
        level: 'Senior',
        history: [],
      })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('evaluation');
    expect(res.body.evaluation).toHaveProperty('correctness');
  });

  test('GET /api/interview/tts/voices returns curated neural voices', async () => {
    const res = await request(app).get('/api/interview/tts/voices');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
  });

  test('POST /api/interview/tts validates missing text', async () => {
    const res = await request(app)
      .post('/api/interview/tts')
      .send({})
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('ok', false);
  });
});
