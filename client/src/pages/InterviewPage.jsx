/**
 * InterviewPage.jsx
 *
 * Main page — orchestrates:
 *  - Setup screen (role + level selection)
 *  - Active interview (state machine via useInterviewFlow)
 *  - Final completion screen
 *
 * Voice flow:
 *  LISTENING → user speaks → SpeechRecognition shows live text
 *           → user clicks Submit (or VAD fires after 1.5s silence)
 *           → stopRecording + Whisper transcription → submitTranscript
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioRecorder }            from '../hooks/useAudioRecorder';
import { useInterviewFlow, STATES }    from '../hooks/useInterviewFlow';
import { useLiveTranscript }           from '../hooks/useLiveTranscript';
import { transcribeAudio }             from '../services/api';
import { finalTranscriptCleanup }      from '../utils/textProcessing';
import InterviewLayout                 from '../components/InterviewLayout';

// ── SmithLogo ──────────────────────────────────────────────────────────────
function SmithLogo({ size = 24 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="rgba(79, 110, 247, 0.08)"
        />
        <path
          d="M9 8.5C9 7.67 9.67 7 10.5 7H13.5C14.33 7 15 7.67 15 8.5V10.25C15 11.08 14.33 11.75 13.5 11.75H10.5C9.67 11.75 9 12.42 9 13.25V15C9 15.83 9.67 16.5 10.5 16.5H13.5C14.33 16.5 15 15.83 15 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ── Setup Screen ───────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('smith_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!profile) {
      setProfile({
        name: 'Rahul Sharma',
        role: 'Software Engineer',
        level: 'Fresher',
        language: 'English',
        difficulty: 'Beginner',
        voiceEnabled: true,
        speechSpeed: 'Normal',
      });
    }
  }, [profile]);

  return (
    <div className="setup-screen">
      <div className="setup-screen__inner">
        <div className="setup-header">
          <div className="setup-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SmithLogo size={28} />
            <span className="setup-logo__text">Smith</span>
          </div>
          <p className="setup-subtitle" style={{ marginTop: '6px' }}>AI Technical Interviewer · Enterprise Platform</p>
        </div>

        <div className="setup-card">
          {profile && (
            <div className="setup-field" style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Interview Settings</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div><strong>Role:</strong> {profile.role}</div>
                <div><strong>Level:</strong> {profile.level}</div>
                <div><strong>Language:</strong> {profile.language}</div>
                <div><strong>Difficulty:</strong> {profile.difficulty}</div>
                <div><strong>Voice:</strong> {profile.voiceEnabled ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          )}

          <button
            onClick={() => profile && onStart({ ...profile, interviewType: 'Introduction' })}
            disabled={!profile}
            className="setup-start-btn"
          >
            Start Interview
          </button>
        </div>

        <div className="setup-badge">
          <div className="setup-badge__avatar">S</div>
          Interviewer: <strong style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>Smith AI</strong>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function InterviewPage({ onComplete }) {
  const [role,          setRole]          = useState('');
  const [level,         setLevel]         = useState('');
  const [language,      setLanguage]      = useState('');
  const [difficulty,    setDifficulty]    = useState('');
  const [resumeContext, setResumeContext] = useState(null);
  const [screen,        setScreen]        = useState('setup');

  // Guard: prevent duplicate concurrent submissions
  const isSubmittingRef = useRef(false);

  const {
    startRecording,
    stopRecording,
    cleanup: cleanupRecorder,
    isSpeaking,
  } = useAudioRecorder(); // No VAD callback — submission is button-only

  const {
    interviewState,
    displayText,
    candidateText,
    feedback,
    questionCount,
    maxQuestions,
    analysis,
    qaEvaluations,
    codingSubmissions,
    error,
    setError,
    chatMessages,
    beginInterview,
    submitTranscript,
    endInterview,
    reset,
    transitionTo,
    updateCandidateLiveText,
    finalizeCandidateMessage,
    history,
    handleCodeSubmitted,
    interviewType,
    currentInterviewRound,
  } = useInterviewFlow({
    role,
    level,
    language,
    difficulty,
    resumeContext,
    onStateChange: useCallback(() => {}, []),
  });

  const {
    liveText: liveTranscriptText,
    startLiveTranscript,
    stopLiveTranscript,
    clearLiveText,
  } = useLiveTranscript(useCallback((err) => setError(err), [setError]));

  // ── Start recording + live transcript whenever LISTENING state begins ──
  useEffect(() => {
    if (interviewState !== STATES.LISTENING) return;

    isSubmittingRef.current = false;
    clearLiveText();

    startRecording()
      .then(() => {
        startLiveTranscript();
      })
      .catch((err) => {
        console.error('[InterviewPage] Microphone access failed:', err);
        setError('Microphone access is required. Please allow access and try again.');
        transitionTo(STATES.IDLE);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewState]); // only re-run when the state changes

  // ── Push live transcript into the candidate chat bubble ──────────────────
  useEffect(() => {
    if (interviewState === STATES.LISTENING && liveTranscriptText) {
      updateCandidateLiveText(liveTranscriptText);
    }
  }, [liveTranscriptText, interviewState, updateCandidateLiveText]);

  // ── Core submit handler — ONLY called when user clicks Submit Answer ────
  /**
   * Stops recording + live transcript, sends audio to Whisper, then submits.
   * This is the ONLY code path that triggers AI submission.
   * VAD / silence detection does NOT call this function.
   */
  const handleDoneSpeaking = useCallback(async () => {
    if (interviewState !== STATES.LISTENING) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // 1. Stop BOTH channels immediately — do this synchronously before any await
    const capturedLiveText = stopLiveTranscript(); // returns current text via ref (not stale)
    transitionTo(STATES.TRANSCRIBING);

    try {
      // 2. Stop the MediaRecorder and collect the blob
      const audioBlob = await stopRecording({ disableVAD: true });
      let transcriptText = '';

      // 3. Whisper transcription (primary, most accurate)
      if (audioBlob && audioBlob.size > 500) {
        try {
          transcriptText = await transcribeAudio(audioBlob, language || 'English');
        } catch (whisperErr) {
          console.warn('[InterviewPage] Whisper failed, using SpeechRecognition fallback:', whisperErr.message);
        }
      }

      // 4. Fallback to SpeechRecognition live text
      if (!transcriptText || transcriptText.trim().length === 0) {
        transcriptText = capturedLiveText || '';
      }

      // 5. Cleanup & normalization
      transcriptText = finalTranscriptCleanup(transcriptText);

      if (!transcriptText || transcriptText.trim().length === 0) {
        console.warn('[InterviewPage] No transcript captured. Returning to LISTENING.');
        clearLiveText();
        transitionTo(STATES.LISTENING);
        isSubmittingRef.current = false;
        return;
      }

      // 6. Submit to AI
      await submitTranscript(transcriptText);
    } catch (err) {
      console.error('[InterviewPage] Transcription/submission error:', err);
      clearLiveText();
      transitionTo(STATES.LISTENING);
    } finally {
      isSubmittingRef.current = false;
    }
  }, [
    interviewState,
    language,
    stopRecording,
    stopLiveTranscript,
    clearLiveText,
    submitTranscript,
    transitionTo,
  ]);

  // Keep no VAD ref — handleDoneSpeaking is only called from the Submit button

  // ── Other handlers ─────────────────────────────────────────────────────
  const handleStart = useCallback(async (config) => {
    setRole(config.role);
    setLevel(config.level);
    setLanguage(config.language);
    setDifficulty(config.difficulty);
    setResumeContext(config.resumeContext ?? null);
    setScreen('interview');
    try {
      await beginInterview(config);
    } catch (err) {
      console.error('[InterviewPage] Failed to begin interview:', err);
    }
  }, [beginInterview]);

  const handleEnd = useCallback(async () => {
    stopLiveTranscript();
    cleanupRecorder();
    await endInterview();
    setScreen('done');
  }, [cleanupRecorder, endInterview, stopLiveTranscript]);

  // Auto-transition to done screen when the state machine completes
  useEffect(() => {
    if (interviewState === STATES.INTERVIEW_COMPLETE && screen === 'interview') {
      stopLiveTranscript();
      cleanupRecorder();
      setScreen('done');
    }
  }, [interviewState, screen, cleanupRecorder, stopLiveTranscript]);

  const handleRestart = useCallback(() => {
    stopLiveTranscript();
    cleanupRecorder();
    reset();
    setResumeContext(null);
    setScreen('setup');
  }, [cleanupRecorder, reset, stopLiveTranscript]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header__left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SmithLogo size={20} />
          <span className="app-header__title">Smith</span>
          <span className="app-header__subtitle">AI Interviewer</span>
        </div>
        {screen === 'interview' && (
          <div className="app-header__status">
            <div className={`status-dot ${
              interviewState === STATES.LISTENING      ? 'status-dot--listening' :
              interviewState === STATES.SMITH_SPEAKING ? 'status-dot--speaking'  :
              'status-dot--idle'
            }`} />
            <span className="app-header__state">{getStateLabel(interviewState)}</span>
          </div>
        )}
        {screen === 'setup' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            Ready to interview
          </div>
        )}
      </header>

      <main className="app-main">
        {screen === 'setup' && (
          <SetupScreen onStart={handleStart} />
        )}

        {screen === 'interview' && (
          <div className="interview-container">
            {error && (
              <div className="error-banner">{error}</div>
            )}

            <InterviewLayout
              interviewState={interviewState}
              displayText={displayText}
              candidateText={candidateText}
              feedback={feedback}
              questionCount={questionCount}
              maxQuestions={maxQuestions}
              role={role}
              level={level}
              difficulty={difficulty}
              interviewType={interviewType}
              onEndInterview={handleEnd}
              onDoneSpeaking={handleDoneSpeaking}
              chatMessages={chatMessages}
              liveTranscriptText={liveTranscriptText}
              history={history}
              resumeContext={resumeContext}
              onCodeSubmitted={handleCodeSubmitted}
              language={language}
              currentInterviewRound={currentInterviewRound}
              isUserSpeaking={isSpeaking}
            />
          </div>
        )}

        {screen === 'done' && (
          <div className="feedback-view-completed" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
            <div className="feedback-card" style={{ maxWidth: '580px', width: '100%', textAlign: 'center', padding: '48px', border: '1px solid var(--border-subtle)' }}>
              <div className="feedback-card__status" style={{ marginBottom: '24px' }}>
                <div className="success-badge" style={{ display: 'inline-flex', padding: '10px 24px', borderRadius: '99px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                  INTERVIEW COMPLETED
                </div>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>Thank you for completing the interview.</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1rem', marginBottom: '32px' }}>
                I have finished analyzing your performance. Click below to view your dashboard.
              </p>

              <button
                className="view-report-btn"
                style={{ width: '100%', padding: '16px 28px', background: 'var(--accent)', color: '#fff', fontSize: '1.05rem', fontWeight: '700', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}
                onClick={() => onComplete?.({
                  role,
                  level,
                  questionCount,
                  analysis,
                  qaEvaluations,
                  codingSubmissions,
                })}
              >
                View Dashboard
              </button>

              <button
                className="restart-btn"
                style={{ width: '100%', marginTop: '16px', padding: '14px 28px', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600', borderRadius: '12px', border: '1px solid var(--border-medium)', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={handleRestart}
              >
                Start New Session
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getStateLabel(state) {
  switch (state) {
    case STATES.IDLE:                return 'Ready';
    case STATES.THINKING:            return 'Smith is thinking...';
    case STATES.SMITH_SPEAKING:      return 'Smith is speaking...';
    case STATES.ROUND_SELECTION:     return 'Round Selection';
    case STATES.LISTENING:           return 'Listening...';
    case STATES.TRANSCRIBING:        return 'Transcribing...';
    case STATES.GENERATING_RESPONSE: return 'Generating response...';
    case STATES.INTERVIEW_COMPLETE:  return 'Interview complete';
    default:                         return 'Standby';
  }
}
