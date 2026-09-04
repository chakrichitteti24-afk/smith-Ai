"""
server/database.py

SQLAlchemy Database Adapter for Smith AI Backend
Provides unified access to SQLAlchemy ORM models and database health checks.
"""

import logging
from typing import Dict, Any, List, Optional

import database_sqlalchemy as db_orm
from database_sqlalchemy import (
    init_sqlalchemy_db,
    check_db_health,
    get_practice_questions_orm,
    get_practice_question_by_id_orm,
    get_practice_stats_orm,
    record_practice_progress_orm,
    save_interview_session_orm,
    get_interview_sessions_orm,
    save_resume_analysis_orm,
    SessionLocal,
    engine
)

logger = logging.getLogger("smith_ai.database")

class DatabaseProxy:
    """Provides a unified interface backed by SQLAlchemy ORM."""
    def __init__(self):
        self.is_connected = True
        self.is_supabase = False  # Pure SQLAlchemy ORM
        self.engine = engine

    def health(self) -> Dict[str, Any]:
        return check_db_health()

db = DatabaseProxy()

async def connect_db():
    global db
    init_sqlalchemy_db()
    health = check_db_health()
    if health.get("connected"):
        logger.info(f"[SQLAlchemy] Connected to database: {health.get('dialect')} (Latency: {health.get('latencyMs')}ms)")
        print(f"\033[32m[SQLAlchemy]\033[0m Connected to Database ({health.get('dialect')}) - Health: \033[32mOK\033[0m")
    else:
        logger.error(f"[SQLAlchemy] Database connection error: {health.get('error')}")
        print(f"\033[31m[SQLAlchemy Error]\033[0m {health.get('error')}")
    return db

async def close_db():
    logger.info("[SQLAlchemy] Database session closed.")
