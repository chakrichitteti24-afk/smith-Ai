/**
 * InterviewPage.jsx
 *
 * Main page — handles:
 *  - Setup screen (role + level selection)
 *  - Active interview (state machine orchestration)
 *  - Final completion screen prompting to open report
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioRecorder }   from '../hooks/useAudioRecorder';
import { useInterviewFlow, STATES } from '../hooks/useInterviewFlow';
import { useLiveTranscript }  from '../hooks/useLiveTranscript';
import { transcribeAudio, uploadResume } from '../services/api';
import InterviewLayout        from '../components/InterviewLayout';

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

  const [resumeContext, setResumeContext] = useState(profile?.resumeContext || null);
  const [resumeFile, setResumeFile] = useState(profile?.resumeName ? { name: profile.resumeName } : null);
  const [uploadStatus, setUploadStatus] = useState(profile?.resumeContext ? 'Resume previously analyzed successfully.' : '');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!profile) {
      // Fallback if settings are not loaded properly
      setProfile({
        name: 'Rahul Sharma',
        role: 'Software Engineer',
        level: 'Fresher',
        language: 'English',
        difficulty: 'Beginner',
        voiceEnabled: true,
        speechSpeed: 'Normal'
      });
    }
  }, [profile]);

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('File size must be under 10MB.');
      return;
    }

    setResumeFile(file);
    setIsUploading(true);
    setUploadStatus('Analyzing resume with Gemini AI...');
    try {
      const data = await uploadResume(file);
      setResumeContext(data);
      setUploadStatus('Resume analyzed successfully!');
    } catch (err) {
      console.error(err);
      if (err.message && (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('connect'))) {
        setUploadStatus('Unable to connect to the analysis service.');
      } else {
        setUploadStatus('Resume analysis failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

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

          <div className="setup-field">
            <label className="setup-label">Upload Resume (PDF, DOCX · Optional)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
              Resume upload is optional. Uploading a resume enables more personalized interview questions.
            </p>
            <div className="resume-upload-zone">
              <input
                type="file"
                id="resume-file"
                accept=".pdf,.docx"
                onChange={handleResumeChange}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
              <label htmlFor="resume-file" className={`resume-upload-label ${isUploading ? 'resume-upload-label--uploading' : ''}`}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '8px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{resumeFile ? resumeFile.name : 'Choose PDF or DOCX'}</span>
              </label>
              {uploadStatus && (
                <p className={`resume-upload-status ${uploadStatus.includes('Failed') ? 'resume-upload-status--error' : 'resume-upload-status--success'}`}>
                  {uploadStatus}
                </p>
              )}
            </div>
            {resumeContext && (
              <div className="resume-summary-preview">
                <p className="resume-summary-preview__title">Parsed Resume Summary</p>
                <p className="resume-summary-preview__text">{resumeContext.summary}</p>
                {resumeContext.skills?.length > 0 && (
                  <div className="resume-summary-preview__tags">
                    {resumeContext.skills.slice(0, 10).map(s => (
                      <span key={s} className="tag">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => profile && onStart({ ...profile, resumeContext, interviewType: 'Introduction' })}
            disabled={!profile || isUploading}
            className="setup-start-btn"
          >
            {isUploading ? 'Uploading Resume...' : 'Start Interview'}
          </button>
        </div>

        <div className="setup-badge">
          <div className="setup-badge__avatar">S</div>
          Interviewer: <strong style={{color: 'var(--text-primary)', marginLeft: '4px'}}>Smith AI</strong>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function InterviewPage({ onComplete }) {
  const [role,  setRole]  = useState('');
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [resumeContext, setResumeContext] = useState(null);
  const [screen, setScreen] = useState('setup');
  const isSubmittingRef = useRef(false);

  const { startRecording, stopRecording, cleanup: cleanupRecorder } = useAudioRecorder();

  const {
    liveText: liveTranscriptText,
    startLiveTranscript,
    stopLiveTranscript,
    clearLiveText,
  } = useLiveTranscript();

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
    chatMessages,
    beginInterview,
    submitTranscript,
    endInterview,
    reset,
    transitionTo,
    confirmRounds,
    updateCandidateLiveText,
    finalizeCandidateMessage,
    history,
    handleCodeSubmitted,
    interviewType,
  } = useInterviewFlow({
    role,
    level,
    language,
    difficulty,
    resumeContext,
    onStateChange: useCallback(() => {}, []),
  });

  useEffect(() => {
    if (interviewState === STATES.LISTENING) {
      isSubmittingRef.current = false;
      clearLiveText();
      startRecording()
        .then(() => {
          startLiveTranscript();
        })
        .catch(err => {
          console.error('Failed to start recording:', err);
          startLiveTranscript();
        });
    }
  }, [interviewState, startRecording, startLiveTranscript, clearLiveText]);

  useEffect(() => {
    if (interviewState === STATES.LISTENING && liveTranscriptText) {
      updateCandidateLiveText(liveTranscriptText);
    }
  }, [liveTranscriptText, interviewState, updateCandidateLiveText]);

  const handleDoneSpeaking = useCallback(async () => {
    if (interviewState !== STATES.LISTENING) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    stopLiveTranscript();
    transitionTo(STATES.TRANSCRIBING);

    try {
      const audioBlob = await stopRecording();
      let transcriptText = '';

      if (audioBlob && audioBlob.size > 0) {
        try {
          transcriptText = await transcribeAudio(audioBlob, profile?.language || 'English');
        } catch (whisperErr) {
          console.warn('[InterviewPage] Whisper transcription failed, falling back to Web Speech transcript:', whisperErr);
        }
      }

      if (!transcriptText || transcriptText.trim().length === 0) {
        transcriptText = liveTranscriptText;
      }

      if (!transcriptText || transcriptText.trim().length === 0) {
        console.warn('[InterviewPage] No voice captured from either Whisper or Web Speech API.');
        clearLiveText();
        transitionTo(STATES.LISTENING);
        isSubmittingRef.current = false;
        return;
      }

      await submitTranscript(transcriptText);
    } catch (err) {
      console.error('Transcription/submission error:', err);
      clearLiveText();
      transitionTo(STATES.LISTENING);
    } finally {
      isSubmittingRef.current = false;
    }
  }, [interviewState, stopRecording, submitTranscript, transitionTo, stopLiveTranscript, clearLiveText, liveTranscriptText]);

  const handleStart = useCallback(async (config) => {
    setRole(config.role);
    setLevel(config.level);
    setLanguage(config.language);
    setDifficulty(config.difficulty);
    setResumeContext(config.resumeContext);
    setScreen('interview');
    try {
      await beginInterview(config);
    } catch (err) {
      console.error('Failed to start:', err);
    }
  }, [beginInterview]);

  const handleEnd = useCallback(async () => {
    stopLiveTranscript();
    cleanupRecorder();
    await endInterview();
    setScreen('done');
  }, [cleanupRecorder, endInterview, stopLiveTranscript]);

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
              interviewState === STATES.LISTENING ? 'status-dot--listening' :
              interviewState === STATES.SMITH_SPEAKING ? 'status-dot--speaking' :
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
              interviewType={interviewType}
              onEndInterview={handleEnd}
              onDoneSpeaking={handleDoneSpeaking}
              onConfirmRounds={confirmRounds}
              chatMessages={chatMessages}
              liveTranscriptText={liveTranscriptText}
              history={history}
              resumeContext={resumeContext}
              onCodeSubmitted={handleCodeSubmitted}
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
                  codingSubmissions
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
