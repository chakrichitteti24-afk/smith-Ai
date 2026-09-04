-- Smith AI SQLAlchemy Unified SQL Schema (PostgreSQL & SQLite Compatible)

-- 1. Practice Questions Table
CREATE TABLE IF NOT EXISTS practice_questions (
    id INTEGER PRIMARY KEY,
    question_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Beginner',
    description TEXT NOT NULL,
    sample_test_cases TEXT DEFAULT '[]',
    hidden_test_cases TEXT DEFAULT '[]',
    starter_code TEXT DEFAULT '{}',
    supported_languages TEXT DEFAULT '[]',
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Practice Progress Table
CREATE TABLE IF NOT EXISTS practice_progress (
    id INTEGER PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    question_id INTEGER NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Beginner',
    status VARCHAR(50) DEFAULT 'attempted',
    language VARCHAR(50) DEFAULT 'Python',
    verdict VARCHAR(50) DEFAULT 'Wrong Answer',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uix_session_question UNIQUE (session_id, question_id)
);

-- 3. Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id INTEGER PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL,
    level VARCHAR(50) DEFAULT 'Fresher',
    score FLOAT,
    accuracy FLOAT,
    confidence FLOAT,
    logical_thinking FLOAT,
    result VARCHAR(50) DEFAULT 'Borderline',
    qa_evaluations TEXT DEFAULT '[]',
    coding_submissions TEXT DEFAULT '[]',
    analysis TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50) DEFAULT '0 KB',
    ats_score FLOAT DEFAULT 0.0,
    skills TEXT DEFAULT '[]',
    raw_analysis TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
