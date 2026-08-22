/**
 * scripts/testRoutesAndMonaco.js
 * Comprehensive validation of all API routes, database state, and Monaco code execution.
 */

const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING ROUTE & MONACO CODE EXECUTION TESTS');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Health & DB Check
  try {
    const res = await makeRequest('GET', '/health');
    console.log(`[1] GET /health -> Status: ${res.status}`);
    console.log('    Response:', JSON.stringify(res.data));
    if (res.status === 200) {
      console.log('    ✅ Health Check Passed');
      passed++;
    } else {
      console.log('    ❌ Health Check Failed');
      failed++;
    }
  } catch (err) {
    console.log('    ❌ Health Check Error:', err.message);
    failed++;
  }

  // 2. Practice Questions List
  try {
    const res = await makeRequest('GET', '/api/practice/questions?category=Basics&page=1&limit=5');
    console.log(`\n[2] GET /api/practice/questions -> Status: ${res.status}`);
    console.log(`    Total Questions: ${res.data?.total}, Returned: ${res.data?.questions?.length}`);
    if (res.status === 200 && res.data?.questions?.length > 0) {
      console.log('    Sample Question #1:', res.data.questions[0].title);
      console.log('    ✅ Practice Questions Route Passed');
      passed++;
    } else {
      console.log('    ❌ Practice Questions Route Failed');
      failed++;
    }
  } catch (err) {
    console.log('    ❌ Practice Questions Error:', err.message);
    failed++;
  }

  // 3. Practice Question Detail (#1 - Even/Odd)
  try {
    const res = await makeRequest('GET', '/api/practice/questions/1');
    console.log(`\n[3] GET /api/practice/questions/1 -> Status: ${res.status}`);
    if (res.status === 200 && res.data?.title) {
      console.log('    Question Title:', res.data.title);
      console.log('    Supported Languages:', res.data.supportedLanguages?.join(', '));
      console.log('    ✅ Practice Question Detail Passed');
      passed++;
    } else {
      console.log('    ❌ Practice Question Detail Failed');
      failed++;
    }
  } catch (err) {
    console.log('    ❌ Practice Question Detail Error:', err.message);
    failed++;
  }

  // 4. Practice Stats
  try {
    const res = await makeRequest('GET', '/api/practice/stats?session_id=test_sess_123');
    console.log(`\n[4] GET /api/practice/stats -> Status: ${res.status}`);
    console.log('    Stats Response:', JSON.stringify(res.data));
    if (res.status === 200 && typeof res.data?.total === 'number') {
      console.log('    ✅ Practice Stats Route Passed');
      passed++;
    } else {
      console.log('    ❌ Practice Stats Route Failed');
      failed++;
    }
  } catch (err) {
    console.log('    ❌ Practice Stats Error:', err.message);
    failed++;
  }

  // 5. Monaco Editor Live Sandbox Execution: /api/interview/run-code
  try {
    const testCode = `
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
console.log(JSON.stringify(twoSum([2, 7, 11, 15], 9)));
`;
    console.log('\n[5] POST /api/interview/run-code (Monaco Sandbox)');
    console.log('    Executing JavaScript Two-Sum in Sandbox...');
    const res = await makeRequest('POST', '/api/interview/run-code', {
      code: testCode,
      language: 'JavaScript',
      input: ''
    });
    console.log(`    Status: ${res.status}`);
    console.log('    Stdout:', res.data?.stdout?.trim());
    console.log('    Stderr:', res.data?.stderr || 'None');
    console.log('    Exit Code:', res.data?.exitCode);
    if (res.status === 200 && res.data?.stdout?.includes('[0,1]')) {
      console.log('    ✅ Monaco Sandbox Execution Passed (Correct Output: [0,1])');
      passed++;
    } else {
      console.log('    ❌ Monaco Sandbox Execution Failed');
      failed++;
    }
  } catch (err) {
    console.log('    ❌ Monaco Sandbox Error:', err.message);
    failed++;
  }

  // 6. Practice Run Code (Question #1 - Even or Odd)
  try {
    console.log('\n[6] POST /api/practice/run (Question #1: Even/Odd)');
    const pythonCode = `import sys
input = sys.stdin.readline
n = int(input().strip())
if n % 2 == 0:
    print("Even")
else:
    print("Odd")
`;
    const res = await makeRequest('POST', '/api/practice/run', {
      questionId: 1,
      code: pythonCode,
      language: 'Python',
      sessionId: 'test_sess_123'
    });
    console.log(`    Status: ${res.status}`);
    console.log('    All Passed:', res.data?.allPassed);
    console.log('    Test Cases Results:', JSON.stringify(res.data?.results));
    if (res.status === 200 && res.data?.allPassed) {
      console.log('    ✅ Practice Code Run Passed (All Test Cases Matched)');
      passed++;
    } else {
      console.log('    ❌ Practice Code Run Failed');
      failed++;
    }
  } catch (err) {
    console.log('    ❌ Practice Code Run Error:', err.message);
    failed++;
  }

  // 7. Practice Submit Code (Question #1 - Full Submission)
  try {
    console.log('\n[7] POST /api/practice/submit (Question #1 Submission)');
    const jsCode = `const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const n = parseInt(lines[0]);
console.log(n % 2 === 0 ? "Even" : "Odd");
`;
    const res = await makeRequest('POST', '/api/practice/submit', {
      questionId: 1,
      code: jsCode,
      language: 'JavaScript',
      sessionId: 'test_sess_123'
    });
    console.log(`    Status: ${res.status}`);
    console.log('    Verdict:', res.data?.verdict);
    console.log(`    Passed: ${res.data?.passedCount}/${res.data?.totalCount}`);
    if (res.status === 200 && res.data?.verdict === 'Accepted') {
      console.log('    ✅ Practice Code Submit Passed (Verdict: Accepted)');
      passed++;
    } else {
      console.log('    ❌ Practice Code Submit Failed');
      failed++;
    }
  } catch (err) {
    console.log('    ❌ Practice Code Submit Error:', err.message);
    failed++;
  }

  console.log('\n==================================================');
  console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');
}

runTests();
