import React, { useState, useEffect } from 'react';
import { ArrowRight, Code, FileText, Activity, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchPracticeStats, healthCheck } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, solved: 0, categories: [] });
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);

  useEffect(() => {
    // Check backend health
    healthCheck()
      .then(res => {
        if (res.status === 'ok') setIsBackendHealthy(true);
      })
      .catch(() => setIsBackendHealthy(false));

    // Fetch practice stats
    fetchPracticeStats()
      .then(data => {
        if (data.total !== undefined) {
          setStats(data);
        }
      })
      .catch(err => {
        console.warn('Could not load practice stats:', err);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
              Atlyra AI Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-secondary">Welcome back, Alex</h1>
          <p className="text-gray-500 mt-0.5 text-xs sm:text-base">
            Your 45-minute mock interview with <span className="font-semibold text-secondary">Smith</span> is ready.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-surface px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-gray-100 text-[11px] sm:text-xs font-semibold self-start sm:self-auto">
          <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-gray-700">{isBackendHealthy ? 'Atlyra Cloud Online • Smith Ready' : 'Connecting to Server...'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Main Hero Bento */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Activity size={13} />
              Up Next • Interviewer: Smith (45-Min Session)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-secondary">Mock Interview with Smith</h2>
            <p className="text-gray-600 mb-6 max-w-md text-xs sm:text-sm leading-relaxed">
              Comprehensive 45-minute simulation covering Self-Pitch & Soft Skills, Technical Deep-Dive, Live Coding Sandbox, and Behavioral Culture Fit with instant scoring.
            </p>
            <Link
              to="/interview"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm hover:bg-primary/90 transition shadow-sm w-full sm:w-auto"
            >
              <Sparkles size={16} /> Launch 45-Min Mock Interview
            </Link>
          </div>
          {/* Decorative blur */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition duration-700"></div>
        </div>

        {/* Stats Bento */}
        <div className="md:col-span-4 bg-secondary text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-gray-400 font-medium text-xs mb-1">DSA Bank Readiness</h3>
            <div className="text-4xl sm:text-5xl font-bold">
              {stats.total > 0 ? stats.total : 100}
              <span className="text-base sm:text-lg text-gray-400 font-normal"> questions</span>
            </div>
          </div>
          <div className="space-y-2.5 mt-6 pt-4 border-t border-gray-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Topics Available</span>
              <span className="font-semibold text-primary">{stats.categories?.length || 13} Categories</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">AI Resume Auditor</span>
              <span className="font-semibold text-primary">Gemini 2.5 Flash</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Audio Transcription</span>
              <span className="font-semibold text-primary">Whisper Large v3</span>
            </div>
          </div>
        </div>

        {/* Practice Module Link */}
        <Link to="/practice" className="md:col-span-6 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition group flex flex-col justify-between min-h-[180px]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface rounded-2xl flex items-center justify-center text-secondary mb-3">
            <Code size={22} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 group-hover:text-primary transition">Live Coding Arena</h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              Embedded Monaco Editor sandbox supporting Python, JavaScript, C++, and Java with real-time test case evaluation.
            </p>
          </div>
          <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
            <span>{stats.total > 0 ? `${stats.total} Problems in Neon DB` : 'DSA Question Bank'}</span>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-primary transition" />
          </div>
        </Link>

        {/* Resume Module Link */}
        <Link to="/resume" className="md:col-span-6 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition group flex flex-col justify-between min-h-[180px]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface rounded-2xl flex items-center justify-center text-secondary mb-3">
            <FileText size={22} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 group-hover:text-primary transition">Resume ATS Checker</h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              Upload your PDF/DOCX resume to receive instantaneous ATS compatibility scoring, keyword detection, and AI recommendations.
            </p>
          </div>
          <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
            <span>NDJSON Streaming Analysis</span>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-primary transition" />
          </div>
        </Link>
      </div>
    </div>
  );
}
