import { useState, useMemo, useEffect } from 'react';
import { uploadResume } from '../services/api';
import AnalyticsTab from '../components/AnalyticsTab';
import ResumeInsightsTab from '../components/ResumeInsightsTab';
import PracticeTab from '../components/PracticeTab';
import SmithLogo, { CipherFluxBadge } from '../components/SmithLogo';

// Hand-Drawn Curved Arrow Indicator
function HandDrawnArrow() {
  return (
    <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: '-40px', left: '20px', zIndex: 10 }}>
      <path 
        d="M20 70C25 50 35 30 55 20" 
        stroke="var(--accent)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeDasharray="4 4" 
      />
      <path 
        d="M48 20L56 19L55 27" 
        stroke="var(--accent)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

// Robot Mascot Illustration
function RobotIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="24" width="60" height="46" rx="18" fill="var(--bg-elevated)" stroke="var(--border-medium)" strokeWidth="2.5" />
      <rect x="27" y="31" width="46" height="32" rx="10" fill="#0f172a" />
      <ellipse cx="41" cy="47" rx="4.5" ry="3.5" fill="#3b82f6" />
      <ellipse cx="59" cy="47" rx="4.5" ry="3.5" fill="#3b82f6" />
      <line x1="50" y1="24" x2="50" y2="12" stroke="var(--border-medium)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="10" r="3.5" fill="#3b82f6" />
      <path d="M42 78H58M46 83H54M38 73H62" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Icons Set
const ICONS = {
  dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  history: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  analytics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  resume: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  practice: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  ),
  resources: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
    </svg>
  ),
  settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  chevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  code: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  database: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  layers: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polygon points="2 17 12 22 22 17" /><polygon points="2 12 12 17 22 12" />
    </svg>
  )
};

// Circular Progress indicator card
function PerformanceIndicatorChart({ score, title, color }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = score !== null && score !== undefined 
    ? circumference - (score / 100) * circumference 
    : circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-elevated)', padding: '16px 12px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="transparent" stroke="var(--border-medium)" strokeWidth="6" />
          <circle 
            cx="40" cy="40" r={radius} fill="transparent" 
            stroke={color} strokeWidth="6" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            transform="rotate(-90 40 40)" 
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <span style={{ position: 'absolute', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {score !== null && score !== undefined ? `${score}%` : 'N/A'}
        </span>
      </div>
      <span style={{ marginTop: '10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync theme class to HTML element
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('smith_dashboard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // User profile state
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('smith_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      name: 'Alex Morgan',
      role: 'Software Engineer',
      level: 'Fresher',
      language: 'English',
      difficulty: 'Beginner',
      voiceEnabled: true,
      speechSpeed: 'Normal',
      micSensitivity: 'Normal',
      autoSilence: true,
      saveRecordings: true
    };
  });

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Resume Upload Handler
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadResume(file);
      if (res && res.analysis) {
        const updatedProfile = {
          ...profile,
          resumeName: file.name,
          resumeDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          resumeSize: `${(file.size / 1024).toFixed(1)} KB`,
          resumeContext: res.analysis
        };
        setProfile(updatedProfile);
        localStorage.setItem('smith_user_profile', JSON.stringify(updatedProfile));
        setToast('Resume analyzed successfully!');
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err) {
      alert(`Resume Upload Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Parse session JSON report if available
  const parsedSession = useMemo(() => {
    if (!sessionData || !sessionData.analysis) return null;
    if (typeof sessionData.analysis === 'object') return sessionData.analysis;
    try {
      const cleanJson = String(sessionData.analysis).replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return null;
    }
  }, [sessionData]);

  // Performance metrics calculation
  const currentMetrics = useMemo(() => {
    if (parsedSession) {
      return {
        accuracy: parsedSession.accuracyScore ?? parsedSession.technicalScore ?? 82,
        confidence: parsedSession.confidenceScore ?? 78,
        logicalThinking: parsedSession.logicalThinkingScore ?? parsedSession.problemSolvingScore ?? 85,
        overall: parsedSession.overallScore ?? 81
      };
    }
    if (history.length > 0) {
      const accs = history.map(h => h.accuracy).filter(s => s !== null && s !== undefined);
      const confs = history.map(h => h.confidence).filter(s => s !== null && s !== undefined);
      const logs = history.map(h => h.logicalThinking).filter(s => s !== null && s !== undefined);
      const ovr = history.map(h => h.score).filter(s => s !== null && s !== undefined);

      return {
        accuracy: accs.length > 0 ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 82,
        confidence: confs.length > 0 ? Math.round(confs.reduce((a, b) => a + b, 0) / confs.length) : 78,
        logicalThinking: logs.length > 0 ? Math.round(logs.reduce((a, b) => a + b, 0) / logs.length) : 85,
        overall: ovr.length > 0 ? Math.round(ovr.reduce((a, b) => a + b, 0) / ovr.length) : 81
      };
    } else {
      return {
        accuracy: null,
        confidence: null,
        logicalThinking: null,
        overall: null
      };
    }
  }, [parsedSession, history]);

  const displayAttempts = useMemo(() => {
    return history.map(item => ({
      id: item.id,
      role: item.role,
      date: item.date,
      score: item.score,
      result: item.result,
      raw: item
    })).slice(0, 5);
  }, [history]);

  const handleSelectAttempt = (attempt) => {
    if (attempt.raw) {
      onLoadHistorySession(attempt.raw);
      setCurrentTab('report');
    }
  };

  return (
    <div className="dashboard-root">
      
      {/*  Apple iOS / Huawei Dynamic Island Header */}
      <div className="ios-dynamic-island">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="ios-dynamic-island__pulse" />
          <span>Smith AI Engine &bull; CipherFlux Labs</span>
        </div>
        <div className="ios-dynamic-island__camera" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* 1. LEFT SIDEBAR PANEL */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar--open' : ''}`}>
        <div>
          {/* Sidebar Header Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <SmithLogo size={34} showText={true} showBadge={true} />
          </div>

          {/* Navigation Menu List */}
          <nav className="sidebar-menu-list">
            <button className={`sidebar-menu-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setCurrentTab('dashboard'); setSidebarOpen(false); }}>
              <ICONS.dashboard /> Dashboard
            </button>
            <button className="sidebar-menu-item" onClick={() => { onRestart(); setSidebarOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Interview
            </button>
            <button className={`sidebar-menu-item ${currentTab === 'practice' ? 'active' : ''}`} onClick={() => { setCurrentTab('practice'); setSidebarOpen(false); }}>
              <ICONS.practice /> Practice
            </button>
            <button className={`sidebar-menu-item ${currentTab === 'resume' ? 'active' : ''}`} onClick={() => { setCurrentTab('resume'); setSidebarOpen(false); }}>
              <ICONS.resume /> Resume Insights
            </button>
            <button className={`sidebar-menu-item ${currentTab === 'analytics' ? 'active' : ''}`} onClick={() => { setCurrentTab('analytics'); setSidebarOpen(false); }}>
              <ICONS.analytics /> Analytics
            </button>
            <button className={`sidebar-menu-item ${currentTab === 'history' ? 'active' : ''}`} onClick={() => { setCurrentTab('history'); setSidebarOpen(false); }}>
              <ICONS.history /> Interview History
            </button>
            {sessionData && (
              <button className={`sidebar-menu-item ${currentTab === 'report' ? 'active' : ''}`} onClick={() => { setCurrentTab('report'); setSidebarOpen(false); }}>
                <ICONS.analytics /> Detailed Report
              </button>
            )}
            <button className={`sidebar-menu-item ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => { setCurrentTab('settings'); setSidebarOpen(false); }}>
              <ICONS.settings /> Settings
            </button>
          </nav>
        </div>

        {/* Minimal Footer Status inside Sidebar */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>AI Engine Active</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>v2.4</span>
        </div>
      </aside>

      {/* RIGHT SIDE CONTENT CONTAINER */}
      <main className="dashboard-content-main">
        
        {/* 2. TOP NAV BAR CONTROLS */}
        <header className="dashboard-topbar-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Mobile hamburger menu */}
            <button className="topbar-nav__hamburger" onClick={() => setSidebarOpen(prev => !prev)} title="Toggle Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Breadcrumb Title */}
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Smith AI</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>
                {currentTab === 'dashboard' ? 'Overview' :
                 currentTab === 'history' ? 'Interview History' :
                 currentTab === 'report' ? 'Detailed Evaluation' :
                 currentTab === 'analytics' ? 'Analytics Overview' :
                 currentTab === 'resume' ? 'Resume Intelligence' :
                 currentTab === 'practice' ? 'Coding Practice' :
                 currentTab === 'settings' ? 'Settings' : 'Platform'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Developed by CipherFlux Labs Badge */}
            <CipherFluxBadge />

            {/* Theme Toggle */}
            <button className="topbar-nav__icon-btn" onClick={toggleTheme} title="Toggle Dark/Light Theme">
              {theme === 'light' ? <ICONS.moon /> : <ICONS.sun />}
            </button>

            {/* Notifications */}
            <button className="topbar-nav__icon-btn" title="Notifications" style={{ position: 'relative' }}>
              <ICONS.bell />
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}></span>
            </button>

            {/* User Profile Chip */}
            <div style={{ position: 'relative' }}>
              <button className="topbar-nav__profile-chip" onClick={() => setProfileMenuOpen(!profileMenuOpen)} title="User Menu" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: '24px', padding: '4px 12px 4px 4px', cursor: 'pointer' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="topbar-nav__profile-info" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span className="topbar-nav__profile-name" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.2' }}>
                    {profile.name && profile.name.trim() ? profile.name : 'Alex Morgan'}
                  </span>
                  <span className="topbar-nav__profile-role" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                    {profile.role || 'Software Engineer'}
                  </span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6, transform: profileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {profileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <button onClick={() => { setCurrentTab('settings'); setProfileMenuOpen(false); }} className="profile-dropdown-item">
                    <ICONS.settings />
                    Settings
                  </button>
                  <button onClick={() => { 
                    localStorage.removeItem('smith_user_profile');
                    localStorage.removeItem('smith_interview_history');
                    sessionStorage.removeItem('smith_session_data');
                    window.location.href = '/interview';
                  }} className="profile-dropdown-item profile-dropdown-item--danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC TAB PAGES CONTAINER */}
        <div key={currentTab} className="apple-tab-animate" style={{ flexGrow: 1 }}>
          
          {/* TAB A: MAIN DASHBOARD VIEW */}
          {currentTab === 'dashboard' && (
            <div className="dashboard-grid-layout">
              
              {/* Left / Center Main Column */}
              <div className="dashboard-col-left">
                <div>
                  <div className="dashboard-welcome-label">Welcome back, {profile.name.split(' ')[0]} 👋</div>
                  <h1 className="dashboard-hero-title">Ready for your next<br />AI interview?</h1>
                  <p className="dashboard-hero-subtitle">
                    Launch a real-time mock evaluation powered by Smith AI<br />and receive comprehensive hiring feedback.
                  </p>
                </div>

                {/* Circular Start Interview Action Circle */}
                <div className="start-interview-interactive-box">
                  <div className="outer-glow-ring-1" />
                  <div className="outer-glow-ring-2" />
                  <button className="main-cta-circle-btn" onClick={onRestart}>
                    <div className="main-cta-circle-btn__logo">
                      <SmithLogo size={46} />
                    </div>
                    <span className="main-cta-circle-btn__brand">Smith AI</span>
                    <span className="main-cta-circle-btn__action">Start Interview</span>
                  </button>

                  <HandDrawnArrow />
                  <div className="click-start-pointer-text" style={{ bottom: '-30px', left: '90px' }}>
                    <span>Click to start</span>
                    <span>your interview</span>
                  </div>
                </div>

                {/* Bottom Interview Tips card */}
                <div className="dashboard-tips-card">
                  <div className="tips-card__content">
                    <span className="tips-card__icon" style={{ fontSize: '1.3rem' }}>💡</span>
                    <div>
                      <div className="tips-card__title">Pro Interview Tip</div>
                      <p className="tips-card__text">
                        State your thought process out loud when tackling algorithmic and system design questions.
                      </p>
                    </div>
                  </div>
                  <button className="tips-card__btn" onClick={() => setCurrentTab('practice')}>
                    Practice Problems
                  </button>
                </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="dashboard-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Performance Overview Grid (circular progress charts) */}
                <div className="performance-overview-card">
                  <div className="card-header-row">
                    <h3>Performance Overview</h3>
                    {history.length > 0 && (
                      <button className="card-header-row__link" style={{ background: 'none', border: 'none' }} onClick={() => sessionData ? setCurrentTab('report') : setCurrentTab('history')}>
                        View Details →
                      </button>
                    )}
                  </div>

                  {history.length === 0 && !sessionData ? (
                    <div style={{ textAlign: 'center', padding: '28px 16px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '16px', lineHeight: '1.4' }}>
                        Complete your first interview to unlock performance analytics.
                      </p>
                      <button 
                        onClick={onRestart}
                        style={{ padding: '8px 18px', background: 'var(--accent)', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' }}
                      >
                        Start Interview
                      </button>
                    </div>
                  ) : (
                    <div className="overview-mini-cards-grid">
                      <PerformanceIndicatorChart score={currentMetrics.accuracy} title="Accuracy" color="#3b82f6" />
                      <PerformanceIndicatorChart score={currentMetrics.confidence} title="Confidence" color="#10b981" />
                      <PerformanceIndicatorChart score={currentMetrics.logicalThinking} title="Logical" color="#8b5cf6" />
                      <PerformanceIndicatorChart score={currentMetrics.overall} title="Overall" color="#f59e0b" />
                    </div>
                  )}
                </div>

                {/* Recent Interviews attempted list */}
                <div className="recent-interviews-card">
                  <div className="card-header-row">
                    <h3>Recent Sessions</h3>
                    <button className="card-header-row__link" style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => setCurrentTab('history')}>
                      View All
                    </button>
                  </div>
                  <div className="recent-interviews-list">
                    {displayAttempts.length === 0 ? (
                      <div className="empty-state" style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="empty-state__icon" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📋</div>
                        <div className="empty-state__title" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>No interviews yet</div>
                        <div className="empty-state__desc" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Complete your first mock interview to see results here.</div>
                        <button className="empty-state__cta" style={{ padding: '6px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }} onClick={onRestart}>Start Interview</button>
                      </div>
                    ) : (
                      displayAttempts.map((attempt, index) => {
                        const Icon = index === 0 ? ICONS.code : index === 1 ? ICONS.database : ICONS.layers;
                        const hasScore = attempt.score !== null && attempt.score !== undefined;
                        const scoreBadgeColor = hasScore && attempt.score >= 80 ? 'var(--success)' : 'var(--warning)';
                        const scoreBadgeBg = hasScore && attempt.score >= 80 ? 'var(--success-dim)' : 'var(--warning-dim)';

                        return (
                          <div key={attempt.id} className="recent-interview-item" onClick={() => handleSelectAttempt(attempt)}>
                            <div className="recent-interview-item__left">
                              <div className="recent-interview-item__icon">
                                <Icon />
                              </div>
                              <div>
                                <div className="recent-interview-item__title">{attempt.role}</div>
                                <div className="recent-interview-item__date">{attempt.date}</div>
                              </div>
                            </div>
                            <div className="recent-interview-item__right">
                              <span 
                                className="recent-interview-item__score-badge" 
                                style={{ color: scoreBadgeColor, backgroundColor: scoreBadgeBg }}
                              >
                                {hasScore ? `${attempt.score}%` : 'N/A'}
                              </span>
                              <span className="recent-interview-item__arrow">
                                <ICONS.chevronRight />
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Quote card with robot avatar */}
                <div className="quote-robot-card">
                  <div className="quote-robot-card__content">
                    <p className="quote-robot-card__quote">
                      "The more you practice, the higher your confidence."
                    </p>
                    <span className="quote-robot-card__author">— Smith AI Assistant</span>
                  </div>
                  <div className="quote-robot-card__robot">
                    <RobotIllustration />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB B: HISTORY TAB VIEW */}
          {currentTab === 'history' && (
            <div style={{ padding: '36px 40px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
              <div className="overview-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Assessment History Logs</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review and inspect detailed reports of your past mock interviews.</p>
                  </div>
                  <button onClick={onRestart} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                    + New Interview
                  </button>
                </div>

                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📁</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No history records found</div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Start your first mock interview round to build your history track.</p>
                    <button onClick={onRestart} style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Start Interview</button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Date / Time</th>
                          <th>Target Role</th>
                          <th>Overall</th>
                          <th>Accuracy</th>
                          <th>Confidence</th>
                          <th>Logical</th>
                          <th>Verdict</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h, i) => (
                          <tr key={h.id || i}>
                            <td className="text-date">{h.date}</td>
                            <td className="text-bold">{h.role} <span className="level-badge">{h.level}</span></td>
                            <td className="text-score">{h.score !== null && h.score !== undefined ? `${h.score}%` : 'N/A'}</td>
                            <td>{h.accuracy !== null && h.accuracy !== undefined ? `${h.accuracy}%` : 'N/A'}</td>
                            <td>{h.confidence !== null && h.confidence !== undefined ? `${h.confidence}%` : 'N/A'}</td>
                            <td>{h.logicalThinking !== null && h.logicalThinking !== undefined ? `${h.logicalThinking}%` : 'N/A'}</td>
                            <td>
                              <span className="verdict-tag" data-val={h.result}>{h.result}</span>
                            </td>
                            <td>
                              <button 
                                className="action-load-btn" 
                                onClick={() => {
                                  onLoadHistorySession(h);
                                  setCurrentTab('report');
                                }}
                              >
                                View Report
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB C: DETAILED EVALUATION REPORT */}
          {currentTab === 'report' && sessionData && parsedSession && (
            <div style={{ padding: '36px 40px', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>Smith Assessment Evaluation Report</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>{sessionData.role} &middot; {sessionData.level}</p>
                </div>
                <button className="new-interview-btn" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }} onClick={onRestart}>
                  + New Interview
                </button>
              </div>

              {/* Score summary block */}
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
                <div className="overview-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                      <circle stroke="var(--bg-elevated)" fill="transparent" strokeWidth="8" r="50" cx="60" cy="60" />
                      <circle 
                        stroke="var(--accent)" 
                        fill="transparent" 
                        strokeWidth="8" 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        style={{
                          strokeDasharray: 314,
                          strokeDashoffset: 314 - (314 * currentMetrics.overall) / 100
                        }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentMetrics.overall}%</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="verdict-tag" data-val={parsedSession.hiringRecommendation || 'Borderline'} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                      {parsedSession.hiringRecommendation || 'Borderline'}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Overall Score</h3>
                  </div>
                </div>

                <div className="overview-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent)' }}>Evaluation Overview</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {parsedSession.hiringRecommendation && `Hiring Recommendation: ${parsedSession.hiringRecommendation}. `}
                    {parsedSession.overallRating && `Overall Rating: ${parsedSession.overallRating}. `}
                    Review the key strengths and improvement feedback compiled by Smith AI below.
                  </p>
                </div>
              </div>

              {/* Strengths & Weaknesses row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="overview-card" style={{ padding: '24px' }}>
                  <h4 style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '16px', fontSize: '1.05rem' }}>Key Strengths</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                    {(parsedSession.strengths || []).map((s, i) => (
                      <li key={i} style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span> {s}
                      </li>
                    ))}
                    {(parsedSession.strengths || []).length === 0 && <li style={{ color: 'var(--text-secondary)' }}>No strengths feedback available.</li>}
                  </ul>
                </div>

                <div className="overview-card" style={{ padding: '24px' }}>
                  <h4 style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: '16px', fontSize: '1.05rem' }}>Improvement Areas</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                    {(() => {
                      const list = [];
                      if (parsedSession.weaknesses) list.push(...parsedSession.weaknesses);
                      if (parsedSession.technicalGaps) list.push(...parsedSession.technicalGaps);
                      return [...new Set(list)].filter(Boolean);
                    })().map((w, i) => (
                      <li key={i} style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--warning)', fontWeight: 800 }}>⚠</span> {w}
                      </li>
                    ))}
                    {(() => {
                      const list = [];
                      if (parsedSession.weaknesses) list.push(...parsedSession.weaknesses);
                      if (parsedSession.technicalGaps) list.push(...parsedSession.technicalGaps);
                      return [...new Set(list)].filter(Boolean);
                    })().length === 0 && <li style={{ color: 'var(--text-secondary)' }}>No specific improvement areas flagged.</li>}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="overview-card" style={{ padding: '24px' }}>
                <h4 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '16px', fontSize: '1.05rem' }}>Preparation Recommendations</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                  {(() => {
                    const list = [];
                    if (parsedSession.topicsToStudy) parsedSession.topicsToStudy.forEach(t => list.push(`Study: ${t}`));
                    if (parsedSession.suggestedPractice) parsedSession.suggestedPractice.forEach(p => list.push(`Practice: ${p}`));
                    return [...new Set(list)].filter(Boolean);
                  })().map((r, i) => (
                    <li key={i} style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--accent)' }}>•</span> {r}
                    </li>
                  ))}
                  {(() => {
                    const list = [];
                    if (parsedSession.topicsToStudy) parsedSession.topicsToStudy.forEach(t => list.push(`Study: ${t}`));
                    if (parsedSession.suggestedPractice) parsedSession.suggestedPractice.forEach(p => list.push(`Practice: ${p}`));
                    return [...new Set(list)].filter(Boolean);
                  })().length === 0 && <li style={{ color: 'var(--text-secondary)' }}>Keep up the great work! No additional preparation required.</li>}
                </ul>
              </div>
            </div>
          )}

          {/* TAB D: ANALYTICS PROGRESSION GRAPH */}
          {currentTab === 'analytics' && (
            <AnalyticsTab history={history} currentMetrics={currentMetrics} />
          )}

          {/* TAB E: RESUME INSIGHTS */}
          {currentTab === 'resume' && (
            <ResumeInsightsTab 
              profile={profile} 
              setProfile={setProfile}
              onUpload={handleResumeUpload}
              isUploading={isUploading}
            />
          )}

          {/* TAB F: PRACTICE TAB */}
          {currentTab === 'practice' && (
            <PracticeTab profile={profile} onStartPractice={onRestart} />
          )}

          {/* TAB G: RESOURCES */}
          {currentTab === 'resources' && (
            <div style={{ padding: '36px 40px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
              <div className="overview-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Assessment Resources</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Recommended learning materials and architectural guides.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div style={{ border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '20px', background: 'var(--bg-elevated)' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>System Design Primer</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>Complete open-source guide covering standard system architecture, scalability, and distributed design patterns.</p>
                    <a href="https://github.com/donnemartin/system-design-primer" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>Explore Guide →</a>
                  </div>
                  <div style={{ border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '20px', background: 'var(--bg-elevated)' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>MDN Web Documentation</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>Authoritative reference for JavaScript APIs, CSS layouts, event handlers, and web performance tuning.</p>
                    <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>Explore Docs →</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB H: SETTINGS FOR CHANGING PROFILE DETAILS */}
          {currentTab === 'settings' && (
            <div style={{ padding: '36px 40px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Account & Interview Settings</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>Configure your target role, experience, voice preferences, and evaluation settings.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem('smith_user_profile', JSON.stringify(profile));
                setToast('Settings saved successfully!');
                setTimeout(() => setToast(null), 3000);
              }}>

                {/* Profile Settings */}
                <div style={{ marginBottom: '36px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>Profile Details</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div style={{ border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-card)' }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        value={profile.name} 
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Interview Preferences */}
                <div style={{ marginBottom: '36px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>Target Interview Preferences</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {/* Role */}
                    <div style={{ border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '18px', backgroundColor: 'var(--bg-card)' }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                        Target Role
                      </label>
                      <select 
                        value={profile.role} 
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Backend Engineer">Backend Engineer</option>
                        <option value="Frontend Engineer">Frontend Engineer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="AI Engineer">AI Engineer</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Bartender">Bartender</option>
                      </select>
                    </div>

                    {/* Level */}
                    <div style={{ border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '18px', backgroundColor: 'var(--bg-card)' }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                        Experience Level
                      </label>
                      <select 
                        value={profile.level} 
                        onChange={(e) => setProfile({ ...profile, level: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        <option value="Fresher">Fresher (0-1 years)</option>
                        <option value="Junior">Junior (1-3 years)</option>
                        <option value="Mid Level">Mid Level (3-5 years)</option>
                        <option value="Senior">Senior (5+ years)</option>
                      </select>
                    </div>

                    {/* Difficulty */}
                    <div style={{ border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '18px', backgroundColor: 'var(--bg-card)' }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                        Question Difficulty
                      </label>
                      <select 
                        value={profile.difficulty} 
                        onChange={(e) => setProfile({ ...profile, difficulty: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div style={{ border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '18px', backgroundColor: 'var(--bg-card)' }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                        Interview Language
                      </label>
                      <select 
                        value={profile.language || 'English'} 
                        onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        <option value="English">English</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Voice Settings */}
                <div style={{ marginBottom: '36px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>Voice & Audio Configuration</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div style={{ border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>AI Voice Speech</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enable spoken audio responses</div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', flexShrink: 0 }}>
                        <input type="checkbox" checked={profile.voiceEnabled} onChange={(e) => setProfile({...profile, voiceEnabled: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: profile.voiceEnabled ? 'var(--accent)' : 'var(--border-medium)', transition: '.3s', borderRadius: '34px' }}>
                          <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.3s', borderRadius: '50%', transform: profile.voiceEnabled ? 'translateX(16px)' : 'translateX(0)' }} />
                        </span>
                      </label>
                    </div>

                    <div style={{ border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Speech Speed</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Adjust voice playback rate</div>
                      </div>
                      <select value={profile.speechSpeed} onChange={(e) => setProfile({ ...profile, speechSpeed: e.target.value })} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <option value="Slow">Slow</option>
                        <option value="Normal">Normal</option>
                        <option value="Fast">Fast</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit buttons */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button 
                    type="submit" 
                    style={{ padding: '12px 28px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
                  >
                    Save Settings
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      const defaults = { 
                        name: 'Alex Morgan', 
                        role: 'Software Engineer',
                        level: 'Fresher',
                        language: 'English',
                        difficulty: 'Beginner',
                        voiceEnabled: true,
                        speechSpeed: 'Normal',
                        micSensitivity: 'Normal',
                        autoSilence: true,
                        saveRecordings: true
                      };
                      setProfile(defaults);
                      localStorage.setItem('smith_user_profile', JSON.stringify(defaults));
                      setToast('Reset to default preferences');
                      setTimeout(() => setToast(null), 3000);
                    }}
                    style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-medium)', borderRadius: '8px', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}
                  >
                    Reset Defaults
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="toast-notification">
          <div className="toast-notification__icon">✓</div>
          <span>{toast}</span>
        </div>
      )}

      {/*  Apple iOS & Huawei Floating Bottom Navigation Dock (Mobile Devices) */}
      <nav className="mobile-os-bottom-dock">
        <button className={`mobile-os-dock-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>
          <ICONS.dashboard />
          <span>Home</span>
        </button>
        <button className="mobile-os-dock-item" onClick={onRestart}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>Start</span>
        </button>
        <button className={`mobile-os-dock-item ${currentTab === 'practice' ? 'active' : ''}`} onClick={() => setCurrentTab('practice')}>
          <ICONS.practice />
          <span>Code</span>
        </button>
        <button className={`mobile-os-dock-item ${currentTab === 'resume' ? 'active' : ''}`} onClick={() => setCurrentTab('resume')}>
          <ICONS.resume />
          <span>Resume</span>
        </button>
        <button className={`mobile-os-dock-item ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => setCurrentTab('settings')}>
          <ICONS.settings />
          <span>Settings</span>
        </button>
      </nav>

      {/*  iOS Home Indicator Line */}
      <div className="ios-home-indicator" />

    </div>
  );
}
