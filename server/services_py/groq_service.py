"""
server/services_py/groq_service.py

Groq AI inference service for Smith AI in Python.
"""

import os
import json
import tempfile
import time
import httpx
from groq import AsyncGroq
from config import GROQ_API_KEY, GROQ_WHISPER_API_KEY, GROQ_API_KEYS, GROQ_WHISPER_API_KEYS

MODEL = os.getenv("GROQ_MODEL", "gpt-oss-120b")
FALLBACK_MODELS = ["gpt-oss-120b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
WHISPER_MODEL = "whisper-large-v3-turbo"

class KeyPoolManager:
    def __init__(self, key_list, fallback_key=None):
        keys = key_list if key_list else ([fallback_key] if fallback_key else [])
        self.keys = [k for k in keys if k]
        self.clients = [AsyncGroq(api_key=k) for k in self.keys]
        self.index = 0
        self.cooldowns = {}

    def get_client(self):
        if not self.clients:
            raise ValueError("No valid GROQ_API_KEYS configured")
        now = time.time()
        n = len(self.clients)
        for _ in range(n):
            idx = self.index
            self.index = (self.index + 1) % n
            if self.cooldowns.get(idx, 0) <= now:
                return self.clients[idx], idx
        
        idx = self.index
        self.index = (self.index + 1) % n
        return self.clients[idx], idx

    def mark_cooldown(self, idx, seconds=60):
        self.cooldowns[idx] = time.time() + seconds

groq_pool = KeyPoolManager(GROQ_API_KEYS, GROQ_API_KEY)
whisper_pool = KeyPoolManager(GROQ_WHISPER_API_KEYS, GROQ_WHISPER_API_KEY)

def get_groq_client():
    client, _ = groq_pool.get_client()
    return client

def get_whisper_client():
    client, _ = whisper_pool.get_client()
    return client

async def create_completion_with_fallback(client=None, **kwargs):
    requested_model = kwargs.get("model", MODEL)
    models_to_try = [requested_model] + [m for m in FALLBACK_MODELS if m != requested_model]
    
    last_err = None
    max_account_retries = max(1, len(groq_pool.clients))

    for acc_attempt in range(max_account_retries):
        active_client, acc_idx = groq_pool.get_client()
        for m in models_to_try:
            try:
                kwargs["model"] = m
                res = await active_client.chat.completions.create(**kwargs)
                return res
            except Exception as e:
                last_err = e
                err_str = str(e).lower()
                if "rate limit" in err_str or "429" in err_str or "quota" in err_str or "rate_limit_exceeded" in err_str:
                    print(f"[KeyPool] Account key #{acc_idx+1} hit rate limit ({e}). Rotating to next account key...")
                    groq_pool.mark_cooldown(acc_idx, 60)
                    break
                print(f"[Groq Model Warning] Model '{m}' unavailable: {e}. Trying fallback model...")
                continue
    raise last_err

CLEANING_SYSTEM_PROMPT = """You clean interview transcripts.
Remove: filler words (um, uh, like, you know, actually, basically), repeated words (I I am -> I am), stutters, and accidental duplicate phrases.
Fix: capitalization, punctuation.
CRITICAL RULES:
- Preserve technical terms (React, Node.js, etc), variable names, programming keywords, and code snippets EXACTLY as spoken.
- Do not remove filler words if they are intentionally part of the sentence (e.g., "I actually like Python").
Return ONLY the cleaned text. No explanations. No extra text."""

BASE_SYSTEM_PROMPT = """You are Smith, a Senior Technical Lead and Principal Interviewer at a top-tier global technology company. You conduct authentic, high-signal, engaging, and professional technical interviews. You are a warm, courteous, highly articulate human interviewer—NOT a robotic chatbot.

RESUME AWARE INTERVIEW SYSTEM (CRITICAL RULES):
Your top priority is truthfulness. Never claim to have seen, analyzed, or reviewed a resume unless resume context is explicitly provided in the session context.

RULE 1 - If Resume Available (Resume Context Provided):
- You may say: "I've reviewed your background," "I noticed your project," or "Given your experience with...".
- Ground your questions in their specific projects, technologies, and achievements.

RULE 2 - If Resume NOT Available (No Resume Context Provided):
- Never mention a resume, CV, past company, or specific unmentioned project.
- Focus purely on the target role, seniority level, and industry best practices.

CORE INTERVIEWER PERSONA & TONE:
- Personality: Warm, Courteous, Highly Professional, Encouraging, Empathetic, and Technical.
- Polite Phrasing: Use natural, polite expressions such as:
  * "Thank you for sharing that detailed explanation."
  * "I appreciate your thought process on this."
  * "That's an interesting approach to handling..."
  * "Thank you for walking me through your architecture."
- Active Listening & Realistic Depth (CRITICAL - DO NOT USE SINGLE SHORT LINES):
  * Do NOT give brief 1-line responses like "Thank you, let's continue." or "Can you elaborate?".
  * Structure every response in 2-4 complete, articulate, polite sentences (~50 to 90 words):
    1. Sentence 1-2 (Polite Acknowledgment & Active Listening): Acknowledge specific technical points, key trade-offs, or logic from the candidate's answer with genuine professional courtesy.
    2. Sentence 3 (Contextual Bridge / Engineering Nuance): Connect their point to real-world engineering constraints (e.g., scale, latency, security, state management, edge cases).
    3. Sentence 4 (High-Signal Follow-Up Question): Ask a clear, insightful, follow-up question or scenario.

LANGUAGE RULE:
You MUST conduct the entire interview strictly in the candidate's 'Preferred Language' specified in the session context.

OUTPUT FORMAT:
Return ONLY your spoken response as Smith. Do not wrap in JSON, markdown tags, or meta-commentary."""

INTRO_PROMPT = """You are Smith, a Senior Technical Lead & Principal Interviewer. Generate a warm, polite, professional opening greeting to begin the interview session.

Context provided:
- Target Role
- Seniority Level
- Preferred Language
- Resume Context (if available)

Instructions:
- Welcome the candidate politely and introduce yourself as Smith.
- Express enthusiasm for speaking with them today regarding the target role and level.
- If resume context is available, mention you've had a chance to look over their background and are excited to dive in.
- End with ONE open-ended introductory question inviting them to share a brief background introduction or highlight a key technical accomplishment.
- Keep the greeting warm, articulate, and professional (3-4 well-crafted, polite sentences).
- Speak strictly in the requested Preferred Language."""

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

    res = await create_completion_with_fallback(
        client,
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

    res = await create_completion_with_fallback(
        client,
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

    models_to_try = [MODEL] + [m for m in FALLBACK_MODELS if m != MODEL]
    stream = None
    for m in models_to_try:
        try:
            stream = await client.chat.completions.create(
                model=m,
                messages=messages,
                temperature=0.6,
                max_tokens=250,
                stream=True
            )
            break
        except Exception as e:
            print(f"[Groq Stream Warning] Model '{m}' unavailable: {e}. Trying fallback...")
            continue

    if stream:
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
        res = await create_completion_with_fallback(
            client,
            model=MODEL,
            messages=[{"role": "system", "content": prompt}],
            temperature=0.1,
            max_tokens=600,
            response_format={"type": "json_object"}
        )
        return res.choices[0].message.content.strip()
    except Exception:
        res = await create_completion_with_fallback(
            client,
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
