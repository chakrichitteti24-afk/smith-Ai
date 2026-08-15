const http = require('http');

function req(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: payload ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      } : {}
    };

    const request = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch {}
        resolve({ status: res.statusCode, body: json || body });
      });
    });

    request.on('error', (err) => resolve({ status: 500, error: err.message }));
    if (payload) request.write(payload);
    request.end();
  });
}

async function testAll() {
  console.log('==================================================');
  console.log('🚀 TESTING ALL SMITH AI BACKEND APIS (PORT 3001)');
  console.log('==================================================\n');

  const tests = [
    { name: 'GET /health', path: '/health', method: 'GET' },
    { name: 'POST /api/interview/start', path: '/api/interview/start', method: 'POST', body: { role: 'Senior Frontend Engineer', level: 'Senior' } },
    { name: 'POST /api/interview/respond', path: '/api/interview/respond', method: 'POST', body: { role: 'Senior Frontend Engineer', level: 'Senior', rawTranscript: 'I use React hooks and custom state machines.', history: [] } },
    { name: 'POST /api/interview/run-code', path: '/api/interview/run-code', method: 'POST', body: { code: 'console.log("Hello from sandbox")', language: 'javascript' } },
    { name: 'POST /api/interview/submit-code', path: '/api/interview/submit-code', method: 'POST', body: { code: 'function sum(a,b){ return a+b; }', language: 'javascript', questionText: 'Add two numbers' } },
    { name: 'POST /api/interview/finish', path: '/api/interview/finish', method: 'POST', body: { role: 'Senior Frontend Engineer', level: 'Senior', history: [{ sender: 'user', text: 'I am experienced in Web performance.' }] } },
    { name: 'GET /api/practice/questions', path: '/api/practice/questions?difficulty=Beginner&page=1&limit=5', method: 'GET' },
    { name: 'GET /api/practice/stats', path: '/api/practice/stats?difficulty=Beginner', method: 'GET' },
    { name: 'POST /api/practice/run', path: '/api/practice/run', method: 'POST', body: { questionId: 1, code: 'console.log("practice run")', language: 'javascript' } },
  ];

  let passed = 0;
  for (const t of tests) {
    const res = await req(t.path, t.method, t.body);
    const isOk = res.status >= 200 && res.status < 400;
    if (isOk) passed++;
    const sample = typeof res.body === 'object' ? JSON.stringify(res.body).slice(0, 100) : String(res.body).slice(0, 100);
    console.log(`[${isOk ? 'PASS ✅' : 'FAIL ❌'}] ${res.status} ${t.name} -> ${sample}`);
  }

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed}/${tests.length} APIS PASSED CLEANLY!`);
  console.log(`==================================================`);
}

testAll();
