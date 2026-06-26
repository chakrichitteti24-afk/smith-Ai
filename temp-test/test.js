const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  const fileBuffer = fs.readFileSync('JohnDoe_Resume.pdf');
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('resume', blob, 'JohnDoe_Resume.pdf');

  try {
    console.log('Sending resume to server...');
    const response = await fetch('http://localhost:3001/api/interview/resume', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log('Server Response Status:', response.status);
    console.log('Server Response Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error uploading:', err);
  }
}

testUpload();
