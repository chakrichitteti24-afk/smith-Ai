"""
server/config.py

Environment configuration for Python FastAPI Backend
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
GROQ_WHISPER_API_KEY = os.getenv("GROQ_WHISPER_API_KEY") or GROQ_API_KEY
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
