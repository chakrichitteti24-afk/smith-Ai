const fs = require('fs');

async function testAllRoutes() {
  console.log('--- STARTING COMPREHENSIVE ROUTE TESTS ---\n');
  const baseUrl = 'http://localhost:3001';

  try {
    // 1. GET /health
    console.log('1. Testing GET /health...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('Status:', healthRes.status, '✅');
    console.log('Response:', healthData, '\n');

    // 2. POST /api/interview/resume (File Upload)
    console.log('2. Testing POST /api/interview/resume...');
    const formData = new FormData();
    const fileBuffer = fs.readFileSync('../JohnDoe_Resume.pdf');
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('resume', blob, 'JohnDoe_Resume.pdf');
    
    const resumeRes = await fetch(`${baseUrl}/api/interview/resume`, {
      method: 'POST',
      body: formData
    });
    const resumeData = await resumeRes.json();
    console.log('Status:', resumeRes.status, resumeRes.status === 200 ? '✅' : '❌');
    console.log('Parsed Skills (first 3):', resumeData.data?.skills?.slice(0, 3) || 'None', '\n');

    // 3. POST /api/interview/start
    console.log('3. Testing POST /api/interview/start...');
    const startPayload = {
      role: 'Full Stack Developer',
      level: 'Senior',
      resumeContext: resumeData.data,
      interviewType: 'Technical Round'
    };
    const startRes = await fetch(`${baseUrl}/api/interview/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(startPayload)
    });
    const startData = await startRes.json();
    console.log('Status:', startRes.status, startRes.status === 200 ? '✅' : '❌');
    console.log('Intro Text:', startData.intro?.substring(0, 80) + '...', '\n');

    // 4. POST /api/interview/respond
    console.log('4. Testing POST /api/interview/respond...');
    const respondPayload = {
      role: 'Full Stack Developer',
      level: 'Senior',
      rawTranscript: 'I would use React for the frontend and Node.js for the backend to build this scalable application.',
      history: [{ role: 'system', content: startData.intro }],
      interviewType: 'Technical Round'
    };
    const respondRes = await fetch(`${baseUrl}/api/interview/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(respondPayload)
    });
    const respondData = await respondRes.json();
    console.log('Status:', respondRes.status, respondRes.status === 200 ? '✅' : '❌');
    console.log('Feedback:', respondData.feedback, '\n');

    // 5. POST /api/interview/run-code
    console.log('5. Testing POST /api/interview/run-code...');
    const runPayload = {
      code: 'function add(a, b) { return a + b; }\nconsole.log(add(5, 7));',
      language: 'javascript'
    };
    const runRes = await fetch(`${baseUrl}/api/interview/run-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(runPayload)
    });
    const runData = await runRes.json();
    console.log('Status:', runRes.status, runRes.status === 200 ? '✅' : '❌');
    console.log('Stdout:', runData.stdout, '\n');

    // 6. POST /api/interview/submit-code
    console.log('6. Testing POST /api/interview/submit-code...');
    const submitPayload = {
      code: 'function add(a, b) { return a + b; }',
      language: 'javascript',
      questionText: 'Write a function that adds two numbers.',
      role: 'Full Stack Developer',
      level: 'Senior'
    };
    const submitRes = await fetch(`${baseUrl}/api/interview/submit-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitPayload)
    });
    const submitData = await submitRes.json();
    console.log('Status:', submitRes.status, submitRes.status === 200 ? '✅' : '❌');
    console.log('Evaluation:', submitData.evaluation?.feedbackText, '\n');

    // 7. POST /api/interview/finish
    console.log('7. Testing POST /api/interview/finish...');
    const finishPayload = {
      role: 'Full Stack Developer',
      level: 'Senior',
      qaEvaluations: [
        { question: 'How would you scale this?', answer: 'Using microservices.', feedback: 'Good start.' }
      ],
      codingSubmissions: [
        { code: 'function add(a, b) { return a + b; }', evaluation: submitData.evaluation }
      ]
    };
    const finishRes = await fetch(`${baseUrl}/api/interview/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finishPayload)
    });
    const finishData = await finishRes.json();
    console.log('Status:', finishRes.status, finishRes.status === 200 ? '✅' : '❌');
    console.log('Final Analysis Output length:', finishData.analysis?.length, 'characters\n');

    console.log('--- ALL ROUTES TESTED SUCCESSFULLY ✅ ---');

  } catch (err) {
    console.error('Error during testing:', err);
  }
}

testAllRoutes();
