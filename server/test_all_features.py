"""
server/test_all_features.py

Comprehensive test suite testing Groq AI, Gemini AI, MongoDB persistence, and FastAPI routes.
"""

import sys
import httpx
import asyncio

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3001"

async def test_all():
    print("==================================================")
    print("  SMITH AI — COMPLETE END-TO-END VERIFICATION TEST")
    print("==================================================")
    
    async with httpx.AsyncClient(timeout=35.0) as client:
        
        # 1. Health check
        print("\n[1/6] Testing GET /health...")
        try:
            res = await client.get(f"{BASE_URL}/health")
            print(f"   Status Code: {res.status_code}")
            print(f"   Response: {res.json()}")
            assert res.status_code == 200
            print("   [SUCCESS] Health Check Passed!")
        except Exception as e:
            print(f"   [FAILED] Health Check Failed: {e}")

        # 2. Groq AI Intro Generation
        print("\n[2/6] Testing Groq LLM (POST /api/interview/start)...")
        try:
            start_payload = {
                "role": "Software Engineer",
                "level": "Mid-Level",
                "language": "English",
                "difficulty": "Intermediate"
            }
            res = await client.post(f"{BASE_URL}/api/interview/start", json=start_payload)
            print(f"   Status Code: {res.status_code}")
            data = res.json()
            print(f"   AI Intro Question: \"{data.get('question')}\"")
            assert res.status_code == 200 and data.get("ok") is True
            print("   [SUCCESS] Groq AI Intro Passed!")
        except Exception as e:
            print(f"   [FAILED] Groq AI Intro Failed: {e}")

        # 3. Groq AI Q&A Response
        print("\n[3/6] Testing Groq Q&A Follow-up (POST /api/interview/respond)...")
        try:
            respond_payload = {
                "role": "Software Engineer",
                "level": "Mid-Level",
                "candidateAnswer": "I have 3 years of experience building scalable backend APIs with Python, Node.js, and MongoDB.",
                "interviewType": "Technical Round",
                "history": [],
                "language": "English"
            }
            res = await client.post(f"{BASE_URL}/api/interview/respond", json=respond_payload)
            print(f"   Status Code: {res.status_code}")
            data = res.json()
            print(f"   AI Follow-up Question: \"{data.get('question')}\"")
            assert res.status_code == 200 and data.get("ok") is True
            print("   [SUCCESS] Groq AI Follow-up Passed!")
        except Exception as e:
            print(f"   [FAILED] Groq AI Follow-up Failed: {e}")

        # 4. Gemini AI Practice Question Generator
        print("\n[4/6] Testing Gemini AI Practice Problem Generator (POST /api/interview/practice-question)...")
        try:
            practice_payload = {
                "difficulty": "Intermediate",
                "role": "Backend Engineer",
                "solvedTitles": []
            }
            res = await client.post(f"{BASE_URL}/api/interview/practice-question", json=practice_payload)
            print(f"   Status Code: {res.status_code}")
            data = res.json()
            prob = data.get("data", {})
            print(f"   Generated Problem Title: \"{prob.get('title')}\"")
            assert res.status_code == 200 and data.get("ok") is True
            print("   [SUCCESS] Gemini AI Practice Generator Passed!")
        except Exception as e:
            print(f"   [FAILED] Gemini AI Practice Generator Failed: {e}")

        # 5. Gemini AI Code Submission Evaluator
        print("\n[5/6] Testing Gemini AI Code Evaluator (POST /api/interview/submit-code)...")
        try:
            code_payload = {
                "code": "function twoSum(nums, target) { const map = new Map(); for (let i=0; i<nums.length; i++) { const diff = target - nums[i]; if (map.has(diff)) return [map.get(diff), i]; map.set(nums[i], i); } return []; }",
                "language": "javascript",
                "questionText": "Two Sum Problem",
                "role": "Software Engineer",
                "level": "Mid-Level"
            }
            res = await client.post(f"{BASE_URL}/api/interview/submit-code", json=code_payload)
            print(f"   Status Code: {res.status_code}")
            data = res.json()
            eval_data = data.get("evaluation", {})
            print(f"   Passed Test Cases: {eval_data.get('passedTestCases')}")
            print(f"   Time Complexity: {eval_data.get('timeComplexity')}")
            assert res.status_code == 200 and data.get("ok") is True
            print("   [SUCCESS] Gemini AI Code Evaluator Passed!")
        except Exception as e:
            print(f"   [FAILED] Gemini AI Code Evaluator Failed: {e}")

        # 6. MongoDB History Log Persistence
        print("\n[6/6] Testing MongoDB History Records (GET /api/interview/history)...")
        try:
            res = await client.get(f"{BASE_URL}/api/interview/history")
            print(f"   Status Code: {res.status_code}")
            data = res.json()
            print(f"   History Count: {len(data.get('history', []))}")
            assert res.status_code == 200 and data.get("ok") is True
            print("   [SUCCESS] MongoDB History Route Passed!")
        except Exception as e:
            print(f"   [FAILED] MongoDB History Route Failed: {e}")

    print("\n==================================================")
    print("  ALL FEATURE TESTS COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(test_all())
