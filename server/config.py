"""
server/config.py

Environment configuration for Python FastAPI & SQLAlchemy Backend
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from root directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

PORT = int(os.getenv("PORT", 3001))
NODE_ENV = os.getenv("NODE_ENV", "development")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_KEYS_RAW = os.getenv("GROQ_API_KEYS") or GROQ_API_KEY
GROQ_API_KEYS = [k.strip() for k in GROQ_API_KEYS_RAW.split(",") if k.strip()]

GROQ_WHISPER_API_KEY = os.getenv("GROQ_WHISPER_API_KEY") or GROQ_API_KEY
GROQ_WHISPER_KEYS_RAW = os.getenv("GROQ_WHISPER_API_KEYS") or GROQ_WHISPER_API_KEY
GROQ_WHISPER_API_KEYS = [k.strip() for k in GROQ_WHISPER_KEYS_RAW.split(",") if k.strip()]
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")

# SQLAlchemy Database URL (Defaults to local SQLite, or PostgreSQL if configured)
DB_DIR = Path(__file__).resolve().parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_SQLITE_URL = f"sqlite:///{DB_DIR / 'smith_ai_orm.db'}"

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URI") or DEFAULT_SQLITE_URL
if "<" in DATABASE_URL:
    DATABASE_URL = DEFAULT_SQLITE_URL

# MongoDB Authentication Database
MONGODB_AUTH_URI = os.getenv(
    "MONGODB_AUTH_URI",
    "mongodb://chakrichitteti24_db_user:8OPRAgjFaRQfWcTe@atlas-sql-6a91548dc39875bde768bf34-opohay.a.query.mongodb.net/smith_ai_auth?ssl=true&authSource=admin"
)
JWT_SECRET = os.getenv("JWT_SECRET", "smith_ai_jwt_secret_token_key_2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30
