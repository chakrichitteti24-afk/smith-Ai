const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { parseResume } = require('../services/geminiService');

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

async function run() {
  const filePath = path.join(__dirname, '../../DavidEliot_Resume.pdf');
  const buffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(buffer);
  const text = parsed.text;
  console.log('Extracted text length:', text.length);
  console.log('Extracted text:', JSON.stringify(text));

  try {
    console.log('Parsing resume with Gemini Service...');
    const result = await parseResume(text);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Service error:', err);
  }
}

run();
