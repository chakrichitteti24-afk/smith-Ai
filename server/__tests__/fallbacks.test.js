const { cleanTranscript, generateIntro, evaluateAndQuestion } = require('../services/groqService');

describe('Service fallbacks', () => {
  test('groq.cleanTranscript returns raw transcript when GROQ_API_KEY missing', async () => {
    const orig = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    const raw = 'um I think the answer is caching TTLs';
    const res = await cleanTranscript(raw);
    expect(res).toBe(raw);
    if (orig) process.env.GROQ_API_KEY = orig;
  });

  test('groq.generateIntro returns default when GROQ_API_KEY missing', async () => {
    const origG = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    const intro = await generateIntro({ name: 'Test', role: 'Engineer', level: 'Senior' });
    expect(typeof intro).toBe('string');
    expect(intro.length).toBeGreaterThan(0);
    expect(intro).toMatch(/Smith|background|interview/i);

    if (origG) process.env.GROQ_API_KEY = origG;
  });

  test('groq.evaluateAndQuestion fallback returns conservative object on failures', async () => {
    const origG = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    const result = await evaluateAndQuestion({ role: 'X', level: 'Y', history: [], cleanedTranscript: 'test' });
    expect(result).toHaveProperty('feedback');
    expect(result).toHaveProperty('question');

    if (origG) process.env.GROQ_API_KEY = origG;
  });
});
