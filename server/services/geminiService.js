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
Extract the following information from the provided resume text and return it strictly as a JSON object.

PRIMARY RULES (CRITICAL):
1. NEVER generate fake ATS scores, fake skills, fake experience, fake projects, or fake keyword matches. Every insight MUST come explicitly from the actual uploaded resume.
2. If extraction fails completely or it's not a resume, still return valid JSON with "Not Found" or empty arrays.

ATS SCORE:
Calculate a dynamic "atsScore" (0-100) based strictly on real factors:
- Contact Information present
- Professional Summary quality
- Explicit Skills listed
- Work Experience details
- Education, Projects, Certifications
- Keyword match with the target role.

SKILLS & PROJECTS:
Extract only skills explicitly mentioned in the text. Do not infer unknown skills (e.g., if they mention React, do not add Redux unless explicitly stated).
Extract actual project names only. Never invent projects.

EXPERIENCE:
Do not create fake company experience. Use only companies mentioned.

MISSING KEYWORDS:
Compare the explicitly extracted skills against the target role and level. Recommend ONLY genuinely missing, highly relevant core keywords that are absent from their resume.

JSON SCHEMA:
{
  "name": "Candidate's full name",
  "summary": "A brief 2-3 sentence professional summary based strictly on the text",
  "skills": ["skill1", "skill2"],
  "projects": [
    { "name": "Project Name", "description": "Brief description from resume", "technologies": ["tech1"] }
  ],
  "experience": [
    { "role": "Job Title", "company": "Company Name", "duration": "Duration/Dates" }
  ],
  "education": [
    { "degree": "Degree Name", "institution": "Institution Name", "year": "Year" }
  ],
  "certifications": ["cert1", "cert2"],
  "strengths": ["strength1", "strength2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "atsScore": 75,
  "missingKeywords": ["missingKw1", "missingKw2"]
}

Do not include any markdown formatting like \`\`\`json. Just return the raw JSON string.`;

/**
 * Parse resume text using Gemini
 * @param {string} resumeText 
 * @param {Buffer} [fileBuffer]
 * @param {string} [mimeType]
 * @param {string} [role]
 * @param {string} [level]
 * @returns {Promise<Object>} Parsed resume data
 */
async function parseResume(resumeText, fileBuffer, mimeType, role = 'Software Engineer', level = 'Mid-Level') {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let contentArgs = [RESUME_PARSING_PROMPT + `\n\nTARGET ROLE: ${role} (${level})`];
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
/**
 * Evaluate a candidate's code submission against the problem using Gemini.
 * @param {string} code
 * @param {string} language
 * @param {string} questionText
 * @returns {Promise<Object>} Comprehensive evaluation
 */
async function evaluateCodeSubmission(code, language, questionText) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert technical interviewer (like Google/Amazon).
Evaluate the following code submission against the requested coding problem.

Coding Problem / Question:
${questionText}

Language: ${language}
Code:
${code}

You MUST evaluate the code on these dimensions:
- Correctness (Is it functionally correct?)
- Test Cases (How many hidden/sample test cases passed vs failed?)
- Time Complexity (Big O notation)
- Space Complexity (Big O notation)
- Code Quality (Readability, structure, variable naming)
- Edge Case Handling (Did they miss boundary conditions?)
- Optimization (How to improve efficiency)
- Recommended Solution (Optimal code snippet)

Respond strictly in JSON matching this schema:
{
  "correctness": "evaluation string (max 2 sentences)",
  "passedTestCases": "e.g. 10/12 passed",
  "failedTestCases": "e.g. 2 failed on large inputs",
  "timeComplexity": "Big O notation (e.g. O(N))",
  "spaceComplexity": "Big O notation (e.g. O(1))",
  "edgeCases": "evaluation string (max 2 sentences)",
  "codeQuality": "evaluation string (max 2 sentences)",
  "optimization": "evaluation string (max 2 sentences)",
  "recommendedSolution": "Brief optimal code snippet in ${language}",
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
      passedTestCases: "?/?",
      failedTestCases: "Unknown",
      timeComplexity: "Unknown",
      spaceComplexity: "Unknown",
      edgeCases: "Unable to evaluate edge cases.",
      codeQuality: "Unable to evaluate code quality.",
      optimization: "Unable to evaluate optimization.",
      recommendedSolution: "System error.",
      feedbackText: "Code evaluation encountered a system error: " + err.message
    };
  }
}

/**
 * Generate a new coding question for Practice Mode
 * @param {string} difficulty 
 * @param {string} role 
 * @param {Array<string>} solvedTitles 
 * @returns {Promise<Object>} The generated coding question.
 */
async function generateCodingQuestion(difficulty, role, solvedTitles = []) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an enterprise LeetCode/HackerRank-style problem generator simulating a 400-question bank.
Generate a coding problem appropriate for a ${difficulty} level candidate applying for a ${role} position.

CATEGORIES BASED ON DIFFICULTY:
- Beginner (Pick 1): Variables, Data Types, If Else, Loops, Functions, Arrays, Strings, Basic Mathematics, Patterns.
- Intermediate (Pick 1): Arrays, Hash Maps, Sliding Window, Two Pointers, Stack, Queue, Linked List, Binary Search, Trees, Sorting.
- Advanced (Pick 1): Graphs, Dynamic Programming, Greedy, Trie, Segment Tree, Union Find, Backtracking, Advanced Trees, Bit Manipulation.
- Expert (Pick 1): Advanced Dynamic Programming, Advanced Graph Algorithms, System Design Coding, Concurrency, Multi-threading, Distributed Systems, Cache Design, Rate Limiter, Low Level Design Coding, Large Scale Algorithmic Problems.

Avoid the following problems which the candidate has already solved: [${solvedTitles.join(', ')}].

The problem must be clear, rigorous, and solvable within 30-45 minutes.

Output MUST be strictly in JSON matching this exact schema:
{
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "questionText": "Detailed markdown-formatted problem statement, including clear constraints, input/output types, and edge cases.",
  "examples": [
    { "input": "input string", "output": "expected output", "explanation": "Why this output happens" }
  ]
}
Do not include any markdown backticks or explanations outside the JSON. Return raw JSON string.`;

    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    logger.error('gemini_generate_question_failed', { err: String(err) });
    throw new Error('Failed to generate practice question: ' + err.message);
  }
}

module.exports = {
  parseResume,
  simulateCodeRun,
  evaluateCodeSubmission,
  generateCodingQuestion
};
