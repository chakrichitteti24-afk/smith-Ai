/**
 * client/src/services/api.js — All HTTP & streaming calls to the Smith AI backend.
 *
 * Automatically works with Vite proxy in development (relative /api path)
 * or VITE_API_URL if explicitly defined.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

let _reqCounter = 0;
function generateReqId() {
  _reqCounter = (_reqCounter + 1) % 10000;
  const ts = Date.now().toString(36).slice(-4);
  return `cli-${ts}-${String(_reqCounter).padStart(4, '0')}`;
}

/**
 * Make a JSON HTTP request to the backend.
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
      await new Promise(r => setTimeout(r, 800));
      return request(method, path, body, retries - 1);
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
      await new Promise(r => setTimeout(r, 800));
      return request(method, path, body, retries - 1);
    }
    throw new Error(`Invalid response from server (HTTP ${res.status})`);
  }

  if (!res.ok) {
    if (res.status >= 500 && retries > 0) {
      await new Promise(r => setTimeout(r, 800));
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

/**
 * Transcribe audio via Groq Whisper Large v3
 */
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
    const err = new Error('Network error: unable to reach transcription server');
    err.cause = networkErr;
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Invalid transcription response (HTTP ${res.status})`);
  }

  if (!res.ok) {
    const msg = data?.error?.message || `Transcription failed: ${res.status}`;
    throw new Error(msg);
  }

  return data.transcript || '';
}

/**
 * Upload resume (PDF or DOCX) to get parsed resume context & ATS analytics
 */
export async function uploadResume(file, profile = {}, onProgress = null) {
  const reqId = generateReqId();
  const formData = new FormData();
  formData.append('resume', file);
  if (profile.role) formData.append('role', profile.role);
  if (profile.level) formData.append('level', profile.level);

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

  // Handle streaming NDJSON response
  const contentType = res.headers.get('Content-Type') || '';
  if (contentType.includes('application/x-ndjson')) {
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

    throw new Error('Connection closed before parsing completed.');
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

  return data.data;
}

/** Begin an interview session */
export async function startInterview({
  name = 'Candidate',
  role = 'Software Engineer',
  level = 'Mid-Level',
  language = 'English',
  difficulty = 'Medium',
  resumeContext = null,
  interviewType = 'general',
} = {}) {
  return request('POST', '/api/interview/start', {
    name,
    role,
    level,
    language,
    difficulty,
    resumeContext,
    interviewType,
  });
}

/** Submit an answer — returns { ok, feedback, question, fullResponse, cleanedTranscript } */
export async function submitAnswer({
  role = 'Software Engineer',
  level = 'Mid-Level',
  language = 'English',
  difficulty = 'Medium',
  rawTranscript,
  history = [],
  resumeContext = null,
  interviewType = 'general',
}) {
  return request('POST', '/api/interview/respond', {
    role,
    level,
    language,
    difficulty,
    rawTranscript,
    history,
    resumeContext,
    interviewType,
  });
}

/** Submit an answer with SSE streaming tokens */
export async function submitAnswerStream({
  role = 'Software Engineer',
  level = 'Mid-Level',
  language = 'English',
  difficulty = 'Medium',
  rawTranscript,
  history = [],
  resumeContext = null,
  interviewType = 'general',
}, onChunk, onMetadata, onDone) {
  const reqId = generateReqId();
  const body = JSON.stringify({
    role,
    level,
    language,
    difficulty,
    rawTranscript,
    history,
    resumeContext,
    interviewType,
  });

  const res = await fetch(`${BASE_URL}/api/interview/respond-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': reqId,
    },
    body,
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
        if (eventName === 'metadata' && onMetadata) onMetadata(data);
        else if (eventName === 'chunk' && onChunk) onChunk(data.text);
        else if (eventName === 'done' && onDone) onDone(data);
      }

      boundary = buffer.indexOf('\n\n');
    }
  }
}

/** Finish the interview session */
export async function finishInterview({
  role = 'Software Engineer',
  level = 'Mid-Level',
  language = 'English',
  difficulty = 'Medium',
  history = [],
  resumeContext = null,
  interviewType = 'general',
}) {
  return request('POST', '/api/interview/finish', {
    role,
    level,
    language,
    difficulty,
    history,
    resumeContext,
    interviewType,
  });
}

/** Execute code in sandbox during interview */
export async function runInterviewCode({ code, language = 'Python', input = '' }) {
  return request('POST', '/api/interview/run-code', { code, language, input });
}

/** Submit code solution to Smith during interview */
export async function submitInterviewCode({
  code,
  language = 'Python',
  spokenLanguage = 'English',
  questionText = 'Coding Assessment Problem',
  role = 'Software Engineer',
  level = 'Mid-Level',
  difficulty = 'Medium',
  history = [],
  resumeContext = null,
  interviewType = 'Coding Round',
}) {
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

/** Health check */
export async function healthCheck() {
  return request('GET', '/health');
}

/** Fetch coding questions from Neon DB */
export async function fetchPracticeQuestions({
  difficulty = 'Beginner',
  category = 'All',
  page = 1,
  limit = 20,
} = {}) {
  const params = new URLSearchParams({ difficulty, category, page, limit });
  return request('GET', `/api/practice/questions?${params}`);
}

/** Fetch question detail by ID */
export async function fetchPracticeQuestionById(questionId) {
  return request('GET', `/api/practice/questions/${questionId}`);
}

/** Fetch practice stats */
export async function fetchPracticeStats({ sessionId = '' } = {}) {
  const params = new URLSearchParams({ session_id: sessionId });
  return request('GET', `/api/practice/stats?${params}`);
}

/** Run practice code against visible test cases */
export async function runPracticeCode({ questionId, code, language, sessionId = 'user-session' }) {
  return request('POST', '/api/practice/run', { questionId, code, language, sessionId });
}

/** Submit practice code against all test cases */
export async function submitPracticeCode({ questionId, code, language, sessionId = 'user-session' }) {
  return request('POST', '/api/practice/submit', { questionId, code, language, sessionId });
}
