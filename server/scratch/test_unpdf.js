const fs = require('fs');
const path = require('path');
const { extractText } = require('unpdf');

async function test() {
  try {
    const filePath = path.join(__dirname, '../../DavidEliot_Resume.pdf');
    const buffer = fs.readFileSync(filePath);
    console.log('Extracting text from PDF using unpdf...');
    const result = await extractText(new Uint8Array(buffer));
    console.log('Extracted text:', JSON.stringify(result.text));
  } catch (err) {
    console.error('Failed with unpdf:', err);
  }
}

test();
