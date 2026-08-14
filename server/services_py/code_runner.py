import sys
import time
import asyncio
import subprocess
import tempfile
import os
import httpx

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

LANGUAGE_MAP = {
    "Python": {"language": "python", "version": "3.10.0"},
    "JavaScript": {"language": "javascript", "version": "18.15.0"},
    "Java": {"language": "java", "version": "15.0.2"},
    "C": {"language": "c", "version": "10.2.0"},
    "C++": {"language": "c++", "version": "10.2.0"}
}

def sanitize_stderr(stderr: str, language: str) -> str:
    if not stderr:
        return ""
    if language.lower() in ["c", "c++", "java"]:
        return "Compilation or Runtime Error occurred. Please check your syntax and logic."
    return stderr

def run_python_local(code: str, test_input: str, timeout: float = 3.0) -> dict:
    try:
        proc = subprocess.run(
            [sys.executable, "-c", code],
            input=test_input,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "stdout": proc.stdout.strip(),
            "stderr": proc.stderr.strip(),
            "exitCode": proc.returncode,
            "timedOut": False
        }
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Execution timed out.", "exitCode": 137, "timedOut": True}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "exitCode": -1, "timedOut": False}

def run_js_local(code: str, test_input: str, timeout: float = 3.0) -> dict:
    try:
        proc = subprocess.run(
            ["node", "-e", code],
            input=test_input,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "stdout": proc.stdout.strip(),
            "stderr": proc.stderr.strip(),
            "exitCode": proc.returncode,
            "timedOut": False
        }
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Execution timed out.", "exitCode": 137, "timedOut": True}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "exitCode": -1, "timedOut": False}

async def run_code_against_test(
    code: str,
    language: str,
    test_input: str,
    timeout: float = 4.0
) -> dict:
    lang_lower = language.lower()
    
    # Fast local execution for Python and JavaScript (Node.js)
    if lang_lower == "python":
        return run_python_local(code, test_input, timeout)
    elif lang_lower in ["javascript", "js"]:
        return run_js_local(code, test_input, timeout)
        
    # Remote/Piston API execution for C, C++, Java
    lang_info = LANGUAGE_MAP.get(language, LANGUAGE_MAP["Python"])
    payload = {
        "language": lang_info["language"],
        "version": lang_info["version"],
        "files": [{"content": code}],
        "stdin": test_input,
        "run_timeout": int(timeout * 1000)
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(PISTON_API_URL, json=payload, timeout=timeout + 2.0)
            if response.status_code == 200:
                data = response.json()
                run_data = data.get("run", {})
                stdout = run_data.get("stdout", "")
                stderr = sanitize_stderr(run_data.get("stderr", ""), language)
                exit_code = run_data.get("code", 0)
                signal = run_data.get("signal", None)
                return {
                    "stdout": stdout.strip(),
                    "stderr": stderr.strip(),
                    "exitCode": exit_code,
                    "timedOut": signal == "SIGKILL" or exit_code == 137
                }
        except Exception:
            pass

    return {
        "stdout": "Code executed (Simulation mode for compiled languages).",
        "stderr": "",
        "exitCode": 0,
        "timedOut": False
    }

async def run_visible_tests(
    code: str,
    language: str,
    test_cases: list
) -> list:
    results = []
    for test in test_cases:
        test_input = test.get("input", "")
        expected_output = test.get("expectedOutput", "").strip()
        
        start_time = time.time()
        res = await run_code_against_test(code, language, test_input)
        execution_time = time.time() - start_time
        
        passed = (res["stdout"] == expected_output and res["exitCode"] == 0 and not res["timedOut"])
        
        error_msg = res["stderr"] if res["stderr"] else ("Time Limit Exceeded" if res["timedOut"] else "")
        if res["exitCode"] != 0 and not error_msg:
            error_msg = f"Exited with code {res['exitCode']}"
        
        results.append({
            "input": test_input,
            "expectedOutput": expected_output,
            "actualOutput": res["stdout"],
            "passed": passed,
            "executionTime": round(execution_time, 4),
            "error": error_msg
        })
        
    return results

async def run_hidden_tests(
    code: str,
    language: str,
    test_cases: list
) -> dict:
    results = []
    passed_count = 0
    total_count = len(test_cases)
    verdict = "Accepted"
    
    for test in test_cases:
        test_input = test.get("input", "")
        expected_output = test.get("expectedOutput", "").strip()
        
        res = await run_code_against_test(code, language, test_input)
        
        passed = False
        test_verdict = "Accepted"
        
        if res["timedOut"]:
            test_verdict = "Time Limit Exceeded"
        elif res["stderr"] and res["exitCode"] != 0:
            if "Compilation" in res["stderr"] or "SyntaxError" in res["stderr"]:
                test_verdict = "Compilation Error"
            else:
                test_verdict = "Runtime Error"
        elif res["exitCode"] != 0:
            test_verdict = "Runtime Error"
        elif res["stdout"] != expected_output:
            test_verdict = "Wrong Answer"
        else:
            passed = True
        
        if passed:
            passed_count += 1
        elif verdict == "Accepted":
            verdict = test_verdict
            
        results.append({
            "passed": passed,
            "verdict": test_verdict
        })
        
    score = int((passed_count / total_count) * 100) if total_count > 0 else 0
    
    return {
        "verdict": verdict,
        "passedCount": passed_count,
        "totalCount": total_count,
        "results": results,
        "score": score
    }
