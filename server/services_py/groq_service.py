"""
server/services_py/groq_service.py

Groq AI inference service for Smith AI in Python.
"""

import os
import json
import tempfile
import httpx
from groq import AsyncGroq
from config import GROQ_API_KEY, GROQ_WHISPER_API_KEY

MODEL = "llama-3.1-8b-instant"
WHISPER_MODEL = "whisper-large-v3-turbo"

def get_groq_client():
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set in environment variables")
    return AsyncGroq(api_key=GROQ_API_KEY)

def get_whisper_client():
    key = GROQ_WHISPER_API_KEY or GROQ_API_KEY
    if not key:
        raise ValueError("No API key available for Whisper")
    return AsyncGroq(api_key=key)

CLEANING_SYSTEM_PROMPT = """You clean interview transcripts.
Remove: filler words (um, uh, like, you know, actually, basically), repeated words (I I am -> I am), stutters, and accidental duplicate phrases.
Fix: capitalization, punctuation.
CRITICAL RULES:
- Preserve technical terms (React, Node.js, etc), variable names, programming keywords, and code snippets EXACTLY as spoken.
- Do not remove filler words if they are intentionally part of the sentence (e.g., "I actually like Python").
Return ONLY the cleaned text. No explanations. No extra text."""

BASE_SYSTEM_PROMPT = """You are Smith, a Senior Technical Interviewer at a top-tier technology company. You conduct real, high-signal, natural interviews. You are NOT a chatbot.

RESUME AWARE INTERVIEW SYSTEM (CRITICAL RULES):
Your first responsibility is to remain truthful. Never claim to have seen, analyzed or reviewed a resume unless a resume has actually been uploaded and successfully analyzed.

RULE 1 - If Resume Available (Resume Context Provided):
You may say: "I've reviewed your resume," "I noticed your project," "I saw your experience," or "You mentioned...".
Only use information that actually exists inside the uploaded resume. Never invent information.

RULE 2 - If Resume NOT Available (No Resume Context Provided):
Never mention: "I've reviewed your resume," "I noticed your project," "I saw your experience," or "I'm impressed with your resume."
Everything must remain unknown.

CORE PERSONA:
- Personality: Professional, Polite, Strict, Calm, Objective.
- Never say: "Awesome", "Cool", "Bro", "Great job", "No worries", "Perfect", "Excellent".
- Instead use: "Thank you.", "Let's continue.", "Please explain further.", "Could you elaborate?", "Let's move to the next question."
- Your responses are concise: 1-2 sentences of natural acknowledgment + 1 conversational, context-aware question.

LANGUAGE RULE: You MUST conduct the entire interview strictly in the 'Preferred Language' specified in the session context.

OUTPUT FORMAT:
[1-2 sentence reaction to their answer — specific, honest, professional]
[1 sharp follow-up question rooted in their answer or the next logical topic]"""

INTRO_PROMPT = """You are Smith, a professional AI Technical Interviewer.
Your first responsibility is to remain truthful. Never claim to have seen, analyzed or reviewed a resume unless a resume has actually been uploaded and successfully analyzed.

RULE 1: If Resume Available (Resume Context is provided):
You may say: "I've reviewed your resume," "I noticed your project," etc. Ask a contextual question from the resume.

RULE 2: If Resume NOT Available (No Resume Context provided):
Start with: "Hello, I'm Smith, your AI Technical Interviewer. Today I'll be conducting your interview based on the role, experience level and interview settings you've selected. Let's begin with a brief introduction. Could you tell me a little about yourself?"

Tone: confident, warm, professional. Maximum 3 sentences. No markdown, no lists.
LANGUAGE RULE: You MUST write your entire introduction strictly in the 'Preferred Language' specified by the candidate."""

ANALYSIS_PROMPT = """You are Smith, a senior technical interviewer. The interview is complete.
Generate a highly rigorous, realistic, and objective final evaluation of the candidate based strictly on their performance recorded in the conversation history.

SCORING RULES (CRITICAL):
- ABSOLUTELY NO DEFAULT OR FAKE SCORES.
- Score each dimension accurately on a 0-100 scale:
  * accuracyScore: Technical correctness
  * confidenceScore: Speaking confidence, hesitations
  * logicalThinkingScore: Problem solving, reasoning
  * communicationScore: clarity, articulation
  * codingScore: code quality, complexity

JSON OUTPUT SCHEMA:
{
  "hiringRecommendation": "Hire Recommended | Borderline | Needs Improvement",
  "overallRating": "Excellent | Good | Average | Below Average",
  "overallScore": 82,
  "accuracyScore": 85,
  "confidenceScore": 78,
  "logicalThinkingScore": 80,
  "communicationScore": 82,
  "codingScore": 84,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "technicalGaps": ["gap1"],
  "topicsToStudy": ["topic1"],
  "suggestedPractice": ["practice1"]
}
Do not include markdown formatting. Return raw JSON string only."""

async def clean_transcript(raw_text: str) -> str:
    if not raw_text or not raw_text.strip():
        return ""
    try:
        client = get_groq_client()
        res = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": CLEANING_SYSTEM_PROMPT},
                {"role": "user", "content": raw_text}
            ],
            temperature=0.1,
            max_tokens=300
        )
        return res.choices[0].message.content.strip()
    except Exception:
        return raw_text.strip()

async def generate_intro(role: str, level: str, language: str = "English", difficulty: str = "Beginner", resume_context: dict = None) -> str:
    client = get_groq_client()
    resume_available = bool(resume_context and len(resume_context) > 0)

    prompt = f"{INTRO_PROMPT}\n\nTARGET ROLE: {role}\nSENIORITY: {level}\nPREFERRED LANGUAGE: {language}\nDIFFICULTY: {difficulty}\nRESUME AVAILABLE: {resume_available}"
    if resume_available:
        prompt += f"\nRESUME CONTEXT: {json.dumps(resume_context)}"

    res = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "system", "content": prompt}],
        temperature=0.7,
        max_tokens=250
    )
    return res.choices[0].message.content.strip()

async def evaluate_and_question(role: str, level: str, candidate_answer: str, interview_type: str = "Technical Round", history: list = None, resume_context: dict = None, language: str = "English", difficulty: str = "Beginner") -> str:
    client = get_groq_client()
    resume_available = bool(resume_context and len(resume_context) > 0)
    history = history or []

    system_prompt = f"{BASE_SYSTEM_PROMPT}\n\nSESSION CONTEXT:\nRole: {role}\nLevel: {level}\nRound: {interview_type}\nLanguage: {language}\nDifficulty: {difficulty}\nResume Available: {resume_available}"
    if resume_available:
        system_prompt += f"\nRESUME CONTEXT: {json.dumps(resume_context)}"

    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-10:]:
        sender = "assistant" if (msg.get("sender") == "smith" or msg.get("role") == "assistant") else "user"
        messages.append({"role": sender, "content": msg.get("text") or msg.get("content", "")})

    messages.append({"role": "user", "content": candidate_answer})

    res = await client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.6,
        max_tokens=250
    )
    return res.choices[0].message.content.strip()

async def evaluate_and_question_stream(role: str, level: str, candidate_answer: str, interview_type: str = "Technical Round", history: list = None, resume_context: dict = None, language: str = "English", difficulty: str = "Beginner"):
    client = get_groq_client()
    resume_available = bool(resume_context and len(resume_context) > 0)
    history = history or []

    system_prompt = f"{BASE_SYSTEM_PROMPT}\n\nSESSION CONTEXT:\nRole: {role}\nLevel: {level}\nRound: {interview_type}\nLanguage: {language}\nDifficulty: {difficulty}\nResume Available: {resume_available}"
    if resume_available:
        system_prompt += f"\nRESUME CONTEXT: {json.dumps(resume_context)}"

    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-10:]:
        sender = "assistant" if (msg.get("sender") == "smith" or msg.get("role") == "assistant") else "user"
        messages.append({"role": sender, "content": msg.get("text") or msg.get("content", "")})

    messages.append({"role": "user", "content": candidate_answer})

    stream = await client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.6,
        max_tokens=250,
        stream=True
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content if chunk.choices and chunk.choices[0].delta else ""
        if delta:
            yield delta

async def generate_final_analysis(role: str, level: str, history: list = None, resume_context: dict = None) -> str:
    client = get_groq_client()
    history = history or []

    prompt = f"{ANALYSIS_PROMPT}\n\nROLE: {role}\nLEVEL: {level}\nCONVERSATION HISTORY:\n"
    for m in history[-12:]:
        sender = m.get('sender') or m.get('role') or 'user'
        text = m.get('text') or m.get('content') or ''
        prompt += f"{sender}: {text}\n"

    try:
        res = await client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": prompt}],
            temperature=0.1,
            max_tokens=600,
            response_format={"type": "json_object"}
        )
        return res.choices[0].message.content.strip()
    except Exception:
        res = await client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": prompt}],
            temperature=0.1,
            max_tokens=600
        )
        text = res.choices[0].message.content.strip()
        return text.replace("```json", "").replace("```", "").strip()

async def transcribe_audio_file(file_bytes: bytes, filename: str = "audio.wav", language: str = "English") -> str:
    client = get_whisper_client()

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            res = await client.audio.transcriptions.create(
                model=WHISPER_MODEL,
                file=audio_file,
                response_format="text"
            )
        return str(res).strip()
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
