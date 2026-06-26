const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using API key:', apiKey ? apiKey.slice(0, 10) + '...' : 'none');

async function testGemini(modelName) {
  console.log(`Testing model: ${modelName}`);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello in one word");
    console.log(`Success with ${modelName}:`, result.response.text().trim());
  } catch (err) {
    console.error(`Failed with ${modelName}:`, err);
  }
}

async function run() {
  await testGemini('gemini-2.5-flash');
  await testGemini('gemini-1.5-flash');
}

run();
