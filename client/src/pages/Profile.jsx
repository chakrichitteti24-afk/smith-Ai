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
  Terminal,
  Cpu,
  Layers,
  Settings,
  Shield,
  Activity,
  Award,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchPracticeStats } from '../services/api';

// ─── Default Data Constants ──────────────────────────────────────────────────

const DEFAULT_PROFILE = {
  name: 'Alex Rivera',
  title: 'Staff Software Engineer',
  level: 'Staff · L6',
  email: 'alex.rivera@email.com',
  location: 'San Francisco, CA',
  targetCompanies: 'Google · Stripe · Meta',
  fitScore: 94,
  bio: 'Systems engineer specializing in high-throughput distributed architectures, concurrency, and low-latency pipelines.',
  primaryLanguage: 'python',
  persona: 'architect',
  autoRun: true,
  hints: false,
  voiceEnabled: true
};

const PILLARS = [
  { label: 'Algorithms & Complexity', score: 94, color: 'bg-emerald-400', benchmark: 'FAANG L6 Target: 90%' },
  { label: 'Distributed Systems & CAP', score: 88, color: 'bg-violet-400', benchmark: 'FAANG L6 Target: 85%' },
  { label: 'Code Cleanliness & Quality', score: 92, color: 'bg-cyan-400', benchmark: 'FAANG L6 Target: 85%' },
  { label: 'Technical Communication', score: 87, color: 'bg-blue-400', benchmark: 'FAANG L6 Target: 80%' },
  { label: 'System Architecture & Scaling', score: 91, color: 'bg-teal-400', benchmark: 'FAANG L6 Target: 85%' }
];

const ACTIVITY = [2, 3, 0, 1, 2, 3, 2, 1, 3, 2, 0, 2, 3, 3, 1, 2, 3, 0, 1, 2, 3, 2, 3, 1, 2, 3, 3, 2, 3, 3];

const SCHEDULED = [
  { month: 'OCT', day: '08', title: 'Google L6 Distributed Systems Mock', type: 'System Architecture', link: '/interview' },
  { month: 'OCT', day: '14', title: 'Meta E5 Algorithmic Sprint', type: 'Live Coding Sandbox', link: '/practice' },
  { month: 'OCT', day: '21', title: 'Stripe Staff Ledger Resiliency', type: 'Technical Architecture', link: '/interview' }
];

const COMPLETED_SESSIONS = [
  {
    title: 'Full Stack Staff Simulation',
    score: '92/100',
    verdict: 'Strong Hire',
    date: 'Yesterday',
    feedback: 'Excellent breakdown of distributed transaction rollback mechanics and lock-free concurrency.'
  },
  {
    title: 'Concurrent Data Structures & Algorithms',
    score: '88/100',
    verdict: 'Hire',
    date: '3 days ago',
    feedback: 'Optimal O(log N) approach. Could proactively discuss memory locality and cache misses.'
  },
  {
    title: 'Cloud-Native Scalability Assessment',
    score: '85/100',
    verdict: 'Hire',
    date: 'Last week',
    feedback: 'Strong understanding of event-driven Kafka stream partitioning and read-replica replication lag.'
  }
];

const PERSONAS = [
  { id: 'architect', title: 'Principal Architect', desc: 'Probing & analytical; challenges system bottlenecks, single points of failure, and trade-offs.' },
  { id: 'rigorous', title: 'Algorithmic Staff', desc: 'Fast-paced & precise; enforces strict Big-O complexity bounds and edge cases.' },
  { id: 'collaborative', title: 'Founding CTO', desc: 'Pragmatic & holistic; balances high-level velocity with technical debt and architecture.' }
];

const LANGUAGES = [
  { id: 'python', label: 'Python 3.12 (Native 50ms)' },
  { id: 'javascript', label: 'JavaScript (Node 24)' },
  { id: 'cpp', label: 'C++ 20 (GCC / Clang)' },
  { id: 'java', label: 'Java 25 (OpenJDK Javac)' }
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 cursor-pointer ${
        on ? 'bg-emerald-500' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${
          on ? 'translate-x-4' : ''
        }`}
      />
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 font-semibold mb-3">
      {children}
    </p>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Profile() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('candidate_profile');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState('radar'); // 'radar' | 'pipeline' | 'calibration' | 'settings'
  const [exported, setExported] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ total: 100, solved: 18 });

  // Sync practice stats from backend
  useEffect(() => {
    fetchPracticeStats()
      .then((data) => {
        if (data && data.total !== undefined) {
          setPracticeStats({ total: data.total, solved: data.solved || 18 });
        }
      })
      .catch(() => {});
  }, []);

  // Save profile to localStorage
  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('candidate_profile', JSON.stringify(profile));
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.warn('Could not save profile:', err);
    }
  };

  // Generate and download real Candidate Dossier
  const handleExportDossier = () => {
    const content = `# ATLYRA CANDIDATE EVALUATION DOSSIER
Generated: ${new Date().toLocaleDateString()} | Calibrated for FAANG / Tier 1 Staff

## 1. Candidate Information
- Name: ${profile.name}
- Target Role: ${profile.title} (${profile.level})
- Target Companies: ${profile.targetCompanies}
- Location: ${profile.location}
- Primary Runtime: ${profile.primaryLanguage.toUpperCase()}
- Bio: ${profile.bio}

## 2. Technical Readiness Diagnostic (Score: ${profile.fitScore}/100)
${PILLARS.map((p) => `- ${p.label}: ${p.score}% (${p.benchmark})`).join('\n')}

## 3. Algorithmic Practice Stats
- Curated Problems Solved: ${practiceStats.solved} of ${practiceStats.total} (${Math.round((practiceStats.solved / practiceStats.total) * 100)}% Complete)
- Active Streak: 14 Consecutive Days
- Sandbox Precision: 100% (Native Local Sandbox)

## 4. Completed Simulation Assessments
${COMPLETED_SESSIONS.map((c) => `- [${c.date}] ${c.title} -> Verdict: ${c.verdict} (${c.score})\n  Feedback: ${c.feedback}`).join('\n')}

---------------------------------------------------------------------
Atlyra AI Technical Interview Studio • Developed by CipherFlux Labs
https://cipherflux-labs.vercel.app
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, '_')}_Technical_Dossier.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  // Compute initials
  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AR';

  return (
    <div className="max-w-4xl mx-auto w-full pb-10 pt-2 px-1 space-y-7 animate-fadeIn">

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-sm animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Candidate calibration profile updated and synced successfully.
          </span>
          <span className="text-[10px] text-zinc-500">Auto-saved to local state</span>
        </div>
      )}

      {/* ── Candidate Identity Header Card ──────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#090a0f]/80 backdrop-blur-xl p-5 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          {/* Avatar & Info */}
          <div className="flex items-start sm:items-center gap-4.5">
            {/* Avatar Pill */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-white/[0.08] to-white/[0.02] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-lg text-white shadow-inner">
                {initials}
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090a0f] shadow-[0_0_10px_#10b981]"
                title="Active Candidate State"
              />
            </div>

            {/* Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">{profile.name}</h1>
                <span className="text-[10px] font-mono text-zinc-300 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full font-medium">
                  {profile.level}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  {profile.fitScore}% Bar Match
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-mono">
                {profile.email} · {profile.location}
              </p>

              <div className="flex items-center gap-2 text-xs font-mono pt-0.5 text-zinc-400 flex-wrap">
                <span className="text-zinc-500">Target Companies:</span>
                <span className="text-zinc-200 font-medium">{profile.targetCompanies}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="linear-btn-secondary px-3.5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 size={13} />
              <span>{isEditing ? 'Close' : 'Edit'}</span>
            </button>

            <button
              onClick={handleExportDossier}
              className="linear-btn-secondary px-3.5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Download formatted Candidate Assessment Dossier (.md)"
            >
              {exported ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Downloaded</span>
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
              className="linear-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-glow-white"
            >
              <Sparkles size={13} />
              <span>Launch Mock</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Inline Profile Editor Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-5 border-t border-white/[0.08] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                <Settings size={13} className="text-zinc-300" /> Candidate Profile Customization
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Persists in local state</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg linear-input text-xs text-white focus:outline-none"
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Target Role & Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg linear-input text-xs text-white focus:outline-none"
                  placeholder="e.g. Staff Software Engineer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Seniority Level</label>
                <input
                  type="text"
                  value={profile.level}
                  onChange={(e) => setProfile({ ...profile, level: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg linear-input text-xs text-white focus:outline-none"
                  placeholder="e.g. Staff · L6"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg linear-input text-xs text-white focus:outline-none"
                  placeholder="e.g. alex@example.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg linear-input text-xs text-white focus:outline-none"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Target Companies</label>
                <input
                  type="text"
                  value={profile.targetCompanies}
                  onChange={(e) => setProfile({ ...profile, targetCompanies: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg linear-input text-xs text-white focus:outline-none"
                  placeholder="e.g. Google · Stripe · Meta"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Engineering Headline & Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg linear-input text-xs text-white focus:outline-none resize-none"
                placeholder="Brief summary of your technical specializations..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="linear-btn-primary px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── High-Density Metric Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg">
        <div className="bg-[#090a0f] p-4.5 space-y-1">
          <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Simulations</p>
          <p className="text-2xl font-bold text-white tracking-tight leading-none">12</p>
          <p className="text-[11px] font-mono text-emerald-400 font-medium">+3 this week</p>
        </div>

        <div className="bg-[#090a0f] p-4.5 space-y-1">
          <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Rubric Score</p>
          <p className="text-2xl font-bold text-white tracking-tight leading-none">
            88<span className="text-xs text-zinc-500 font-normal">/100</span>
          </p>
          <p className="text-[11px] font-mono text-emerald-400 font-medium">Top 3% Band</p>
        </div>

        <div className="bg-[#090a0f] p-4.5 space-y-1">
          <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Challenges Solved</p>
          <p className="text-2xl font-bold text-white tracking-tight leading-none">
            {practiceStats.solved}
            <span className="text-xs text-zinc-500 font-normal">/{practiceStats.total}</span>
          </p>
          <p className="text-[11px] font-mono text-cyan-400 font-medium">100% Sandbox Pass</p>
        </div>

        <div className="bg-[#090a0f] p-4.5 space-y-1">
          <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Target Fit</p>
          <p className="text-2xl font-bold text-white tracking-tight leading-none">
            {profile.fitScore}%
          </p>
          <p className="text-[11px] font-mono text-emerald-400 font-medium">Staff Archetype</p>
        </div>
      </div>

      {/* ── Segmented Navigation Ribbon ───────────────────────────────────────── */}
      <div className="flex gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl w-full sm:w-fit font-mono text-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'radar', label: 'Competency Radar', icon: Activity },
          { id: 'pipeline', label: 'Sessions & Pipeline', icon: Layers },
          { id: 'calibration', label: 'Simulator Calibration', icon: Cpu },
          { id: 'settings', label: 'Candidate Preferences', icon: Settings },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              tab === t.id
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <t.icon size={12} className={tab === t.id ? 'text-black' : 'text-zinc-500'} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: COMPETENCY RADAR ───────────────────────────────────────────── */}
      {tab === 'radar' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Readiness Pillars Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">FAANG Hiring Bar Competency Radar</h3>
                <p className="text-xs text-zinc-500 mt-0.5 font-mono">Calibrated against Google L6, Stripe Staff, and Meta E5 benchmarks</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                94% Overall Readiness
              </span>
            </div>

            <div className="space-y-4">
              {PILLARS.map((p) => (
                <div key={p.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-200 font-medium">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 hidden sm:inline">{p.benchmark}</span>
                      <span className="text-white font-semibold">{p.score}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.color} transition-all duration-700 shadow-sm`}
                      style={{ width: `${p.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-white/[0.06] pt-3.5 flex-wrap gap-2">
              <span>Diagnostic baseline: 12 Voice Mock Simulations & 18 Code Arena Submissions</span>
              <span className="text-zinc-400">Refreshed today</span>
            </div>
          </div>

          {/* Practice Streak Heatmap Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={15} className="text-amber-400" />
                <h4 className="text-sm font-semibold text-white">30-Day Engineering Activity</h4>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium">
                14-Day Streak Active
              </span>
            </div>

            <div className="grid grid-cols-15 gap-1.5">
              {ACTIVITY.map((v, i) => (
                <div
                  key={i}
                  className={`h-4.5 rounded-sm transition-all duration-150 hover:ring-1 hover:ring-white/40 ${
                    v === 3
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.3)]'
                      : v === 2
                      ? 'bg-emerald-500/55'
                      : v === 1
                      ? 'bg-emerald-500/25'
                      : 'bg-white/[0.04]'
                  }`}
                  title={`Day ${i + 1}: ${v} challenges completed`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
              <span>30 days ago</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                {[0.04, 0.25, 0.55, 1].map((o, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-sm inline-block ${
                      i === 3 ? 'bg-emerald-400' : i === 2 ? 'bg-emerald-500/55' : i === 1 ? 'bg-emerald-500/25' : 'bg-white/[0.04]'
                    }`}
                  />
                ))}
                <span>More</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PIPELINE & SESSIONS ────────────────────────────────────────── */}
      {tab === 'pipeline' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Upcoming Mock Schedule */}
          <div>
            <SectionLabel>Upcoming Scheduled Simulations</SectionLabel>
            <div className="space-y-2.5">
              {SCHEDULED.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center font-mono shrink-0">
                      <span className="text-[8px] text-zinc-500 uppercase">{item.month}</span>
                      <span className="text-base font-bold text-white leading-none mt-0.5">{item.day}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      <p className="text-xs font-mono text-zinc-500 mt-0.5">{item.type}</p>
                    </div>
                  </div>
                  <Link
                    to={item.link}
                    className="linear-btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 shrink-0 transition"
                  >
                    Launch <ChevronRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Session Log */}
          <div>
            <SectionLabel>Evaluated Sessions & Hiring Recommendations</SectionLabel>
            <div className="space-y-2">
              {COMPLETED_SESSIONS.map((c, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.015] space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-zinc-200 font-semibold truncate text-sm">{c.title}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {c.verdict}
                      </span>
                      <span className="text-white font-bold">{c.score}</span>
                      <span className="text-zinc-500 hidden sm:inline">{c.date}</span>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs font-sans leading-relaxed pt-1 border-t border-white/[0.04]">
                    {c.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SIMULATOR CALIBRATION ──────────────────────────────────────── */}
      {tab === 'calibration' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Interviewer Persona */}
          <div>
            <SectionLabel>Smith AI Interviewer Archetype</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                      ? 'border-white/25 bg-white/[0.08] shadow-sm'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">{p.title}</span>
                    {profile.persona === p.id && <Check size={13} className="text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Language */}
          <div>
            <SectionLabel>Default Sandbox Execution Runtime</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      ? 'border-white/25 bg-white/[0.08] text-white font-medium shadow-sm'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <span>{l.label}</span>
                  {profile.primaryLanguage === l.id && <Check size={13} className="text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Ergonomic Toggles */}
          <div>
            <SectionLabel>Studio Ergonomics & Assistance</SectionLabel>
            <div className="space-y-2">
              {[
                {
                  label: 'Auto-run test cases on code edit',
                  sub: 'Instant local sandbox execution without manual Run clicks',
                  on: profile.autoRun,
                  toggle: () => {
                    const updated = { ...profile, autoRun: !profile.autoRun };
                    setProfile(updated);
                    localStorage.setItem('candidate_profile', JSON.stringify(updated));
                  }
                },
                {
                  label: 'Contextual AI hints when stuck > 3 min',
                  sub: 'Algorithmic nudges and data structure hints instead of full spoilers',
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

      {/* ── TAB 4: CANDIDATE SETTINGS ─────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="space-y-6 animate-fadeIn">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">Candidate Identity & Preferences</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Candidate Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl linear-input text-xs text-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl linear-input text-xs text-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Target Engineering Role</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl linear-input text-xs text-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Target Seniority / Level</label>
                  <input
                    type="text"
                    value={profile.level}
                    onChange={(e) => setProfile({ ...profile, level: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl linear-input text-xs text-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Target Companies</label>
                  <input
                    type="text"
                    value={profile.targetCompanies}
                    onChange={(e) => setProfile({ ...profile, targetCompanies: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl linear-input text-xs text-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Current Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl linear-input text-xs text-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">Engineering Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl linear-input text-xs text-white focus:outline-none resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('candidate_profile');
                    setProfile(DEFAULT_PROFILE);
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 2000);
                  }}
                  className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} /> Reset to Defaults
                </button>

                <button
                  type="submit"
                  className="linear-btn-primary px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-glow-white"
                >
                  Save Calibration Profile
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="flex items-center justify-between pt-5 border-t border-white/[0.06] text-[11px] font-mono text-zinc-500">
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
