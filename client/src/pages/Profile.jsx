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
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AtlyraSymbol from '../components/AtlyraSymbol';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'preferences' | 'pipeline'
  const [interviewerPersona, setInterviewerPersona] = useState('architect');
  const [preferredLanguage, setPreferredLanguage] = useState('python');

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-16 animate-fadeIn pt-4 sm:pt-8 select-none">
      
      {/* Sleek Minimalist Identity Header (No Boxy Bloat) */}
      <header className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Subtle Glowing Avatar Ring */}
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-[2px] bg-gradient-to-tr from-violet-500/80 via-cyan-400/80 to-emerald-400/80 shadow-[0_0_30px_rgba(139,92,246,0.25)] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#08090f] flex items-center justify-center font-mono font-semibold text-xl text-white">
                AR
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#08090f] flex items-center justify-center shadow-[0_0_8px_#10b981]" title="Active Candidate" />
          </div>

          {/* Name & Target Role */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                Alex Rivera
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-zinc-300 uppercase tracking-wider">
                L6 Verified
              </span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm font-mono flex items-center justify-center sm:justify-start gap-2">
              <span>alex.rivera@email.com</span>
              <span className="text-zinc-700">&bull;</span>
              <span>San Francisco, CA</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-zinc-500 pt-0.5">
              <span>Senior Backend Engineer</span>
              <span className="text-zinc-700">&bull;</span>
              <span className="text-zinc-400">Target: FAANG / Unicorn</span>
            </div>
          </div>
        </div>

        {/* Quick Launch CTA */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/interview"
            className="linear-btn-primary px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-glow-white hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles size={13} />
            <span>Launch Mock</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Seamless Inline Telemetry Strip (Zero Clunky Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl font-mono text-center sm:text-left">
        <div className="p-2 space-y-0.5">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">Mock Sessions</div>
          <div className="text-2xl font-semibold text-white tracking-tight">12</div>
          <div className="text-[10px] text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
            <TrendingUp size={10} /> +3 this week
          </div>
        </div>

        <div className="p-2 space-y-0.5">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">Average Score</div>
          <div className="text-2xl font-semibold text-white tracking-tight">84<span className="text-xs text-zinc-600 font-normal">/100</span></div>
          <div className="text-[10px] text-zinc-400">Top 4% tier</div>
        </div>

        <div className="p-2 space-y-0.5">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">Algorithms Solved</div>
          <div className="text-2xl font-semibold text-white tracking-tight">45</div>
          <div className="text-[10px] text-zinc-400">100% test pass</div>
        </div>

        <div className="p-2 space-y-0.5">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">ATS Compatibility</div>
          <div className="text-2xl font-semibold text-white tracking-tight">92%</div>
          <div className="text-[10px] text-emerald-400">FAANG Calibrated</div>
        </div>
      </div>

      {/* Buttery Floating Navigation Dock */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full">
          {[
            { id: 'overview', label: 'Evaluation Radar' },
            { id: 'pipeline', label: 'Interview Pipeline' },
            { id: 'preferences', label: 'Studio Preferences' }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-glow-white scale-102'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EVALUATION RADAR (Hairline Minimalist Bars)                         */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="linear-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Bar Raiser Readiness Diagnostic
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                  Aggregated across 12 full-round simulations with Smith AI.
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                94% Overall Fit
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {[
                { title: 'Technical Communication & Architecture Tradeoffs', score: 88, color: 'from-violet-500 to-cyan-400' },
                { title: 'Monaco Sandbox Code Quality & Edge Cases', score: 92, color: 'from-cyan-400 to-emerald-400' },
                { title: 'Distributed Scalability & Fault Tolerance', score: 85, color: 'from-blue-500 to-violet-500' },
                { title: 'Leadership & Conflict Resolution (STAR Method)', score: 89, color: 'from-emerald-400 to-teal-400' },
              ].map((pillar) => (
                <div key={pillar.title} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-normal">{pillar.title}</span>
                    <span className="text-white font-semibold">{pillar.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.05]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${pillar.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>Calibrated standard: Google / Meta L6</span>
              <span className="text-zinc-400">Updated today</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERVIEW PIPELINE (Sleek Upcoming Sprints)                        */}
      {/* ========================================================================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4 animate-fadeIn">
          {[
            {
              month: 'OCT',
              day: '08',
              company: 'Google L6 Staff Mock',
              topic: '45 mins • Distributed Cache & Sharding Architecture',
              link: '/interview'
            },
            {
              month: 'OCT',
              day: '14',
              company: 'Meta E5 Algorithmic Sprint',
              topic: '60 mins • Dynamic Programming & Graph Hard Cases',
              link: '/practice'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="linear-card rounded-2xl p-4 sm:p-5 border border-white/[0.08] flex items-center justify-between gap-4 group hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center font-mono leading-none shrink-0 text-white">
                  <span className="text-[9px] uppercase text-zinc-400">{item.month}</span>
                  <span className="text-lg font-semibold mt-0.5">{item.day}</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-zinc-200 transition truncate">
                    {item.company}
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                    {item.topic}
                  </p>
                </div>
              </div>

              <Link
                to={item.link}
                className="linear-btn-secondary px-4 py-2 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 shrink-0 transition"
              >
                <span>Launch</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STUDIO PREFERENCES (Tactile Calibration)                          */}
      {/* ========================================================================= */}
      {activeTab === 'preferences' && (
        <div className="linear-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Simulator Personalization
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-normal">
              Adjust Smith AI interviewer demeanor and default code arena runtime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Persona */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Interviewer Persona
              </label>
              <div className="space-y-2">
                {[
                  { id: 'architect', name: 'Smith Default: Senior Architect', desc: 'Rigor on latency, CAP theorem, and memory bounds.' },
                  { id: 'bar-raiser', name: 'Amazon Bar Raiser', desc: 'Deep dive into STAR metrics, leadership, and scale.' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setInterviewerPersona(p.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${
                      interviewerPersona === p.id
                        ? 'bg-white/[0.08] border-white/30 text-white font-medium shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-1 font-mono">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sandbox Language */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Default Sandbox Language
              </label>
              <div className="space-y-2">
                {[
                  { id: 'python', label: 'Python 3.12 (CPython)' },
                  { id: 'javascript', label: 'JavaScript (Node.js v20)' },
                  { id: 'cpp', label: 'C++ (GCC v14 / C++20)' }
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setPreferredLanguage(lang.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      preferredLanguage === lang.id
                        ? 'bg-white/[0.08] border-white/30 text-white font-medium shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {preferredLanguage === lang.id && <Check size={14} className="text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Preferences automatically synced</span>
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

      {/* Global Profile Footer Attribution */}
      <footer className="pt-6 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono text-zinc-500">
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
