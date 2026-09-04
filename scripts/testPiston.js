const https = require('https');

const data = JSON.stringify({
  language: 'cpp',
  version: '10.2.0',
  files: [{ content: '#include <iostream>\nint main(){ int n; std::cin >> n; if (n%2==0) std::cout << "Even"; else std::cout << "Odd"; return 0; }' }],
  stdin: '4'
});

const req = https.request('https://emkc.org/api/v2/piston/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('C++ result:', body));
});

req.on('error', e => console.error('error:', e));
req.write(data);
req.end();
