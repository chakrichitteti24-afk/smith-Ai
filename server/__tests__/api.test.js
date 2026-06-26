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
    expect(res.body.evaluation).toHaveProperty('correctness', 'Correct implementation.');
  });
});
