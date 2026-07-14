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
async function request(method, path, body = null, retries = 2) {
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
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return request(method, path, body, retries - 1);
    }
    const err = new Error(`Network error: unable to reach server`);
    err.cause = networkErr;
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    if (res.status >= 500 && retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return request(method, path, body, retries - 1);
    }
    throw new Error(`Invalid response from server (HTTP ${res.status})`);
  }

  if (!res.ok) {
    if (res.status >= 500 && retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return request(method, path, body, retries - 1);
    }
    const msg = data?.error?.message || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.reqId = data?.error?.reqId;
    throw err;
  }

  return data;
}

/** Transcribe audio via Groq Whisper Large v3 */
export async function transcribeAudio(audioBlob, language = 'English', retries = 2) {
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
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return transcribeAudio(audioBlob, language, retries - 1);
    }
    const err = new Error('Network error: unable to reach server');
    err.cause = networkErr;
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    if (res.status >= 500 && retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return transcribeAudio(audioBlob, language, retries - 1);
    }
    throw new Error(`Invalid response from server (HTTP ${res.status})`);
  }

  if (!res.ok) {
    if (res.status >= 500 && retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return transcribeAudio(audioBlob, language, retries - 1);
    }
    const msg = data?.error?.message || `Transcription failed: ${res.status}`;
    throw new Error(msg);
  }

  return data.transcript || '';
}

/** Upload resume (PDF or DOCX) to get parsed resumeContext */
export async function uploadResume(file, profile, onProgress) {
  const reqId = generateReqId();
  const formData = new FormData();
  formData.append('resume', file);
  if (profile) {
    if (profile.role) formData.append('role', profile.role);
    if (profile.level) formData.append('level', profile.level);
  }

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

  if (res.headers.get('Content-Type')?.includes('application/x-ndjson')) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line

      for (const line of lines) {
        if (!line.trim()) continue;
        const msg = JSON.parse(line);
        if (msg.error) throw new Error(msg.error.message || 'Resume parsing failed');
        if (msg.status && onProgress) onProgress(msg.status);
        if (msg.ok) return msg.data;
      }
    }
    
    if (buffer.trim()) {
      const msg = JSON.parse(buffer);
      if (msg.error) throw new Error(msg.error.message || 'Resume parsing failed');
      if (msg.status && onProgress) onProgress(msg.status);
      if (msg.ok) return msg.data;
    }
    
    throw new Error('Connection closed before completion.');
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
export async function startInterview({ name, role, level, language, difficulty, resumeContext, interviewType }) {
  return request('POST', '/api/interview/start', { name, role, level, language, difficulty, resumeContext, interviewType });
}

/** Submit an answer — returns { feedback, question, fullResponse, cleanedTranscript } */
export async function submitAnswer({ role, level, language, difficulty, rawTranscript, history, resumeContext, interviewType }) {
  return request('POST', '/api/interview/respond', { role, level, language, difficulty, rawTranscript, history, resumeContext, interviewType });
}

/** Submit an answer and get a stream of SSE events */
export async function submitAnswerStream({ role, level, language, difficulty, rawTranscript, history, resumeContext, interviewType }, onEvent) {
  const reqId = generateReqId();
  const body = JSON.stringify({ role, level, language, difficulty, rawTranscript, history, resumeContext, interviewType });
  
  const res = await fetch(`${BASE_URL}/api/interview/respond-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': reqId,
    },
    body
  });

  if (!res.ok) {
    throw new Error(`Stream request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    
    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      
      const lines = chunk.split('\n');
      let eventName = 'message';
      let data = null;

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventName = line.substring(7);
        } else if (line.startsWith('data: ')) {
          try {
            data = JSON.parse(line.substring(6));
          } catch (e) {
            console.error('Failed to parse SSE data', e);
          }
        }
      }

      if (data) {
        onEvent(eventName, data);
      }
      boundary = buffer.indexOf('\n\n');
    }
  }
}

/** Finish the interview — returns { analysis } */
export async function finishInterview({ role, level, language, difficulty, history, resumeContext, interviewType }) {
  return request('POST', '/api/interview/finish', { role, level, language, difficulty, history, resumeContext, interviewType });
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
export async function submitCode({ code, language, spokenLanguage, questionText, role, level, difficulty, history, resumeContext, interviewType }) {
  return request('POST', '/api/interview/submit-code', {
    code,
    language,
    spokenLanguage,
    questionText,
    role,
    level,
    difficulty,
    history,
    resumeContext,
    interviewType,
  });
}

/** Fetch a generated coding question for practice */
export async function fetchPracticeQuestion({ difficulty, role, solvedTitles = [] }) {
  return request('POST', '/api/interview/practice-question', { difficulty, role, solvedTitles });
}
