const https = require('https');

function testEndpoint(name, url, payload) {
  const data = JSON.stringify(payload);
  const u = new URL(url);
  const req = https.request({
    hostname: u.hostname,
    path: u.pathname + u.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'User-Agent': 'SmithAI/1.0'
    },
    timeout: 5000
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => console.log(name, res.statusCode, body.slice(0, 200)));
  });
  req.on('error', e => console.log(name, 'error:', e.message));
  req.on('timeout', () => { req.destroy(); console.log(name, 'timeout'); });
  req.write(data);
  req.end();
}

// 1. Glot.io C++
testEndpoint('Glot.io', 'https://glot.io/api/run/cpp/latest', {
  files: [{ name: 'main.cpp', content: '#include <iostream>\nint main(){ int n; std::cin >> n; std::cout << (n%2==0 ? \"Even\" : \"Odd\"); return 0; }' }],
  stdin: '4'
});

// 2. Wandbox C++
testEndpoint('Wandbox', 'https://wandbox.org/api/compile.json', {
  code: '#include <iostream>\nint main(){ int n; std::cin >> n; std::cout << (n%2==0 ? \"Even\" : \"Odd\"); return 0; }',
  compiler: 'gcc-head',
  stdin: '4'
});

// 3. CodeX
testEndpoint('CodeX', 'https://api.codex.jaagrav.in', {
  code: '#include <iostream>\nint main(){ int n; std::cin >> n; std::cout << (n%2==0 ? \"Even\" : \"Odd\"); return 0; }',
  language: 'cpp',
  input: '4'
});
