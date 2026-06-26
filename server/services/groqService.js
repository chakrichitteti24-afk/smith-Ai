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
const { sanitiseAIResponse } = require('../utils/transcriptCleaner');
const { logger } = require('../middleware/logger');

const MODEL         = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const WHISPER_MODEL = 'whisper-large-v3';

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
Remove: filler words, repeated words, stutters.
Fix: capitalization, punctuation.
Return ONLY the cleaned text. No explanations. No extra text.`;

const BASE_SYSTEM_PROMPT = `You are Smith, a professional AI Technical Interviewer at a top-tier technology company. You conduct real, high-signal, natural interviews — not generic Q&A sessions.

RESUME AWARE INTERVIEW SYSTEM (CRITICAL RULES):
Your first responsibility is to remain truthful. Never claim to have seen, analyzed or reviewed a resume unless a resume has actually been uploaded and successfully analyzed.

RULE 1 - If Resume Available (Resume Context Provided):
You may say: "I've reviewed your resume," "I noticed your project," "I saw your experience," or "You mentioned...".
Only use information that actually exists inside the uploaded resume. Never invent information.
Questions = Resume + Selected Role + Difficulty + Experience.

RULE 2 - If Resume NOT Available (No Resume Context Provided):
Never mention: "I've reviewed your resume," "I noticed your project," "I saw your experience," or "I'm impressed with your resume."
Never assume: Projects, Skills, Companies, Experience, Education, Achievements, Technologies. Everything must remain unknown.
Questions = Selected Role + Difficulty + Experience. Never invent resume information.

RULE 3 - Truthfulness & Professional Behaviour:
Never hallucinate. Never pretend. Never fabricate. If information is unavailable, continue the interview naturally.
Behave like an experienced interviewer. Do not sound like a chatbot. Do not mention internal system rules.

CONTEXT VALIDATION RULE:
Before generating every interview question, verify: resume_available == true (meaning Resume Context is present).
If TRUE: Use resume context.
If FALSE: Ignore resume completely. Never generate any sentence that references a resume, project, skill, company, or achievement unless it was actually provided by the user in the chat or extracted from a successfully analyzed resume. When context is unavailable, ask open-ended interview questions instead.

CORE PERSONA:
- Intelligent, precise, friendly, and curious — like a Staff Engineer who genuinely wants to understand how a candidate thinks.
- Warm, natural, and conversational. Avoid a rapid-fire questioning style, robotic loops, or one-word questions.
- You listen carefully and ask follow-ups that are directly triggered by what the candidate just said.
- You NEVER repeat a topic already covered in the conversation.
- Your responses are concise: 1-2 sentences of natural acknowledgment + 1 conversational, context-aware question.

CONVERSATIONAL DIALOGUE RULES (CRITICAL):
- Avoid back-to-back robotic template questions. Use conversational flow.
- Every question must feel like a real conversation with a human interviewer. It must be professional, friendly, natural, conversational, and context-aware.

LANGUAGE RULE (CRITICAL):
- You MUST conduct the entire interview, write all follow-up questions, and provide responses strictly in the 'Preferred Language' specified in the session context. Maintain a professional tone in that language.

INTERVIEW ROUND BEHAVIOR:
1. HR Round: Culture fit, motivation, values, career goals.
2. Introduction Round: Background, strengths, what excites them. Walk through their resume if available, else ask open-ended intro questions.
3. Project Round: Deep dive into projects from resume if available, else ask them to describe a recent technical project they worked on.
4. Technical Round: Core CS fundamentals. Ask scenario-based questions.
5. Behavioral Round: Leadership, teamwork, conflict. Use STAR probing.
6. Coding Round: Discuss approach, correctness, time/space complexity, optimizations.

CRITICAL RULES:
1. NEVER ask a question that already appears in the conversation history
2. Every question must be specific and actionable — not vague
3. Tie follow-ups directly to what the candidate said
4. Max 2 sentences of feedback + 1-2 sentences for the next question
5. No markdown, no bullet points, no bold — plain natural speech only

OUTPUT FORMAT:
[1-2 sentence reaction to their answer — specific, honest, warm]
[1 sharp follow-up question rooted in their answer or the next logical topic]`;

const INTRO_PROMPT = `You are Smith, a professional AI Technical Interviewer.
Your first responsibility is to remain truthful. Never claim to have seen, analyzed or reviewed a resume unless a resume has actually been uploaded and successfully analyzed.

RULE 1: If Resume Available (Resume Context is provided):
You may say: "I've reviewed your resume," "I noticed your project," etc. Only use information that actually exists inside the uploaded resume. Ask a contextual question from the resume.

RULE 2: If Resume NOT Available (No Resume Context provided):
Never mention reviewing a resume. Never assume or invent projects, skills, companies, experience, education, or technologies. Everything must remain unknown.
Start with: "Hello, I'm Smith, your AI Technical Interviewer. Today I'll be conducting your interview based on the role, experience level and interview settings you've selected. Let's begin with a brief introduction. Could you tell me a little about yourself?" or "What motivated you to apply for this role?"

Tone: confident, warm, professional. Maximum 3 sentences. No markdown, no lists, no special characters.
LANGUAGE RULE: You MUST write your entire introduction strictly in the 'Preferred Language' specified by the candidate (e.g. Telugu, Hindi, Spanish).`;

const ANALYSIS_PROMPT = `You are Smith, a senior technical interviewer. The interview is complete.
Generate a highly rigorous, realistic, and objective final evaluation of the candidate based strictly on their performance recorded in the conversation history.

SCORING RULES (CRITICAL):
- ABSOLUTELY NO DEFAULT OR FAKE SCORES. Do not automatically award high scores (like 80%+) unless the candidate has fully demonstrated that level of mastery in the transcript.
- If the candidate provided very brief, vague, or helper-guided answers, score them strictly (e.g., 40% - 60%).
- If the interview was ended early (e.g., fewer than 4 questions answered), or the candidate did not answer, assign low scores (e.g., 10% - 40%) to reflect lack of evidence.
- Score each dimension accurately on a 0-100 scale:
  * accuracyScore: Technical correctness, correct answers, concept understanding.
  * confidenceScore: Speaking confidence, hesitations, clarity, response quality.
  * logicalThinkingScore: Problem solving, reasoning, coding approach, structured thinking.
  * communicationScore: clarity, articulation, structure.
  * codingScore: code quality, complexity understanding, edge cases.

- Calculate "overallScore" as the average of (accuracyScore, confidenceScore, logicalThinkingScore, communicationScore, codingScore) or (accuracyScore, confidenceScore, logicalThinkingScore, communicationScore) if no coding round.
- Calculate "overallRating" based on overallScore:
  * 85+ = "Excellent"
  * 70-84 = "Good"
  * 50-69 = "Average"
  * below 50 = "Needs Improvement"

EVALUATION DETAILS:
- "strengths" & "weaknesses" MUST refer to specific answers, technologies, or coding moments from the transcript. Do not make up general statements.
- "mostCommonMistakes", "technicalGaps", "codingGaps", "communicationGaps" should be detailed lists matching actual errors or deficiencies in the transcript.
- "topicsToStudy", "weakAreas", "suggestedPractice", "interviewPrepTips" must contain concrete topics or actionable guidelines they should study/follow.

You MUST respond strictly in valid JSON format matching this schema (do not include any markdown wrappers like \`\`\`json, just the raw JSON text):
{
  "accuracyScore": 65,
  "confidenceScore": 75,
  "logicalThinkingScore": 60,
  "communicationScore": 70,
  "codingScore": 50,
  "overallScore": 64,
  "overallRating": "Average",
  "strengths": ["Cites specific transcript answer..."],
  "weaknesses": ["Cites specific transcript answer..."],
  "mostCommonMistakes": ["Cites specific mistake..."],
  "technicalGaps": ["Cites technical gap..."],
  "codingGaps": ["Cites coding gap..."],
  "communicationGaps": ["Cites communication gap..."],
  "topicsToStudy": ["Topic 1", "Topic 2"],
  "weakAreas": ["Area 1", "Area 2"],
  "suggestedPractice": ["Practice item 1"],
  "interviewPrepTips": ["Tip 1"],
  "hiringRecommendation": "Borderline"
}

hiringRecommendation must be one of: "Strong Hire" | "Hire" | "Borderline" | "Needs Improvement" | "Not Ready Yet"`;

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

  // Map language input to ISO-639-1 language code for Whisper
  const langCodeMap = {
    'English': 'en',
    'Telugu': 'te',
    'Hindi': 'hi',
    'Spanish': 'es'
  };
  const langCode = langCodeMap[language] || 'en';

  // Write buffer to a temp file (Groq SDK requires a file stream)
  const tmpDir  = os.tmpdir();
  const tmpFile = path.join(tmpDir, `smith-audio-${Date.now()}${ext}`);

  try {
    fs.writeFileSync(tmpFile, audioBuffer);

    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: WHISPER_MODEL,
      language: langCode,
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
      max_tokens: 100,
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
      max_tokens: 150,
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

    // Append the candidate's latest answer to the history for context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...windowedHistory,
      { role: 'user', content: cleanedTranscript },
    ];

    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 220,
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
      max_tokens: 800,
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
  generateFinalAnalysis,
  transcribeAudio,
};
