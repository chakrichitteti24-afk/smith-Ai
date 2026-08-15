/**
 * groqService.js
 *
 * RESPONSIBILITY: AI inference for the technical interviewer (Smith AI) using Groq.
 * Handles transcript cleaning, intro greeting, answer evaluation/follow-up questions,
 * final candidate assessment reports, and audio transcription via Whisper Large v3.
 *
 * Uses: llama-3.1-8b-instant (LLM), whisper-large-v3 (STT)
 */

'use strict';

const Groq = require('groq-sdk');
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { randomUUID } = require('crypto');
const { sanitiseAIResponse } = require('../utils/transcriptCleaner');
const { logger } = require('../middleware/logger');

const MODEL         = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const WHISPER_MODEL = 'whisper-large-v3-turbo';

logger.info('groq_models_selected', { llm: MODEL, stt: WHISPER_MODEL });

let _client = null;
function getClient() {
  if (!_client) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set');
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
}

// Separate client for Whisper — uses GROQ_WHISPER_API_KEY if set, otherwise falls back to GROQ_API_KEY
let _whisperClient = null;
function getWhisperClient() {
  if (!_whisperClient) {
    const key = process.env.GROQ_WHISPER_API_KEY || process.env.GROQ_API_KEY;
    if (!key) throw new Error('No API key available for Whisper (set GROQ_WHISPER_API_KEY or GROQ_API_KEY)');
    _whisperClient = new Groq({ apiKey: key });
  }
  return _whisperClient;
}

// Rolling memory window — keep last N exchanges to stay token-efficient
const MEMORY_WINDOW = 10; // 5 Q/A pairs for better context

const CLEANING_SYSTEM_PROMPT = `You clean interview transcripts.
Remove: filler words (um, uh, like, you know, actually, basically), repeated words (I I am -> I am), stutters, and accidental duplicate phrases.
Fix: capitalization, punctuation.
CRITICAL RULES:
- Preserve technical terms (React, Node.js, etc), variable names, programming keywords, and code snippets EXACTLY as spoken.
- Do not remove filler words if they are intentionally part of the sentence (e.g., "I actually like Python").
Return ONLY the cleaned text. No explanations. No extra text.`;

const BASE_SYSTEM_PROMPT = `SYSTEM PROMPT — SMITH AI (45-MINUTE PROFESSIONAL INTERVIEW SYSTEM)

You are Smith AI, a strict, professional, fair AI technical interviewer.

==================================================
1. TOTAL INTERVIEW DURATION & TIME CONTROL
==================================================
- Maximum total interview duration: 45 MINUTES (HARD MAXIMUM LIMIT).
- Target time allocation across rounds:
  * Introduction / HR: 5–7 minutes
  * Technical: 15–18 minutes
  * Coding: 12–15 minutes
  * Final HR / Behavioral: 5–7 minutes
- Never allow one round to consume the entire interview.
- Continuously track elapsed time, remaining time, current round, remaining rounds, and questions already asked.
- As remaining time shortens, ask shorter, high-value questions and move briskly to required remaining rounds.

==================================================
2. INTERVIEW STRUCTURE & ROUND PROGRESSION
==================================================
- Default Flow: Welcome/Intro -> HR -> Technical -> Coding -> Final HR/Behavioral -> Complete.
- Introduction / HR Round:
  1. Wish the candidate naturally.
  2. Introduce Smith AI as the AI technical interviewer.
  3. Confirm the target role and seniority level.
  4. Briefly explain the 45-minute structured interview flow.
  5. Ask ONE introductory question ("Could you tell me about yourself?").
  6. Never start immediately with a technical or coding question.
- Technical Round:
  * Questions must be role-specific, experience-appropriate, non-repetitive, and progressively difficult.
  * The Coding Sandbox MUST NOT be visible during the normal Technical Round. Technical concepts are discussed verbally.
- Coding Round:
  * Announce clearly: "We'll now move to the coding assessment. I'll provide a problem based on your role and selected programming language. You can implement your solution in the coding sandbox."
  * Provide problem statement, input requirements, expected output, constraints, examples, expected language, and evaluation criteria.
- Coding Round Completion:
  * Once completed, state clearly: "Thank you. That completes the coding assessment. Let's move on to the final behavioral section."
  * The Coding Sandbox MUST CLOSE and CANNOT be reopened.

==================================================
3. QUESTION RULES & ACKNOWLEDGEMENTS
==================================================
- Always ask ONLY ONE question at a time.
- QUESTION NON-REPETITION: Never repeat questions or ask semantically similar questions. Compare against conversation history before asking.
- ANSWER ACKNOWLEDGEMENT: After each response, acknowledge briefly in 1-2 polite, neutral sentences (e.g. "Thank you. Let me ask you about..."). Do not excessively praise or reveal scores.

==================================================
4. RESUME & ROLE & EXPERIENCE AWARENESS
==================================================
- Resume is OPTIONAL. If provided, use only facts from the resume. If NO resume is uploaded, NEVER say "I reviewed your resume" or invent projects/experience.
- Tailor questions strictly to selected role (Frontend, Backend, Python, Cybersecurity, Systems, etc.) and seniority level (Fresher, Beginner, Intermediate, Experienced, Senior).

==================================================
5. STRICT PROFESSIONAL BEHAVIOR
==================================================
- Always remain professional, polite, neutral, strict, and fair.
- NEVER use casual slang (e.g. "bro", "cool", "what's up").
- OFF-TOPIC: Politely redirect off-topic responses back to the interview.
- CANDIDATE DOES NOT KNOW: If candidate says "I don't know", respond neutrally ("That's alright. We'll move to the next question.") and ask a new question without revealing the answer.

==================================================
6. FINAL COMPLETION & EVALUATION
==================================================
- When all rounds finish or 45 minutes elapse, state clearly: "Thank you, [Name]. That concludes your interview. Your responses and coding assessment will now be evaluated."
- Never fabricate evaluation evidence. Do not inflate scores.

OUTPUT FORMAT:
Return ONLY your spoken response as Smith. Do not wrap in JSON, markdown code blocks, or meta-commentary.`;

const INTRO_PROMPT = `You are Smith AI, a strict, professional, fair AI Technical Interviewer.
Generate the opening greeting for a 45-MINUTE PROFESSIONAL INTERVIEW session.

Context provided:
- Candidate Name
- Target Role
- Seniority Level
- Preferred Language
- Resume Context (if available)

Instructions:
1. Wish the candidate naturally and welcome them.
2. Introduce yourself as Smith, the AI technical interviewer.
3. Confirm the target role and level.
4. Briefly explain the 45-minute structured interview format (Intro -> Technical -> Coding -> Behavioral).
5. If resume is available, mention reviewing their background. If no resume, do NOT mention reviewing a resume.
6. End with ONE open-ended introductory question ("Could you tell me about yourself and your background?").
7. Keep it warm, structured, and professional (3-4 sentences).
8. Speak strictly in the requested Preferred Language.`;

const ANALYSIS_PROMPT = `You are Smith AI, a senior technical interviewer conducting a strict final evaluation. The 45-minute interview is complete.
Generate a highly rigorous, realistic, objective final evaluation of the candidate based strictly on their performance recorded in conversation history and coding submissions.

EVALUATION WEIGHTS & SCORING RULES:
- ABSOLUTELY NO DEFAULT OR FAKE SCORES. Do not inflate scores.
- Evaluate:
  * Correctness & Accuracy (35% coding / 20% overall)
  * Test Case & Edge Case Handling (20% coding)
  * Problem Solving & Logical Reasoning (15% coding / 20% overall)
  * Time Complexity & Efficiency (10% coding)
  * Space Complexity (5% coding)
  * Code Quality & Structure (10% coding)
  * Communication & Articulation (15% overall)
  * Role Knowledge & Seniority Fit (10% overall)

- Calculate "overallScore" accurately from individual dimensions on a 0-100 scale.
- Calculate "overallRating":
  * 85+ = "Excellent"
  * 70-84 = "Good"
  * 50-69 = "Average"
  * below 50 = "Needs Improvement"

- Calculate "hiringRecommendation" strictly as one of:
  "Strong Hire" | "Hire" | "Borderline" | "Needs Improvement" | "Not Ready"

Return ONLY raw JSON (no markdown wrapper like \`\`\`json):
{
  "accuracyScore": 65,
  "confidenceScore": 75,
  "logicalThinkingScore": 60,
  "communicationScore": 70,
  "codingScore": 50,
  "overallScore": 64,
  "overallRating": "Average",
  "strengths": ["Cites specific transcript evidence..."],
  "weaknesses": ["Cites specific transcript evidence..."],
  "mostCommonMistakes": ["Cites specific mistake..."],
  "technicalGaps": ["Cites technical gap..."],
  "codingGaps": ["Cites coding gap..."],
  "communicationGaps": ["Cites communication gap..."],
  "topicsToStudy": ["Topic 1", "Topic 2"],
  "weakAreas": ["Area 1", "Area 2"],
  "suggestedPractice": ["Practice item 1"],
  "interviewPrepTips": ["Tip 1"],
  "hiringRecommendation": "Borderline"
}`;

/**
 * Transcribe audio using Groq Whisper Large v3.
 * @param {Buffer} audioBuffer - Raw audio buffer from multer
 * @param {string} mimeType - MIME type of the audio
 * @returns {Promise<string>} Transcribed text
 */
async function transcribeAudio(audioBuffer, mimeType = 'audio/webm', language = 'English') {
  const client = getWhisperClient();

  // Determine file extension from MIME type
  const extMap = {
    'audio/webm': '.webm',
    'audio/ogg': '.ogg',
    'audio/wav': '.wav',
    'audio/mp4': '.mp4',
    'audio/mpeg': '.mp3',
    'audio/mp3': '.mp3',
    'audio/flac': '.flac',
  };
  const ext = extMap[mimeType] || '.webm';

  // We let Whisper auto-detect the language to better handle English-Telugu mixed speech.
  // Not forcing a language code improves accuracy for code-switching.

  // Write buffer to a temp file (Groq SDK requires a file stream)
  const tmpDir  = os.tmpdir();
  const tmpFile = path.join(tmpDir, `smith-audio-${Date.now()}-${randomUUID()}${ext}`);

  try {
    fs.writeFileSync(tmpFile, audioBuffer);

    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: WHISPER_MODEL,
      response_format: 'json',
    });

    const text = transcription.text || '';
    logger.info('whisper_transcribed', { model: WHISPER_MODEL, length: text.length });
    return text;
  } catch (err) {
    logger.error('whisper_transcription_failed', { err: String(err) });
    throw new Error('Audio transcription failed: ' + err.message);
  } finally {
    // Clean up temp file
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

/**
 * Clean a raw transcript via Groq.
 * @param {string} rawTranscript
 * @returns {Promise<string>} Cleaned transcript
 */
async function cleanTranscript(rawTranscript) {
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      temperature: 0.1,
      messages: [
        { role: 'system', content: CLEANING_SYSTEM_PROMPT },
        { role: 'user',   content: rawTranscript },
      ],
    });

    const cleaned = completion.choices?.[0]?.message?.content?.trim() ?? rawTranscript;
    logger.debug('groq_cleaned', { original: rawTranscript, cleaned });
    return cleaned;
  } catch (err) {
    logger.warn('groq_cleanTranscript_failed', { err: String(err) });
    return rawTranscript;
  }
}

/**
 * Generate starting greeting and question.
 */
async function generateIntro({ name, role, level, language, difficulty, resumeContext, interviewType }) {
  try {
    const client = getClient();
    const resumeInfo = resumeContext ? `\nCandidate Resume: ${JSON.stringify(resumeContext)}` : '';
    const roundInfo = interviewType ? `\nInterview Round: ${interviewType}` : '';

    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        { role: 'system', content: INTRO_PROMPT },
        {
          role: 'user',
          content: `Candidate: ${name || 'the candidate'}. Role: ${role}. Level: ${level}. Preferred Language: ${language}. Difficulty: ${difficulty}.${roundInfo}${resumeInfo}\nBegin the interview.`,
        },
      ],
    });

    const text = completion.choices?.[0]?.message?.content ?? '';
    const clean = sanitiseAIResponse(text);
    logger.info('groq_intro', { name, role, level, response: clean });
    return clean;
  } catch (err) {
    logger.error('groq_generateIntro_failed', { err: String(err) });
    return `Hello, I'm Smith and I'll be conducting your ${interviewType || 'technical'} interview today for the ${role} position. Please start by telling me a bit about your background and what brings you here.`;
  }
}

/**
 * Evaluate an answer and generate the next question.
 */
async function evaluateAndQuestion({ role, level, language, difficulty, history, cleanedTranscript, resumeContext, interviewType }) {
  try {
    const client = getClient();
    const windowedHistory = history.slice(-MEMORY_WINDOW);

    // Build context-rich system prompt
    let systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n--- CURRENT SESSION CONTEXT ---\nRole: ${role} | Level: ${level} | Preferred Language: ${language} | Difficulty: ${difficulty}`;
    if (interviewType) systemPrompt += ` | Round: ${interviewType}`;
    if (resumeContext) {
      systemPrompt += `\n\nCANDIDATE RESUME (use for personalized follow-ups):\n${JSON.stringify(resumeContext, null, 2)}`;
    }

    // Extract previous questions to enforce anti-repetition
    const prevAssistantMsgs = windowedHistory
      .filter(m => m.role === 'assistant')
      .map((m, i) => `${i + 1}. ${m.content}`)
      .join('\n');
    if (prevAssistantMsgs) {
      systemPrompt += `\n\nQUESTIONS ALREADY ASKED — DO NOT REVISIT THESE TOPICS:\n${prevAssistantMsgs}`;
    }

    // ── Code submission: override to produce spec §10 closing phrase ──────────
    const isCodeSubmission = cleanedTranscript.startsWith('[Candidate submitted code');
    if (isCodeSubmission) {
      systemPrompt += `

CODE SUBMISSION TRANSITION RULE (CRITICAL — OVERRIDE ALL OTHER CODING RULES):
The candidate has just submitted their code solution. Your response MUST:
1. Acknowledge the submission in 1 brief, neutral sentence (e.g. "Thank you for your submission.").
2. Immediately follow with this EXACT phrase: "That completes the coding assessment. Let's move on to the final section."
3. Do NOT ask any follow-up questions about time complexity, space complexity, edge cases, or optimisations.
4. Do NOT generate another coding problem.
5. Keep the total response under 3 sentences.`;
    } else if (interviewType === 'Coding Round') {
      const hasAnnounced = windowedHistory.some(m => m.role === 'assistant' && (m.content.includes("move to the Coding Assessment") || m.content.includes("Coding Assessment")));
      if (!hasAnnounced) {
        systemPrompt += `\n\nCODING ROUND START RULE (CRITICAL):
Your next response MUST start EXACTLY with this phrase (word for word, no deviations): "We've completed the technical discussion. We'll now move to the Coding Assessment."
After that sentence, you must provide a coding problem adapted to the candidate's role (${role}).
Topic Suggestions:
- Software Engineer: Arrays, Strings, Linked Lists, Trees, Recursion, Dynamic Programming.
- Backend Engineer: APIs, SQL, Database Design, Caching, Concurrency.
- Frontend Engineer: JavaScript, React, HTML/CSS, DOM, State Management.
- Cybersecurity: Secure Coding, Input Validation, Cryptography Basics, Networking, OWASP.
- AI/ML Engineer: Python, NumPy, Pandas, Machine Learning Algorithms, Data Processing.

Ask them to solve this problem. Keep it clear and concise.`;
      } else {
        systemPrompt += `\n\nCODING ROUND RULE:
You are currently in the Coding Round. The candidate is using a code editor to solve problems. Ask follow-up questions about time complexity, space complexity, edge cases, and optimization.`;
      }
    }

    // Append the candidate's latest answer to the history for context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...windowedHistory,
      { role: 'user', content: cleanedTranscript },
    ];

    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 600,
      temperature: 0.7,
      messages,
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';
    const fullResponse = sanitiseAIResponse(raw);

    // Split response into feedback + question
    // Smith's output is: [1-2 sentence feedback]. [1 question sentence].
    // Split on sentence boundary (period/question mark followed by space + capital letter)
    const sentenceMatch = fullResponse.match(/^(.+?[.!?])\s+([A-Z].+)$/s);
    let feedback, question;
    if (sentenceMatch && sentenceMatch[2].length > 10) {
      feedback = sentenceMatch[1].trim();
      question = sentenceMatch[2].trim();
    } else {
      // Fallback: treat whole response as question
      feedback = '';
      question = fullResponse;
    }

    logger.info('groq_evaluate', { role, level, interviewType, feedback: feedback.slice(0, 80), question: question.slice(0, 80) });
    return { feedback, question, fullResponse };
  } catch (err) {
    logger.error('groq_evaluateAndQuestion_failed', { err: String(err) });
    return {
      feedback: 'Good answer.',
      question: 'Let me ask you something related — can you walk me through how you would approach that problem from a different angle?',
      fullResponse: 'Good answer. Let me ask you something related — can you walk me through how you would approach that problem from a different angle?',
    };
  }
}

/**
 * Evaluate an answer and generate the next question via stream.
 */
async function evaluateAndQuestionStream({ role, level, language, difficulty, history, cleanedTranscript, resumeContext, interviewType }) {
  try {
    const client = getClient();
    const windowedHistory = history.slice(-MEMORY_WINDOW);

    let systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n--- CURRENT SESSION CONTEXT ---\nRole: ${role} | Level: ${level} | Preferred Language: ${language} | Difficulty: ${difficulty}`;
    if (interviewType) systemPrompt += ` | Round: ${interviewType}`;
    if (resumeContext) {
      systemPrompt += `\n\nCANDIDATE RESUME (use for personalized follow-ups):\n${JSON.stringify(resumeContext, null, 2)}`;
    }

    const prevAssistantMsgs = windowedHistory
      .filter(m => m.role === 'assistant')
      .map((m, i) => `${i + 1}. ${m.content}`)
      .join('\n');
    if (prevAssistantMsgs) {
      systemPrompt += `\n\nQUESTIONS ALREADY ASKED — DO NOT REVISIT THESE TOPICS:\n${prevAssistantMsgs}`;
    }

    // ── Code submission: override to produce spec §10 closing phrase ──────────
    const isCodeSubmission = cleanedTranscript.startsWith('[Candidate submitted code');
    if (isCodeSubmission) {
      systemPrompt += `

CODE SUBMISSION TRANSITION RULE (CRITICAL — OVERRIDE ALL OTHER CODING RULES):
The candidate has just submitted their code solution. Your response MUST:
1. Acknowledge the submission in 1 brief, neutral sentence (e.g. "Thank you for your submission.").
2. Immediately follow with this EXACT phrase: "That completes the coding assessment. Let's move on to the final section."
3. Do NOT ask any follow-up questions about time complexity, space complexity, edge cases, or optimisations.
4. Do NOT generate another coding problem.
5. Keep the total response under 3 sentences.`;
    } else if (interviewType === 'Coding Round') {
      const hasAnnounced = windowedHistory.some(m => m.role === 'assistant' && (m.content.includes("move to the Coding Assessment") || m.content.includes("Coding Assessment")));
      if (!hasAnnounced) {
        systemPrompt += `\n\nCODING ROUND START RULE (CRITICAL):
Your next response MUST start EXACTLY with this phrase (word for word, no deviations): "We've completed the technical discussion. We'll now move to the Coding Assessment."
After that sentence, you must provide a coding problem adapted to the candidate's role (${role}).
Topic Suggestions:
- Software Engineer: Arrays, Strings, Linked Lists, Trees, Recursion, Dynamic Programming.
- Backend Engineer: APIs, SQL, Database Design, Caching, Concurrency.
- Frontend Engineer: JavaScript, React, HTML/CSS, DOM, State Management.
- Cybersecurity: Secure Coding, Input Validation, Cryptography Basics, Networking, OWASP.
- AI/ML Engineer: Python, NumPy, Pandas, Machine Learning Algorithms, Data Processing.

Ask them to solve this problem. Keep it clear and concise.`;
      } else {
        systemPrompt += `\n\nCODING ROUND RULE:
You are currently in the Coding Round. The candidate is using a code editor to solve problems. Ask follow-up questions about time complexity, space complexity, edge cases, and optimization.`;
      }
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...windowedHistory,
      { role: 'user', content: cleanedTranscript },
    ];

    const stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 600,
      temperature: 0.7,
      messages,
      stream: true,
    });

    return stream;
  } catch (err) {
    logger.error('groq_evaluateAndQuestionStream_failed', { err: String(err) });
    throw err;
  }
}

/**
 * Generate final interview analysis.
 */
async function generateFinalAnalysis({ role, level, language, difficulty, history, resumeContext, interviewType }) {
  try {
    // Filter for candidate responses (messages with role === 'user' or from candidate)
    const candidateResponses = (history || []).filter(msg => 
      msg.role === 'user' || 
      msg.sender === 'candidate' ||
      (msg.role === 'assistant' && msg.content && msg.content.includes('[Candidate submitted code'))
    );

    if (candidateResponses.length < 3) {
      logger.info('groq_analysis_premature_exit', { role, level, responseCount: candidateResponses.length });
      return JSON.stringify({
        accuracyScore: null,
        confidenceScore: null,
        logicalThinkingScore: null,
        communicationScore: null,
        codingScore: null,
        overallScore: null,
        overallRating: null,
        strengths: [],
        weaknesses: [
          "Ended the interview session prematurely with insufficient responses.",
          "Failed to answer enough questions to evaluate technical, coding, or problem-solving skills."
        ],
        mostCommonMistakes: ["Exiting the interview early before answering questions."],
        technicalGaps: ["Could not assess technical skills due to premature session end."],
        codingGaps: ["Could not assess coding skills due to premature session end."],
        communicationGaps: ["Insufficient speaking length to evaluate communication."],
        topicsToStudy: ["General core engineering concepts", "React or Backend systems depending on role"],
        weakAreas: ["Interview completion endurance"],
        suggestedPractice: ["Take a full mock interview session"],
        interviewPrepTips: ["Prepare for at least 8 questions", "Give detailed answers with code examples"],
        hiringRecommendation: null
      });
    }

    const client = getClient();
    // Use more history for final analysis — up to 20 messages
    const windowedHistory = history.slice(-20);
    
    let contextPrompt = `Role: ${role} (${level}), Language: ${language}, Difficulty: ${difficulty}`;
    if (interviewType) contextPrompt += `, Round: ${interviewType}`;
    if (resumeContext) contextPrompt += `, Resume: ${JSON.stringify(resumeContext)}`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: ANALYSIS_PROMPT },
        ...windowedHistory,
        {
          role: 'user',
          content: `The interview is now complete. Generate a comprehensive evaluation for this ${role} (${level}) candidate. Context: ${contextPrompt}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';
    const clean = raw.trim();
    logger.info('groq_analysis', { role, level, analysis: clean });
    return clean;
  } catch (err) {
    logger.error('groq_generateFinalAnalysis_failed', { err: String(err) });
    return JSON.stringify({
      accuracyScore: null,
      confidenceScore: null,
      logicalThinkingScore: null,
      communicationScore: null,
      codingScore: null,
      overallScore: null,
      overallRating: null,
      strengths: [],
      weaknesses: ["Unable to complete assessment due to system timeout or API issues"],
      mostCommonMistakes: ["API communication failure during generation."],
      technicalGaps: ["System error occurred."],
      codingGaps: ["System error occurred."],
      communicationGaps: ["System error occurred."],
      topicsToStudy: ["Restart mock interview to generate insights."],
      weakAreas: ["API availability"],
      suggestedPractice: ["Run another session once API is stable."],
      interviewPrepTips: ["Verify your network connection."],
      hiringRecommendation: null
    });
  }
}

module.exports = {
  cleanTranscript,
  generateIntro,
  evaluateAndQuestion,
  evaluateAndQuestionStream,
  generateFinalAnalysis,
  transcribeAudio,
};
