const { GoogleGenerativeAI } = require('@google/generative-ai');
const { spawnSync } = require('child_process');
const vm = require('vm');
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
 * Native Zero-Latency Local JavaScript Runner
 */
function runLocalJavaScript(code, input = '') {
  let stdout = '';
  let stderr = '';
  
  const mockConsole = {
    log: (...args) => { stdout += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n'; },
    error: (...args) => { stderr += args.map(a => String(a)).join(' ') + '\n'; },
    warn: (...args) => { stdout += args.map(a => String(a)).join(' ') + '\n'; },
    info: (...args) => { stdout += args.map(a => String(a)).join(' ') + '\n'; },
  };

  const mockFs = {
    readFileSync: () => input || '',
  };

  const mockRequire = (mod) => {
    if (mod === 'fs') return mockFs;
    return {};
  };

  try {
    const sandbox = {
      console: mockConsole,
      require: mockRequire,
      input: input || '',
      parseInt,
      parseFloat,
      Math,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      JSON,
      Date,
      RegExp,
    };

    const context = vm.createContext(sandbox);
    const script = new vm.Script(code);
    script.runInContext(context, { timeout: 2000 });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: stderr ? 1 : 0
    };
  } catch (err) {
    return {
      stdout: stdout.trim(),
      stderr: err.message || String(err),
      exitCode: 1
    };
  }
}

/**
 * Native Zero-Latency Local Python Subprocess Runner
 */
function runLocalPython(code, input = '') {
  try {
    const result = spawnSync('python', ['-c', code], {
      input: input || '',
      encoding: 'utf8',
      timeout: 2500,
      maxBuffer: 1024 * 1024
    });

    if (result.error) {
      const pyResult = spawnSync('py', ['-c', code], {
        input: input || '',
        encoding: 'utf8',
        timeout: 2500,
        maxBuffer: 1024 * 1024
      });
      if (!pyResult.error) {
        return {
          stdout: (pyResult.stdout || '').trim(),
          stderr: (pyResult.stderr || '').trim(),
          exitCode: pyResult.status || 0
        };
      }
      return null;
    }

    return {
      stdout: (result.stdout || '').trim(),
      stderr: (result.stderr || '').trim(),
      exitCode: result.status || 0
    };
  } catch {
    return null;
  }
}

/**
 * Multi-Tier Resilient Code Execution Engine (Local Native -> Groq -> Gemini)
 */
async function simulateCodeRun(code, language = 'Python', input = '') {
  const lang = (language || '').toLowerCase().trim();

  // Tier 1: Local Native JavaScript
  if (lang === 'javascript' || lang === 'js' || lang === 'node') {
    return runLocalJavaScript(code, input);
  }

  // Tier 2: Local Native Python
  if (lang === 'python' || lang === 'py' || lang === 'python3') {
    const localPyRes = runLocalPython(code, input);
    if (localPyRes) return localPyRes;
  }

  // Tier 3: Groq High-Speed LLM Fallback (Zero 429 quota issues)
  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = require('groq-sdk');
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = `You are a code execution engine. Simulate the output of this code and output strictly in JSON schema {"stdout": "...", "stderr": "...", "exitCode": 0}.
Language: ${language}
Input: ${input || 'None'}
Code:
${code}`;

      const res = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      const content = res.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (groqErr) {
      logger.warn('groq_code_sim_failed', { err: String(groqErr) });
    }
  }

  // Tier 4: Gemini 2.5 Flash Fallback
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Simulate this code and return JSON schema {"stdout": "...", "stderr": "...", "exitCode": 0}:
Language: ${language}
Input: ${input || 'None'}
Code:
${code}`;

    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    logger.error('code_execution_fallback_failed', { err: String(err) });
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
