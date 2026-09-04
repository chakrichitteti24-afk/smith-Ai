"""
server/test_routes_and_db.py

Comprehensive Integration Test for all Routing and SQLAlchemy Database Health
"""

import sys
from fastapi.testclient import TestClient
from main import app
from database_sqlalchemy import check_db_health

def run_tests():
    print("=" * 60)
    print("SMITH AI ROUTING & SQLALCHEMY DATABASE HEALTH VERIFICATION")
    print("=" * 60)

    # 1. Test Database Health directly
    db_health = check_db_health()
    print("\n[1] Database Health Check:")
    print(f"    - Status:     {db_health.get('status')}")
    print(f"    - Connected:  {db_health.get('connected')}")
    print(f"    - Dialect:    {db_health.get('dialect')}")
    print(f"    - Latency:    {db_health.get('latencyMs')} ms")
    assert db_health.get("connected") is True, "Database connection failed!"

    with TestClient(app) as client:
        # 2. Test /health endpoint
        res = client.get("/health")
        print("\n[2] GET /health:")
        print(f"    - Status Code:       {res.status_code}")
        print(f"    - Engine:            {res.json().get('engine')}")
        print(f"    - Questions Loaded:  {res.json().get('questionsLoaded')}")
        print(f"    - Topics Available:  {res.json().get('topicsAvailable')}")
        assert res.status_code == 200

        # 3. Test Practice Questions Pagination
        res = client.get("/api/practice/questions?page=1&limit=5")
        print("\n[3] GET /api/practice/questions (limit=5):")
        print(f"    - Status Code:       {res.status_code}")
        print(f"    - Total Count:       {res.json().get('total')}")
        print(f"    - Retrieved Count:   {len(res.json().get('questions', []))}")
        assert res.status_code == 200
        assert len(res.json().get("questions", [])) == 5

        # 4. Test Single Question Fetch
        res = client.get("/api/practice/questions/1")
        print("\n[4] GET /api/practice/questions/1:")
        print(f"    - Status Code:       {res.status_code}")
        print(f"    - Title:             {res.json().get('title')}")
        print(f"    - Category:          {res.json().get('category')}")
        assert res.status_code == 200
        assert res.json().get("questionId") == 1

        # 5. Test Practice Stats Aggregation
        res = client.get("/api/practice/stats?difficulty=Beginner")
        print("\n[5] GET /api/practice/stats:")
        print(f"    - Status Code:       {res.status_code}")
        print(f"    - Total in Pool:     {res.json().get('total')}")
        print(f"    - Solved Count:      {res.json().get('solved')}")
        print(f"    - Categories:        {res.json().get('categories')}")
        assert res.status_code == 200

        # 6. Test Code Run Endpoint
        res = client.post("/api/practice/run", json={
            "questionId": 1,
            "code": "n = int(input())\nprint('Even' if n % 2 == 0 else 'Odd')",
            "language": "Python",
            "sessionId": "test_session_abc"
        })
        print("\n[6] POST /api/practice/run:")
        print(f"    - Status Code:       {res.status_code}")
        print(f"    - All Passed:        {res.json().get('allPassed')}")
        print(f"    - Test Results:      {len(res.json().get('results', []))} cases executed")
        assert res.status_code == 200

        # 7. Test Code Submit Endpoint & SQLAlchemy Persistence
        res = client.post("/api/practice/submit", json={
            "questionId": 1,
            "code": "n = int(input())\nprint('Even' if n % 2 == 0 else 'Odd')",
            "language": "Python",
            "sessionId": "test_session_abc"
        })
        print("\n[7] POST /api/practice/submit:")
        print(f"    - Status Code:       {res.status_code}")
        print(f"    - Verdict:           {res.json().get('verdict')}")
        print(f"    - Score:             {res.json().get('score')}")
        assert res.status_code == 200

        # 8. Test Interview Session Save (SQLAlchemy)
        res = client.post("/api/interview/history", json={
            "sessionId": "session_mock_999",
            "role": "Lead Full Stack Architect",
            "level": "Lead",
            "date": "Aug 28, 2026",
            "score": 94.0,
            "accuracy": 92.0,
            "confidence": 95.0,
            "logicalThinking": 96.0,
            "result": "Strong Hire",
            "analysis": "Exceptional architectural depth."
        })
        print("\n[8] POST /api/interview/history:")
        print(f"    - Status Code:       {res.status_code}")
        print(f"    - Response:          {res.json()}")
        assert res.status_code == 200

        # 9. Test Interview Session History Retrieval (SQLAlchemy)
        res = client.get("/api/interview/history")
        print("\n[9] GET /api/interview/history:")
        print(f"    - Status Code:       {res.status_code}")
        sessions = res.json().get("history", [])
        print(f"    - History Records:   {len(sessions)}")
        if sessions:
            print(f"    - Latest Session:    {sessions[0].get('role')} | Score: {sessions[0].get('score')}% | Verdict: {sessions[0].get('result')}")
        assert res.status_code == 200
        assert len(sessions) > 0

        # 10. Test Code Sandbox Run & Submit
        res = client.post("/api/interview/run-code", json={
            "code": "console.log('Test');",
            "language": "javascript",
            "stdin": "input_val"
        })
        print("\n[10] POST /api/interview/run-code:")
        print(f"    - Status Code:       {res.status_code}")
        print(f"    - Output:            {res.json().get('stdout').strip()}")
        assert res.status_code == 200

    print("\n" + "=" * 60)
    print("ALL ROUTING & SQLALCHEMY TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
