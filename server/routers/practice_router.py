"""
server/routers/practice_router.py

FastAPI Router for DSA Practice Bank using SQLAlchemy ORM
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime

from database_sqlalchemy import (
    get_practice_questions_orm,
    get_practice_question_by_id_orm,
    get_practice_stats_orm,
    record_practice_progress_orm
)
from services_py.code_runner import run_visible_tests, run_hidden_tests

router = APIRouter(prefix="/api/practice", tags=["practice"])

class PracticeRunRequest(BaseModel):
    questionId: int
    code: str
    language: str
    sessionId: str = ''

class PracticeSubmitRequest(BaseModel):
    questionId: int
    code: str
    language: str
    sessionId: str = ''

@router.get("/questions")
async def get_questions(
    difficulty: str = Query("Beginner"),
    category: str = Query("All"),
    page: int = Query(1),
    limit: int = Query(20)
):
    try:
        data = get_practice_questions_orm(
            difficulty=difficulty,
            category=category,
            page=page,
            limit=limit
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/questions/{question_id}")
async def get_question(question_id: int):
    question = get_practice_question_by_id_orm(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Remove hidden test cases from client response
    safe_question = {k: v for k, v in question.items() if k != "hiddenTestCases"}
    return safe_question

@router.get("/stats")
async def get_stats(
    difficulty: str = Query("Beginner"),
    session_id: str = Query("")
):
    try:
        return get_practice_stats_orm(difficulty=difficulty, session_id=session_id)
    except Exception as e:
        return {
            "total": 100,
            "solved": 0,
            "attempted": 0,
            "remaining": 100,
            "categories": []
        }

@router.post("/run")
async def run_practice(request: PracticeRunRequest):
    question = get_practice_question_by_id_orm(request.questionId)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    visible_tests = question.get("sampleTestCases", []) or question.get("testCases", [])
    results = await run_visible_tests(request.code, request.language, visible_tests)
    all_passed = all(r.get("passed", False) for r in results)
    total_execution_time = sum(r.get("executionTime", 0) for r in results)
    
    # Record attempt in SQLAlchemy
    if request.sessionId:
        record_practice_progress_orm(
            session_id=request.sessionId,
            question_id=request.questionId,
            difficulty=question.get("difficulty", "Beginner"),
            language=request.language,
            status="attempted",
            verdict="Executed"
        )
        
    return {
        "ok": True,
        "results": results,
        "allPassed": all_passed,
        "executionTime": total_execution_time
    }

@router.post("/submit")
async def submit_practice(request: PracticeSubmitRequest):
    question = get_practice_question_by_id_orm(request.questionId)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    hidden_tests = question.get("hiddenTestCases", [])
    if not hidden_tests:
        hidden_tests = question.get("sampleTestCases", [])
        
    result = await run_hidden_tests(request.code, request.language, hidden_tests)
    verdict = result.get("verdict", "Wrong Answer")
    passed_count = result.get("passedCount", 0)
    total_count = result.get("totalCount", len(hidden_tests))
    status = "solved" if verdict == "Accepted" else "attempted"
    
    # Record progress in SQLAlchemy
    if request.sessionId:
        record_practice_progress_orm(
            session_id=request.sessionId,
            question_id=request.questionId,
            difficulty=question.get("difficulty", "Beginner"),
            language=request.language,
            status=status,
            verdict=verdict
        )
        
    return {
        "ok": True,
        "verdict": verdict,
        "passedCount": passed_count,
        "totalCount": total_count,
        "score": result.get("score", 100 if verdict == "Accepted" else 0),
        "message": f"Passed {passed_count} out of {total_count} test cases."
    }
