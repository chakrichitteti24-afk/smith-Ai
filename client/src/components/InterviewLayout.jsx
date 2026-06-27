/**
 * InterviewLayout.jsx
 *
 * Premium chat-style interview layout:
 *  - Left sidebar: Session info, progress, timer
 *  - Center: Live conversation with avatars, typing indicators,
 *    word-by-word text display, and state-aware animations
 */

import { useEffect, useRef, useState } from 'react';
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

function TypingDots() {
  return (
    <div className="typing-dots">
      <span className="typing-dots__dot" />
      <span className="typing-dots__dot" />
      <span className="typing-dots__dot" />
    </div>
  );
}

function WaveformVisualizer({ isActive, color }) {
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
}

function ChatBubble({ message, isLast, interviewState }) {
  const isSmith = message.sender === 'smith';
  const isLive = !message.isComplete && isLast;

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
          <span className="chat-bubble__name">{isSmith ? 'Smith' : 'You'}</span>
          {isLive && (
            <span className={`chat-bubble__badge chat-bubble__badge--${message.sender}`}>
              {isSmith ? 'Speaking' : 'Recording'}
            </span>
          )}
        </div>
        <div className={`chat-bubble__text chat-bubble__text--${message.sender}`}>
          {isLive ? message.text : (message.fullText || message.text)}
          {isLive && isSmith && <span className="typing-cursor">|</span>}
          {isLive && !isSmith && message.text && <span className="typing-cursor typing-cursor--green">|</span>}
        </div>
      </div>
    </div>
  );
}

function RoundSelectionUI({ onConfirm }) {
  const [selected, setSelected] = useState([
    'Introduction', 'Project', 'Technical', 'Coding', 'Behavioral'
  ]);

  const toggleRound = (round) => {
    setSelected(prev => 
      prev.includes(round) 
        ? prev.filter(r => r !== round) 
        : [...prev, round]
    );
  };

  const rounds = ['Introduction', 'Project', 'Technical', 'Coding', 'Behavioral'];

  return (
    <div className="chat-bubble chat-bubble--smith">
      <div className="chat-avatar chat-avatar--smith">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="16" height="16" rx="3.5" stroke="white" strokeWidth="1.5"/>
          <path d="M6.5 10h7M10 6.5v7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="10" cy="10" r="2" fill="white"/>
        </svg>
      </div>
      <div className="chat-bubble__content" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="chat-bubble__header">
          <span className="chat-bubble__name">Smith</span>
        </div>
        <div className="chat-bubble__text chat-bubble__text--smith" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Choose Interview Rounds</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rounds.map(r => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selected.includes(r)} 
                  onChange={() => toggleRound(r)} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                {r} Round
              </label>
            ))}
          </div>
          <button 
            onClick={() => onConfirm(selected)}
            disabled={selected.length === 0}
            style={{ 
              marginTop: '8px', padding: '10px', background: 'var(--accent)', color: '#fff', 
              border: 'none', borderRadius: '8px', fontWeight: 600, cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
              opacity: selected.length === 0 ? 0.5 : 1
            }}
          >
            Start Interview Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewLayout({
  interviewState,
  displayText,
  candidateText,
  feedback,
  questionCount,
  maxQuestions,
  role,
  level,
  interviewType = 'Technical Round',
  onEndInterview,
  onDoneSpeaking,
  onConfirmRounds,
  chatMessages = [],
  liveTranscriptText = '',
  history = [],
  resumeContext = null,
  onCodeSubmitted = null,
  language = 'javascript',
}) {
  const isCodingRound = interviewType === 'Coding Round';
  const [isCodingOpen, setIsCodingOpen] = useState(isCodingRound);

  useEffect(() => {
    if (isCodingRound) {
      setIsCodingOpen(true);
    } else {
      setIsCodingOpen(false);
    }
  }, [isCodingRound]);
  const chatEndRef = useRef(null);
  const isActive = interviewState !== STATES.IDLE && interviewState !== STATES.INTERVIEW_COMPLETE;
  const timer = useRemainingTime(isActive, 20 * 60);

  const isListening    = interviewState === STATES.LISTENING;
  const isSpeaking     = interviewState === STATES.SMITH_SPEAKING;
  const isThinking     = interviewState === STATES.THINKING;
  const isTranscribing = interviewState === STATES.TRANSCRIBING;
  const isGenerating   = interviewState === STATES.GENERATING_RESPONSE;
  const isRoundSelection = interviewState === STATES.ROUND_SELECTION;

  const lastSmithMessage = [...chatMessages].reverse().find(m => m.sender === 'smith');

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages, displayText, candidateText, liveTranscriptText, interviewState]);

  const getStatusConfig = () => {
    if (isSpeaking)    return { label: 'Smith is speaking', color: 'var(--accent)', icon: '🔊' };
    if (isRoundSelection) return { label: 'Round Selection', color: 'var(--accent)', icon: '📋' };
    if (isListening)   return { label: 'Listening to you', color: 'var(--success)', icon: '🎤' };
    if (isThinking)    return { label: 'Smith is thinking', color: 'var(--warning)', icon: '🧠' };
    if (isTranscribing) return { label: 'Transcribing', color: 'var(--accent-dim)', icon: '📝' };
    if (isGenerating)  return { label: 'Preparing response', color: 'var(--warning)', icon: '⚡' };
    return { label: 'Standby', color: 'var(--text-muted)', icon: '⏸' };
  };

  const status = getStatusConfig();

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

      {/* ── MOBILE INFO BAR (visible on tablet/mobile when sidebar hidden) ── */}
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
            {/* Top Status Bar */}
            <div className="conversation-status-bar">
              <div className="conversation-status-bar__left">
                <div className="smith-mini-avatar">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="16" height="16" rx="3.5" stroke="white" strokeWidth="1.5"/>
                    <path d="M6.5 10h7M10 6.5v7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="10" cy="10" r="2" fill="white"/>
                  </svg>
                </div>
                <div className="conversation-status-bar__info">
                  <span className="conversation-status-bar__name">Smith AI</span>
                  <span className="conversation-status-bar__role">{interviewType} · {questionCount}/{maxQuestions} Questions</span>
                </div>
              </div>
              <div className="conversation-status-bar__right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isCodingRound && (
                  <button
                    className="toggle-editor-btn"
                    onClick={() => setIsCodingOpen(prev => !prev)}
                  >
                    {isCodingOpen ? 'Hide Sandbox' : 'Code Sandbox'}
                  </button>
                )}
                <div className="live-indicator" style={{ '--indicator-color': status.color }}>
                  <div className="live-indicator__dot" />
                  <span>{status.label}</span>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="chat-area">
              <div className="chat-area__messages">
                {chatMessages.map((msg, idx) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isLast={idx === chatMessages.length - 1}
                    interviewState={interviewState}
                  />
                ))}

                {isRoundSelection && <RoundSelectionUI onConfirm={onConfirmRounds} />}

                {isListening && liveTranscriptText && !chatMessages.some(m => !m.isComplete && m.sender === 'candidate') && (
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
                        <span className="chat-bubble__badge chat-bubble__badge--candidate">Recording</span>
                      </div>
                      <div className="chat-bubble__text chat-bubble__text--candidate">
                        {liveTranscriptText}
                        <span className="typing-cursor typing-cursor--green">|</span>
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
                        <span className="chat-bubble__name">Smith</span>
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
                      <div className="transcribing-indicator">
                        <div className="spinner spinner--small" />
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
                <div className="mic-control-row">
                  <WaveformVisualizer isActive={true} color="var(--success)" />
                  <button className="mic-btn mic-btn--active" onClick={onDoneSpeaking}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                    <span>Done Speaking</span>
                  </button>
                  <WaveformVisualizer isActive={true} color="var(--success)" />
                </div>
              )}

              {isTranscribing && (
                <div className="control-status">
                  <div className="spinner" />
                  <span>Transcribing your answer...</span>
                </div>
              )}

              {isGenerating && (
                <div className="control-status">
                  <div className="spinner" />
                  <span>Smith is preparing a response...</span>
                </div>
              )}

              {isSpeaking && (
                <div className="control-status control-status--speaking">
                  <WaveformVisualizer isActive={true} color="var(--accent)" />
                  <span>Smith is speaking...</span>
                  <WaveformVisualizer isActive={true} color="var(--accent)" />
                </div>
              )}

              {isThinking && (
                <div className="control-status">
                  <div className="spinner" />
                  <span>Smith is thinking...</span>
                </div>
              )}
            </div>
          </div>

          <div className={`editor-column ${(!isCodingRound || !isCodingOpen) ? 'editor-column--closed' : ''}`}>
            {(isCodingRound || isCodingOpen) && (
              <CodingWorkspace
                questionText={lastSmithMessage?.fullText || ''}
                role={role}
                level={level}
                history={history}
                resumeContext={resumeContext}
                interviewType={interviewType}
                onCodeSubmitted={onCodeSubmitted}
                defaultLanguage={language}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
