const fs = require('fs');
const path = require('path');

async function testUpload() {
  const filePath = path.join(__dirname, '../../JohnDoe_Resume.pdf');
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  const stats = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  // We can construct a multipart request manually without external libraries
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  let data = '';
  data += `--${boundary}\r\n`;
  data += `Content-Disposition: form-data; name="resume"; filename="JohnDoe_Resume.pdf"\r\n`;
  data += `Content-Type: application/pdf\r\n\r\n`;
  
  const payload = Buffer.concat([
    Buffer.from(data, 'utf-8'),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8')
  ]);

  try {
    const res = await fetch('http://localhost:3001/api/interview/resume', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      },
      body: payload
    });

    console.log('Response Status:', res.status);
    const json = await res.json();
    console.log('Response Body:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testUpload();
