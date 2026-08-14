from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import database
from services_py.code_runner import run_visible_tests, run_hidden_tests
from datetime import datetime

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
    if database.db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
        
    query = {}
    if difficulty and difficulty != "All":
        query["difficulty"] = difficulty
    if category and category != "All":
        query["category"] = category
        
    skip = (page - 1) * limit
    
    cursor = database.db.practice_questions.find(query, {"questionId": 1, "title": 1, "category": 1, "difficulty": 1, "isActive": 1, "_id": 0})
    questions = await cursor.skip(skip).limit(limit).to_list(length=limit)
    total = await database.db.practice_questions.count_documents(query)
    total = max(total, len(questions) + skip)
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    
    return {
        "questions": questions,
        "total": total,
        "page": page,
        "totalPages": total_pages
    }

@router.get("/questions/{question_id}")
async def get_question(question_id: int):
    if database.db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
        
    question = await database.db.practice_questions.find_one(
        {"questionId": question_id}, 
        {"hiddenTestCases": 0, "_id": 0}
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    return question

@router.get("/stats")
async def get_stats(
    difficulty: str = Query("Beginner"),
    session_id: str = Query("")
):
    if database.db is None:
        return {
            "total": 0,
            "solved": 0,
            "attempted": 0,
            "remaining": 0,
            "categories": []
        }
        
    # Get total active questions for this difficulty
    query = {"isActive": True}
    if difficulty and difficulty != "All":
        query["difficulty"] = difficulty
        
    total_questions = await database.db.practice_questions.count_documents(query)
    
    # Get categories
    categories = await database.db.practice_questions.distinct("category", query)
    
    # Get progress for this session
    solved = 0
    attempted = 0
    
    if session_id:
        solved = await database.db.practice_progress.count_documents({
            "sessionId": session_id,
            "difficulty": difficulty if difficulty != "All" else {"$exists": True},
            "status": "solved"
        })
        attempted = await database.db.practice_progress.count_documents({
            "sessionId": session_id,
            "difficulty": difficulty if difficulty != "All" else {"$exists": True},
            "status": "attempted"
        })
        
    return {
        "total": total_questions,
        "solved": solved,
        "attempted": attempted,
        "remaining": max(0, total_questions - solved),
        "categories": categories
    }

@router.post("/run")
async def run_practice(request: PracticeRunRequest):
    if database.db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
        
    question = await database.db.practice_questions.find_one({"questionId": request.questionId})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    visible_tests = question.get("testCases", [])
    
    results = await run_visible_tests(request.code, request.language, visible_tests)
    all_passed = all(r["passed"] for r in results)
    total_execution_time = sum(r["executionTime"] for r in results)
    
    # Record attempt
    if request.sessionId:
        await database.db.practice_progress.update_one(
            {"sessionId": request.sessionId, "questionId": request.questionId},
            {"$set": {
                "language": request.language,
                "lastRunAt": datetime.utcnow().isoformat()
            }},
            upsert=True
        )
        
    return {
        "results": results,
        "allPassed": all_passed,
        "executionTime": total_execution_time
    }

@router.post("/submit")
async def submit_practice(request: PracticeSubmitRequest):
    if database.db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable")
        
    question = await database.db.practice_questions.find_one({"questionId": request.questionId})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    hidden_tests = question.get("hiddenTestCases", [])
    if not hidden_tests:
        # Fallback to visible tests if no hidden tests defined
        hidden_tests = question.get("testCases", [])
        
    result = await run_hidden_tests(request.code, request.language, hidden_tests)
    
    status = "solved" if result["verdict"] == "Accepted" else "attempted"
    
    # Record attempt
    if request.sessionId:
        progress = await database.db.practice_progress.find_one({
            "sessionId": request.sessionId,
            "questionId": request.questionId
        })
        
        # Keep status as solved if it was already solved
        if progress and progress.get("status") == "solved":
            status = "solved"
            
        await database.db.practice_progress.update_one(
            {"sessionId": request.sessionId, "questionId": request.questionId},
            {"$set": {
                "difficulty": question.get("difficulty"),
                "status": status,
                "language": request.language,
                "submittedAt": datetime.utcnow().isoformat(),
                "verdict": result["verdict"]
            }},
            upsert=True
        )
        
    return {
        "verdict": result["verdict"],
        "passedCount": result["passedCount"],
        "totalCount": result["totalCount"],
        "score": result["score"],
        "message": f"Passed {result['passedCount']} out of {result['totalCount']} test cases."
    }
