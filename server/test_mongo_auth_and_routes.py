"""
server/test_mongo_auth_and_routes.py

Verification suite for MongoDB Atlas Authentication, JWT tokens, and SQLAlchemy ORM
"""

import sys
import uuid
from fastapi.testclient import TestClient
from main import app
from database_mongo_auth import check_mongo_auth_health

def run_tests():
    print("=" * 65)
    print("SMITH AI MONGODB ATLAS AUTH & SQLALCHEMY ROUTING VERIFICATION")
    print("=" * 65)

    client = TestClient(app)

    # 1. MongoDB Health Diagnostic
    print("\n[1] Testing MongoDB Atlas Connectivity:")
    mongo_diag = check_mongo_auth_health()
    print(f"    - Status:            {mongo_diag.get('status')}")
    print(f"    - Connected:         {mongo_diag.get('connected')}")
    print(f"    - Cluster Type:      {mongo_diag.get('type')}")
    print(f"    - Database:          {mongo_diag.get('database')}")
    print(f"    - Registered Users:  {mongo_diag.get('usersRegistered')}")
    print(f"    - Ping Latency:      {mongo_diag.get('latencyMs')} ms")
    assert mongo_diag.get("connected") is True, f"MongoDB connection failed: {mongo_diag.get('error')}"

    # 2. GET /health
    print("\n[2] Testing GET /health (Dual DB Engine Status):")
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    print(f"    - Status Code:       {res.status_code}")
    print(f"    - Engine:            {data.get('engine')}")
    print(f"    - SQLAlchemy DB:     {data.get('database', {}).get('status')}")
    print(f"    - MongoDB Auth:      {data.get('mongoAuth', {}).get('status')}")
    print(f"    - Questions Loaded:  {data.get('questionsLoaded')}")

    # 3. User Signup in MongoDB
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    test_password = "SecurePassword123!"
    print(f"\n[3] Testing POST /api/auth/signup (Email: {unique_email}):")
    signup_res = client.post("/api/auth/signup", json={
        "name": "Chakri Chitteti",
        "email": unique_email,
        "password": test_password,
        "role": "Lead Full Stack Architect",
        "level": "Senior Level",
        "difficulty": "Advanced"
    })
    print(f"    - Status Code:       {signup_res.status_code}")
    assert signup_res.status_code == 200
    signup_data = signup_res.json()
    jwt_token = signup_data.get("token")
    user_id = signup_data.get("user", {}).get("id")
    print(f"    - User ID:           {user_id}")
    print(f"    - Name:              {signup_data.get('user', {}).get('name')}")
    print(f"    - JWT Token Issued:  {bool(jwt_token)} (Length: {len(jwt_token)})")
    assert bool(jwt_token) is True
    assert user_id is not None

    # 4. User Login with MongoDB Password Verification (bcrypt)
    print(f"\n[4] Testing POST /api/auth/login with bcrypt verification:")
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": test_password
    })
    print(f"    - Status Code:       {login_res.status_code}")
    assert login_res.status_code == 200
    login_data = login_res.json()
    auth_token = login_data.get("token")
    print(f"    - Login Token:       {auth_token[:20]}...")
    print(f"    - Authenticated User: {login_data.get('user', {}).get('name')} ({login_data.get('user', {}).get('email')})")
    assert bool(auth_token) is True

    # 5. GET /api/auth/me (Protected Route with JWT)
    print("\n[5] Testing GET /api/auth/me (Bearer Token Validation):")
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {auth_token}"})
    print(f"    - Status Code:       {me_res.status_code}")
    assert me_res.status_code == 200
    me_data = me_res.json()
    print(f"    - Decoded User ID:   {me_data.get('user', {}).get('id')}")
    print(f"    - Role:              {me_data.get('user', {}).get('role')}")
    print(f"    - Level:             {me_data.get('user', {}).get('level')}")
    assert me_data.get("user", {}).get("email") == unique_email

    # 6. POST /api/auth/profile (Update Profile in MongoDB)
    print("\n[6] Testing POST /api/auth/profile (Update Role & Rigor in MongoDB):")
    update_res = client.post("/api/auth/profile", 
        json={"role": "Principal AI Systems Architect", "difficulty": "Expert"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    print(f"    - Status Code:       {update_res.status_code}")
    assert update_res.status_code == 200
    updated_data = update_res.json()
    print(f"    - Updated Role:      {updated_data.get('user', {}).get('role')}")
    print(f"    - Updated Rigor:     {updated_data.get('user', {}).get('difficulty')}")
    assert updated_data.get("user", {}).get("role") == "Principal AI Systems Architect"

    # 7. Verify SQLAlchemy Practice Pool (100 Questions)
    print("\n[7] Testing SQLAlchemy Practice Questions Retrieval:")
    practice_res = client.get("/api/practice/questions?limit=3")
    assert practice_res.status_code == 200
    pdata = practice_res.json()
    print(f"    - Total in SQL DB:   {pdata.get('total')}")
    print(f"    - Sample Question:   {pdata.get('questions', [])[0].get('title')}")
    assert pdata.get("total") == 100

    print("\n" + "=" * 65)
    print("ALL MONGODB AUTH & SQLALCHEMY ROUTING TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
