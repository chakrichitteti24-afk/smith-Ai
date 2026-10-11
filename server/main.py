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

from config import PORT, CLIENT_ORIGIN, CLIENT_ORIGINS
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

# OWASP A05: Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://smith-ai-five.vercel.app",
    CLIENT_ORIGIN,
    *CLIENT_ORIGINS,
]
# Deduplicate and filter empty
origins = list({o.rstrip("/") for o in origins if o and o.strip()})

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
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
