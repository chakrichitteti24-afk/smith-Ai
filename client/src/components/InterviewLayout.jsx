import { useEffect, useRef, useState, memo } from 'react';
import { STATES } from '../hooks/useInterviewFlow';
import CodingWorkspace from './CodingWorkspace';

function useRemainingTime(running, maxSeconds) {
  const [remaining, setRemaining] = useState(maxSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, remaining]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

const TypingDots = memo(function TypingDots() {
  return (
    <div className="typing-dots">
      <span className="typing-dots__dot" />
      <span className="typing-dots__dot" />
      <span className="typing-dots__dot" />
    </div>
  );
});

const WaveformVisualizer = memo(function WaveformVisualizer({ isActive, color }) {
  return (
    <div className={`waveform ${isActive ? 'waveform--active' : ''}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="waveform__bar"
          style={{
            '--bar-index': i,
            '--bar-color': color,
          }}
        />
      ))}
    </div>
  );
});

function formatMessageText(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*.*?\*\*|`.*?`|\n)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} style={{ color: '#93c5fd', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
    }
    if (part === '\n') {
      return <br key={idx} />;
    }
    return part;
  });
}

const ChatBubble = memo(function ChatBubble({ message, isLast }) {
  const isSmith = message.sender === 'smith';
  const isLive = !message.isComplete && isLast;

  const textContent = isLive ? message.text : (message.fullText || message.text);

  return (
    <div className={`chat-bubble chat-bubble--${message.sender} ${isLive ? 'chat-bubble--live' : ''}`}>
      <div className={`chat-avatar chat-avatar--${message.sender}`}>
        {isSmith ? (
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="16" height="16" rx="3.5" stroke="white" strokeWidth="1.5"/>
            <path d="M6.5 10h7M10 6.5v7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="10" cy="10" r="2" fill="white"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        )}
        {isLive && (
          <div className={`chat-avatar__status chat-avatar__status--${isSmith ? 'speaking' : 'recording'}`} />
        )}
      </div>

      <div className="chat-bubble__content">
        <div className="chat-bubble__header">
          <span className="chat-bubble__name">{isSmith ? 'Smith AI' : 'You'}</span>
          {isLive && (
            <span className={`chat-bubble__badge chat-bubble__badge--${message.sender}`}>
              {isSmith ? 'Speaking' : 'Recording'}
            </span>
          )}
        </div>
        <div className={`chat-bubble__text chat-bubble__text--${message.sender}`}>
          {formatMessageText(textContent)}
          {isLive && isSmith && <span className="typing-cursor">|</span>}
          {isLive && !isSmith && message.text && <span className="typing-cursor typing-cursor--green">|</span>}
        </div>
      </div>
    </div>
  );
});

export default function InterviewLayout({
  interviewState,
  displayText,
  candidateText,
  questionCount,
  maxQuestions,
  role,
  level,
  difficulty,
  interviewType = 'Technical Round',
  onEndInterview,
  onDoneSpeaking,
  chatMessages = [],
  liveTranscriptText = '',
  history = [],
  resumeContext = null,
  onCodeSubmitted = null,
  language = 'javascript',
  currentInterviewRound = 'INTRODUCTION',
  isUserSpeaking = false,
  error = null,
}) {
  const isCodingRound = currentInterviewRound === 'CODING';
  const [isCodingOpen, setIsCodingOpen] = useState(isCodingRound);

  useEffect(() => {
    setIsCodingOpen(isCodingRound);
  }, [isCodingRound]);

  const chatEndRef = useRef(null);
  const isActive = interviewState !== STATES.IDLE && interviewState !== STATES.INTERVIEW_COMPLETE;
  const timer = useRemainingTime(isActive, 45 * 60);

  const isListening    = interviewState === STATES.LISTENING;
  const isSpeaking     = interviewState === STATES.SMITH_SPEAKING;
  const isThinking     = interviewState === STATES.THINKING;
  const isTranscribing = interviewState === STATES.TRANSCRIBING;
  const isGenerating   = interviewState === STATES.GENERATING_RESPONSE;

  const lastSmithMessage = [...chatMessages].reverse().find(m => m.sender === 'smith');

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages, displayText, candidateText, liveTranscriptText, interviewState]);

  const getStatusConfig = () => {
    if (isSpeaking)     return { label: 'Smith is speaking...', color: 'var(--accent)', icon: '🔊' };
    if (isListening)    return { label: 'Listening...', color: 'var(--success)', icon: '🎤' };
    if (isThinking || isGenerating || isTranscribing) return { label: 'Analyzing response...', color: 'var(--warning)', icon: '⚡' };
    return { label: 'Standby', color: 'var(--text-muted)', icon: '⏸' };
  };

  const status = getStatusConfig();

  const [typedInput, setTypedInput] = useState('');

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const textToSend = typedInput.trim();
    setTypedInput('');
    onDoneSpeaking(textToSend);
  };

  return (
    <div className="interview-layout">
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <div className="interview-left">
        <div className="info-card">
          <p className="info-card__label">Role</p>
          <p className="info-card__value">{role || '—'}</p>
          <p className="info-card__sub">{level || '—'}</p>
        </div>

        <div className="info-card">
          <p className="info-card__label">Round Type</p>
          <p className="info-card__value" style={{ fontSize: '13px', fontWeight: '600' }}>{interviewType}</p>
        </div>

        <div className="info-card">
          <p className="info-card__label">Duration</p>
          <p className="info-card__timer">{timer}</p>
        </div>

        <div className="info-card">
          <p className="info-card__label">Questions</p>
          <div className="progress-dots">
            {Array.from({ length: maxQuestions }, (_, i) => (
              <div
                key={i}
                className={`progress-dot ${i < questionCount ? 'progress-dot--done' : ''}`}
              />
            ))}
          </div>
          <p className="info-card__sub">{questionCount} / {maxQuestions} answered</p>
        </div>

        <div className="info-card">
          <p className="info-card__label">Status</p>
          <div className="status-indicator">
            <div className="status-indicator__pulse" style={{ background: status.color }} />
            <span className="status-text">{status.label}</span>
          </div>
        </div>

        {isActive && (
          <button className="end-btn" onClick={onEndInterview}>
            End Interview
          </button>
        )}
      </div>

      {/* ── MOBILE INFO BAR ────────────────────────────────────────── */}
      <div className="mobile-interview-bar">
        <div className="mobile-interview-bar__item">
          <span>Role:</span>
          <span className="mobile-interview-bar__value">{role || '—'}</span>
        </div>
        <div className="mobile-interview-bar__item">
          <span>⏱</span>
          <span className="mobile-interview-bar__value">{timer}</span>
        </div>
        <div className="mobile-interview-bar__item">
          <span>Q:</span>
          <span className="mobile-interview-bar__value">{questionCount}/{maxQuestions}</span>
        </div>
        <div className="mobile-interview-bar__item">
          <div className="status-indicator__pulse" style={{ background: status.color, width: '6px', height: '6px' }} />
          <span>{status.label}</span>
        </div>
        {isActive && (
          <button className="end-btn" style={{ padding: '6px 12px', marginTop: 0, fontSize: '11px' }} onClick={onEndInterview}>
            End
          </button>
        )}
      </div>

      {/* ── CENTER: CONVERSATION & CODING ─────────────────────────────── */}
      <div className="interview-center">
        <div className="interview-split-container">
          <div className="conversation-column">
            {/* Top macOS Header Bar */}
            <div className="conversation-status-bar macos-titlebar">
              <div className="conversation-status-bar__left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="macos-traffic-lights">
                  <span className="macos-traffic-dot macos-traffic-dot--red" />
                  <span className="macos-traffic-dot macos-traffic-dot--yellow" />
                  <span className="macos-traffic-dot macos-traffic-dot--green" />
                </div>
                <div className="smith-mini-avatar">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="16" height="16" rx="3.5" stroke="white" strokeWidth="1.5"/>
                    <path d="M6.5 10h7M10 6.5v7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="10" cy="10" r="2" fill="white"/>
                  </svg>
                </div>
                <div className="conversation-status-bar__info">
                  <span className="conversation-status-bar__name" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>Smith AI</span>
                  <span className="conversation-status-bar__role" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{interviewType} · Question {questionCount} of {maxQuestions}</span>
                </div>
              </div>
              <div className="conversation-status-bar__right" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {isCodingRound && (
                  <button
                    className="toggle-editor-btn"
                    onClick={() => setIsCodingOpen(prev => !prev)}
                    style={{ 
                      padding: '6px 14px', 
                      borderRadius: 'var(--radius-pill)', 
                      background: 'rgba(10, 132, 255, 0.18)', 
                      color: 'var(--accent)', 
                      border: '1px solid rgba(10, 132, 255, 0.35)', 
                      fontWeight: 600, 
                      fontSize: '0.8rem', 
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {isCodingOpen ? 'Hide Sandbox' : 'Code Sandbox'}
                  </button>
                )}
                <div className="live-indicator" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div className="live-indicator__dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: status.color, boxShadow: `0 0 8px ${status.color}` }} />
                  <span>{status.label}</span>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="chat-area">
              <div className="chat-area__messages">
                {error && (
                  <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '12px 18px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isLast={idx === chatMessages.length - 1}
                    interviewState={interviewState}
                  />
                ))}

                {isListening && (
                  <div className="chat-bubble chat-bubble--candidate chat-bubble--live">
                    <div className="chat-avatar chat-avatar--candidate">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                      <div className="chat-avatar__status chat-avatar__status--recording" />
                    </div>
                    <div className="chat-bubble__content">
                      <div className="chat-bubble__header">
                        <span className="chat-bubble__name">You</span>
                        <span className="chat-bubble__badge chat-bubble__badge--candidate">
                          {isUserSpeaking ? '🎙 Speaking' : '🎤 Listening'}
                        </span>
                      </div>
                      <div className="chat-bubble__text chat-bubble__text--candidate">
                        {liveTranscriptText
                          ? <>{liveTranscriptText}<span className="typing-cursor typing-cursor--green">|</span></>
                          : <span style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>Start speaking…</span>
                        }
                      </div>
                    </div>
                  </div>
                )}

                {(isThinking || isGenerating) && (
                  <div className="chat-bubble chat-bubble--smith chat-bubble--thinking">
                    <div className="chat-avatar chat-avatar--smith">
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                        <rect x="2" y="2" width="16" height="16" rx="3.5" stroke="white" strokeWidth="1.5"/>
                        <path d="M6.5 10h7M10 6.5v7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="10" cy="10" r="2" fill="white"/>
                      </svg>
                      <div className="chat-avatar__status chat-avatar__status--thinking" />
                    </div>
                    <div className="chat-bubble__content">
                      <div className="chat-bubble__header">
                        <span className="chat-bubble__name">Smith AI</span>
                        <span className="chat-bubble__badge chat-bubble__badge--smith">
                          {isThinking ? 'Thinking' : 'Preparing response'}
                        </span>
                      </div>
                      <TypingDots />
                    </div>
                  </div>
                )}

                {isTranscribing && (
                  <div className="chat-bubble chat-bubble--system">
                    <div className="chat-bubble__content">
                      <div className="transcribing-indicator" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <span>Transcribing your response...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="conversation-controls">
              {isListening && (
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '880px', margin: '0 auto' }}>
                  <WaveformVisualizer isActive={isUserSpeaking} color="var(--accent)" />
                  <input
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder="Speak naturally or type your response here..."
                    style={{
                      flex: 1,
                      padding: '13px 20px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '0.94rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    className="mic-btn mic-btn--active mic-btn--submit"
                    title="Submit your answer"
                    style={{ 
                      padding: '12px 24px', 
                      borderRadius: 'var(--radius-pill)', 
                      background: 'var(--gradient-brand)', 
                      color: '#ffffff', 
                      border: 'none', 
                      fontWeight: 700, 
                      fontSize: '0.92rem',
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      boxShadow: '0 4px 20px var(--accent-glow)', 
                      whiteSpace: 'nowrap',
                      transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    <span>{typedInput.trim() ? 'Send Response' : (isUserSpeaking ? 'Speaking…' : 'Done Speaking')}</span>
                  </button>
                  <WaveformVisualizer isActive={isUserSpeaking} color="var(--accent)" />
                </form>
              )}

              {isTranscribing && (
                <div className="control-status" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Transcribing your answer...</span>
                </div>
              )}

              {isGenerating && (
                <div className="control-status" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Smith AI is preparing a response...</span>
                </div>
              )}

              {isSpeaking && (
                <div className="control-status control-status--speaking" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                  <WaveformVisualizer isActive={true} color="var(--accent)" />
                  <span>Smith AI is speaking...</span>
                  <WaveformVisualizer isActive={true} color="var(--accent)" />
                </div>
              )}

              {isThinking && (
                <div className="control-status" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Smith AI is thinking...</span>
                </div>
              )}
            </div>
          </div>

          <div className={`editor-column ${(!isCodingRound || !isCodingOpen) ? 'editor-column--closed' : ''}`}>
            {(isCodingRound && isCodingOpen) && (
              <CodingWorkspace
                questionText={lastSmithMessage?.fullText || ''}
                role={role}
                level={level}
                difficulty={difficulty}
                history={history}
                resumeContext={resumeContext}
                interviewType={interviewType}
                onCodeSubmitted={onCodeSubmitted}
                defaultLanguage="javascript"
                spokenLanguage={language}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
