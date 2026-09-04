"""
server/models_sqlalchemy.py

SQLAlchemy ORM Models for Smith AI
Handles Practice Questions, User Progress, Interview Sessions, and Parsed Resumes
"""

import json
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    Float,
    DateTime,
    UniqueConstraint
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class PracticeQuestion(Base):
    __tablename__ = "practice_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), index=True, nullable=False)
    difficulty = Column(String(50), index=True, default="Beginner")
    description = Column(Text, nullable=False)
    sample_test_cases = Column(Text, default="[]")
    hidden_test_cases = Column(Text, default="[]")
    starter_code = Column(Text, default="{}")
    supported_languages = Column(Text, default="[]")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self, include_hidden=False):
        try:
            samples = json.loads(self.sample_test_cases) if isinstance(self.sample_test_cases, str) else self.sample_test_cases
        except Exception:
            samples = []

        try:
            starter = json.loads(self.starter_code) if isinstance(self.starter_code, str) else self.starter_code
        except Exception:
            starter = {}

        try:
            langs = json.loads(self.supported_languages) if isinstance(self.supported_languages, str) else self.supported_languages
        except Exception:
            langs = ["Python", "JavaScript", "Java", "C++"]

        data = {
            "questionId": self.question_id,
            "title": self.title,
            "category": self.category,
            "difficulty": self.difficulty,
            "description": self.description,
            "sampleTestCases": samples,
            "starterCode": starter,
            "supportedLanguages": langs,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }

        if include_hidden:
            try:
                data["hiddenTestCases"] = json.loads(self.hidden_test_cases) if isinstance(self.hidden_test_cases, str) else self.hidden_test_cases
            except Exception:
                data["hiddenTestCases"] = []

        return data


class PracticeProgress(Base):
    __tablename__ = "practice_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), index=True, nullable=False)
    question_id = Column(Integer, index=True, nullable=False)
    difficulty = Column(String(50), default="Beginner")
    status = Column(String(50), default="attempted")  # 'solved' or 'attempted'
    language = Column(String(50), default="Python")
    verdict = Column(String(50), default="Wrong Answer")
    submitted_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('session_id', 'question_id', name='uix_session_question'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "sessionId": self.session_id,
            "questionId": self.question_id,
            "difficulty": self.difficulty,
            "status": self.status,
            "language": self.language,
            "verdict": self.verdict,
            "submittedAt": self.submitted_at.isoformat() if self.submitted_at else None
        }


class InterviewSessionModel(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(100), nullable=False)
    level = Column(String(50), default="Fresher")
    score = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    logical_thinking = Column(Float, nullable=True)
    result = Column(String(50), default="Borderline")
    qa_evaluations = Column(Text, default="[]")
    coding_submissions = Column(Text, default="[]")
    analysis = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        try:
            qa = json.loads(self.qa_evaluations) if isinstance(self.qa_evaluations, str) else self.qa_evaluations
        except Exception:
            qa = []

        try:
            coding = json.loads(self.coding_submissions) if isinstance(self.coding_submissions, str) else self.coding_submissions
        except Exception:
            coding = []

        return {
            "id": self.session_id,
            "sessionId": self.session_id,
            "role": self.role,
            "level": self.level,
            "score": self.score,
            "accuracy": self.accuracy,
            "confidence": self.confidence,
            "logicalThinking": self.logical_thinking,
            "result": self.result,
            "qaEvaluations": qa,
            "codingSubmissions": coding,
            "analysis": self.analysis,
            "date": self.created_at.strftime("%b %d, %Y, %I:%M %p") if self.created_at else None
        }


class ResumeModel(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_name = Column(String(255), nullable=False)
    file_size = Column(String(50), default="0 KB")
    ats_score = Column(Float, default=0.0)
    skills = Column(Text, default="[]")
    raw_analysis = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        try:
            skills_list = json.loads(self.skills) if isinstance(self.skills, str) else self.skills
        except Exception:
            skills_list = []

        try:
            analysis_dict = json.loads(self.raw_analysis) if isinstance(self.raw_analysis, str) else self.raw_analysis
        except Exception:
            analysis_dict = {}

        return {
            "id": self.id,
            "fileName": self.file_name,
            "fileSize": self.file_size,
            "atsScore": self.ats_score,
            "skills": skills_list,
            "rawAnalysis": analysis_dict,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
