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

async def run_python_local(code: str, test_input: str, timeout: float = 3.0) -> dict:
    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, "-c", code,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout_bytes, stderr_bytes = await asyncio.wait_for(
            proc.communicate(input=test_input.encode("utf-8") if test_input else None),
            timeout=timeout
        )
        return {
            "stdout": stdout_bytes.decode("utf-8", errors="replace").strip(),
            "stderr": stderr_bytes.decode("utf-8", errors="replace").strip(),
            "exitCode": proc.returncode,
            "timedOut": False
        }
    except asyncio.TimeoutError:
        try: proc.kill()
        except Exception: pass
        return {"stdout": "", "stderr": "Execution timed out.", "exitCode": 137, "timedOut": True}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "exitCode": -1, "timedOut": False}

async def run_js_local(code: str, test_input: str, timeout: float = 3.0) -> dict:
    try:
        proc = await asyncio.create_subprocess_exec(
            "node", "-e", code,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout_bytes, stderr_bytes = await asyncio.wait_for(
            proc.communicate(input=test_input.encode("utf-8") if test_input else None),
            timeout=timeout
        )
        return {
            "stdout": stdout_bytes.decode("utf-8", errors="replace").strip(),
            "stderr": stderr_bytes.decode("utf-8", errors="replace").strip(),
            "exitCode": proc.returncode,
            "timedOut": False
        }
    except asyncio.TimeoutError:
        try: proc.kill()
        except Exception: pass
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
        return await run_python_local(code, test_input, timeout)
    elif lang_lower in ["javascript", "js"]:
        return await run_js_local(code, test_input, timeout)
        
WANDBOX_API_URL = "https://wandbox.org/api/compile.json"
WANDBOX_COMPILERS = {
    "c++": "gcc-head",
    "cpp": "gcc-head",
    "c": "gcc-head-c",
    "java": "openjdk-jdk-22+36",
    "python": "cpython-head",
    "javascript": "nodejs-20.17.0"
}

async def run_wandbox(code: str, language: str, test_input: str, timeout: float = 6.0) -> dict:
    lang_key = language.lower()
    compiler = WANDBOX_COMPILERS.get(lang_key, "gcc-head")
    
    clean_code = code
    if lang_key == "java":
        import re
        clean_code = re.sub(r'public\s+class\s+([A-Za-z0-9_]+)', r'class \1', clean_code)

    payload = {
        "code": clean_code,
        "compiler": compiler,
        "stdin": test_input or ""
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(WANDBOX_API_URL, json=payload, timeout=timeout + 3.0)
            if response.status_code == 200:
                data = response.json()
                stdout = (data.get("program_output") or "").strip()
                stderr = (data.get("compiler_error") or data.get("program_error") or "").strip()
                status_str = str(data.get("status", "0"))
                exit_code = int(status_str) if status_str.isdigit() else (1 if stderr and not stdout else 0)
                return {
                    "stdout": stdout,
                    "stderr": stderr,
                    "exitCode": exit_code,
                    "timedOut": "timed out" in stderr.lower() or exit_code == 124
                }
        except httpx.TimeoutException:
            return {"stdout": "", "stderr": "Time Limit Exceeded (Execution timed out).", "exitCode": 124, "timedOut": True}
        except Exception as e:
            return {"stdout": "", "stderr": f"Compiler error: {str(e)}", "exitCode": 1, "timedOut": False}

    return {"stdout": "", "stderr": "Compiler service unavailable.", "exitCode": 1, "timedOut": False}

async def run_code_against_test(
    code: str,
    language: str,
    test_input: str,
    timeout: float = 4.0
) -> dict:
    lang_lower = language.lower()
    
    # Fast local execution for Python and JavaScript (Node.js)
    if lang_lower == "python":
        local_py = await run_python_local(code, test_input, timeout)
        if local_py.get("exitCode") == 0 or local_py.get("stderr"):
            return local_py
    elif lang_lower in ["javascript", "js"]:
        local_js = await run_js_local(code, test_input, timeout)
        if local_js.get("exitCode") == 0 or local_js.get("stderr"):
            return local_js
        
    # Remote real sandboxed compiler for C, C++, Java, or fallback
    return await run_wandbox(code, language, test_input, timeout)

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
