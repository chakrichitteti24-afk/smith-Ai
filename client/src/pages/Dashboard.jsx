import React, { useState, useEffect } from 'react';
import {
  Mic,
  ArrowRight,
  Sparkles,
  Terminal,
  FileCode2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPracticeStats, healthCheck } from '../services/api';
import AtlyraSymbol from '../components/AtlyraSymbol';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 100, solved: 18 });
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [activeMode, setActiveMode] = useState('interview'); // 'interview' | 'practice' | 'resume'
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    healthCheck()
      .then(res => {
        if (res.status === 'ok') setIsBackendHealthy(true);
      })
      .catch(() => setIsBackendHealthy(false));

    fetchPracticeStats()
      .then(data => {
        if (data.total !== undefined) {
          setStats(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => {
        console.warn('Could not load stats:', err);
      });
  }, []);

  const modes = {
    interview: {
      id: 'interview',
      title: 'Voice Interview',
      badge: 'Spoken Neural AI',
      heading: 'Speak with Smith.',
      description: 'Human-grade neural conversation across system architecture, algorithms, and behavioral STAR debriefs.',
      actionText: 'Start 45-Min Voice Session',
      path: '/interview',
      accentGlow: 'from-violet-500/25 via-fuchsia-500/15 to-cyan-500/20',
      statusText: 'Neural Voice Ready'
    },
    practice: {
      id: 'practice',
      title: 'Code Arena',
      badge: '100 Curated Problems',
      heading: 'Solve in Monaco.',
      description: 'Full-featured algorithmic sandbox with GCC C++, Node.js, Python 3, and OpenJDK test runner.',
      actionText: 'Launch Code Arena',
      path: '/practice',
      accentGlow: 'from-cyan-500/25 via-blue-500/15 to-emerald-500/20',
      statusText: 'Compiler Sandbox Active'
    },
    resume: {
      id: 'resume',
      title: 'Resume ATS',
      badge: 'Gemini 2.5 Flash',
      heading: 'Calibrate your resume.',
      description: 'AST structural parsing, keyword density gap detection, and FAANG hiring bar alignment.',
      actionText: 'Run Gemini ATS Audit',
      path: '/resume',
      accentGlow: 'from-emerald-500/25 via-teal-500/15 to-cyan-500/20',
      statusText: 'ATS Engine Calibrated'
    }
  };

  const current = modes[activeMode];

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center py-6 sm:py-10 max-w-3xl mx-auto w-full relative">
      
      {/* Dynamic Ambient Color Field with Buttery Fade */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr ${current.accentGlow} rounded-full blur-[140px] pointer-events-none -z-10 transition-all duration-700 ease-out`}
      />

      {/* Top Floating Telemetry Capsule */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-400 mb-6 shadow-sm backdrop-blur-xl transition-all duration-300">
        <span className={`w-1.5 h-1.5 rounded-full ${isBackendHealthy ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400'}`} />
        <span className="text-zinc-200 font-medium">Smith AI</span>
        <span className="text-zinc-600">&bull;</span>
        <span className="text-zinc-400">{current.statusText}</span>
      </div>

      {/* Central Living Neural Orb */}
      <div
        className="relative my-4 group cursor-pointer"
        onClick={() => navigate(current.path)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Buttery Smooth Concentric Echo Rings */}
        <div className="absolute -inset-5 rounded-full border border-white/[0.08] animate-ripple pointer-events-none" />
        <div className="absolute -inset-11 rounded-full border border-white/[0.04] animate-ripple pointer-events-none [animation-delay:1.5s]" />

        {/* The Breathing Luminous Core */}
        <div
          className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isHovered
              ? 'scale-105 shadow-[0_0_80px_rgba(255,255,255,0.2)]'
              : 'scale-100 shadow-[0_0_50px_rgba(255,255,255,0.08)]'
          }`}
        >
          {/* Outer Ring Border */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-white/5 to-transparent p-[1px]">
            <div className="w-full h-full rounded-full bg-[#070913]/90 backdrop-blur-2xl flex items-center justify-center relative overflow-hidden">
              
              {/* Dynamic Rotating Gradient Beams */}
              <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(255,255,255,0.25)_340deg,rgba(168,85,247,0.35)_360deg)] animate-orb-spin pointer-events-none opacity-80" />
              <div className="absolute inset-2 rounded-full bg-[#070913]/95 border border-white/[0.08]" />

              {/* Center Floating Icon & Feedback */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-2 transition-transform duration-300">
                <AtlyraSymbol size={42} withGlow animated />
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono tracking-wider uppercase text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isHovered ? 'Initialize' : 'Smith'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Micro Audio Waveform Pulse beneath Orb */}
        <div className="flex items-center justify-center gap-1 mt-4 h-3">
          <span className="w-0.5 bg-zinc-500 rounded-full animate-soundwave-1" />
          <span className="w-0.5 bg-zinc-400 rounded-full animate-soundwave-2" />
          <span className="w-0.5 bg-white rounded-full animate-soundwave-3" />
          <span className="w-0.5 bg-zinc-400 rounded-full animate-soundwave-4" />
          <span className="w-0.5 bg-zinc-500 rounded-full animate-soundwave-2" />
        </div>
      </div>

      {/* Dynamic Headline & Narrative (Smooth fade) */}
      <div className="space-y-2 mt-2 max-w-lg transition-all duration-300">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.04em] text-white">
          {current.heading}
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm font-normal leading-relaxed min-h-[38px]">
          {current.description}
        </p>
      </div>

      {/* Buttery Floating Mode Switcher */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-full my-6 shadow-2xl transition-all">
        {Object.values(modes).map(m => {
          const isSelected = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 cursor-pointer select-none ${
                isSelected
                  ? 'bg-white text-black shadow-glow-white font-semibold scale-102'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {m.id === 'interview' && <Mic size={13} className={isSelected ? 'text-black' : 'text-zinc-500'} />}
              {m.id === 'practice' && <Terminal size={13} className={isSelected ? 'text-black' : 'text-zinc-500'} />}
              {m.id === 'resume' && <FileCode2 size={13} className={isSelected ? 'text-black' : 'text-zinc-500'} />}
              <span>{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tactile Primary Action Button */}
      <div className="flex items-center justify-center">
        <Link
          to={current.path}
          className="linear-btn-primary px-8 py-3 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-glow-white hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Sparkles size={14} />
          <span>{current.actionText}</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Whisper-Quiet Bottom Telemetry */}
      <div className="mt-10 sm:mt-12 pt-4 border-t border-white/[0.05] flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] font-mono text-zinc-500">
        <span>4-Round Pacing</span>
        <span className="text-zinc-800">&bull;</span>
        <span>{stats.total || 100} Curated Problems</span>
        <span className="text-zinc-800">&bull;</span>
        <span>ATS Rubric Engine</span>
        <span className="text-zinc-800">&bull;</span>
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
  );
}
