import React, { useState } from 'react';
import {
  User,
  Mail,
  Award,
  Calendar,
  TrendingUp,
  Code2,
  CheckCircle2,
  Sparkles,
  Clock,
  ChevronRight,
  Sliders,
  Cpu,
  FileText,
  Terminal,
  ArrowRight,
  Check,
  Shield,
  Layers,
  Flame,
  Activity,
  Download,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AtlyraSymbol from '../components/AtlyraSymbol';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'pipeline' | 'preferences'
  const [interviewerPersona, setInterviewerPersona] = useState('architect');
  const [preferredLanguage, setPreferredLanguage] = useState('python');
  const [autoRunTests, setAutoRunTests] = useState(true);
  const [liveHints, setLiveHints] = useState(false);
  const [dossierDownloaded, setDossierDownloaded] = useState(false);

  const handleDownloadDossier = () => {
    setDossierDownloaded(true);
    setTimeout(() => setDossierDownloaded(false), 2500);
  };

  // Mock 30-day activity matrix (1 for light, 2 for medium, 3 for high)
  const activityDays = [
    2, 3, 0, 1, 2, 3, 2, 1, 3, 2, 0, 2, 3, 3, 1, 2, 3, 0, 1, 2, 3, 2, 3, 1, 2, 3, 3, 2, 3, 3
  ];

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-16 animate-fadeIn pt-2 sm:pt-4 select-none">
      
      {/* ========================================================================= */}
      {/* 1. DEVELOPER IDENTITY CAPSULE (Header)                                    */}
      {/* ========================================================================= */}
      <header className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Glowing Avatar Capsule */}
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-[2px] bg-gradient-to-tr from-violet-500/80 via-cyan-400/80 to-emerald-400/80 shadow-[0_0_24px_rgba(139,92,246,0.2)] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#08090f] flex items-center justify-center font-mono font-semibold text-xl text-white">
                AR
              </div>
            </div>
            <div
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#08090f] flex items-center justify-center shadow-[0_0_10px_#10b981]"
              title="Active Candidate • High Velocity"
            />
          </div>

          {/* Name & Target Role Meta */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                Alex Rivera
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-zinc-300 uppercase tracking-wider">
                Staff Candidate (L6)
              </span>
            </div>
            
            <p className="text-zinc-400 text-xs sm:text-sm font-mono flex items-center justify-center sm:justify-start gap-2">
              <span>alex.rivera@email.com</span>
              <span className="text-zinc-700">&bull;</span>
              <span>San Francisco, CA</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono text-zinc-500 pt-0.5">
              <span>Senior Distributed Systems</span>
              <span className="text-zinc-700">&bull;</span>
              <span className="text-emerald-400 font-medium">94% Target Fit: Google / Stripe / Meta</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleDownloadDossier}
            className="linear-btn-secondary px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer transition"
            title="Export candidate verification dossier"
          >
            {dossierDownloaded ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Exported</span>
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
            className="linear-btn-primary px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-glow-white hover:scale-102 transition"
          >
            <Sparkles size={13} />
            <span>Launch Mock</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. TELEMETRY STRIP (Four High-Precision Indicators)                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl font-mono text-center sm:text-left">
        <div className="p-2 space-y-0.5">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">Simulations</div>
          <div className="text-2xl font-semibold text-white tracking-tight">12</div>
          <div className="text-[10px] text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
            <TrendingUp size={10} /> +3 this week
          </div>
        </div>

        <div className="p-2 space-y-0.5">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">Rubric Score</div>
          <div className="text-2xl font-semibold text-white tracking-tight">
            84<span className="text-xs text-zinc-600 font-normal">/100</span>
          </div>
          <div className="text-[10px] text-zinc-400">Top 4% percentile</div>
        </div>

        <div className="p-2 space-y-0.5">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">Code Challenges</div>
          <div className="text-2xl font-semibold text-white tracking-tight">
            45<span className="text-xs text-zinc-600 font-normal">/100</span>
          </div>
          <div className="text-[10px] text-emerald-400">100% test pass</div>
        </div>

        <div className="p-2 space-y-0.5">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">ATS Calibrated</div>
          <div className="text-2xl font-semibold text-white tracking-tight">92%</div>
          <div className="text-[10px] text-zinc-400">Staff Archetype</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FLUID SEGMENTED DOCK                                                  */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full font-mono text-xs">
          {[
            { id: 'radar', label: 'Evaluation Radar' },
            { id: 'pipeline', label: 'Interview Pipeline' },
            { id: 'preferences', label: 'Studio Preferences' }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EVALUATION RADAR & PRACTICE VELOCITY                              */}
      {/* ========================================================================= */}
      {activeTab === 'radar' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Diagnostic Pillars */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Bar Raiser Technical Readiness
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                  Weighted across 12 live AI interviews and sandbox code executions.
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                94% Overall Fit
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {[
                {
                  title: 'Algorithms, Data Structures & Edge Case Rigor',
                  score: 94,
                  color: 'from-emerald-400 to-teal-400',
                  note: 'Exemplary time complexity optimization; covers null/empty boundary conditions instinctively.'
                },
                {
                  title: 'Distributed Systems, Sharding & CAP Tradeoffs',
                  score: 88,
                  color: 'from-violet-500 to-cyan-400',
                  note: 'Articulate sharding key decisions and fallback strategies during network partitions.'
                },
                {
                  title: 'Code Cleanliness, Idiomatic Syntax & Modularity',
                  score: 92,
                  color: 'from-cyan-400 to-emerald-400',
                  note: 'Production-ready readability; writes self-documenting method signatures.'
                },
                {
                  title: 'Technical Communication & Clarifying Questions',
                  score: 87,
                  color: 'from-blue-500 to-violet-500',
                  note: 'Proactively identifies hidden constraints before committing to implementation.'
                },
                {
                  title: 'Leadership, Ownership & STAR Behavioral Evidence',
                  score: 91,
                  color: 'from-teal-400 to-emerald-400',
                  note: 'High-impact quantifiable results when articulating past architectural initiatives.'
                }
              ].map(pillar => (
                <div key={pillar.title} className="space-y-1.5 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-200 font-medium">{pillar.title}</span>
                    <span className="text-white font-semibold">{pillar.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.05]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${pillar.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans pt-0.5">
                    {pillar.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Standard: Google / Meta L6 Staff Calibrated</span>
              <span className="text-zinc-400">Refreshed 2 hours ago</span>
            </div>
          </div>

          {/* 30-Day Practice Velocity (Minimalist GitHub-style Momentum Dots) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-amber-400" />
                <h4 className="text-sm font-semibold text-white tracking-tight">
                  Practice Velocity & Streak
                </h4>
              </div>
              <span className="text-xs font-mono text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                14-Day Active Streak
              </span>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
                {activityDays.map((val, i) => (
                  <div
                    key={i}
                    title={`Day -${30 - i}: ${val === 0 ? 'Rest day' : val === 1 ? '1 challenge solved' : val === 2 ? '2 challenges + mock' : '3+ sessions'}`}
                    className={`h-4 sm:h-5 rounded-md transition-all cursor-pointer ${
                      val === 3
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : val === 2
                        ? 'bg-emerald-500/60'
                        : val === 1
                        ? 'bg-emerald-500/30'
                        : 'bg-white/[0.04]'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                <span>30 days ago</span>
                <div className="flex items-center gap-1.5">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded bg-white/[0.04]" />
                  <div className="w-2.5 h-2.5 rounded bg-emerald-500/30" />
                  <div className="w-2.5 h-2.5 rounded bg-emerald-500/60" />
                  <div className="w-2.5 h-2.5 rounded bg-emerald-400" />
                  <span>More</span>
                </div>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERVIEW PIPELINE & UPCOMING SPRINTS                             */}
      {/* ========================================================================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Upcoming Mocks */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-zinc-500 font-semibold tracking-wider px-1">
              Scheduled Simulation Sprints
            </div>

            {[
              {
                month: 'OCT',
                day: '08',
                company: 'Google L6 Staff Mock',
                topic: '45 mins • Distributed Cache, Sharding & Consistent Hashing',
                type: 'System Design & Voice',
                link: '/interview',
                ready: true
              },
              {
                month: 'OCT',
                day: '14',
                company: 'Meta E5 Algorithmic Sprint',
                topic: '60 mins • Dynamic Programming, Graph Topological Sort & Hard Cases',
                type: 'Live Coding Arena',
                link: '/practice',
                ready: true
              },
              {
                month: 'OCT',
                day: '21',
                company: 'Stripe Staff Financial Ledger',
                topic: '50 mins • Exactly-Once Semantics & Idempotency Pipeline',
                type: 'Architecture & Architecture Rubric',
                link: '/interview',
                ready: false
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center font-mono leading-none shrink-0 text-white">
                    <span className="text-[9px] uppercase text-zinc-400">{item.month}</span>
                    <span className="text-lg font-semibold mt-0.5">{item.day}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-zinc-200 transition truncate">
                        {item.company}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mt-1 truncate">
                      {item.topic}
                    </p>
                  </div>
                </div>

                <Link
                  to={item.link}
                  className="linear-btn-secondary px-4 py-2 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 shrink-0 transition"
                >
                  <span>Launch Session</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            ))}
          </div>

          {/* Past Simulation Archive */}
          <div className="pt-4 space-y-3">
            <div className="text-xs font-mono uppercase text-zinc-500 font-semibold tracking-wider px-1">
              Completed Simulation Archive
            </div>

            {[
              { title: 'Full Stack Staff Simulation', score: '92 / 100', verdict: 'Strong Hire', date: 'Yesterday' },
              { title: 'Concurrent Data Structures Arena', score: '88 / 100', verdict: 'Hire', date: '3 days ago' },
              { title: 'Cloud-Native Scalability Rubric', score: '85 / 100', verdict: 'Hire', date: 'Last week' }
            ].map((past, i) => (
              <div
                key={i}
                className="p-3.5 px-4 rounded-xl bg-white/[0.015] border border-white/[0.05] flex items-center justify-between text-xs font-mono text-zinc-400"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-white font-medium">{past.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">{past.verdict}</span>
                  <span className="text-zinc-300 font-semibold">{past.score}</span>
                  <span className="text-zinc-500 hidden sm:inline">{past.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STUDIO PREFERENCES (Personalization & Calibration)                 */}
      {/* ========================================================================= */}
      {activeTab === 'preferences' && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Simulator Personalization
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-normal">
              Calibrate Smith AI interviewer demeanor, runtime compiler, and code sandbox defaults.
            </p>
          </div>

          <div className="space-y-5 pt-2">
            {/* Interviewer Persona Calibration */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                Smith AI Interviewer Archetype
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'architect',
                    title: 'Principal Architect',
                    desc: 'Probing & analytical; challenges system bottleneck assumptions and failure modes.'
                  },
                  {
                    id: 'rigorous',
                    title: 'Algorithmic Staff',
                    desc: 'Fast-paced & mathematically rigorous; enforces tight Big-O bounds and edge tests.'
                  },
                  {
                    id: 'collaborative',
                    title: 'Founding CTO',
                    desc: 'Pragmatic & execution-driven; balances architecture with developer velocity.'
                  }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setInterviewerPersona(item.id)}
                    className={`text-left p-4 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${
                      interviewerPersona === item.id
                        ? 'bg-white/[0.08] border-white/30 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      {interviewerPersona === item.id && <Check size={13} className="text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-sans font-normal">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Language */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                Default Code Arena Runtime
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'python', label: 'Python 3.12 (CPython)' },
                  { id: 'javascript', label: 'JavaScript (Node.js v20)' },
                  { id: 'cpp', label: 'C++ (GCC v14 / C++20)' }
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setPreferredLanguage(lang.id)}
                    className={`text-left p-3.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      preferredLanguage === lang.id
                        ? 'bg-white/[0.08] border-white/30 text-white font-medium shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {preferredLanguage === lang.id && <Check size={13} className="text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sandbox Automation Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                Developer Ergonomics
              </label>
              <div className="space-y-2">
                <div
                  onClick={() => setAutoRunTests(!autoRunTests)}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-white block">Auto-Run Sample Tests on Code Change</span>
                    <span className="text-[11px] text-zinc-500 font-mono block">Sub-millisecond verification without manually clicking Run</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${autoRunTests ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoRunTests ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div
                  onClick={() => setLiveHints(!liveHints)}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-white block">Subtle Algorithmic Hints when Stuck &gt; 3 mins</span>
                    <span className="text-[11px] text-zinc-500 font-mono block">Provides small conceptual nudges instead of full solutions</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${liveHints ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${liveHints ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Studio calibration synchronized automatically</span>
            </span>
            <span className="text-zinc-400">
              Developed by{' '}
              <a
                href="https://cipherflux-labs.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-200 font-semibold hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition"
              >
                CipherFlux Labs
              </a>
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLOBAL PROFILE FOOTER (Strictly in footer with hyperlink)                 */}
      {/* ========================================================================= */}
      <footer className="pt-6 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-500">
        <span>Atlyra Enterprise Dossier</span>
        <span className="text-zinc-400">
          Developed by{' '}
          <a
            href="https://cipherflux-labs.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-200 font-semibold hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition"
          >
            CipherFlux Labs
          </a>
        </span>
      </footer>

    </div>
  );
}
