"""
server/migrate_all_to_mongodb.py

Automated one-click migration script:
Transfers all data from SQLite ORM directly into MongoDB Atlas:
- 100 Practice DSA Questions
- User Accounts & Auth Credentials
- AI Mock Interview Sessions
- Code Practice Progress & Submissions
- Resume ATS Evaluations
"""

import sys
import os
import json
import pymongo
from pathlib import Path

# Add server directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from database_sqlalchemy import SessionLocal
from models_sqlalchemy import (
    PracticeQuestion,
    UserModel,
    InterviewSessionModel,
    PracticeProgress,
    ResumeModel
)

def run_migration(mongo_uri: str, db_name: str = "smith_ai"):
    print("==========================================================")
    print(" [MIGRATION] ATLYRA -> MONGODB ATLAS AUTOMATED DATA MIGRATION")
    print("==========================================================")

    # 1. Connect to MongoDB Atlas
    print(f"\n[1/5] Connecting to MongoDB Atlas ({db_name})...")
    try:
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=8000)
        # Test connection
        client.admin.command('ping')
        print("[OK] Connected to MongoDB Atlas successfully!")
    except Exception as e:
        print(f"[FAIL] Connection failed: {e}")
        return False

    db = client[db_name]
    session = SessionLocal()

    try:
        # 2. Migrate Practice Questions (100 DSA Problems)
        print("\n[2/5] Migrating 100 Algorithmic Practice Questions...")
        questions = session.query(PracticeQuestion).all()
        q_coll = db["practice_questions"]
        q_coll.create_index("questionId", unique=True)
        q_coll.create_index("category")
        q_coll.create_index("difficulty")

        inserted_q = 0
        for q in questions:
            q_dict = q.to_dict(include_hidden=True)
            q_coll.update_one(
                {"questionId": q_dict["questionId"]},
                {"$set": q_dict},
                upsert=True
            )
            inserted_q += 1
        print(f"[OK] Successfully pushed {inserted_q} questions to MongoDB Atlas ('{db_name}.practice_questions')")

        # 3. Migrate Users & Auth Profiles
        print("\n[3/5] Migrating User Accounts & Auth Credentials...")
        users = session.query(UserModel).all()
        u_coll = db["users"]
        try:
            u_coll.drop_indexes()
        except Exception:
            pass
        u_coll.create_index("email", unique=True)
        u_coll.create_index("id", unique=True)

        inserted_u = 0
        for u in users:
            u_dict = u.to_dict()
            u_dict["id"] = u.user_id
            u_dict["userId"] = u.user_id
            u_dict["passwordHash"] = u.password_hash
            u_dict["password"] = u.password_hash
            u_coll.update_one(
                {"email": u_dict["email"]},
                {"$set": u_dict},
                upsert=True
            )
            inserted_u += 1
        print(f"[OK] Successfully pushed {inserted_u} users to MongoDB Atlas ('{db_name}.users')")

        # 4. Migrate AI Interview Sessions
        print("\n[4/5] Migrating Interview History & Evaluation Dossiers...")
        interviews = session.query(InterviewSessionModel).all()
        i_coll = db["interview_sessions"]
        i_coll.create_index("sessionId", unique=True)

        inserted_i = 0
        for i in interviews:
            i_dict = i.to_dict()
            i_coll.update_one(
                {"sessionId": i_dict["sessionId"]},
                {"$set": i_dict},
                upsert=True
            )
            inserted_i += 1
        print(f"[OK] Successfully pushed {inserted_i} interview sessions to MongoDB Atlas ('{db_name}.interview_sessions')")

        # 5. Migrate Practice Progress & Submissions
        print("\n[5/5] Migrating Sandbox Progress & Resumes...")
        progresses = session.query(PracticeProgress).all()
        p_coll = db["practice_progress"]
        p_coll.create_index([("sessionId", 1), ("questionId", 1)])

        inserted_p = 0
        for p in progresses:
            p_dict = p.to_dict()
            p_coll.update_one(
                {"id": p_dict["id"]},
                {"$set": p_dict},
                upsert=True
            )
            inserted_p += 1

        resumes = session.query(ResumeModel).all()
        r_coll = db["resumes"]
        inserted_r = 0
        for r in resumes:
            r_dict = r.to_dict()
            r_coll.update_one(
                {"id": r_dict["id"]},
                {"$set": r_dict},
                upsert=True
            )
            inserted_r += 1

        print(f"[OK] Successfully pushed {inserted_p} submissions and {inserted_r} resumes to MongoDB Atlas")

        print("\n==========================================================")
        print(" [SUCCESS] FULL DATABASE MIGRATION COMPLETED SUCCESSFULLY!")
        print(f" All collections are now live in MongoDB Atlas database: '{db_name}'")
        print("==========================================================")
        return True

    except Exception as e:
        print(f"[FAIL] Migration error: {e}")
        return False
    finally:
        session.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_uri = sys.argv[1]
    else:
        target_uri = input("Enter your full MongoDB connection string: ").strip()

    if target_uri:
        run_migration(target_uri)
    else:
        print("No URI provided. Exiting.")
