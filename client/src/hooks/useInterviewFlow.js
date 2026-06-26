/**
 * useInterviewFlow.js
 *
 * RESPONSIBILITY: Orchestrate the full interview lifecycle with a strict state machine.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { startInterview, submitAnswer, finishInterview } from '../services/api';

export const STATES = {
  IDLE:                'IDLE',
  THINKING:            'THINKING',
  SMITH_SPEAKING:      'SMITH_SPEAKING',
  ROUND_SELECTION:     'ROUND_SELECTION',
  LISTENING:           'LISTENING',
  TRANSCRIBING:        'TRANSCRIBING',
  GENERATING_RESPONSE: 'GENERATING_RESPONSE',
  INTERVIEW_COMPLETE:  'INTERVIEW_COMPLETE',
};

const MAX_QUESTIONS   = 8;
const HISTORY_WINDOW  = 12;

function pushToHistory(prev, role, content) {
  return [...prev.slice(-(HISTORY_WINDOW - 1)), { role, content }];
}

function speakTextAsync(text, onWordBoundary) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !text) {
      resolve();
      return;
    }
    
    // Clear active utterances to prevent memory leaks and cancel ongoing speech
    window.speechSynthesis.cancel();
    window.activeUtterances = window.activeUtterances || [];
    window.activeUtterances = [];

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate   = 0.92;
    utter.pitch  = 0.95;
    utter.volume = 1;

    // Prevent garbage collection in Chrome
    window.activeUtterances.push(utter);

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      /Google US English|Microsoft David|David|Daniel|Alex/i.test(v.name)
    );
    if (preferred) utter.voice = preferred;

    utter.onboundary = (event) => {
      if (event.name === 'word') {
        onWordBoundary?.(event.charIndex, event.charLength);
      }
    };

    let resolved = false;
    const handleEnd = () => {
      if (resolved) return;
      resolved = true;
      const idx = window.activeUtterances.indexOf(utter);
      if (idx > -1) window.activeUtterances.splice(idx, 1);
      resolve();
    };

    // Calculate a safe fallback timeout: ~150 words per minute + 3.5 seconds buffer
    const wordCount = text.split(/\s+/).length;
    const estimatedMs = (wordCount / 2) * 1000 + 3500;
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        console.warn('[speakTextAsync] Fallback timeout fired.');
        window.speechSynthesis.cancel();
        handleEnd();
      }
    }, estimatedMs);

    utter.onend = () => {
      clearTimeout(timeoutId);
      handleEnd();
    };
    utter.onerror = (err) => {
      console.warn('[speakTextAsync] error:', err);
      clearTimeout(timeoutId);
      handleEnd();
    };

    window.speechSynthesis.speak(utter);
  });
}

export function useInterviewFlow({ role, level, language, difficulty, resumeContext, onStateChange }) {
  const [interviewState, setInterviewState] = useState(STATES.IDLE);
  const [aiMessage,      setAIMessage]      = useState('');
  const [displayText,    setDisplayText]    = useState('');
  const [candidateText,  setCandidateText]  = useState('');
  const [feedback,       setFeedback]       = useState('');
  const [transcript,     setTranscript]     = useState('');
  const [history,        setHistory]        = useState([]);
  const [questionCount,  setQuestionCount]  = useState(0);
  const [analysis,       setAnalysis]       = useState('');
  const [qaEvaluations,  setQaEvaluations]  = useState([]);
  const [codingSubmissions, setCodingSubmissions] = useState([]);
  const [error,          setError]          = useState(null);
  const [chatMessages,   setChatMessages]   = useState([]);
  const [selectedRounds, setSelectedRounds] = useState([
    'Introduction', 'Project', 'Technical', 'Coding', 'Behavioral'
  ]);

  const getRoundForCount = useCallback((count) => {
    if (selectedRounds.length === 0) return 'Technical Round';
    const chunkSize = Math.max(1, Math.floor(MAX_QUESTIONS / selectedRounds.length));
    const roundIndex = Math.min(Math.floor(count / chunkSize), selectedRounds.length - 1);
    const selected = selectedRounds[roundIndex];
    return selected.includes('Round') ? selected : `${selected} Round`;
  }, [selectedRounds]);

  const currentRound = getRoundForCount(questionCount);

  const submittingRef    = useRef(false);
  const historyRef       = useRef(history);
  const configRef        = useRef({ role, level, language, difficulty, resumeContext, interviewType: currentRound });
  const stateRef         = useRef(interviewState);
  const wordTimerRef     = useRef(null);
  const timeoutRef       = useRef(null);
  const msgIdCounter     = useRef(0);
  const questionCountRef = useRef(questionCount);

  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { configRef.current = { role, level, language, difficulty, resumeContext, interviewType: currentRound }; }, [role, level, language, difficulty, resumeContext, currentRound]);
  useEffect(() => { questionCountRef.current = questionCount; }, [questionCount]);
  useEffect(() => {
    stateRef.current = interviewState;
    onStateChange?.(interviewState);
  }, [interviewState, onStateChange]);

  useEffect(() => {
    return () => {
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const nextMsgId = useCallback(() => {
    msgIdCounter.current += 1;
    return `msg-${Date.now()}-${msgIdCounter.current}`;
  }, []);

  const addChatMessage = useCallback((sender, fullText) => {
    const id = nextMsgId();
    setChatMessages(prev => [...prev, {
      id,
      sender,
      text: '',
      fullText,
      isComplete: false,
      timestamp: Date.now(),
    }]);
    return id;
  }, [nextMsgId]);

  const updateChatMessageText = useCallback((id, text) => {
    setChatMessages(prev => prev.map(m =>
      m.id === id ? { ...m, text } : m
    ));
  }, []);

  const completeChatMessage = useCallback((id, finalText) => {
    setChatMessages(prev => prev.map(m =>
      m.id === id ? { ...m, text: finalText || m.fullText, isComplete: true } : m
    ));
  }, []);

  const transitionTo = useCallback((newState) => {
    setInterviewState(newState);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  const speakAndWait = useCallback(async (text) => {
    transitionTo(STATES.SMITH_SPEAKING);
    setDisplayText('');

    const msgId = addChatMessage('smith', text);
    const words = text.split(/\s+/).map(w => ({ text: w }));

    const targetWordIndexRef = { current: 0 };
    let revealedCount = 0;
    let hasBoundaryFired = false;
    let lastBoundaryTime = Date.now();

    // 3. Start boundary sync speech
    const speakPromise = speakTextAsync(text, (charIndex) => {
      hasBoundaryFired = true;
      lastBoundaryTime = Date.now();

      // Find spoken word count
      const spokenText = text.substring(0, charIndex);
      const spokenWords = spokenText.split(/\s+/).filter(Boolean).length;
      targetWordIndexRef.current = Math.min(words.length, spokenWords + 1);
    });

    // 4. Start 30ms high-resolution loop for smooth catch-up
    let fallbackWordIdx = 0;
    let lastFallbackTime = Date.now();
    let currentFallbackDelay = 80;

    wordTimerRef.current = setInterval(() => {
      const now = Date.now();
      let nextTarget = targetWordIndexRef.current;

      if (hasBoundaryFired) {
        if (revealedCount >= nextTarget && (now - lastBoundaryTime) > 400) {
          nextTarget = Math.min(words.length, nextTarget + 1);
          targetWordIndexRef.current = nextTarget;
          lastBoundaryTime = now;
        }
      } else {
        if (now - lastFallbackTime > currentFallbackDelay) {
          fallbackWordIdx = Math.min(words.length, fallbackWordIdx + 1);
          nextTarget = Math.max(nextTarget, fallbackWordIdx);
          lastFallbackTime = now;

          if (fallbackWordIdx < words.length) {
            const nextWord = words[fallbackWordIdx];
            const baseDelay = 35;
            const charDelay = 4 * nextWord.text.length;
            const punctuationDelay = /[.,?!;:]/.test(nextWord.text) ? 60 : 0;
            currentFallbackDelay = baseDelay + charDelay + punctuationDelay;
          }
        }
      }

      if (revealedCount < nextTarget) {
        const diff = nextTarget - revealedCount;
        const step = diff > 2 ? Math.ceil(diff / 2) : 1;
        revealedCount += step;
        const currentText = words.slice(0, revealedCount).map(w => w.text).join(' ');
        setDisplayText(currentText);
        updateChatMessageText(msgId, currentText);
      }

      if (revealedCount >= words.length) {
        clearInterval(wordTimerRef.current);
        wordTimerRef.current = null;
      }
    }, 30);

    await speakPromise;

    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }

    setDisplayText(text);
    completeChatMessage(msgId, text);
  }, [transitionTo, addChatMessage, updateChatMessageText, completeChatMessage]);

  const endInterviewAction = useCallback(async () => {
    if (stateRef.current === STATES.INTERVIEW_COMPLETE) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    stopSpeaking();
    transitionTo(STATES.THINKING);

    const cfg = configRef.current;

    try {
      const data = await finishInterview({
        role: cfg.role,
        level: cfg.level,
        language: cfg.language,
        difficulty: cfg.difficulty,
        history: historyRef.current,
        resumeContext: cfg.resumeContext,
        interviewType: cfg.interviewType,
      });
      const finalAnalysis = data.analysis || 'Interview complete.';
      setAnalysis(finalAnalysis);

      const completionMessage = "Thank you for completing the mock interview. I have finished analyzing your responses. Please open the Analysis Report to view your detailed performance insights.";
      
      await speakAndWait(completionMessage);

      transitionTo(STATES.INTERVIEW_COMPLETE);
    } catch (err) {
      setError(err.message);
      transitionTo(STATES.INTERVIEW_COMPLETE);
    }
  }, [stopSpeaking, transitionTo, speakAndWait]);

  const beginInterview = useCallback(async (overrides = {}) => {
    if (stateRef.current !== STATES.IDLE) return;
    setError(null);
    setHistory([]);
    setDisplayText('');
    setCandidateText('');
    setChatMessages([]);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      endInterviewAction();
    }, 20 * 60 * 1000);

    const cfg = { ...configRef.current, ...overrides };
    transitionTo(STATES.THINKING);

    try {
      const data = await startInterview({
        role: cfg.role,
        level: cfg.level,
        language: cfg.language,
        difficulty: cfg.difficulty,
        resumeContext: cfg.resumeContext,
        interviewType: 'Introduction Round',
      });
      const intro = data.intro || "Hello. I'm Smith. Let's get started — walk me through your background.";

      setHistory(prev => pushToHistory(prev, 'assistant', intro));
      setAIMessage(intro);

      await speakAndWait(intro);
      transitionTo(STATES.ROUND_SELECTION);
    } catch (err) {
      setError(err.message);
      transitionTo(STATES.IDLE);
    }
  }, [transitionTo, speakAndWait, endInterviewAction]);

  const candidateMsgIdRef = useRef(null);

  const updateCandidateLiveText = useCallback((liveText) => {
    setCandidateText(liveText);

    if (!candidateMsgIdRef.current) {
      const id = nextMsgId();
      candidateMsgIdRef.current = id;
      setChatMessages(prev => [...prev, {
        id,
        sender: 'candidate',
        text: liveText,
        fullText: liveText,
        isComplete: false,
        timestamp: Date.now(),
      }]);
    } else {
      setChatMessages(prev => prev.map(m =>
        m.id === candidateMsgIdRef.current
          ? { ...m, text: liveText, fullText: liveText }
          : m
      ));
    }
  }, [nextMsgId]);

  const finalizeCandidateMessage = useCallback((whisperText) => {
    let msgId = candidateMsgIdRef.current;
    if (!msgId) {
      msgId = nextMsgId();
      setChatMessages(prev => [...prev, {
        id: msgId,
        sender: 'candidate',
        text: whisperText,
        fullText: whisperText,
        isComplete: true,
        timestamp: Date.now(),
      }]);
    } else {
      setChatMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, text: whisperText, fullText: whisperText, isComplete: true } : m
      ));
    }
    candidateMsgIdRef.current = null;
    setCandidateText(whisperText);
  }, [nextMsgId]);

  const submitTranscript = useCallback(async (rawTranscript) => {
    if (submittingRef.current) return;
    if (stateRef.current === STATES.INTERVIEW_COMPLETE) return;
    if (!rawTranscript?.trim()) {
      transitionTo(STATES.LISTENING);
      return;
    }

    submittingRef.current = true;
    setTranscript(rawTranscript);

    const lastQuestionText = chatMessages.filter(m => m.sender === 'smith').slice(-1)[0]?.fullText || "";

    finalizeCandidateMessage(rawTranscript);
    transitionTo(STATES.GENERATING_RESPONSE);

    const cfg = configRef.current;
    const activeRound = getRoundForCount(questionCount);

    try {
      setHistory(prev => pushToHistory(prev, 'user', rawTranscript));

      const data = await submitAnswer({
        role: cfg.role,
        level: cfg.level,
        language: cfg.language,
        difficulty: cfg.difficulty,
        rawTranscript,
        history: historyRef.current,
        resumeContext: cfg.resumeContext,
        interviewType: activeRound,
      });

      const { feedback: fb, question: q, fullResponse } = data;
      const responseText = fullResponse || q;

      setFeedback(fb || '');

      setQaEvaluations(prev => [
        ...prev,
        {
          question: lastQuestionText,
          response: rawTranscript,
          evaluation: fb || "Acknowledgment and redirection.",
          suggestions: fb ? `Focus on explaining the depth of ${cfg.role} concepts.` : "Elaborate with concrete examples of trade-offs."
        }
      ]);

      setHistory(prev => pushToHistory(prev, 'assistant', responseText));
      setAIMessage(q || responseText);

      await speakAndWait(responseText);

      const newCount = questionCountRef.current + 1;
      setQuestionCount(newCount);

      if (newCount >= MAX_QUESTIONS) {
        submittingRef.current = false;
        await endInterviewAction();
        return;
      }

      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
      candidateMsgIdRef.current = null;
      transitionTo(STATES.LISTENING);
    } catch (err) {
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
      setError(err.message);
      candidateMsgIdRef.current = null;
      transitionTo(STATES.LISTENING);
    } finally {
      submittingRef.current = false;
    }
  }, [transitionTo, speakAndWait, finalizeCandidateMessage, endInterviewAction, chatMessages, questionCount, getRoundForCount]);

  const handleCodeSubmitted = useCallback(async (apiResult) => {
    transitionTo(STATES.GENERATING_RESPONSE);
    const { feedback: fb, question: q, fullResponse } = apiResult;
    const responseText = fullResponse || q;

    const codingQuestion = chatMessages.filter(m => m.sender === 'smith').slice(-1)[0]?.fullText || "";

    if (apiResult.evaluation) {
      setCodingSubmissions(prev => [
        ...prev,
        {
          question: codingQuestion,
          code: apiResult.submittedCode || "",
          language: apiResult.language || "javascript",
          correctness: apiResult.evaluation.correctness || "Completed submission.",
          timeComplexity: apiResult.evaluation.timeComplexity || "Not specified",
          spaceComplexity: apiResult.evaluation.spaceComplexity || "Not specified",
          optimization: apiResult.evaluation.optimization || apiResult.evaluation.feedbackText || "Keep standard clean coding practices."
        }
      ]);
    }

    const customUserMsgId = nextMsgId();
    setChatMessages(prev => [...prev, {
      id: customUserMsgId,
      sender: 'candidate',
      text: '[Submitted code solution]',
      fullText: '[Submitted code solution]',
      isComplete: true,
      timestamp: Date.now(),
    }]);

    setHistory(prev => pushToHistory(prev, 'user', '[Submitted code solution]'));
    setHistory(prev => pushToHistory(prev, 'assistant', responseText));
    setAIMessage(q || responseText);

    await speakAndWait(responseText);

    const newCount = questionCountRef.current + 1;
    setQuestionCount(newCount);

    if (newCount >= MAX_QUESTIONS) {
      await endInterviewAction();
      return;
    }

    candidateMsgIdRef.current = null;
    transitionTo(STATES.LISTENING);
  }, [transitionTo, speakAndWait, endInterviewAction, nextMsgId, chatMessages]);

  const reset = useCallback(() => {
    stopSpeaking();
    if (wordTimerRef.current) clearInterval(wordTimerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    submittingRef.current = false;
    candidateMsgIdRef.current = null;
    setInterviewState(STATES.IDLE);
    setAIMessage('');
    setDisplayText('');
    setCandidateText('');
    setFeedback('');
    setTranscript('');
    setHistory([]);
    setQuestionCount(0);
    setAnalysis('');
    setQaEvaluations([]);
    setCodingSubmissions([]);
    setError(null);
    setChatMessages([]);
  }, [stopSpeaking]);

  const confirmRounds = useCallback((rounds) => {
    setSelectedRounds(rounds);
    transitionTo(STATES.LISTENING);
  }, [transitionTo]);

  return {
    interviewState,
    aiMessage,
    displayText,
    candidateText,
    feedback,
    transcript,
    questionCount,
    maxQuestions: MAX_QUESTIONS,
    analysis,
    qaEvaluations,
    codingSubmissions,
    error,
    history,
    chatMessages,
    selectedRounds,
    beginInterview,
    submitTranscript,
    endInterview: endInterviewAction,
    stopSpeaking,
    reset,
    transitionTo,
    confirmRounds,
    updateCandidateLiveText,
    finalizeCandidateMessage,
    handleCodeSubmitted,
    interviewType: currentRound,
  };
}
