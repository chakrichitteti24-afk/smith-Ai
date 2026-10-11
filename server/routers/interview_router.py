"""
server/routers/interview_router.py

FastAPI Router for all Interview Endpoints in Smith AI
"""

import json
from io import BytesIO
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Response
from fastapi.responses import StreamingResponse
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
    evaluate_and_question_stream,
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
    
    if not text:
        clean_name = filename.rsplit(".", 1)[0]
        return {
            "ok": True,
            "data": {
                "isResume": False,
                "name": clean_name,
                "email": "",
                "phone": "",
                "location": "",
                "summary": f"Could not extract readable text from '{filename}'. Please upload a text-based PDF or Word document.",
                "skills": [],
                "projects": [],
                "experience": [],
                "education": [],
                "certifications": [],
                "strengths": [],
                "recommendations": ["Upload a standard text-based PDF or DOCX rather than an image-only scan."],
                "missingKeywords": [],
                "breakdown": {"keywords": 0, "impact": 0, "formatting": 0, "relevance": 0},
                "atsScore": 0,
                "error": "No readable text found in uploaded file."
            }
        }

    analysis = await parse_resume_content(resume_text=text, role=role, level=level)

    # Persist parsed resume to SQLAlchemy ORM database & MongoDB Atlas
    try:
        from database_sqlalchemy import save_resume_analysis_orm
        save_resume_analysis_orm(
            file_name=filename,
            file_size=f"{len(file_bytes) / 1024:.1f} KB",
            analysis=analysis
        )
    except Exception as e:
        print(f"[Database Error] Could not persist resume: {e}")

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
    return {"ok": True, "intro": question, "question": question}


@router.post("/respond")
async def respond_interview(req: InterviewRespondRequest):
    answer = req.candidateAnswer or req.rawTranscript or ""
    question = await evaluate_and_question(
        role=req.role,
        level=req.level,
        candidate_answer=answer,
        interview_type=req.interviewType,
        history=req.history,
        resume_context=req.resumeContext,
        language=req.language,
        difficulty=req.difficulty
    )
    return {
        "ok": True,
        "question": question,
        "feedback": "",
        "fullResponse": question,
        "cleanedTranscript": answer
    }


@router.post("/respond-stream")
async def respond_interview_stream(req: InterviewRespondRequest):
    answer = req.candidateAnswer or req.rawTranscript or ""

    async def event_generator():
        meta_payload = json.dumps({"type": "metadata", "cleanedTranscript": answer})
        yield f"data: {meta_payload}\n\n"

        full_text = ""
        async for token in evaluate_and_question_stream(
            role=req.role,
            level=req.level,
            candidate_answer=answer,
            interview_type=req.interviewType,
            history=req.history,
            resume_context=req.resumeContext,
            language=req.language,
            difficulty=req.difficulty
        ):
            full_text += token
            chunk_payload = json.dumps({"type": "chunk", "text": token})
            yield f"data: {chunk_payload}\n\n"

        done_payload = json.dumps({"type": "done", "fullResponse": full_text, "question": full_text, "cleanedTranscript": answer})
        yield f"data: {done_payload}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


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
async def transcribe(
    file: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    language: str = Form("English")
):
    upload_file = file or audio
    if not upload_file:
        return {"ok": False, "transcript": "", "error": "No audio file uploaded"}
    file_bytes = await upload_file.read()
    transcript = await transcribe_audio_file(file_bytes, upload_file.filename, language)
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
    from services_py.code_runner import run_code_against_test
    res = await run_code_against_test(req.code, req.language, req.stdin or "")
    stdout = res.get("stdout", "")
    stderr = res.get("stderr", "")
    error = stderr if (res.get("exitCode") != 0 or res.get("timedOut")) else None
    return {"ok": True, "stdout": stdout, "error": error}


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


# SQLAlchemy Persistence Routes
@router.get("/history")
async def get_history():
    from database_sqlalchemy import get_interview_sessions_orm
    sessions = get_interview_sessions_orm(limit=50)
    return {"ok": True, "history": sessions}


@router.post("/history")
async def save_history_session(session: SessionRecord):
    from database_sqlalchemy import save_interview_session_orm
    data = session.dict()
    success = save_interview_session_orm(data)
    return {"ok": success}
