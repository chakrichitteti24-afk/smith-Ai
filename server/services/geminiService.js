const { GoogleGenerativeAI } = require('@google/generative-ai');
const { spawnSync } = require('child_process');
const https = require('https');
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
 * Native Zero-Latency Local JavaScript Runner using Node.js Subprocess
 * Direct stdin piping & full ES/Node compatibility.
 */
function runLocalJavaScript(code, input = '') {
  try {
    const result = spawnSync(process.execPath, ['-e', code], {
      input: input || '',
      encoding: 'utf8',
      timeout: 3000,
      maxBuffer: 1024 * 1024
    });

    if (result.error) {
      return {
        stdout: '',
        stderr: result.error.message || 'Execution error',
        exitCode: 1
      };
    }

    return {
      stdout: (result.stdout || '').trim(),
      stderr: (result.stderr || '').trim(),
      exitCode: result.status !== null ? result.status : (result.stderr ? 1 : 0)
    };
  } catch (err) {
    return {
      stdout: '',
      stderr: err.message || String(err),
      exitCode: 1
    };
  }
}

/**
 * Native Zero-Latency Local Python Subprocess Runner
 */
function runLocalPython(code, input = '') {
  const binaries = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];

  for (const bin of binaries) {
    try {
      const result = spawnSync(bin, ['-c', code], {
        input: input || '',
        encoding: 'utf8',
        timeout: 3000,
        maxBuffer: 1024 * 1024
      });

      if (!result.error) {
        return {
          stdout: (result.stdout || '').trim(),
          stderr: (result.stderr || '').trim(),
          exitCode: result.status !== null ? result.status : (result.stderr ? 1 : 0)
        };
      }
    } catch {
      // Try next binary
    }
  }
  return null;
}

/**
 * Sandboxed Multi-Language Compiler (Wandbox)
 * Real compilers for C, C++, Java, Python, and JavaScript.
 * Returns exact compiler diagnostics, runtime stdout, stderr, and exit codes.
 */
async function runWandboxCompiler(code, language = 'cpp', input = '', timeoutMs = 8000) {
  const lang = (language || '').toLowerCase().trim();
  
  let compiler = 'gcc-head';
  let cleanCode = code;

  if (lang === 'cpp' || lang === 'c++') {
    compiler = 'gcc-head';
  } else if (lang === 'c') {
    compiler = 'gcc-head-c';
  } else if (lang === 'java') {
    compiler = 'openjdk-jdk-22+36';
    // Remove 'public' modifier from class declaration so single-file compilation succeeds in Java
    cleanCode = cleanCode.replace(/public\s+class\s+([A-Za-z0-9_]+)/g, 'class $1');
  } else if (lang === 'python' || lang === 'py' || lang === 'python3') {
    compiler = 'cpython-head';
  } else if (lang === 'javascript' || lang === 'js' || lang === 'node') {
    compiler = 'nodejs-20.17.0';
  }

  const payload = JSON.stringify({
    code: cleanCode,
    compiler,
    stdin: input || ''
  });

  return new Promise((resolve) => {
    const u = new URL('https://wandbox.org/api/compile.json');
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'SmithAI-Compiler/2.0'
      },
      timeout: timeoutMs
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const resp = JSON.parse(data);
          const stdout = (resp.program_output || '').trim();
          const stderr = (resp.compiler_error || resp.program_error || resp.compiler_message || '').trim();
          const exitCode = parseInt(resp.status, 10) || (stderr && !stdout ? 1 : 0);
          resolve({ stdout, stderr, exitCode });
        } catch (parseErr) {
          resolve({ stdout: '', stderr: 'Compiler output parsing error: ' + parseErr.message, exitCode: 1 });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ stdout: '', stderr: 'Compiler connection error: ' + err.message, exitCode: 1 });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ stdout: '', stderr: 'Time Limit Exceeded (Execution timed out).', exitCode: 124 });
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Genuine Real-Time Multi-Language Code Compiler & Runner
 * - JavaScript: Local native Node.js process (0ms overhead)
 * - Python: Local native Python 3 interpreter (0ms overhead, with Wandbox fallback)
 * - C++ / C / Java: Real GCC & OpenJDK Sandbox (Wandbox)
 * NO FAKE LLM HALLUCINATIONS OR SIMULATIONS.
 */
async function simulateCodeRun(code, language = 'Python', input = '') {
  const lang = (language || '').toLowerCase().trim();

  // 1. JavaScript (Node.js) -> Local Native Process
  if (lang === 'javascript' || lang === 'js' || lang === 'node') {
    return runLocalJavaScript(code, input);
  }

  // 2. Python -> Local Native Process
  if (lang === 'python' || lang === 'py' || lang === 'python3') {
    const localPyRes = runLocalPython(code, input);
    if (localPyRes) return localPyRes;
  }

  // 3. C, C++, Java, and Remote Fallback -> Real Sandboxed Compiler (Wandbox)
  return await runWandboxCompiler(code, language, input);
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
    logger.warn('gemini_code_evaluation_failed, trying Codestral fallback...', { err: String(err) });
    if (process.env.MISTRAL_API_KEY) {
      try {
        const { evaluateCodeWithCodestral } = require('./mistralService');
        const codestralRes = await evaluateCodeWithCodestral(code, language, questionText);
        return codestralRes;
      } catch (codestralErr) {
        logger.error('codestral_fallback_failed', { err: codestralErr.message });
      }
    }
    return {
      correctness: "Unable to evaluate correctness.",
      passedTestCases: "?/?",
      failedTestCases: "Unknown",
      timeComplexity: "Unknown",
      spaceComplexity: "Unknown",
      edgeCases: "Unable to evaluate edge cases.",
      codeQuality: "Code received.",
      optimization: "No optimization available.",
      recommendedSolution: "// N/A",
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
    logger.warn('gemini_generate_question_failed, trying Codestral fallback...', { err: String(err) });
    if (process.env.MISTRAL_API_KEY) {
      try {
        const { generateCodingQuestionWithCodestral } = require('./mistralService');
        const q = await generateCodingQuestionWithCodestral(difficulty, role);
        return {
          title: q.title || 'Dynamic Problem',
          difficulty: q.difficulty || difficulty,
          questionText: q.description || q.questionText,
          examples: q.examples || []
        };
      } catch (codestralErr) {
        logger.error('codestral_generate_question_failed', { err: codestralErr.message });
      }
    }
    throw new Error('Failed to generate practice question: ' + err.message);
  }
}

module.exports = {
  parseResume,
  simulateCodeRun,
  evaluateCodeSubmission,
  generateCodingQuestion
};
