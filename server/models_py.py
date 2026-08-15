"""
server/models_py.py

Pydantic schemas and models for FastAPI request validation and MongoDB storage.
"""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class UserProfile(BaseModel):
    name: str = "Alex Morgan"
    email: Optional[str] = None
    role: str = "Software Engineer"
    level: str = "Fresher"
    language: str = "English"
    difficulty: str = "Beginner"
    voiceEnabled: bool = True
    speechSpeed: str = "Normal"
    micSensitivity: str = "Normal"
    autoSilence: bool = True
    saveRecordings: bool = True

class InterviewStartRequest(BaseModel):
    role: str = "Software Engineer"
    level: str = "Fresher"
    language: str = "English"
    difficulty: str = "Beginner"
    resumeContext: Optional[Dict[str, Any]] = None

class InterviewRespondRequest(BaseModel):
    role: str = "Software Engineer"
    level: str = "Fresher"
    language: str = "English"
    difficulty: str = "Beginner"
    candidateAnswer: Optional[str] = ""
    rawTranscript: Optional[str] = ""
    interviewType: str = "Technical Round"
    history: List[Dict[str, Any]] = []
    resumeContext: Optional[Dict[str, Any]] = None

class InterviewFinishRequest(BaseModel):
    role: str = "Software Engineer"
    level: str = "Fresher"
    language: str = "English"
    difficulty: str = "Beginner"
    history: List[Dict[str, Any]] = []
    resumeContext: Optional[Dict[str, Any]] = None

class PracticeQuestionRequest(BaseModel):
    difficulty: str = "Intermediate"
    role: str = "Software Engineer"
    solvedTitles: List[str] = []

class CodeRunRequest(BaseModel):
    code: str
    language: str = "javascript"
    stdin: Optional[str] = ""
    input: Optional[str] = ""

class CodeSubmitRequest(BaseModel):
    code: str
    language: str = "javascript"
    spokenLanguage: str = "English"
    questionText: str = "Solve the coding challenge."
    role: str = "Software Engineer"
    level: str = "Mid-Level"
    difficulty: str = "Intermediate"
    history: List[Dict[str, Any]] = []
    resumeContext: Optional[Dict[str, Any]] = None
    interviewType: str = "Technical Round"

class SessionRecord(BaseModel):
    id: Optional[str] = None
    sessionId: Optional[str] = None
    role: str
    level: str
    date: str
    score: Optional[float] = None
    accuracy: Optional[float] = None
    confidence: Optional[float] = None
    logicalThinking: Optional[float] = None
    result: str = "Borderline"
    qaEvaluations: List[Any] = []
    codingSubmissions: List[Any] = []
    analysis: Optional[str] = ""
