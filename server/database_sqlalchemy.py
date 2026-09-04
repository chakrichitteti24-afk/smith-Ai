"""
server/database_sqlalchemy.py

SQLAlchemy Database Engine and Repository for Smith AI
Replaces all legacy Supabase/Mongo calls with pure SQLAlchemy ORM storage.
"""

import os
import json
import logging
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional

from sqlalchemy import create_engine, select, func, distinct, update, text
from sqlalchemy.orm import sessionmaker, scoped_session

from config import DATABASE_URL
from models_sqlalchemy import (
    Base,
    PracticeQuestion,
    PracticeProgress,
    InterviewSessionModel,
    ResumeModel
)

logger = logging.getLogger("smith_ai.database")

# Configure SQLAlchemy Engine
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionFactory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
SessionLocal = scoped_session(SessionFactory)

# ── Seed 100 Curated DSA Questions ──────────────────────────────────────────
RAW_QUESTIONS = [
  "1|Basics|Check whether a number is even or odd.|4|Even|5|Odd",
  "2|Basics|Find the largest of three numbers.|1 2 3|3|5 2 1|5",
  "3|Basics|Check whether a given year is a leap year.|2020|Leap|2023|Not Leap",
  "4|Loops|Find the sum of the first N natural numbers.|5|15|10|55",
  "5|Loops|Print the multiplication table of a given number.|3|3 6 9 12 15 18 21 24 27 30|5|5 10 15 20 25 30 35 40 45 50",
  "6|Numbers|Count the number of digits in a number.|12345|5|987|3",
  "7|Numbers|Reverse a number.|123|321|-456|-654",
  "8|Numbers|Check whether a number is a palindrome.|121|True|123|False",
  "9|Numbers|Check whether a number is prime.|7|True|10|False",
  "10|Numbers|Generate the Fibonacci series up to N terms.|5|0 1 1 2 3|7|0 1 1 2 3 5 8",
  "11|Numbers|Find the factorial of a number.|5|120|3|6",
  "12|Numbers|Find the GCD of two numbers.|12 15|3|20 10|10",
  "13|Numbers|Find the LCM of two numbers.|12 15|60|4 6|12",
  "14|Numbers|Check whether a number is an Armstrong number.|153|True|123|False",
  "15|Numbers|Find the sum of digits of a number.|123|6|456|15",
  "16|Numbers|Find the product of digits of a number.|123|6|456|120",
  "17|Numbers|Count the even and odd digits in a number.|1234|2 2|135|0 3",
  "18|Numbers|Find all divisors of a number.|12|1 2 3 4 6 12|7|1 7",
  "19|Numbers|Count the number of prime numbers in a given range.|1 10|4|10 20|4",
  "20|Numbers|Calculate the power of a number efficiently.|2 3|8|3 4|81",
  "21|Array|Find the sum of all elements in an array.|5\n1 2 3 4 5|15|3\n10 20 30|60",
  "22|Array|Find the largest element in an array.|5\n1 5 3 4 2|5|3\n10 20 30|30",
  "23|Array|Find the smallest element in an array.|5\n1 5 3 4 2|1|3\n10 20 30|10",
  "24|Array|Find the second largest element in an array.|5\n1 5 3 4 2|4|3\n10 20 30|20",
  "25|Array|Find the second smallest element in an array.|5\n1 5 3 4 2|2|3\n10 20 30|20",
  "26|Array|Reverse an array.|5\n1 2 3 4 5|5 4 3 2 1|3\n10 20 30|30 20 10",
  "27|Array|Count even and odd elements in an array.|5\n1 2 3 4 5|2 3|3\n10 20 30|3 0",
  "28|Array|Find the frequency of a given element in an array.|5\n1 2 2 4 5\n2|2|3\n10 20 30\n20|1",
  "29|Array|Check whether an array is sorted.|5\n1 2 3 4 5|True|5\n1 5 3 4 2|False",
  "30|Array|Search for an element using linear search.|5\n1 2 3 4 5\n3|2|5\n1 2 3 4 5\n6|-1",
  "31|Array|Remove duplicates from a sorted array.|5\n1 1 2 2 3|1 2 3|4\n1 1 1 1|1",
  "32|Array|Move all zeros to the end of an array.|5\n1 0 2 0 3|1 2 3 0 0|4\n0 0 1 2|1 2 0 0",
  "33|Array|Separate even and odd numbers in an array.|5\n1 2 3 4 5|2 4 1 3 5|4\n1 3 2 4|2 4 1 3",
  "34|Array|Rotate an array by one position.|5\n1 2 3 4 5|5 1 2 3 4|3\n10 20 30|30 10 20",
  "35|Array|Rotate an array by K positions.|5\n1 2 3 4 5\n2|4 5 1 2 3|4\n1 2 3 4\n1|4 1 2 3",
  "36|Array|Find the missing number from an array containing numbers from 1 to N.|4\n1 2 4|3|5\n1 2 3 5|4",
  "37|Array|Find the duplicate element in an array.|5\n1 2 3 4 2|2|4\n1 1 2 3|1",
  "38|Array|Find common elements in two arrays.|5\n1 2 3 4 5\n3\n3 4 5|3 4 5|3\n1 2 3\n2\n4 5|None",
  "39|Array|Merge two sorted arrays.|3\n1 3 5\n3\n2 4 6|1 2 3 4 5 6|2\n1 2\n2\n3 4|1 2 3 4",
  "40|Array|Find the maximum subarray sum.|5\n-2 1 -3 4 -1|4|5\n1 2 3 4 5|15",
  "41|String|Find the length of a string without using a built-in length function.|hello|5|world|5",
  "42|String|Reverse a string.|hello|olleh|world|dlrow",
  "43|String|Check whether a string is a palindrome.|radar|True|hello|False",
  "44|String|Count vowels and consonants in a string.|hello|2 3|world|1 4",
  "45|String|Count uppercase and lowercase characters in a string.|HeLLo|2 3|WoRLD|4 1",
  "46|String|Count digits and special characters in a string.|a1@b2#|2 2|h3llo!|1 1",
  "47|String|Find the frequency of each character in a string.|hello|h:1 e:1 l:2 o:1|world|w:1 o:1 r:1 l:1 d:1",
  "48|String|Remove spaces from a string.|hello world|helloworld|a b c|abc",
  "49|String|Remove duplicate characters from a string.|hello|helo|world|world",
  "50|String|Find the first non-repeating character in a string.|hello|h|swiss|w",
  "51|String|Check whether two strings are anagrams.|listen silent|True|hello world|False",
  "52|String|Count the number of words in a sentence.|hello world|2|a b c|3",
  "53|String|Reverse the words in a sentence.|hello world|world hello|a b c|c b a",
  "54|String|Find the longest word in a sentence.|hello world|hello|a quick brown fox|quick",
  "55|String|Check whether one string is a rotation of another.|waterbottle erbottlewat|True|hello world|False",
  "56|Searching|Implement linear search.|5\n1 2 3 4 5\n3|2|5\n1 2 3 4 5\n6|-1",
  "57|Searching|Implement binary search on a sorted array.|5\n1 2 3 4 5\n4|3|5\n1 2 3 4 5\n6|-1",
  "58|Searching|Find the first occurrence of an element in a sorted array.|5\n1 2 2 2 3\n2|1|4\n1 1 1 1\n1|0",
  "59|Searching|Find the last occurrence of an element in a sorted array.|5\n1 2 2 2 3\n2|3|4\n1 1 1 1\n1|3",
  "60|Searching|Count the occurrences of a number in a sorted array.|5\n1 2 2 2 3\n2|3|4\n1 1 1 1\n2|0",
  "61|Sorting|Implement bubble sort.|5\n5 4 3 2 1|1 2 3 4 5|3\n3 1 2|1 2 3",
  "62|Sorting|Implement selection sort.|5\n5 4 3 2 1|1 2 3 4 5|3\n3 1 2|1 2 3",
  "63|Sorting|Implement insertion sort.|5\n5 4 3 2 1|1 2 3 4 5|3\n3 1 2|1 2 3",
  "64|Sorting|Check whether an array is already sorted.|5\n1 2 3 4 5|True|5\n5 4 3 2 1|False",
  "65|Sorting|Sort an array of 0s, 1s, and 2s (Dutch National Flag problem).|6\n0 1 2 0 1 2|0 0 1 1 2 2|3\n2 0 1|0 1 2",
  "66|Hashing|Find the frequency of each element in an array.|5\n1 2 2 3 3|1:1 2:2 3:2|3\n1 1 1|1:3",
  "67|Hashing|Find the first repeating element in an array.|5\n1 2 3 2 1|1|4\n1 2 3 4|None",
  "68|Hashing|Find all non-repeating elements in an array.|5\n1 2 2 3 4|1 3 4|3\n1 1 1|None",
  "69|Hashing|Check whether two arrays are equal using frequency map.|3\n1 2 3\n3\n3 2 1|True|2\n1 2\n2\n2 3|False",
  "70|Hashing|Find a pair of elements that sum up to a target value.|5\n1 2 3 4 5\n9|4 5|4\n1 2 3 4\n10|None",
  "71|Two Pointers|Check whether a string is a palindrome using two pointers.|racecar|True|hello|False",
  "72|Two Pointers|Reverse an array using two pointers.|5\n1 2 3 4 5|5 4 3 2 1|4\n10 20 30 40|40 30 20 10",
  "73|Two Pointers|Move all negative numbers to the beginning of an array.|5\n-1 2 -3 4 5|-1 -3 2 4 5|3\n1 -2 3|-2 1 3",
  "74|Two Pointers|Remove duplicates from a sorted array using two pointers.|5\n1 1 2 2 3|1 2 3|3\n1 1 1|1",
  "75|Two Pointers|Find if a pair with a given sum exists in a sorted array.|5\n1 2 3 4 5\n7|True|4\n1 2 3 4\n8|False",
  "76|Prefix Sum|Compute the prefix sum array of a given array.|5\n1 2 3 4 5|1 3 6 10 15|3\n2 4 6|2 6 12",
  "77|Prefix Sum|Find the sum of elements in a range [L, R] using prefix sums.|5\n1 2 3 4 5\n1 3|9|4\n2 4 6 8\n0 2|12",
  "78|Prefix Sum|Find the equilibrium index of an array.|5\n1 3 5 2 2|2|3\n1 2 3|-1",
  "79|Prefix Sum|Check if an array can be split into two parts with equal sum.|4\n1 2 3 3|True|4\n1 2 3 4|False",
  "80|Prefix Sum|Find the highest sum of a subarray of size K.|5\n1 2 3 4 5\n2|9|4\n2 1 5 3\n3|9",
  "81|Linked List|Create a singly linked list and print its elements.|3\n1 2 3|1 -> 2 -> 3|2\n10 20|10 -> 20",
  "82|Linked List|Insert a node at the beginning of a linked list.|3\n1 2 3\n0|0 -> 1 -> 2 -> 3|2\n2 3\n1|1 -> 2 -> 3",
  "83|Linked List|Insert a node at the end of a linked list.|3\n1 2 3\n4|1 -> 2 -> 3 -> 4|2\n1 2\n3|1 -> 2 -> 3",
  "84|Linked List|Delete the first node of a linked list.|3\n1 2 3|2 -> 3|2\n1 2|2",
  "85|Linked List|Delete the last node of a linked list.|3\n1 2 3|1 -> 2|2\n1 2|1",
  "86|Linked List|Search for an element in a linked list.|3\n1 2 3\n2|True|3\n1 2 3\n5|False",
  "87|Linked List|Find the length of a linked list.|3\n1 2 3|3|1\n10|1",
  "88|Linked List|Reverse a singly linked list.|3\n1 2 3|3 -> 2 -> 1|2\n10 20|20 -> 10",
  "89|Linked List|Find the middle element of a linked list.|5\n1 2 3 4 5|3|4\n1 2 3 4|3",
  "90|Linked List|Check whether a linked list contains a cycle.|3\n1 2 3|False|1\n1|False",
  "91|Stack|Implement a stack using an array.|push 1, push 2, pop|2|push 5, pop|5",
  "92|Stack|Check for balanced parentheses in an expression.|{()}()|True|{(})|False",
  "93|Stack|Reverse a string using a stack.|hello|olleh|code|edoc",
  "94|Stack|Evaluate a postfix expression.|2 3 + 4 *|20|5 2 -|3",
  "95|Stack|Find the next greater element for each element in an array.|4\n4 5 2 25|5 25 25 -1|3\n1 3 2|3 -1 -1",
  "96|Queue|Implement a queue using an array.|enqueue 1, enqueue 2, dequeue|1|enqueue 5, dequeue|5",
  "97|Queue|Implement a circular queue.|enqueue 1, enqueue 2, dequeue, enqueue 3|1|enqueue 10, dequeue|10",
  "98|Queue|Generate binary numbers from 1 to N using a queue.|3|1 10 11|5|1 10 11 100 101",
  "99|Queue|Reverse the first K elements of a queue.|5\n1 2 3 4 5\n3|3 2 1 4 5|4\n10 20 30 40\n2|20 10 30 40",
  "100|Queue|Implement a stack using queues.|push 1, push 2, pop|2|push 10, pop|10"
]

def get_starter_code(category: str) -> dict:
    if category in ['Basics', 'Loops', 'Numbers']:
        return {
            "python": "import sys\ninput = sys.stdin.readline\n\n# Read input\nn = int(input())\n\n# Write your solution below\n",
            "javascript": "const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nlet idx = 0;\nconst n = parseInt(lines[idx++]);\n// Write your solution below\n",
            "java": "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Write your solution below\n    }\n}",
            "cpp": "#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    // Write your solution below\n    return 0;\n}"
        }
    elif category == 'String':
        return {
            "python": "import sys\ninput = sys.stdin.readline\n\n# Read input\ns = input().strip()\n\n# Write your solution below\n",
            "javascript": "const s = require('fs').readFileSync(0, 'utf8').trim();\n// Write your solution below\n",
            "java": "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        // Write your solution below\n    }\n}",
            "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s;\n    cin >> s;\n    // Write your solution below\n    return 0;\n}"
        }
    else:
        return {
            "python": "import sys\ninput = sys.stdin.readline\n\n# Read input\nn = int(input())\narr = list(map(int, input().split()))\n\n# Write your solution below\n",
            "javascript": "const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nlet idx = 0;\nconst n = parseInt(lines[idx++]);\nconst arr = lines[idx++].split(' ').map(Number);\n// Write your solution below\n",
            "java": "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i=0; i<n; i++) arr[i] = sc.nextInt();\n        // Write your solution below\n    }\n}",
            "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i=0; i<n; i++) cin >> arr[i];\n    // Write your solution below\n    return 0;\n}"
        }


def init_sqlalchemy_db():
    """Initializes tables and seeds 100 questions into SQLAlchemy database."""
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        count = session.query(func.count(PracticeQuestion.id)).scalar()
        if count == 0:
            logger.info("Seeding 100 DSA questions into SQLAlchemy database...")
            for raw in RAW_QUESTIONS:
                parts = raw.split("|")
                q_id = int(parts[0])
                cat = parts[1]
                title = parts[2]
                in1 = parts[3] if len(parts) > 3 else ""
                out1 = parts[4] if len(parts) > 4 else ""
                in2 = parts[5] if len(parts) > 5 else ""
                out2 = parts[6] if len(parts) > 6 else ""

                samples = [
                    {"input": in1, "expectedOutput": out1},
                    {"input": in2, "expectedOutput": out2}
                ]
                hidden = [
                    {"input": in1, "expectedOutput": out1},
                    {"input": in2, "expectedOutput": out2}
                ]

                q = PracticeQuestion(
                    question_id=q_id,
                    title=title,
                    category=cat,
                    difficulty="Beginner",
                    description=f"### Problem Description\n\n{title}\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint result to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
                    sample_test_cases=json.dumps(samples),
                    hidden_test_cases=json.dumps(hidden),
                    starter_code=json.dumps(get_starter_code(cat)),
                    supported_languages=json.dumps(["Python", "JavaScript", "Java", "C++"]),
                    is_active=True
                )
                session.add(q)
            session.commit()
            print(f"\033[32m[SQLAlchemy]\033[0m Successfully initialized and seeded 100 DSA questions.")
    except Exception as e:
        session.rollback()
        logger.error(f"[SQLAlchemy] Database init error: {e}")
    finally:
        session.close()


def check_db_health() -> Dict[str, Any]:
    """Tests SQLAlchemy database connection and response time."""
    start_time = time.time()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "healthy",
            "connected": True,
            "latencyMs": latency_ms,
            "engine": "SQLAlchemy (ORM)",
            "dialect": engine.dialect.name,
            "databaseUrl": DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else DATABASE_URL
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "connected": False,
            "error": str(e),
            "engine": "SQLAlchemy (ORM)"
        }


# ── Practice Questions ORM Repositories ─────────────────────────────────────

def get_practice_questions_orm(difficulty: str = "Beginner", category: str = "All", page: int = 1, limit: int = 20):
    session = SessionLocal()
    try:
        stmt = select(PracticeQuestion).where(PracticeQuestion.is_active == True)
        if difficulty and difficulty != "All":
            stmt = stmt.where(PracticeQuestion.difficulty == difficulty)
        if category and category != "All":
            stmt = stmt.where(PracticeQuestion.category == category)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = session.execute(count_stmt).scalar() or 0

        skip = (page - 1) * limit
        paginated_stmt = stmt.order_by(PracticeQuestion.question_id.asc()).offset(skip).limit(limit)
        items = session.execute(paginated_stmt).scalars().all()

        questions = [
            {
                "questionId": q.question_id,
                "title": q.title,
                "category": q.category,
                "difficulty": q.difficulty,
                "isActive": q.is_active
            }
            for q in items
        ]

        total_pages = (total + limit - 1) // limit if limit > 0 else 1
        return {
            "questions": questions,
            "total": total,
            "page": page,
            "totalPages": total_pages
        }
    finally:
        session.close()


def get_practice_question_by_id_orm(question_id: int):
    session = SessionLocal()
    try:
        stmt = select(PracticeQuestion).where(PracticeQuestion.question_id == question_id)
        q = session.execute(stmt).scalar_one_or_none()
        if not q:
            return None
        return q.to_dict(include_hidden=True)
    finally:
        session.close()


def get_practice_stats_orm(difficulty: str = "Beginner", session_id: str = ""):
    session = SessionLocal()
    try:
        q_stmt = select(func.count(PracticeQuestion.id)).where(PracticeQuestion.is_active == True)
        if difficulty and difficulty != "All":
            q_stmt = q_stmt.where(PracticeQuestion.difficulty == difficulty)
        total_questions = session.execute(q_stmt).scalar() or 0

        cat_stmt = select(distinct(PracticeQuestion.category)).where(PracticeQuestion.is_active == True)
        categories = sorted([r[0] for r in session.execute(cat_stmt).fetchall()])

        solved = 0
        attempted = 0
        if session_id:
            solved_stmt = select(func.count(PracticeProgress.id)).where(
                PracticeProgress.session_id == session_id,
                PracticeProgress.status == "solved"
            )
            if difficulty and difficulty != "All":
                solved_stmt = solved_stmt.where(PracticeProgress.difficulty == difficulty)
            solved = session.execute(solved_stmt).scalar() or 0

            attempted_stmt = select(func.count(PracticeProgress.id)).where(
                PracticeProgress.session_id == session_id
            )
            if difficulty and difficulty != "All":
                attempted_stmt = attempted_stmt.where(PracticeProgress.difficulty == difficulty)
            attempted = session.execute(attempted_stmt).scalar() or 0

        return {
            "total": total_questions,
            "solved": solved,
            "attempted": attempted,
            "remaining": max(0, total_questions - solved),
            "categories": categories
        }
    finally:
        session.close()


def record_practice_progress_orm(session_id: str, question_id: int, difficulty: str, language: str, status: str, verdict: str):
    if not session_id:
        return
    session = SessionLocal()
    try:
        stmt = select(PracticeProgress).where(
            PracticeProgress.session_id == session_id,
            PracticeProgress.question_id == question_id
        )
        existing = session.execute(stmt).scalar_one_or_none()

        if existing:
            if existing.status != "solved" or status == "solved":
                existing.status = status
            existing.language = language
            existing.verdict = verdict
            existing.difficulty = difficulty
            existing.submitted_at = datetime.utcnow()
        else:
            new_prog = PracticeProgress(
                session_id=session_id,
                question_id=question_id,
                difficulty=difficulty,
                language=language,
                status=status,
                verdict=verdict,
                submitted_at=datetime.utcnow()
            )
            session.add(new_prog)
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"[SQLAlchemy] Failed to record progress: {e}")
    finally:
        session.close()


# ── Interview Session & Resume Persistence ───────────────────────────────────

def save_interview_session_orm(data: Dict[str, Any]):
    session = SessionLocal()
    try:
        s_id = data.get("sessionId") or data.get("id") or f"session_{int(time.time()*1000)}"
        stmt = select(InterviewSessionModel).where(InterviewSessionModel.session_id == s_id)
        existing = session.execute(stmt).scalar_one_or_none()

        qa_json = json.dumps(data.get("qaEvaluations", []))
        coding_json = json.dumps(data.get("codingSubmissions", []))
        analysis_str = data.get("analysis", "") if isinstance(data.get("analysis"), str) else json.dumps(data.get("analysis", {}))

        if existing:
            existing.role = data.get("role", existing.role)
            existing.level = data.get("level", existing.level)
            existing.score = data.get("score", existing.score)
            existing.accuracy = data.get("accuracy", existing.accuracy)
            existing.confidence = data.get("confidence", existing.confidence)
            existing.logical_thinking = data.get("logicalThinking", existing.logical_thinking)
            existing.result = data.get("result", existing.result)
            existing.qa_evaluations = qa_json
            existing.coding_submissions = coding_json
            existing.analysis = analysis_str
        else:
            item = InterviewSessionModel(
                session_id=s_id,
                role=data.get("role", "Software Engineer"),
                level=data.get("level", "Fresher"),
                score=data.get("score"),
                accuracy=data.get("accuracy"),
                confidence=data.get("confidence"),
                logical_thinking=data.get("logicalThinking"),
                result=data.get("result", "Borderline"),
                qa_evaluations=qa_json,
                coding_submissions=coding_json,
                analysis=analysis_str
            )
            session.add(item)
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        logger.error(f"[SQLAlchemy] Failed to save session: {e}")
        return False
    finally:
        session.close()


def get_interview_sessions_orm(limit: int = 50) -> List[Dict[str, Any]]:
    session = SessionLocal()
    try:
        stmt = select(InterviewSessionModel).order_by(InterviewSessionModel.created_at.desc()).limit(limit)
        items = session.execute(stmt).scalars().all()
        return [item.to_dict() for item in items]
    finally:
        session.close()


def save_resume_analysis_orm(file_name: str, file_size: str, analysis: Dict[str, Any]):
    session = SessionLocal()
    try:
        resume = ResumeModel(
            file_name=file_name,
            file_size=file_size,
            ats_score=float(analysis.get("atsScore", 0)),
            skills=json.dumps(analysis.get("skills", [])),
            raw_analysis=json.dumps(analysis)
        )
        session.add(resume)
        session.commit()
        return resume.to_dict()
    except Exception as e:
        session.rollback()
        logger.error(f"[SQLAlchemy] Failed to save resume: {e}")
        return None
    finally:
        session.close()

# Auto-initialize tables and seed on module import
try:
    init_sqlalchemy_db()
except Exception as e:
    logger.error(f"[SQLAlchemy Auto-init] {e}")
