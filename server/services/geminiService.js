const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../middleware/logger');

let _genAI = null;

function getGenAI() {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

const RESUME_PARSING_PROMPT = `You are an expert HR and Technical Resume Analyzer.
Extract the following information from the provided resume text and return it strictly as a JSON object matching this schema:
{
  "name": "Candidate's full name",
  "summary": "A brief 2-3 sentence professional summary of the candidate",
  "skills": ["skill1", "skill2"],
  "projects": [
    { "name": "Project Name", "description": "Brief description", "technologies": ["tech1", "tech2"] }
  ],
  "experience": [
    { "role": "Job Title", "company": "Company Name", "duration": "Duration/Dates" }
  ],
  "education": [
    { "degree": "Degree Name", "institution": "Institution Name", "year": "Year" }
  ],
  "certifications": ["cert1", "cert2"],
  "strengths": ["strength1", "strength2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

CRITICAL RULES:
1. Extract: Name, Skills, Education, Projects, Certifications, Experience.
2. NEVER fabricate or guess missing information.
3. If information is unavailable for a string field, return "Not Found".
4. If information is unavailable for an array field, return an empty array [].
5. Do not include any markdown formatting like \`\`\`json or \`\`\` around the JSON output. Just return the raw JSON string.`;

/**
 * Parse resume text using Gemini
 * @param {string} resumeText 
 * @param {Buffer} [fileBuffer]
 * @param {string} [mimeType]
 * @returns {Promise<Object>} Parsed resume data
 */
async function parseResume(resumeText, fileBuffer, mimeType) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let contentArgs = [RESUME_PARSING_PROMPT];
    if (resumeText) {
      contentArgs.push(resumeText);
    } else if (fileBuffer && mimeType) {
      contentArgs.push({
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: mimeType
        }
      });
    } else {
      throw new Error("Either resumeText or fileBuffer must be provided.");
    }

    const result = await model.generateContent(contentArgs);

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    logger.info('gemini_parsed_resume', { length: cleanJson.length });
    return JSON.parse(cleanJson);
  } catch (err) {
    logger.error('gemini_resume_parsing_failed', { err: String(err) });
    throw new Error('Failed to parse resume: ' + err.message);
  }
}

/**
 * Simulate the execution of code in a sandbox simulation using Gemini.
 * @param {string} code
 * @param {string} language
 * @param {string} input
 * @returns {Promise<Object>} stdout, stderr, exitCode
 */
async function simulateCodeRun(code, language, input) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a secure, sandboxed code execution environment.
Simulate the execution of the following code and return the console output (stdout) and any compiling/runtime errors (stderr).

Language: ${language}
Code:
${code}

Custom Input (standard input):
${input || 'None'}

Evaluate the code and respond strictly in JSON matching this schema:
{
  "stdout": "console output here",
  "stderr": "any syntax errors, runtime errors, or compiling errors here (or empty string if none)",
  "exitCode": 0
}
Do not include any markdown backticks or explanations. Output ONLY the raw JSON string.`;

    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    logger.error('gemini_code_run_failed', { err: String(err) });
    return {
      stdout: "",
      stderr: "Execution failed: " + err.message,
      exitCode: 1
    };
  }
}

/**
 * Evaluate a candidate's code submission against the problem using Gemini.
 * @param {string} code
 * @param {string} language
 * @param {string} questionText
 * @returns {Promise<Object>} Correctness, time complexity, space complexity, edge cases, quality, optimization
 */
async function evaluateCodeSubmission(code, language, questionText) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert technical interviewer.
Evaluate the following code submission against the requested coding problem.

Coding Problem / Question:
${questionText}

Language: ${language}
Code:
${code}

You MUST evaluate the code on these 6 dimensions:
1. Correctness (Functional accuracy)
2. Time Complexity (Big O notation)
3. Space Complexity (Big O notation)
4. Edge Cases (Unusual or boundary conditions)
5. Code Quality (Readability, style, structure)
6. Optimization (Potential improvements)

Respond strictly in JSON matching this schema:
{
  "correctness": "evaluation string (max 2 sentences)",
  "timeComplexity": "Big O notation (e.g. O(N))",
  "spaceComplexity": "Big O notation (e.g. O(1))",
  "edgeCases": "evaluation string (max 2 sentences)",
  "codeQuality": "evaluation string (max 2 sentences)",
  "optimization": "evaluation string (max 2 sentences)",
  "feedbackText": "detailed review summary (max 3 sentences)"
}
Do not include any markdown backticks or explanations. Output ONLY the raw JSON string.`;

    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    logger.error('gemini_code_evaluation_failed', { err: String(err) });
    return {
      correctness: "Unable to evaluate correctness.",
      timeComplexity: "Unknown",
      spaceComplexity: "Unknown",
      edgeCases: "Unable to evaluate edge cases.",
      codeQuality: "Unable to evaluate code quality.",
      optimization: "Unable to evaluate optimization.",
      feedbackText: "Code evaluation encountered a system error: " + err.message
    };
  }
}

module.exports = {
  parseResume,
  simulateCodeRun,
  evaluateCodeSubmission,
};
