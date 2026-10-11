import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Flame,
  Download,
  ArrowRight,
  Check,
  Edit3,
  Cpu,
  Layers,
  Settings,
  Shield,
  Activity,
  Award,
  RefreshCw,
  ExternalLink,
  Code2,
  Calendar,
  Building2,
  MapPin,
  Mail,
  User,
  Sliders,
  Terminal,
  Clock,
  ChevronDown,
  X,
  LogIn,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchPracticeStats, fetchInterviewHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PERSONAS = [
  {
    id: 'architect',
    title: 'Principal Architect',
    archetype: 'System & Scale Focus',
    desc: 'Probing & analytical; rigorously stresses bottlenecks, single points of failure, partition tolerance, and design trade-offs.'
  },
  {
    id: 'rigorous',
    title: 'Algorithmic Staff',
    archetype: 'Efficiency & Rigor',
    desc: 'Fast-paced & precise; enforces strict Big-O complexity bounds, edge case verification, and invariant preservation.'
  },
  {
    id: 'collaborative',
    title: 'Founding CTO',
    archetype: 'Pragmatic & Holistic',
    desc: 'Balances high-velocity engineering with technical debt management, maintainability, and domain ergonomics.'
  }
];

const LANGUAGES = [
  { id: 'python', label: 'Python 3.12 (Native 50ms)', runtime: 'CPython 3.12' },
  { id: 'javascript', label: 'JavaScript (Node 22)', runtime: 'V8 Engine' },
  { id: 'cpp', label: 'C++ 20 (GCC 13)', runtime: 'Native Binary' },
  { id: 'java', label: 'Java 21 (OpenJDK)', runtime: 'JVM HotSpot' }
];

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 cursor-pointer border ${
        on ? 'bg-zinc-200 border-zinc-300' : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${
          on ? 'translate-x-5 bg-zinc-950' : 'bg-zinc-600'
        }`}
      />
    </button>
  );
}

export default function Profile() {
  const { user, isAuthenticated, openAuthModal, updateProfile: updateAuthProfile } = useAuth();

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('candidate_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: user?.name || 'Candidate',
      title: user?.role || 'Software Engineer',
      level: user?.level || 'Senior',
      email: user?.email || '',
      location: '',
      targetCompanies: '',
      bio: '',
      primaryLanguage: 'python',
      persona: 'architect',
      autoRun: true,
      hints: false,
      voiceEnabled: true
    };
  });

  // Sync profile when logged-in user changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        title: user.role || prev.title,
        level: user.level || prev.level
      }));
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ total: 100, solved: 0 });
  const [sessions, setSessions] = useState([]);
  const [scheduledMocks, setScheduledMocks] = useState(() => {
    try {
      const saved = localStorage.getItem('scheduled_mocks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [exported, setExported] = useState(false);

  // Load practice stats and real session history
  useEffect(() => {
    fetchPracticeStats()
      .then((data) => {
        if (data && data.total !== undefined) {
          setPracticeStats({ total: data.total, solved: data.solved || 0 });
        }
      })
      .catch(() => {});

    fetchInterviewHistory()
      .then((history) => {
        let combined = Array.isArray(history) ? [...history] : [];
        try {
          const cached = JSON.parse(localStorage.getItem('candidate_sessions') || '[]');
          if (Array.isArray(cached)) {
            const existingIds = new Set(combined.map(s => s.sessionId || s.id));
            for (const item of cached) {
              if (!existingIds.has(item.sessionId || item.id)) {
                combined.push(item);
              }
            }
          }
        } catch {}
        setSessions(combined);
      })
      .catch(() => {
        try {
          const cached = JSON.parse(localStorage.getItem('candidate_sessions') || '[]');
          if (Array.isArray(cached)) setSessions(cached);
        } catch {}
      });
  }, []);

  const handleOpenEdit = () => {
    setTempProfile(profile);
    setIsEditingModal(true);
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    setProfile(tempProfile);
    try {
      localStorage.setItem('candidate_profile', JSON.stringify(tempProfile));
      if (isAuthenticated) {
        await updateAuthProfile({
          name: tempProfile.name,
          role: tempProfile.title,
          level: tempProfile.level,
          bio: tempProfile.bio,
          targetCompanies: tempProfile.targetCompanies,
          location: tempProfile.location
        });
      }
      setSaveSuccess(true);
      setIsEditingModal(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.warn('Failed to save profile:', err);
    }
  };

  // Derive genuine pillars based strictly on actual evaluated sessions
  const hasRealEvaluations = sessions.length > 0;
  const averageScore = hasRealEvaluations
    ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length)
    : 0;

  const getCategoryScore = (field) => {
    if (!hasRealEvaluations) return 0;
    const validScores = sessions
      .map(s => (s[field] !== undefined && s[field] !== null ? Number(s[field]) : (s.score ? Number(s.score) : null)))
      .filter(v => v !== null && !isNaN(v));
    if (validScores.length === 0) return averageScore;
    return Math.min(100, Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length));
  };

  const pillars = [
    { id: 'algo', label: 'Algorithms & Complexity', score: hasRealEvaluations ? getCategoryScore('codingScore') : 0, benchmark: 'Target: 85%' },
    { id: 'dist', label: 'System Design & Architecture', score: hasRealEvaluations ? getCategoryScore('accuracy') : 0, benchmark: 'Target: 80%' },
    { id: 'clean', label: 'Logical Thinking & Rigor', score: hasRealEvaluations ? getCategoryScore('logicalThinking') : 0, benchmark: 'Target: 85%' },
    { id: 'comm', label: 'Technical Communication', score: hasRealEvaluations ? getCategoryScore('communicationScore') : 0, benchmark: 'Target: 80%' },
  ];

  const handleExportDossier = () => {
    const content = `# CANDIDATE EVALUATION DOSSIER
Generated: ${new Date().toLocaleDateString()} | Atlyra Evaluation Studio

## 1. Candidate Information
- Full Name: ${profile.name}
- Target Role: ${profile.title} (${profile.level})
- Target Organizations: ${profile.targetCompanies || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Verified Email: ${profile.email || 'Not specified'}
- Headline: ${profile.bio || 'Technical Candidate'}

## 2. Real Code Arena Progress
- Problems Solved: ${practiceStats.solved} of ${practiceStats.total} (${Math.round((practiceStats.solved / (practiceStats.total || 1)) * 100)}%)
- Sandbox Status: ${practiceStats.solved > 0 ? `${practiceStats.solved} problems verified in sandbox` : 'Awaiting problem submissions'}

## 3. Evaluated Simulation History (${sessions.length} Recorded Sessions)
${sessions.length > 0
  ? sessions.map(s => `- [${s.date || 'Recent'}] Role: ${s.role} -> Score: ${s.score || 0}/100 | Result: ${s.result || 'Evaluated'}`).join('\n')
  : '- No interview simulations recorded yet.'}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(profile.name || 'Candidate').replace(/\s+/g, '_')}_Technical_Dossier.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="flex-grow flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 animate-fadeIn font-sans text-zinc-100">

      {/* ── Top Notification Banner ─────────────────────────────────────────── */}
      {saveSuccess && (
        <div className="bg-zinc-900 border border-zinc-700 text-zinc-200 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-lg animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-zinc-300" />
            Candidate calibration profile updated and saved.
          </span>
          <span className="text-[10px] text-zinc-500 font-medium">Saved</span>
        </div>
      )}

      {/* ── Guest Warning Banner (if not logged in) ─────────────────────────── */}
      {!isAuthenticated && (
        <div className="bg-zinc-900 border border-zinc-700/80 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <Shield size={14} className="text-zinc-400 shrink-0" />
            <span>
              You are viewing in <strong className="text-white">Guest Session</strong> mode. Create an account or sign in to permanently link your mock sessions.
            </span>
          </div>
          <button
            onClick={() => openAuthModal('signup')}
            className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition cursor-pointer text-center shrink-0"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* ── Executive Candidate Identity Header ────────────────────────────── */}
      <section className="relative rounded-3xl border border-white/[0.08] bg-[#0b0d13]/90 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Avatar & Core Metadata */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border border-white/[0.12] flex items-center justify-center font-mono font-bold text-xl sm:text-2xl text-zinc-100 shadow-inner">
                {initials}
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-200 border-2 border-[#0b0d13]"
                title="Active Profile"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  {profile.name}
                </h1>
                <span className="text-xs font-mono text-zinc-300 bg-white/[0.04] border border-white/[0.08] px-3 py-0.5 rounded-full font-medium">
                  {profile.level}
                </span>
                <span className="text-xs font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
                  {averageScore}% Bar Fit
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-mono flex items-center gap-2 flex-wrap">
                <span>{profile.title}</span>
                {profile.location && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className="flex items-center gap-1"><MapPin size={11} className="text-zinc-500" /> {profile.location}</span>
                  </>
                )}
                {profile.email && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className="flex items-center gap-1"><Mail size={11} className="text-zinc-500" /> {profile.email}</span>
                  </>
                )}
              </p>

              {profile.targetCompanies && (
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pt-0.5">
                  <Building2 size={12} className="text-zinc-600" />
                  <span>Target:</span>
                  <span className="text-zinc-300 font-medium">{profile.targetCompanies}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center flex-wrap">
            <button
              onClick={handleOpenEdit}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleExportDossier}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-1.5 cursor-pointer"
              title="Download formatted Candidate Dossier"
            >
              {exported ? (
                <>
                  <Check size={13} className="text-zinc-200" />
                  <span>Exported</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Dossier</span>
                </>
              )}
            </button>

            <Link
              to="/interview"
              className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles size={13} />
              <span>Launch Mock</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-xs text-zinc-400 font-sans leading-relaxed max-w-3xl">
            {profile.bio}
          </div>
        )}
      </section>

      {/* ── Metric Ribbon ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Simulations Evaluated', val: sessions.length, sub: 'Real completed mocks', icon: Activity },
          { label: 'Technical Readiness', val: hasRealEvaluations ? `${averageScore}%` : 'N/A', sub: hasRealEvaluations ? 'Current hiring bar fit' : 'Pending evaluations', icon: Award },
          { label: 'Challenges Solved', val: `${practiceStats.solved} / ${practiceStats.total}`, sub: practiceStats.solved > 0 ? `${practiceStats.solved} problems verified` : 'Awaiting challenge solutions', icon: Code2 },
          { label: 'Active Runtime', val: profile.primaryLanguage.toUpperCase(), sub: 'Native sub-50ms engine', icon: Cpu },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-white/[0.08] bg-[#0b0d13]/90 backdrop-blur-xl p-5 space-y-2 shadow-sm"
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] uppercase font-mono tracking-wider">{m.label}</span>
              <m.icon size={13} className="text-zinc-600" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-white leading-none font-mono">
              {m.val}
            </p>
            <p className="text-[11px] font-mono text-zinc-500 pt-0.5">{m.sub}</p>
          </div>
        ))}
      </section>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white/[0.07] rounded-full font-mono text-xs w-full sm:w-fit overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: 'overview', label: 'Evaluation Overview', icon: Layers },
          { id: 'radar', label: 'Competency Radar', icon: Activity },
          { id: 'sessions', label: `Simulation History (${sessions.length})`, icon: Calendar },
          { id: 'calibration', label: 'Studio Calibration', icon: Sliders },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-full transition-all duration-150 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <t.icon size={12} className={activeTab === t.id ? 'text-zinc-950' : 'text-zinc-500'} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* ── TAB 1: EVALUATION OVERVIEW ──────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">

          {/* Left Column: Real Pillars & Code Progress */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">Technical Bar Competency Matrix</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">Calibrated from completed simulations and solved challenges</p>
                </div>
                <span className="text-xs font-mono text-zinc-300 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full font-medium">
                  {hasRealEvaluations ? `${averageScore}% Ready` : 'Pending Simulation'}
                </span>
              </div>

              <div className="space-y-4">
                {pillars.map((p) => (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-200 font-medium">{p.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 text-[10px]">{p.benchmark}</span>
                        <span className="text-white font-semibold">{p.score}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-zinc-300 transition-all duration-700"
                        style={{ width: `${p.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Session Feed Preview */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Recent Evaluated Simulations</h4>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className="text-xs font-mono text-zinc-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <span>View all</span>
                  <ChevronRight size={12} />
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="py-8 text-center space-y-2 border border-white/[0.04] rounded-xl bg-white/[0.01]">
                  <p className="text-xs text-zinc-400">No mock interview simulations completed yet.</p>
                  <Link
                    to="/interview"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-200 hover:text-white underline underline-offset-4 decoration-white/20 transition pt-1"
                  >
                    <span>Launch your first 45-min voice assessment</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sessions.slice(0, 3).map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.015] flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="min-w-0">
                        <p className="text-white font-semibold truncate">{s.role} Simulation</p>
                        <p className="text-[11px] text-zinc-500">{s.date || 'Recent Session'}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-zinc-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.07]">
                          {s.result || 'Completed'}
                        </span>
                        <span className="text-white font-bold">{s.score || 0}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Code Progress & Archetype */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Code2 size={13} className="text-zinc-300" /> Code Arena Progress
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Live DB</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-3xl font-bold text-white">{practiceStats.solved}</span>
                  <span className="text-xs text-zinc-500">of {practiceStats.total} problems</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${Math.round((practiceStats.solved / (practiceStats.total || 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {Math.round((practiceStats.solved / (practiceStats.total || 1)) * 100)}% of curated problem matrix solved
                </p>
              </div>

              <Link
                to="/practice"
                className="w-full py-2 px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-zinc-200 hover:text-white hover:bg-white/[0.06] transition flex items-center justify-between cursor-pointer"
              >
                <span>Jump to Sandbox</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* AI Archetype Card */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-5 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                <User size={13} className="text-zinc-300" /> Selected Archetype
              </span>

              {PERSONAS.filter((p) => p.id === profile.persona).map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{p.title}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{p.archetype}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{p.desc}</p>
                </div>
              ))}

              <button
                onClick={() => setActiveTab('calibration')}
                className="text-[11px] font-mono text-zinc-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <span>Configure archetype in calibration</span>
                <ChevronRight size={11} />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: COMPETENCY RADAR ─────────────────────────────────────────── */}
      {activeTab === 'radar' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Competency Diagnostics</h3>
              <p className="text-xs text-zinc-400 font-mono mt-1">Calibrated from your genuine evaluations and code solutions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillars.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-semibold text-white">{p.label}</h4>
                    <span className="text-sm font-bold font-mono text-white">{p.score}%</span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-200 transition-all duration-700"
                      style={{ width: `${p.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                    <span>{p.benchmark}</span>
                    <span className="text-zinc-400 font-medium">{p.score > 0 ? (p.score >= 80 ? 'Above Bar' : 'Calibrating') : 'Pending Session'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SIMULATION HISTORY ───────────────────────────────────────── */}
      {activeTab === 'sessions' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Recorded Simulation Sessions</h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Sessions recorded in persistent storage</p>
              </div>
              <Link
                to="/interview"
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Start New Mock</span>
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="p-12 text-center space-y-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                <Activity size={28} className="mx-auto text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-300">No mock simulations completed yet</p>
                <p className="text-xs text-zinc-500 font-mono">
                  When you complete voice interview assessments, detailed rubrics, QA transcripts, and scores will appear here.
                </p>
                <Link
                  to="/interview"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition cursor-pointer mt-2"
                >
                  <Sparkles size={13} />
                  <span>Launch First Assessment</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2.5 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-zinc-300" />
                        <span className="text-zinc-100 font-semibold text-sm">{s.role} Simulation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-200 font-medium bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded">
                          {s.result || 'Completed'}
                        </span>
                        <span className="text-white font-bold">{s.score || 0}/100</span>
                        <span className="text-zinc-500">{s.date || 'Saved'}</span>
                      </div>
                    </div>

                    {s.analysis && (
                      <p className="text-zinc-400 font-sans text-xs leading-relaxed pt-1 border-t border-white/[0.04]">
                        {s.analysis}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: STUDIO CALIBRATION ───────────────────────────────────────── */}
      {activeTab === 'calibration' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Persona Picker */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Smith AI Interviewer Archetype</h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">Select the evaluation style for upcoming mock interviews</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    const updated = { ...profile, persona: p.id };
                    setProfile(updated);
                    localStorage.setItem('candidate_profile', JSON.stringify(updated));
                  }}
                  className={`text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                    profile.persona === p.id
                      ? 'border-white/20 bg-white/[0.06] shadow-sm'
                      : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">{p.title}</span>
                    {profile.persona === p.id && <Check size={13} className="text-zinc-200" />}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 block mb-2">{p.archetype}</span>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sandbox Runtime Picker */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Default Sandbox Execution Runtime</h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">Primary language loaded in the code arena and live assessment</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    const updated = { ...profile, primaryLanguage: l.id };
                    setProfile(updated);
                    localStorage.setItem('candidate_profile', JSON.stringify(updated));
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-mono transition-all duration-150 cursor-pointer ${
                    profile.primaryLanguage === l.id
                      ? 'border-white/20 bg-white/[0.06] text-white font-medium shadow-sm'
                      : 'border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <div>
                    <span>{l.label}</span>
                    <span className="text-[10px] text-zinc-500 block font-mono">{l.runtime}</span>
                  </div>
                  {profile.primaryLanguage === l.id && <Check size={13} className="text-zinc-200" />}
                </button>
              ))}
            </div>
          </div>

          {/* Ergonomics Toggles */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Studio Ergonomics & Assistance</h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">Assistance settings during simulations and live challenges</p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  label: 'Auto-run test cases on code edit',
                  sub: 'Trigger isolated sub-millisecond local execution automatically',
                  on: profile.autoRun,
                  toggle: () => {
                    const updated = { ...profile, autoRun: !profile.autoRun };
                    setProfile(updated);
                    localStorage.setItem('candidate_profile', JSON.stringify(updated));
                  }
                },
                {
                  label: 'Contextual AI hints when stuck > 3 min',
                  sub: 'Algorithmic nudges and data structure hints instead of spoilers',
                  on: profile.hints,
                  toggle: () => {
                    const updated = { ...profile, hints: !profile.hints };
                    setProfile(updated);
                    localStorage.setItem('candidate_profile', JSON.stringify(updated));
                  }
                },
                {
                  label: 'Neural voice audio output enabled',
                  sub: 'Realistic voice synthesis during simulated live interviews',
                  on: profile.voiceEnabled,
                  toggle: () => {
                    const updated = { ...profile, voiceEnabled: !profile.voiceEnabled };
                    setProfile(updated);
                    localStorage.setItem('candidate_profile', JSON.stringify(updated));
                  }
                }
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={item.toggle}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition"
                >
                  <div>
                    <p className="text-xs font-medium text-white">{item.label}</p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{item.sub}</p>
                  </div>
                  <Toggle on={item.on} onToggle={item.toggle} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ──────────────────────────────────────────────── */}
      {isEditingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/[0.12] bg-[#0b0d13] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">Edit Candidate Profile</h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Updates save to candidate state and profile database</p>
              </div>
              <button
                onClick={() => setIsEditingModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl linear-input text-white focus:outline-none"
                    placeholder="Candidate Name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl linear-input text-white focus:outline-none"
                    placeholder="developer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Target Title</label>
                  <input
                    type="text"
                    value={tempProfile.title}
                    onChange={(e) => setTempProfile({ ...tempProfile, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl linear-input text-white focus:outline-none"
                    placeholder="Staff Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Level / Seniority</label>
                  <input
                    type="text"
                    value={tempProfile.level}
                    onChange={(e) => setTempProfile({ ...tempProfile, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl linear-input text-white focus:outline-none"
                    placeholder="Senior"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={tempProfile.location}
                    onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl linear-input text-white focus:outline-none"
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Target Companies</label>
                  <input
                    type="text"
                    value={tempProfile.targetCompanies}
                    onChange={(e) => setTempProfile({ ...tempProfile, targetCompanies: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl linear-input text-white focus:outline-none"
                    placeholder="Google · Stripe · Meta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Engineering Headline & Bio</label>
                <textarea
                  value={tempProfile.bio}
                  onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl linear-input text-white focus:outline-none resize-none font-sans"
                  placeholder="Summary of engineering focus..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsEditingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-mono font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="pt-8 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
        <span>Atlyra Enterprise Candidate Dossier</span>
        <a
          href="https://cipherflux-labs.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white transition"
        >
          CipherFlux Labs ↗
        </a>
      </footer>

    </div>
  );
}
