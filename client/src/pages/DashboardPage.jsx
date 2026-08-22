import { useState, useEffect } from 'react';
import AnalyticsTab from '../components/AnalyticsTab';
import ResumeInsightsTab from '../components/ResumeInsightsTab';
import PracticeTab from '../components/PracticeTab';
import SmithLogo, { CipherFluxBadge } from '../components/SmithLogo';

// Minimalist Circular Progress Gauge
function CircularGauge({ score, title, color = 'var(--accent)' }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const validScore = typeof score === 'number' ? Math.min(100, Math.max(0, score)) : 0;
  const offset = circumference - (validScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" />
          <circle 
            cx="32" cy="32" r={radius} fill="transparent" 
            stroke={color} strokeWidth="4.5" 
            strokeDasharray={circumference} 
            strokeDashoffset={score !== null && score !== undefined ? offset : circumference} 
            strokeLinecap="round" 
            transform="rotate(-90 32 32)" 
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <span style={{ position: 'absolute', fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
          {score !== null && score !== undefined ? `${score}%` : '—'}
        </span>
      </div>
      <span style={{ marginTop: '8px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'center' }}>
        {title}
      </span>
    </div>
  );
}

export default function DashboardPage({ sessionData, onRestart, onLoadHistorySession }) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [history] = useState(() => {
    try {
      const saved = localStorage.getItem('smith_interview_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  });
  
  const [theme, setTheme] = useState(() => localStorage.getItem('smith_dashboard_theme') || 'dark');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('smith_dashboard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('smith_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      name: 'Alex Morgan',
      role: 'Full Stack Developer',
      level: 'Mid Level',
      difficulty: 'Intermediate',
      voiceEnabled: true,
      speechSpeed: 'Normal'
    };
  });

  const latestSession = sessionData || history[0] || null;
  const currentMetrics = {
    accuracy: latestSession?.score !== undefined ? latestSession.score : 78,
    logicalThinking: latestSession?.score !== undefined ? Math.min(100, latestSession.score + 4) : 82,
    confidence: latestSession?.score !== undefined ? Math.max(0, latestSession.score - 5) : 74,
    overall: latestSession?.score !== undefined ? latestSession.score : 78
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="pro-navbar">
        <div className="pro-navbar-inner">
          
          {/* Brand */}
          <div className="pro-navbar-brand" onClick={() => setCurrentTab('dashboard')}>
            <SmithLogo size={28} showText={false} />
            <span className="pro-navbar-brand-text">
              Smith<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
            <span className="pro-navbar-brand-tag">PRO</span>
          </div>

          {/* Centered Navigation Tabs */}
          <div className="pro-navbar-tabs">
            <button 
              className={`pro-nav-tab ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentTab('dashboard')}
            >
              Cockpit
            </button>
            <button 
              className={`pro-nav-tab ${currentTab === 'resume' ? 'active' : ''}`}
              onClick={() => setCurrentTab('resume')}
            >
              Resume Insights
              {profile.resumeContext && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />}
            </button>
            <button 
              className={`pro-nav-tab ${currentTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setCurrentTab('analytics')}
            >
              Analytics
            </button>
            <button 
              className={`pro-nav-tab ${currentTab === 'practice' ? 'active' : ''}`}
              onClick={() => setCurrentTab('practice')}
            >
              Practice IDE
            </button>
            <button 
              className={`pro-nav-tab ${currentTab === 'history' ? 'active' : ''}`}
              onClick={() => setCurrentTab('history')}
            >
              Session Logs
            </button>
            {sessionData && (
              <button 
                className={`pro-nav-tab ${currentTab === 'report' ? 'active' : ''}`}
                onClick={() => setCurrentTab('report')}
              >
                Report
              </button>
            )}
          </div>

          {/* Actions & Profile */}
          <div className="pro-navbar-actions">
            <CipherFluxBadge />

            {/* Theme Toggle */}
            <button className="pro-icon-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <div className="pro-profile-chip" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
                <div className="pro-profile-avatar">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile.name ? profile.name.split(' ')[0] : 'Candidate'}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {profileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <button onClick={() => { setCurrentTab('settings'); setProfileMenuOpen(false); }} className="profile-dropdown-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Settings
                  </button>
                  <button onClick={() => { 
                    localStorage.removeItem('smith_user_profile');
                    localStorage.removeItem('smith_interview_history');
                    sessionStorage.removeItem('smith_session_data');
                    window.location.href = '/interview';
                  }} className="profile-dropdown-item profile-dropdown-item--danger">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* 2. DYNAMIC MAIN CONTENT */}
      <main style={{ flex: 1 }}>
        
        {/* TAB A: COCKPIT BENTO GRID */}
        {currentTab === 'dashboard' && (
          <div className="pro-page-container">
            
            {/* Header */}
            <div className="pro-header">
              <div>
                <h1 className="pro-header-title">
                  Welcome back, {profile.name ? profile.name.split(' ')[0] : 'Candidate'} 👋
                </h1>
                <p className="pro-header-subtitle">
                  Configure simulation parameters and launch an interactive mock round powered by AI.
                </p>
              </div>
              <div className="pro-header-badges">
                <div className="pro-pill-badge">
                  Role: <strong>{profile.role}</strong>
                </div>
                <div className="pro-pill-badge">
                  Level: <strong>{profile.level}</strong>
                </div>
                <div className="pro-pill-badge">
                  Difficulty: <strong>{profile.difficulty}</strong>
                </div>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="pro-bento-grid">
              
              {/* CARD 1: SESSION LAUNCHER (Span 2) */}
              <div className="pro-card pro-card-span-2">
                <div className="pro-card-header">
                  <div className="pro-card-title-group">
                    <div className="pro-card-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                    <div>
                      <div className="pro-card-title">Mock Round Configurator</div>
                      <div className="pro-card-subtitle">Select role and seniority parameters</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', background: 'var(--success-subtle)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                    ● ENGINE READY
                  </span>
                </div>

                {/* Role Selector */}
                <div style={{ marginBottom: '16px' }}>
                  <div className="pro-chip-group-title">
                    <span>Target Engineering Role</span>
                    <span style={{ color: 'var(--accent)' }}>{profile.role}</span>
                  </div>
                  <div className="pro-chip-row">
                    {[
                      'Full Stack Developer',
                      'Frontend Engineer',
                      'Backend Engineer',
                      'AI Engineer',
                      'Data Scientist',
                      'DevOps Engineer',
                      'Cybersecurity Analyst'
                    ].map(r => (
                      <button
                        key={r}
                        type="button"
                        className={`pro-chip ${profile.role === r ? 'active' : ''}`}
                        onClick={() => {
                          const updated = { ...profile, role: r };
                          setProfile(updated);
                          localStorage.setItem('smith_user_profile', JSON.stringify(updated));
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seniority & Rigor Subgrid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div className="pro-chip-group-title">
                      <span>Seniority Level</span>
                      <span>{profile.level}</span>
                    </div>
                    <div className="pro-chip-row">
                      {['Fresher', 'Junior', 'Mid Level', 'Senior'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          className={`pro-chip ${profile.level === lvl ? 'active' : ''}`}
                          onClick={() => {
                            const updated = { ...profile, level: lvl };
                            setProfile(updated);
                            localStorage.setItem('smith_user_profile', JSON.stringify(updated));
                          }}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="pro-chip-group-title">
                      <span>Difficulty Rigor</span>
                      <span>{profile.difficulty}</span>
                    </div>
                    <div className="pro-chip-row">
                      {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                        <button
                          key={d}
                          type="button"
                          className={`pro-chip ${profile.difficulty === d ? 'active' : ''}`}
                          onClick={() => {
                            const updated = { ...profile, difficulty: d };
                            setProfile(updated);
                            localStorage.setItem('smith_user_profile', JSON.stringify(updated));
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resume Status Alert */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1rem' }}>{profile.resumeContext ? '📄' : '💡'}</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {profile.resumeContext ? `Tailored to ${profile.resumeName || 'your resume'}` : 'Generic Role Context Active'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {profile.resumeContext ? 'AI questions generated from your projects.' : 'Upload resume for hyper-personalized interview rounds.'}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCurrentTab('resume')}
                    className="pro-btn-secondary"
                  >
                    {profile.resumeContext ? 'View ATS Insights →' : 'Upload Resume →'}
                  </button>
                </div>

                {/* Launch CTA */}
                <button className="pro-btn-primary" onClick={onRestart}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  <span>Launch AI Mock Interview Session</span>
                </button>
              </div>

              {/* CARD 2: ATS RESUME AUDITOR (Span 1) */}
              <div className="pro-card pro-card-span-1">
                <div className="pro-card-header">
                  <div className="pro-card-title-group">
                    <div className="pro-card-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </div>
                    <div>
                      <div className="pro-card-title">ATS Resume Auditor</div>
                      <div className="pro-card-subtitle">Resume relevance & scoring</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: profile.resumeContext ? 'var(--success)' : 'var(--text-muted)' }}>
                    {profile.resumeContext ? 'CONNECTED' : 'NOT CONNECTED'}
                  </span>
                </div>

                {profile.resumeContext ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>ATS Match Score</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {profile.resumeContext.atsScore || 0}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/100</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--success)', background: 'var(--success-subtle)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                        Grade {(profile.resumeContext.atsScore || 0) >= 80 ? 'A+' : 'A'}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Extracted Skills</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {profile.resumeContext.skills?.slice(0, 5).map((s, i) => (
                          <span key={i} style={{ fontSize: '0.76rem', padding: '3px 8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => setCurrentTab('resume')} className="pro-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                      View Full ATS Breakdown →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px 16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)', flex: 1 }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>📄</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Resume Uploaded</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Upload your resume to calculate your match score.</div>
                    <button onClick={() => setCurrentTab('resume')} className="pro-btn-secondary">
                      Upload Resume PDF →
                    </button>
                  </div>
                )}
              </div>

              {/* CARD 3: TELEMETRY METRICS (Span 1) */}
              <div className="pro-card pro-card-span-1">
                <div className="pro-card-header">
                  <div className="pro-card-title-group">
                    <div className="pro-card-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div>
                      <div className="pro-card-title">Telemetry Metrics</div>
                      <div className="pro-card-subtitle">Real-time competency index</div>
                    </div>
                  </div>
                  <button onClick={() => setCurrentTab('analytics')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    Analytics →
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <CircularGauge score={currentMetrics.accuracy} title="Accuracy" color="var(--accent)" />
                  <CircularGauge score={currentMetrics.logicalThinking} title="Logic" color="var(--accent)" />
                  <CircularGauge score={currentMetrics.confidence} title="Clarity" color="var(--accent)" />
                  <CircularGauge score={currentMetrics.overall} title="Overall" color="var(--success)" />
                </div>
              </div>

              {/* CARD 4: PERFORMANCE TRAJECTORY (Span 2) */}
              <div className="pro-card pro-card-span-2">
                <div className="pro-card-header">
                  <div className="pro-card-title-group">
                    <div className="pro-card-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <div>
                      <div className="pro-card-title">Performance Trajectory</div>
                      <div className="pro-card-subtitle">Historical score trends and competency breakdown</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Target: 80% Benchmark</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
                  {/* SVG Area Chart */}
                  <div style={{ height: '130px', width: '100%' }}>
                    {history.length > 0 ? (
                      <svg viewBox="0 0 400 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="proChartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(99,102,241,0.2)" strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        {(() => {
                          const pts = [...history].reverse().slice(-6).map((item, idx, arr) => {
                            const s = typeof item.score === 'number' ? item.score : 75;
                            const x = arr.length === 1 ? 200 : (idx / (arr.length - 1)) * 380 + 10;
                            const y = 120 - (s / 100) * 100;
                            return { x, y, s };
                          });
                          const l = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          const a = `${l} L ${pts[pts.length - 1].x} 120 L ${pts[0].x} 120 Z`;
                          return (
                            <>
                              <path d={a} fill="url(#proChartGrad)" />
                              <path d={l} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              {pts.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--bg-app)" stroke="var(--accent)" strokeWidth="2" />
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        Complete a session to render trajectory curve
                      </div>
                    )}
                  </div>

                  {/* Competency Meters */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Technical Accuracy', score: currentMetrics.accuracy || 75 },
                      { label: 'Problem Decomposition', score: currentMetrics.logicalThinking || 80 },
                      { label: 'Communication Clarity', score: currentMetrics.confidence || 72 }
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                          <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{item.score}%</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${item.score}%`, height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-full)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 5: EVALUATION LOGS (Span 2) */}
              <div className="pro-card pro-card-span-2">
                <div className="pro-card-header">
                  <div className="pro-card-title-group">
                    <div className="pro-card-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                    </div>
                    <div>
                      <div className="pro-card-title">Recent Session Logs</div>
                      <div className="pro-card-subtitle">Review evaluated rounds and transcripts</div>
                    </div>
                  </div>
                  <button onClick={() => setCurrentTab('history')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    View All Logs ({history.length}) →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>No sessions recorded yet</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>Complete your first AI mock round to populate logs.</div>
                    </div>
                  ) : (
                    history.slice(0, 3).map((attempt, index) => (
                      <div 
                        key={attempt.id || index}
                        onClick={() => {
                          if (onLoadHistorySession) onLoadHistorySession(attempt);
                          setCurrentTab('report');
                        }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>{attempt.role}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{attempt.date} &bull; Mock Round</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: (attempt.score || 0) >= 80 ? 'var(--success)' : 'var(--warning)', background: (attempt.score || 0) >= 80 ? 'var(--success-subtle)' : 'var(--warning-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                            {attempt.score !== null && attempt.score !== undefined ? `${attempt.score}%` : 'N/A'}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CARD 6: DAILY AI STRATEGY (Span 1) */}
              <div className="pro-card pro-card-span-1">
                <div className="pro-card-header">
                  <div className="pro-card-title-group">
                    <div className="pro-card-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                    </div>
                    <div>
                      <div className="pro-card-title">Daily AI Strategy</div>
                      <div className="pro-card-subtitle">Expert coaching tactic</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flex: 1, marginBottom: '14px' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                    "Deconstruct your logic aloud before writing code. Top engineering interviewers evaluate architectural clarity and modular breakdown equally with syntax."
                  </p>
                </div>

                <button onClick={() => setCurrentTab('practice')} className="pro-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Open Practice Sandbox →
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB B: RESUME INSIGHTS */}
        {currentTab === 'resume' && (
          <ResumeInsightsTab 
            profile={profile} 
            setProfile={setProfile} 
            onUpload={() => {}} 
            isUploading={false} 
          />
        )}

        {/* TAB C: ANALYTICS */}
        {currentTab === 'analytics' && (
          <AnalyticsTab 
            history={history} 
            currentMetrics={currentMetrics} 
          />
        )}

        {/* TAB D: PRACTICE */}
        {currentTab === 'practice' && (
          <PracticeTab />
        )}

        {/* TAB E: HISTORY */}
        {currentTab === 'history' && (
          <div className="pro-page-container">
            <div className="pro-card">
              <div className="pro-card-header">
                <div>
                  <h2 className="pro-header-title" style={{ fontSize: '1.3rem' }}>Interview Assessment Logs</h2>
                  <p className="pro-header-subtitle">Review transcripts and evaluation reports from all previous rounds.</p>
                </div>
                <button onClick={onRestart} className="pro-btn-secondary">
                  + Start New Round
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No interview sessions recorded yet. Launch your first simulator session to view logs.
                  </div>
                ) : (
                  history.map((attempt, index) => (
                    <div 
                      key={attempt.id || index}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{attempt.role}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{attempt.date} &bull; Difficulty: {attempt.difficulty || 'Intermediate'}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: (attempt.score || 0) >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                          {attempt.score !== null && attempt.score !== undefined ? `${attempt.score}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB F: SETTINGS */}
        {currentTab === 'settings' && (
          <div className="pro-page-container">
            <div className="pro-card" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
              <div className="pro-card-header">
                <div>
                  <h2 className="pro-header-title" style={{ fontSize: '1.3rem' }}>Candidate Settings</h2>
                  <p className="pro-header-subtitle">Configure your mock round defaults and preferences.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Candidate Name</label>
                  <input 
                    type="text" 
                    value={profile.name || ''} 
                    onChange={(e) => {
                      const updated = { ...profile, name: e.target.value };
                      setProfile(updated);
                      localStorage.setItem('smith_user_profile', JSON.stringify(updated));
                    }}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Engineering Role</label>
                  <input 
                    type="text" 
                    value={profile.role || ''} 
                    onChange={(e) => {
                      const updated = { ...profile, role: e.target.value };
                      setProfile(updated);
                      localStorage.setItem('smith_user_profile', JSON.stringify(updated));
                    }}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setCurrentTab('dashboard')} className="pro-btn-secondary">
                    Save & Return to Cockpit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. NATIVE MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="pro-mobile-bottom-nav">
        <button 
          className={`pro-mobile-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <span className="pro-mobile-nav-icon">⚡</span>
          <span className="pro-mobile-nav-label">Cockpit</span>
        </button>

        <button 
          className={`pro-mobile-nav-item ${currentTab === 'resume' ? 'active' : ''}`}
          onClick={() => setCurrentTab('resume')}
        >
          <span className="pro-mobile-nav-icon">📄</span>
          <span className="pro-mobile-nav-label">Resume</span>
        </button>

        <button 
          className={`pro-mobile-nav-item ${currentTab === 'practice' ? 'active' : ''}`}
          onClick={() => setCurrentTab('practice')}
        >
          <span className="pro-mobile-nav-icon">💻</span>
          <span className="pro-mobile-nav-label">Practice</span>
        </button>

        <button 
          className={`pro-mobile-nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentTab('analytics')}
        >
          <span className="pro-mobile-nav-icon">📊</span>
          <span className="pro-mobile-nav-label">Analytics</span>
        </button>

        <button 
          className={`pro-mobile-nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentTab('settings')}
        >
          <span className="pro-mobile-nav-icon">⚙️</span>
          <span className="pro-mobile-nav-label">Settings</span>
        </button>
      </nav>

    </div>
  );
}
