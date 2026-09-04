"""
server/main.py

FastAPI Application Entry Point for Smith AI Backend
Port: 3001
"""

import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from config import PORT, CLIENT_ORIGIN
import database
from database_sqlalchemy import init_sqlalchemy_db, check_db_health, get_practice_stats_orm
from database_mongo_auth import get_mongo_client, check_mongo_auth_health
from routers.interview_router import router as interview_router
from routers.practice_router import router as practice_router
from routers.auth_router import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_sqlalchemy_db()
    get_mongo_client()
    await database.connect_db()
    yield
    await database.close_db()

app = FastAPI(
    title="Smith AI FastAPI Backend",
    description="Enterprise AI Technical Interviewer Platform Backend powered by SQLAlchemy ORM and MongoDB Atlas Auth",
    version="2.6.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://smith-ai-five.vercel.app",
    CLIENT_ORIGIN
]

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    db_health = check_db_health()
    mongo_health = check_mongo_auth_health()
    stats = get_practice_stats_orm()
    return {
        "status": "ok",
        "engine": "FastAPI (Python + SQLAlchemy ORM + MongoDB Atlas Auth)",
        "database": db_health,
        "mongoAuth": mongo_health,
        "questionsLoaded": stats.get("total", 0),
        "topicsAvailable": len(stats.get("categories", []))
    }

app.include_router(auth_router)
app.include_router(interview_router)
app.include_router(practice_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
