import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioRecorder }            from '../hooks/useAudioRecorder';
import { useInterviewFlow, STATES }    from '../hooks/useInterviewFlow';
import { useLiveTranscript }           from '../hooks/useLiveTranscript';
import { transcribeAudio }             from '../services/api';
import { finalTranscriptCleanup }      from '../utils/textProcessing';
import InterviewLayout                 from '../components/InterviewLayout';
import SmithLogo, { CipherFluxBadge } from '../components/SmithLogo';


// ── Setup Screen ───────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [profile] = useState(() => {
    try {
      const saved = localStorage.getItem('smith_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      name: 'Alex Morgan',
      role: 'Software Engineer',
      level: 'Fresher',
      language: 'English',
      difficulty: 'Beginner',
      voiceEnabled: true,
      speechSpeed: 'Normal',
    };
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-primary)' }}>
      <div className="macos-window apple-modal-animate" style={{ maxWidth: '600px', width: '100%' }}>
        {/* macOS Window Titlebar */}
        <div className="macos-titlebar">
          <div className="macos-traffic-lights">
            <span className="macos-traffic-dot macos-traffic-dot--red" />
            <span className="macos-traffic-dot macos-traffic-dot--yellow" />
            <span className="macos-traffic-dot macos-traffic-dot--green" />
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Smith AI — Interview Session Launcher
          </div>
          <div style={{ width: '52px' }} />
        </div>

        <div style={{ padding: '36px 40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <SmithLogo size={42} showText={true} showBadge={true} />
            <div style={{ marginTop: '4px' }}>
              <CipherFluxBadge />
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' }}>
            Enterprise AI Technical Interviewer Platform
          </p>

          {profile && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: '16px', padding: '24px', textAlign: 'left', marginBottom: '28px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.5px', marginBottom: '14px' }}>
                Interview Configuration
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.92rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Target Role:</span> <strong style={{ color: 'var(--text-primary)' }}>{profile.role}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Experience:</span> <strong style={{ color: 'var(--text-primary)' }}>{profile.level}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Language:</span> <strong style={{ color: 'var(--text-primary)' }}>{profile.language || 'English'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Difficulty:</span> <strong style={{ color: 'var(--text-primary)' }}>{profile.difficulty}</strong></div>
              </div>
            </div>
          )}

          <button
            onClick={() => profile && onStart({ ...profile, interviewType: 'Introduction' })}
            disabled={!profile}
            style={{
              width: '100%',
              padding: '14px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
              transition: 'transform 0.18s ease'
            }}
          >
            Start AI Mock Interview
          </button>
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

  const isSubmittingRef = useRef(false);

  const {
    startRecording,
    stopRecording,
    cleanup: cleanupRecorder,
    isSpeaking,
  } = useAudioRecorder();

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
    transitionTo,
    updateCandidateLiveText,
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
  }, [interviewState, clearLiveText, setError, startLiveTranscript, startRecording, transitionTo]);

  useEffect(() => {
    if (interviewState === STATES.LISTENING && liveTranscriptText) {
      updateCandidateLiveText(liveTranscriptText);
    }
  }, [liveTranscriptText, interviewState, updateCandidateLiveText]);

  const handleDoneSpeaking = useCallback(async (manualText = '') => {
    if (interviewState !== STATES.LISTENING) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const capturedLiveText = stopLiveTranscript();
    transitionTo(STATES.TRANSCRIBING);

    try {
      let transcriptText = typeof manualText === 'string' ? manualText.trim() : '';

      if (!transcriptText) {
        if (capturedLiveText && capturedLiveText.trim().length > 0) {
          transcriptText = capturedLiveText.trim();
          stopRecording({ disableVAD: true }).catch(() => {});
        } else {
          const audioBlob = await stopRecording({ disableVAD: true });
          if (audioBlob && audioBlob.size > 500) {
            try {
              transcriptText = await transcribeAudio(audioBlob, language || 'English');
            } catch (whisperErr) {
              console.warn('[InterviewPage] Whisper failed:', whisperErr.message);
            }
          }
        }
      }

      transcriptText = finalTranscriptCleanup(transcriptText);

      if (!transcriptText || transcriptText.trim().length === 0) {
        console.warn('[InterviewPage] No transcript captured. Prompting user.');
        setError('No speech or text detected. Please speak into your microphone or type your answer below.');
        clearLiveText();
        transitionTo(STATES.LISTENING);
        isSubmittingRef.current = false;
        return;
      }

      setError(null);
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
    stopLiveTranscript,
    transitionTo,
    stopRecording,
    language,
    submitTranscript,
    clearLiveText,
    setError,
  ]);

  const handleStart = useCallback((config) => {
    setRole(config.role);
    setLevel(config.level);
    setLanguage(config.language || 'English');
    setDifficulty(config.difficulty || 'Beginner');
    setResumeContext(config.resumeContext || null);
    setScreen('interview');
    beginInterview(config);
  }, [beginInterview]);

  const handleEndInterview = useCallback(() => {
    cleanupRecorder();
    stopLiveTranscript();
    endInterview();
  }, [cleanupRecorder, stopLiveTranscript, endInterview]);

  useEffect(() => {
    if (interviewState === STATES.INTERVIEW_COMPLETE && analysis) {
      cleanupRecorder();
      stopLiveTranscript();
      onComplete({
        role,
        level,
        analysis,
        qaEvaluations,
        codingSubmissions,
      });
    }
  }, [
    interviewState,
    analysis,
    role,
    level,
    qaEvaluations,
    codingSubmissions,
    onComplete,
    cleanupRecorder,
    stopLiveTranscript,
  ]);

  if (screen === 'setup') {
    return <SetupScreen onStart={handleStart} />;
  }

  return (
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
      currentInterviewRound={currentInterviewRound}
      onEndInterview={handleEndInterview}
      onDoneSpeaking={handleDoneSpeaking}
      chatMessages={chatMessages}
      liveTranscriptText={liveTranscriptText}
      history={history}
      resumeContext={resumeContext}
      onCodeSubmitted={handleCodeSubmitted}
      language={language}
      isUserSpeaking={isSpeaking}
      error={error}
    />
  );
}
