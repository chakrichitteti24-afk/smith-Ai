const https = require('https');

const javaCode = 'import java.util.Scanner;\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(n % 2 == 0 ? \"Even\" : \"Odd\");\n        }\n    }\n}';

const data = JSON.stringify({
  code: javaCode,
  compiler: 'openjdk-jdk-22+36',
  stdin: '5'
});

const req = https.request('https://wandbox.org/api/compile.json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log('Java result:', JSON.parse(body)));
});

req.on('error', e => console.error('Java error:', e));
req.write(data);
req.end();
