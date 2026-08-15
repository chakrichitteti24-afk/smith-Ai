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
from routers.interview_router import router as interview_router
from routers.practice_router import router as practice_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect_db()
    yield
    await database.close_db()

app = FastAPI(
    title="Smith AI FastAPI Backend",
    description="Enterprise AI Technical Interviewer Platform Backend in Python",
    version="2.4.0",
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
    db_status = "connected" if database.db is not None else "disconnected"
    return {
        "status": "ok",
        "engine": "FastAPI (Python)",
        "database": db_status
    }

app.include_router(interview_router)
app.include_router(practice_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
