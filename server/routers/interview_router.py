"""
server/routers/interview_router.py

FastAPI Router for all Interview Endpoints in Smith AI
"""

import json
from io import BytesIO
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Response
from pydantic import BaseModel

import database
from models_py import (
    InterviewStartRequest,
    InterviewRespondRequest,
    InterviewFinishRequest,
    PracticeQuestionRequest,
    CodeRunRequest,
    CodeSubmitRequest,
    UserProfile,
    SessionRecord
)
from services_py.groq_service import (
    generate_intro,
    evaluate_and_question,
    generate_final_analysis,
    transcribe_audio_file
)
from services_py.gemini_service import (
    parse_resume_content,
    generate_coding_question,
    evaluate_code_submission
)

router = APIRouter(prefix="/api/interview", tags=["Interview"])

# Helper to extract PDF/DOCX text
async def extract_text_from_file(file_bytes: bytes, filename: str, mime: str) -> str:
    filename_lower = filename.lower()
    text = ""

    if "pdf" in mime or filename_lower.endswith(".pdf"):
        try:
            from pypdf import PdfReader
            reader = PdfReader(BytesIO(file_bytes))
            text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        except Exception:
            text = ""

        if not text:
            try:
                buffer_str = file_bytes.decode("utf-8", errors="ignore")
                if any(k in buffer_str for k in ["Resume", "Experience", "Education"]):
                    text = buffer_str
            except Exception:
                pass

    elif "word" in mime or filename_lower.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(BytesIO(file_bytes))
            text = "\n".join([p.text for p in doc.paragraphs if p.text])
        except Exception:
            text = ""

    return text.strip()


@router.post("/resume")
async def process_resume(
    resume: UploadFile = File(...),
    role: str = Form("Software Engineer"),
    level: str = Form("Mid-Level")
):
    if not resume:
        raise HTTPException(status_code=400, detail="No resume file provided")

    file_bytes = await resume.read()
    filename = resume.filename
    mime = resume.content_type or ""

    text = await extract_text_from_file(file_bytes, filename, mime)
    
    if text:
        analysis = await parse_resume_content(resume_text=text, role=role, level=level)
    else:
        analysis = await parse_resume_content(file_bytes=file_bytes, mime_type="application/pdf", role=role, level=level)

    # Persist parsed resume to MongoDB if connected
    if database.db is not None:
        try:
            await database.db["resumes"].insert_one({
                "fileName": filename,
                "fileSize": f"{len(file_bytes) / 1024:.1f} KB",
                "atsScore": analysis.get("atsScore", 0),
                "skills": analysis.get("skills", []),
                "rawAnalysis": analysis,
            })
        except Exception as e:
            print(f"[MongoDB Error] Could not persist resume: {e}")

    return {"ok": True, "data": analysis}


@router.post("/start")
async def start_interview(req: InterviewStartRequest):
    question = await generate_intro(
        role=req.role,
        level=req.level,
        language=req.language,
        difficulty=req.difficulty,
        resume_context=req.resumeContext
    )
    return {"ok": True, "question": question}


@router.post("/respond")
async def respond_interview(req: InterviewRespondRequest):
    question = await evaluate_and_question(
        role=req.role,
        level=req.level,
        candidate_answer=req.candidateAnswer,
        interview_type=req.interviewType,
        history=req.history,
        resume_context=req.resumeContext,
        language=req.language,
        difficulty=req.difficulty
    )
    return {"ok": True, "question": question}


@router.post("/finish")
async def finish_interview(req: InterviewFinishRequest):
    analysis_str = await generate_final_analysis(
        role=req.role,
        level=req.level,
        history=req.history,
        resume_context=req.resumeContext
    )
    return {"ok": True, "analysis": analysis_str}


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...), language: str = Form("English")):
    file_bytes = await file.read()
    transcript = await transcribe_audio_file(file_bytes, file.filename, language)
    return {"ok": True, "transcript": transcript}


@router.post("/practice-question")
async def practice_question(req: PracticeQuestionRequest):
    data = await generate_coding_question(
        difficulty=req.difficulty,
        role=req.role,
        solved_titles=req.solvedTitles
    )
    return {"ok": True, "data": data}


@router.post("/run-code")
async def run_code(req: CodeRunRequest):
    # Simulated execution response
    stdout = f"Code executed successfully ({req.language}).\nOutput: [Simulated StdOut]\n"
    if req.stdin:
        stdout += f"StdIn Passed: {req.stdin}\n"
    return {"ok": True, "stdout": stdout, "error": None}


@router.post("/submit-code")
async def submit_code(req: CodeSubmitRequest):
    result = await evaluate_code_submission(
        code=req.code,
        language=req.language,
        question_text=req.questionText,
        role=req.role,
        level=req.level
    )
    return {"ok": True, "evaluation": result.get("evaluation", {})}


# MongoDB Persistence Routes
@router.get("/history")
async def get_history():
    if database.db is None:
        return {"ok": True, "history": []}
    
    cursor = database.db["sessions"].find({}, {"_id": 0}).sort("createdAt", -1).limit(50)
    sessions = await cursor.to_list(length=50)
    return {"ok": True, "history": sessions}


@router.post("/history")
async def save_history_session(session: SessionRecord):
    if database.db is not None:
        data = session.dict()
        await database.db["sessions"].update_one(
            {"sessionId": session.sessionId or session.id},
            {"$set": data},
            upsert=True
        )
    return {"ok": True}
