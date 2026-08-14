-- Smith AI Supabase PostgreSQL Schema Setup

-- 1. Practice Questions Table
CREATE TABLE IF NOT EXISTS public.practice_questions (
    "questionId" INT PRIMARY KEY,
    "module" TEXT DEFAULT 'practice',
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "description" TEXT,
    "examples" JSONB,
    "constraints" JSONB,
    "supportedLanguages" JSONB,
    "starterCode" JSONB,
    "testCases" JSONB,
    "hiddenTestCases" JSONB,
    "evaluation" JSONB,
    "isActive" BOOLEAN DEFAULT true
);

-- 2. Practice Progress Table
CREATE TABLE IF NOT EXISTS public.practice_progress (
    "id" BIGSERIAL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionId" INT NOT NULL,
    "difficulty" TEXT,
    "status" TEXT,
    "language" TEXT,
    "submittedAt" TEXT,
    "verdict" TEXT,
    CONSTRAINT unique_session_question UNIQUE ("sessionId", "questionId")
);

-- 3. Interview Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    "sessionId" TEXT PRIMARY KEY,
    "createdAt" TEXT,
    "data" JSONB
);

-- Enable public API access
ALTER TABLE public.practice_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
