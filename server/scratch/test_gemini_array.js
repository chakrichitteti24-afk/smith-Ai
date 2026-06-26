const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

const RESUME_PARSING_PROMPT = `You are an expert HR and Technical Resume Analyzer.
Extract the following information from the provided resume text and return it strictly as a JSON object matching this schema:
{
  "summary": "A brief 2-3 sentence professional summary of the candidate",
  "skills": ["skill1", "skill2"],
  "projects": [
    { "name": "Project Name", "description": "Brief description", "technologies": ["tech1", "tech2"] }
  ],
  "education": [
    { "degree": "Degree Name", "institution": "Institution Name", "year": "Year" }
  ],
  "certifications": ["cert1", "cert2"],
  "strengths": ["strength1", "strength2"],
  "weakAreas": ["weakness1", "weakness2"],
  "missingSkills": ["missingSkill1", "missingSkill2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "atsScore": 85
}
Do not include any markdown formatting like \`\`\`json or \`\`\` around the JSON output. Just return the raw JSON string.`;

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      RESUME_PARSING_PROMPT,
      "David Eliot Bartender Momo Restaurant Cookery School Dublin"
    ]);
    console.log('Success:', result.response.text());
  } catch (err) {
    console.error('Failed:', err);
  }
}

run();
