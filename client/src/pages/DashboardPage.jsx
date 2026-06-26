import { useState, useMemo, useEffect, useRef } from 'react';
import { uploadResume } from '../services/api';
import AnalyticsTab from '../components/AnalyticsTab';
import ResumeInsightsTab from '../components/ResumeInsightsTab';
import PracticeTab from '../components/PracticeTab';

// Custom Hexagon Logo containing "S" for Smith AI
function SmithLogo({ size = 24 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="rgba(59, 130, 246, 0.08)"
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

// Hand-Drawn Arrow pointer
function HandDrawnArrow() {
  return (
    <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: '-40px', left: '20px', zIndex: 10 }}>
      {/* Dashed curved arrow line */}
      <path 
        d="M20 70C25 50 35 30 55 20" 
        stroke="var(--accent)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeDasharray="4 4" 
      />
      {/* Arrow head pointing up-right */}
      <path 
        d="M48 20L56 19L55 27" 
        stroke="var(--accent)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

// Cute Robot Illustration
function RobotIllustration() {
  return (
    <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <rect x="20" y="24" width="60" height="46" rx="18" fill="var(--bg-elevated)" stroke="var(--border-medium)" strokeWidth="2.5" />
      {/* Screen */}
      <rect x="27" y="31" width="46" height="32" rx="10" fill="#0f172a" />
      {/* Glowing Eyes */}
      <ellipse cx="41" cy="47" rx="4.5" ry="3.5" fill="#3b82f6" />
      <ellipse cx="59" cy="47" rx="4.5" ry="3.5" fill="#3b82f6" />
      {/* Antenna */}
      <line x1="50" y1="24" x2="50" y2="12" stroke="var(--border-medium)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="10" r="3.5" fill="#3b82f6" />
      {/* Audio Wave lines under chin */}
      <path d="M42 78H58M46 83H54M38 73H62" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Icons
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
  const hasScore = score !== null && score !== undefined;
  const displayScore = hasScore ? score : 0;
  const radius = 50;
  const stroke = 6.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const rating = !hasScore ? '—' : score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'Needs Imp.';

  return (
    <div className="performance-overview-mini-card">
      <div className="overview-mini-card__text">
        <span className="overview-mini-card__title">{title}</span>
        <span className="overview-mini-card__score">{hasScore ? `${score}%` : '—'}</span>
        <span className="overview-mini-card__rating">{rating}</span>
      </div>
      <div className="overview-mini-card__chart">
        <svg viewBox="0 0 100 100" className="mini-donut-chart">
          <circle
            stroke="var(--bg-elevated)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={50}
            cy={50}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out' }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default function DashboardPage({ sessionData, onRestart, onLoadHistorySession }) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('smith_dashboard_theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setToast('Uploading and analyzing resume...');
    try {
      const resumeContext = await uploadResume(file);
      const newProfile = { 
        ...profile, 
        resumeContext, 
        resumeName: file.name,
        resumeDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        resumeSize: `${Math.round(file.size / 1024)} KB`
      };
      setProfile(newProfile);
      localStorage.setItem('smith_user_profile', JSON.stringify(newProfile));
      setToast('Resume analyzed successfully!');
    } catch (err) {
      console.error(err);
      setToast('Failed to parse resume: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  // User Profile details
    const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('smith_user_profile');
      const parsed = saved ? JSON.parse(saved) : {};
      return { 
        name: parsed.name || 'Rahul Sharma', 
        role: parsed.role || 'Software Engineer',
        level: parsed.level || 'Fresher',
        language: parsed.language || 'English',
        difficulty: parsed.difficulty || 'Beginner',
        voiceEnabled: parsed.voiceEnabled !== undefined ? parsed.voiceEnabled : true,
        speechSpeed: parsed.speechSpeed || 'Normal',
        micSensitivity: parsed.micSensitivity || 'Normal',
        autoSilence: parsed.autoSilence !== undefined ? parsed.autoSilence : true,
        saveRecordings: parsed.saveRecordings !== undefined ? parsed.saveRecordings : true
      };
    } catch {
      return { 
        name: 'Rahul Sharma', 
        role: 'Software Engineer',
        level: 'Fresher',
        language: 'JavaScript',
        difficulty: 'Beginner',
        voiceEnabled: true,
        speechSpeed: 'Normal',
        micSensitivity: 'Normal',
        autoSilence: true,
        saveRecordings: true
      };
    }
  });

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('smith_interview_history') || '[]');
      setHistory(saved);
    } catch (e) {
      console.error(e);
    }
  }, [sessionData]);

  // Apply theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('smith_dashboard_theme', theme);
  }, [theme]);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleCloseMenu = (e) => {
      if (!e.target.closest('.topbar-nav__profile-chip')) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleCloseMenu);
    return () => document.removeEventListener('click', handleCloseMenu);
  }, [profileMenuOpen]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  // Parse active session report data
  const parsedSession = useMemo(() => {
    if (!sessionData?.analysis) return null;
    try {
      const cleanJson = sessionData.analysis.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return null;
    }
  }, [sessionData]);

  // Switch to report tab automatically when sessionData changes (meaning a report was loaded)
  useEffect(() => {
    if (sessionData && parsedSession) {
      setCurrentTab('report');
    }
  }, [sessionData, parsedSession]);

  // Default benchmark scores if no history is loaded
  const currentMetrics = useMemo(() => {
    if (parsedSession) {
      const accuracyScore        = parsedSession.accuracyScore ?? parsedSession.technicalScore ?? 80;
      const confidenceScore      = parsedSession.confidenceScore ?? 75;
      const logicalThinkingScore = parsedSession.logicalThinkingScore ?? parsedSession.problemSolvingScore ?? 80;
      
      const scores = [accuracyScore, confidenceScore, logicalThinkingScore].filter(s => s !== null);
      const overallScore = parsedSession.overallScore ?? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      return {
        accuracy: accuracyScore,
        confidence: confidenceScore,
        logicalThinking: logicalThinkingScore,
        overall: overallScore
      };
    } else if (history.length > 0) {
      // average of history
      const accs = history.map(h => h.accuracy).filter(s => s !== null);
      const confs = history.map(h => h.confidence).filter(s => s !== null);
      const logs = history.map(h => h.logicalThinking).filter(s => s !== null);
      const ovr = history.map(h => h.score).filter(s => s !== null);

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

  const totalSessions = history.length;

  return (
    <div className="dashboard-root">
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* 1. LEFT SIDEBAR PANEL */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar--open' : ''}`}>
        <div>
          {/* Sidebar Header Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SmithLogo size={32} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
                Smith AI
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.5px' }}>
                AI Interviewer
              </span>
            </div>
          </div>

          {/* Navigation Menu List */}
          <nav className="sidebar-menu-list">
            <button className={`sidebar-menu-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setCurrentTab('dashboard'); setSidebarOpen(false); }}>
              <ICONS.dashboard /> Dashboard
            </button>
            <button className={`sidebar-menu-item ${currentTab === 'history' ? 'active' : ''}`} onClick={() => { setCurrentTab('history'); setSidebarOpen(false); }}>
              <ICONS.history /> Interview History
            </button>
            {sessionData && (
              <button className={`sidebar-menu-item ${currentTab === 'report' ? 'active' : ''}`} onClick={() => { setCurrentTab('report'); setSidebarOpen(false); }}>
                <ICONS.analytics /> Detailed Report
              </button>
            )}
            <button className={`sidebar-menu-item ${currentTab === 'analytics' ? 'active' : ''}`} onClick={() => { setCurrentTab('analytics'); setSidebarOpen(false); }}>
              <ICONS.analytics /> Analytics
            </button>
            <button className={`sidebar-menu-item ${currentTab === 'resume' ? 'active' : ''}`} onClick={() => { setCurrentTab('resume'); setSidebarOpen(false); }}>
              <ICONS.resume /> Resume Insights
            </button>
            <button className={`sidebar-menu-item ${currentTab === 'practice' ? 'active' : ''}`} onClick={() => { setCurrentTab('practice'); setSidebarOpen(false); }}>
              <ICONS.practice /> Practice
            </button>
            <button className={`sidebar-menu-item ${currentTab === 'resources' ? 'active' : ''}`} onClick={() => { setCurrentTab('resources'); setSidebarOpen(false); }}>
              <ICONS.resources /> Resources
            </button>
            <button className={`sidebar-menu-item ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => { setCurrentTab('settings'); setSidebarOpen(false); }}>
              <ICONS.settings /> Settings
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Session Count Card */}
        <div className="sidebar-streak-card">
          <div className="streak-card__title">Keep Learning!</div>
          <div className="streak-card__sub">Your interview streak</div>
          <div className="streak-card__badge-row">
            <div style={{ fontSize: '1.5rem' }}>🛡️</div>
            <div className="streak-card__days">{totalSessions}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>days</div>
          </div>
          <div className="streak-card__sub" style={{ marginBottom: '8px' }}>{totalSessions > 0 ? 'Great going! 🔥' : 'Start your first interview'}</div>
          <div className="streak-card__progress-bar">
            <div className="streak-card__progress-fill" style={{ width: `${Math.min(100, (totalSessions / 10) * 100)}%` }} />
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE CONTENT CONTAINER */}
      <main className="dashboard-content-main">
        
        {/* 2. TOP NAV BAR CONTROLS */}
        <header className="dashboard-topbar-nav">
          {/* Mobile hamburger menu */}
          <button className="topbar-nav__hamburger" onClick={() => setSidebarOpen(prev => !prev)} title="Toggle Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button className="topbar-nav__icon-btn" onClick={toggleTheme} title="Toggle Light/Dark Theme">
            {theme === 'light' ? <ICONS.moon /> : <ICONS.sun />}
          </button>

          {/* Notifications bell */}
          <button className="topbar-nav__icon-btn" title="Notifications">
            <ICONS.bell />
          </button>

          {/* User Profile Chip */}
          <div style={{ position: 'relative' }}>
            <button className="topbar-nav__profile-chip" onClick={() => setProfileMenuOpen(!profileMenuOpen)} title="User Menu">
              {/* Illustrated Generic Avatar Placeholder */}
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(79, 110, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="topbar-nav__profile-info">
                <span className="topbar-nav__profile-name">{profile.name && profile.name.trim() ? profile.name : 'Candidate'}</span>
                <span className="topbar-nav__profile-role">{profile.role || 'Software Engineer'}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', opacity: 0.6, transform: profileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {profileMenuOpen && (
              <div className="profile-dropdown-menu">
                <button onClick={() => { setCurrentTab('settings'); setProfileMenuOpen(false); }} className="profile-dropdown-item">
                  <ICONS.settings size={16} />
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
        </header>

        {/* 3. DYNAMIC TAB PAGES CONTAINER */}
        <div style={{ flexGrow: 1 }}>
          
          {/* TAB A: MAIN DASHBOARD VIEW */}
          {currentTab === 'dashboard' && (
            <div className="dashboard-grid-layout">
              
              {/* Left / Center Main Column */}
              <div className="dashboard-col-left">
                <div>
                  <div className="dashboard-welcome-label">Welcome back, {profile.name.split(' ')[0]}! 👋</div>
                  <h1 className="dashboard-hero-title">Ready for your next<br />interview?</h1>
                  <p className="dashboard-hero-subtitle">
                    Start a new mock interview with Smith AI<br />and improve your skills.
                  </p>
                </div>

                {/* Circular Start Interview Action Circle */}
                <div className="start-interview-interactive-box">
                  <div className="outer-glow-ring-1" />
                  <div className="outer-glow-ring-2" />
                  <button className="main-cta-circle-btn" onClick={onRestart}>
                    <div className="main-cta-circle-btn__logo">
                      <SmithLogo size={42} />
                    </div>
                    <span className="main-cta-circle-btn__brand">Smith AI</span>
                    <span className="main-cta-circle-btn__action">Start Interview</span>
                  </button>

                  {/* Curving arrow pointer indicator */}
                  <HandDrawnArrow />
                  <div className="click-start-pointer-text" style={{ bottom: '-30px', left: '90px' }}>
                    <span>Click to start</span>
                    <span>your interview</span>
                  </div>
                </div>

                {/* Bottom Interview Tips card */}
                <div className="dashboard-tips-card">
                  <div className="tips-card__content">
                    <span className="tips-card__icon" style={{ fontSize: '1.2rem' }}>💡</span>
                    <div>
                      <div className="tips-card__title">Interview Tips</div>
                      <p className="tips-card__text">
                        Be confident, speak clearly and take your time to think before answering.
                      </p>
                    </div>
                  </div>
                  <button className="tips-card__btn" onClick={() => setCurrentTab('practice')}>
                    View Tips
                  </button>
                </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="dashboard-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Performance Overview Grid (circular progress charts) */}
                <div className="performance-overview-card">
                  <div className="card-header-row">
                    <h3>Performance Overview</h3>
                    <button className="card-header-row__link" style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => sessionData ? setCurrentTab('report') : setCurrentTab('history')}>
                      View All
                    </button>
                  </div>
                  <div className="overview-mini-cards-grid">
                    <PerformanceIndicatorChart score={currentMetrics.accuracy} title="Accuracy" color="#3b82f6" />
                    <PerformanceIndicatorChart score={currentMetrics.confidence} title="Confidence" color="#10b981" />
                    <PerformanceIndicatorChart score={currentMetrics.logicalThinking} title="Logical Thinking" color="#8b5cf6" />
                    <PerformanceIndicatorChart score={currentMetrics.overall} title="Overall Score" color="#f97316" />
                  </div>
                </div>

                {/* Recent Interviews attempted list */}
                <div className="recent-interviews-card">
                  <div className="card-header-row">
                    <h3>Recent Interviews</h3>
                    <button className="card-header-row__link" style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => setCurrentTab('history')}>
                      View All
                    </button>
                  </div>
                  <div className="recent-interviews-list">
                    {displayAttempts.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state__icon">📋</div>
                        <div className="empty-state__title">No interviews yet</div>
                        <div className="empty-state__desc">Complete your first mock interview to see results here.</div>
                        <button className="empty-state__cta" onClick={onRestart}>Start Interview</button>
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
                      "The more you practice, the better you become."
                    </p>
                    <span className="quote-robot-card__author">— Smith AI</span>
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
            <div style={{ padding: '40px', maxWidth: '1200px', width: '100%' }}>
              <div className="overview-card flex-col">
                <div className="card-header-flex">
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Assessment History Logs</h3>
                    <p className="card-subtext" style={{ color: 'var(--text-secondary)' }}>Review all your previous attempts on the platform.</p>
                  </div>
                </div>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No actual mock interview records found yet. Start an interview to create a log entry!
                  </div>
                ) : (
                  <div className="table-responsive" style={{ marginTop: '20px' }}>
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
            <div style={{ padding: '40px', maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="dashboard-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Smith Assessment Report</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{sessionData.role} &middot; {sessionData.level}</p>
                </div>
                <button className="new-interview-btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={onRestart}>
                  + New Interview
                </button>
              </div>

              {/* Score summary block */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="overview-card overall-hero-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div className="hero-radial-box">
                    <div className="radial-circle" style={{ width: '100px', height: '100px' }}>
                      <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
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
                      <div className="circle-score-val" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.4rem', fontWeight: 800 }}>{currentMetrics.overall}%</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="rating-badge" data-rating={parsedSession.overallRating || 'Good'} style={{ display: 'inline-block', marginBottom: '8px' }}>
                      {parsedSession.overallRating || 'Good'}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Overall Score</h3>
                  </div>
                </div>

                <div className="overview-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Interview Performance Breakdown</h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {parsedSession.hiringRecommendation && `Hiring Recommendation: ${parsedSession.hiringRecommendation}. `}
                    {parsedSession.overallRating && `Overall Rating: ${parsedSession.overallRating}. `}
                    Review the detailed breakdowns below for strengths, improvement areas, and preparation recommendations.
                  </p>
                </div>
              </div>

              {/* Strengths & Weaknesses row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="overview-card" style={{ padding: '24px' }}>
                  <h4 className="list-heading text-success" style={{ fontWeight: 700, marginBottom: '16px' }}>Key Strengths</h4>
                  <ul className="dashboard-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(parsedSession.strengths || []).map((s, i) => (
                      <li key={i} className="list-item item--strength" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>✓ {s}</li>
                    ))}
                    {(parsedSession.strengths || []).length === 0 && <li style={{ color: 'var(--text-secondary)' }}>No feedback available.</li>}
                  </ul>
                </div>

                <div className="overview-card" style={{ padding: '24px' }}>
                  <h4 className="list-heading text-danger" style={{ fontWeight: 700, marginBottom: '16px' }}>Improvement Areas</h4>
                  <ul className="dashboard-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(() => {
                      const list = [];
                      if (parsedSession.weaknesses) list.push(...parsedSession.weaknesses);
                      if (parsedSession.technicalGaps) list.push(...parsedSession.technicalGaps);
                      return [...new Set(list)].filter(Boolean);
                    })().map((w, i) => (
                      <li key={i} className="list-item item--weakness" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>⚠ {w}</li>
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
                <h4 className="list-heading text-primary" style={{ fontWeight: 700, marginBottom: '16px' }}>Preparation Recommendations</h4>
                <ul className="dashboard-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(() => {
                    const list = [];
                    if (parsedSession.topicsToStudy) parsedSession.topicsToStudy.forEach(t => list.push(`Study: ${t}`));
                    if (parsedSession.suggestedPractice) parsedSession.suggestedPractice.forEach(p => list.push(`Practice: ${p}`));
                    return [...new Set(list)].filter(Boolean);
                  })().map((r, i) => (
                    <li key={i} className="list-item item--recommendation" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>• {r}</li>
                  ))}
                  {(() => {
                    const list = [];
                    if (parsedSession.topicsToStudy) parsedSession.topicsToStudy.forEach(t => list.push(`Study: ${t}`));
                    if (parsedSession.suggestedPractice) parsedSession.suggestedPractice.forEach(p => list.push(`Practice: ${p}`));
                    return [...new Set(list)].filter(Boolean);
                  })().length === 0 && <li style={{ color: 'var(--text-secondary)' }}>Keep doing what you are doing! No additional preparation required.</li>}
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
            <ResumeInsightsTab profile={profile} sessionData={sessionData} />
          )}

          {/* TAB F: PRACTICE TAB */}
          {currentTab === 'practice' && (
            <PracticeTab profile={profile} onStartPractice={onRestart} />
          )}

          {/* TAB G: RESOURCES */}
          {currentTab === 'resources' && (
            <div style={{ padding: '40px', maxWidth: '1200px', width: '100%' }}>
              <div className="overview-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Assessment Resources</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>Recommended tutorials and mock sandbox platforms.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '6px' }}>System Design Primer</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>GitHub repository covering standard architectures, scalabilities, and patterns.</p>
                    <a href="https://github.com/donnemartin/system-design-primer" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>Go to resource →</a>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '6px' }}>MDN Web Docs</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Complete guide to JavaScript, CSS layout rules, and DOM manipulation APIs.</p>
                    <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>Go to resource →</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB H: SETTINGS FOR CHANGING PROFILE DETAILS */}
          {currentTab === 'settings' && (
            <div style={{ padding: '40px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Settings</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage your interview preferences and account settings.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem('smith_user_profile', JSON.stringify(profile));
                setToast('Settings saved successfully');
                setTimeout(() => setToast(null), 3000);
              }}>

                {/* Profile & Resume */}
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Profile & Resume</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>Your profile is automatically extracted from your resume using AI.</p>
                  
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(79, 110, 247, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.95rem' }}>Current Resume</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{profile.resumeName || 'No resume uploaded'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {profile.resumeDate ? `Uploaded on ${profile.resumeDate} • ${profile.resumeSize}` : 'Please upload your resume to extract profile details.'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {profile.resumeContext && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            Analyzed <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          style={{ display: 'none' }} 
                          accept=".pdf,.docx" 
                          onChange={handleResumeUpload} 
                        />
                        <button 
                          type="button" 
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', background: 'transparent', fontWeight: 600, fontSize: '0.85rem', cursor: isUploading ? 'wait' : 'pointer', opacity: isUploading ? 0.7 : 1 }}
                        >
                          {isUploading ? 'Analyzing...' : (profile.resumeName ? 'Replace Resume' : 'Upload Resume')}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '16px 20px', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="16" height="16" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h4"></path></svg>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)' }}>View Resume Summary</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>See extracted skills, experience, projects and education</div>
                      </div>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </div>

                {/* Interview Preferences */}
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Interview Preferences</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>Set your role, experience and difficulty level for a personalized interview.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {/* Role */}
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--bg-surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        Target Role
                      </div>
                      <select 
                        value={profile.role} 
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Backend Engineer">Backend Engineer</option>
                        <option value="Frontend Engineer">Frontend Engineer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="AI Engineer">AI Engineer</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                      </select>
                    </div>

                    {/* Level */}
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--bg-surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                        Experience Level
                      </div>
                      <select 
                        value={profile.level} 
                        onChange={(e) => setProfile({ ...profile, level: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        <option value="Fresher">Fresher (0-1 years)</option>
                        <option value="Junior">Junior (1-3 years)</option>
                        <option value="Mid Level">Mid Level (3-5 years)</option>
                        <option value="Senior">Senior (5+ years)</option>
                      </select>
                    </div>

                    {/* Difficulty */}
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--bg-surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        Interview Difficulty
                      </div>
                      <select 
                        value={profile.difficulty} 
                        onChange={(e) => setProfile({ ...profile, difficulty: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    {/* Interview Language */}
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--bg-surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Interview Language
                      </div>
                      <select 
                        value={profile.language || 'English'} 
                        onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
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
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Voice Settings</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>Configure Smith AI voice and speech preferences.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {/* Voice Enabled */}
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', color: 'var(--text-secondary)' }}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Voice Enabled</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enable or disable Smith AI voice</div>
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', flexShrink: 0 }}>
                        <input type="checkbox" checked={profile.voiceEnabled} onChange={(e) => setProfile({...profile, voiceEnabled: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: profile.voiceEnabled ? 'var(--accent)' : 'var(--border-medium)', transition: '.3s', borderRadius: '34px' }}>
                          <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.3s', borderRadius: '50%', transform: profile.voiceEnabled ? 'translateX(16px)' : 'translateX(0)' }} />
                        </span>
                      </label>
                    </div>

                    {/* Speech Speed */}
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', color: 'var(--text-secondary)' }}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Speech Speed</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Adjust how fast Smith speaks</div>
                        </div>
                      </div>
                      <select value={profile.speechSpeed} onChange={(e) => setProfile({ ...profile, speechSpeed: e.target.value })} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <option value="Slow">Slow</option>
                        <option value="Normal">Normal</option>
                        <option value="Fast">Fast</option>
                      </select>
                    </div>

                    {/* Mic Sensitivity */}
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', color: 'var(--text-secondary)' }}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Mic Sensitivity</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Adjust microphone sensitivity</div>
                        </div>
                      </div>
                      <select value={profile.micSensitivity || 'Normal'} onChange={(e) => setProfile({ ...profile, micSensitivity: e.target.value })} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Advanced Settings</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>Additional preferences for better interview experience.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {/* Auto Silence Detection */}
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', color: 'var(--text-secondary)' }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Auto Silence Detection</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automatically detect when you stop speaking</div>
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', flexShrink: 0 }}>
                        <input type="checkbox" checked={profile.autoSilence !== false} onChange={(e) => setProfile({...profile, autoSilence: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: profile.autoSilence !== false ? 'var(--accent)' : 'var(--border-medium)', transition: '.3s', borderRadius: '34px' }}>
                          <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.3s', borderRadius: '50%', transform: profile.autoSilence !== false ? 'translateX(16px)' : 'translateX(0)' }} />
                        </span>
                      </label>
                    </div>

                    {/* Save Interview Recordings */}
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', color: 'var(--text-secondary)' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Save Interview Recordings</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Save audio recordings of your interviews</div>
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', flexShrink: 0 }}>
                        <input type="checkbox" checked={profile.saveRecordings !== false} onChange={(e) => setProfile({...profile, saveRecordings: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: profile.saveRecordings !== false ? 'var(--accent)' : 'var(--border-medium)', transition: '.3s', borderRadius: '34px' }}>
                          <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.3s', borderRadius: '50%', transform: profile.saveRecordings !== false ? 'translateX(16px)' : 'translateX(0)' }} />
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
                  <button 
                    type="submit" 
                    style={{ padding: '12px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', minWidth: '180px', boxShadow: '0 4px 12px rgba(79, 110, 247, 0.3)' }}
                  >
                    Save Settings
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      const defaults = { 
                        name: 'Rahul Sharma', 
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
                      setToast('Reset to defaults');
                      setTimeout(() => setToast(null), 3000);
                    }}
                    style={{ padding: '12px 32px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', minWidth: '160px' }}
                  >
                    Reset to Default
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

    </div>
  );
}
