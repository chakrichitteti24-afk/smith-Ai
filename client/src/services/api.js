/**
 * api.js — All HTTP calls to the Smith AI backend.
 *
 * Base URL auto-detects dev vs production.
 * Each request includes a unique reqId for server-side traceability.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Generate a short unique request ID
let _reqCounter = 0;
function generateReqId() {
  _reqCounter = (_reqCounter + 1) % 10000;
  const ts = Date.now().toString(36).slice(-4);
  return `cli-${ts}-${String(_reqCounter).padStart(4, '0')}`;
}

/**
 * Make an HTTP request to the backend.
 * @param {'GET'|'POST'} method
 * @param {string} path - URL path (e.g. '/api/interview/start')
 * @param {object|null} body - JSON body (POST only)
 * @returns {Promise<object>} Parsed JSON response
 */
async function request(method, path, body = null) {
  const reqId = generateReqId();

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': reqId,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, opts);
  } catch (networkErr) {
    const err = new Error(`Network error: unable to reach server`);
    err.cause = networkErr;
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Invalid response from server (HTTP ${res.status})`);
  }

  if (!res.ok) {
    const msg = data?.error?.message || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.reqId = data?.error?.reqId;
    throw err;
  }

  return data;
}

/** Transcribe audio via Groq Whisper Large v3 */
export async function transcribeAudio(audioBlob, language = 'English') {
  const reqId = generateReqId();
  const formData = new FormData();
  let ext = '.webm';
  if (audioBlob.type) {
    if (audioBlob.type.includes('mp4')) ext = '.mp4';
    else if (audioBlob.type.includes('ogg')) ext = '.ogg';
    else if (audioBlob.type.includes('wav')) ext = '.wav';
  }
  formData.append('audio', audioBlob, `recording${ext}`);
  formData.append('language', language);

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/interview/transcribe`, {
      method: 'POST',
      headers: { 'X-Request-Id': reqId },
      body: formData,
    });
  } catch (networkErr) {
    const err = new Error('Network error: unable to reach server');
    err.cause = networkErr;
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Invalid response from server (HTTP ${res.status})`);
  }

  if (!res.ok) {
    const msg = data?.error?.message || `Transcription failed: ${res.status}`;
    throw new Error(msg);
  }

  return data.transcript || '';
}

/** Upload resume (PDF or DOCX) to get parsed resumeContext */
export async function uploadResume(file) {
  const reqId = generateReqId();
  const formData = new FormData();
  formData.append('resume', file);

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/interview/resume`, {
      method: 'POST',
      headers: { 'X-Request-Id': reqId },
      body: formData,
    });
  } catch (networkErr) {
    const err = new Error('Network error: unable to reach server');
    err.cause = networkErr;
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Invalid response from server (HTTP ${res.status})`);
  }

  if (!res.ok) {
    const msg = data?.error?.message || `Resume parsing failed: ${res.status}`;
    throw new Error(msg);
  }

  return data.data; // Return parsed resume context
}

/** Begin an interview session */
export async function startInterview({ role, level, resumeContext, interviewType }) {
  return request('POST', '/api/interview/start', { role, level, resumeContext, interviewType });
}

/** Submit an answer — returns { feedback, question, fullResponse, cleanedTranscript } */
export async function submitAnswer({ role, level, rawTranscript, history, resumeContext, interviewType }) {
  return request('POST', '/api/interview/respond', { role, level, rawTranscript, history, resumeContext, interviewType });
}

/** Finish the interview — returns { analysis } */
export async function finishInterview({ role, level, history, resumeContext, interviewType }) {
  return request('POST', '/api/interview/finish', { role, level, history, resumeContext, interviewType });
}

/** Health check */
export async function healthCheck() {
  return request('GET', '/health');
}

/** Execute code in sandbox simulation */
export async function runCode({ code, language, input }) {
  return request('POST', '/api/interview/run-code', { code, language, input });
}

/** Submit and evaluate code */
export async function submitCode({ code, language, questionText, role, level, history, resumeContext, interviewType }) {
  return request('POST', '/api/interview/submit-code', {
    code,
    language,
    questionText,
    role,
    level,
    history,
    resumeContext,
    interviewType,
  });
}
