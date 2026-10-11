import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Download,
  Loader2,
  Sparkles,
  AlertCircle,
  UploadCloud,
  Check,
  Target,
  X,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  ArrowRight
} from 'lucide-react';
import { uploadResume } from '../services/api';

const COMMON_ROLES = [
  'Senior Backend Engineer',
  'Full Stack Engineer',
  'Frontend Developer',
  'DevOps & Cloud Engineer',
  'Data Engineer'
];

export default function Resume() {
  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem('atlyra_user_resume');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [fileName, setFileName] = useState(() => {
    try {
      return localStorage.getItem('atlyra_user_resume_filename') || '';
    } catch {
      return '';
    }
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [mobileTab, setMobileTab] = useState('insights'); // 'insights' | 'preview'

  // Extract authentic breakdown directly from server AI evaluation
  const getAuthenticBreakdown = (data, score) => {
    if (data?.breakdown && typeof data.breakdown.keywords === 'number') {
      return {
        keywords: Math.min(100, Math.max(0, Math.round(data.breakdown.keywords))),
        impact: Math.min(100, Math.max(0, Math.round(data.breakdown.impact))),
        formatting: Math.min(100, Math.max(0, Math.round(data.breakdown.formatting))),
        relevance: Math.min(100, Math.max(0, Math.round(data.breakdown.relevance)))
      };
    }
    const val = typeof score === 'number' && score > 0 ? Math.round(score) : 0;
    return { keywords: val, impact: val, formatting: val, relevance: val };
  };

  const processUploadedData = (data, uploadedFileName) => {
    setFileName(uploadedFileName);

    if (data.isResume === false || (data.atsScore === 0 && (!data.skills || data.skills.length === 0) && (!data.experience || data.experience.length === 0))) {
      setWarningMessage(
        data.error || `Document analysis: No recognizable candidate experience or technical skills were identified in "${uploadedFileName}". Please ensure you upload a text-based CV or resume.`
      );
    } else {
      setWarningMessage('');
    }

    const rawScore = typeof data.atsScore === 'number' ? Math.round(data.atsScore) : 0;

    // Format experience WITHOUT injecting placeholder text
    const formattedExp = Array.isArray(data.experience)
      ? data.experience.map(exp => {
          let points = [];
          if (Array.isArray(exp.points) && exp.points.length > 0) {
            points = exp.points;
          } else if (exp.description) {
            points = [exp.description];
          } else if (exp.summary) {
            points = [exp.summary];
          }
          return {
            role: exp.role || '',
            company: exp.company || '',
            duration: exp.duration || '',
            points
          };
        })
      : [];

    // Format projects WITHOUT injecting placeholder items
    const formattedProjects = Array.isArray(data.projects)
      ? data.projects.map(p => ({
          name: p.name || 'Project',
          description: p.description || '',
          technologies: Array.isArray(p.technologies) ? p.technologies : []
        }))
      : [];

    const structuredResume = {
      name: data.name || uploadedFileName.replace(/\.[^/.]+$/, ''),
      email: data.email || 'Not specified in CV',
      phone: data.phone || '',
      location: data.location || '',
      role: targetRole,
      atsScore: rawScore,
      breakdown: getAuthenticBreakdown(data, rawScore),
      skills: Array.isArray(data.skills) ? data.skills : [],
      missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords : [],
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      experience: formattedExp,
      projects: formattedProjects,
      education: Array.isArray(data.education) ? data.education : [],
      summary: data.summary || ''
    };

    setResumeData(structuredResume);
    try {
      localStorage.setItem('atlyra_user_resume', JSON.stringify(structuredResume));
      localStorage.setItem('atlyra_user_resume_filename', uploadedFileName);
    } catch {
      // localStorage error fallback
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    setWarningMessage('');
    setUploadStatus('Streaming document bytes to Gemini 2.5 Flash...');

    try {
      const data = await uploadResume(file, { role: targetRole, level: 'Senior' }, (status) => {
        setUploadStatus(status);
      });

      if (!data) {
        throw new Error('Server returned empty analysis payload.');
      }

      processUploadedData(data, file.name);
    } catch (err) {
      console.error('Resume parse error:', err);
      setErrorMessage(err.message || 'Failed to extract text from resume file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearResume = () => {
    setResumeData(null);
    setFileName('');
    setErrorMessage('');
    setWarningMessage('');
    try {
      localStorage.removeItem('atlyra_user_resume');
      localStorage.removeItem('atlyra_user_resume_filename');
    } catch {
      // ignore
    }
  };

  const handleRoleChange = (newRole) => {
    setTargetRole(newRole);
    if (!resumeData) return;

    const updated = {
      ...resumeData,
      role: newRole
    };
    setResumeData(updated);
    try {
      localStorage.setItem('atlyra_user_resume', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleDownloadReport = () => {
    if (!resumeData) return;

    const reportText = `====================================================
           ATLYRA — CANDIDATE ATS AUDIT REPORT         
           Evaluated by Gemini AI Engine
====================================================
Candidate Name:    ${resumeData.name}
Target Role:       ${targetRole}
Overall ATS Score: ${resumeData.atsScore} / 100

SCORE BREAKDOWN:
- Keyword Match:          ${resumeData.breakdown?.keywords}%
- Impact & Metrics:       ${resumeData.breakdown?.impact}%
- Formatting/Parse:       ${resumeData.breakdown?.formatting}%
- Experience Relevance:   ${resumeData.breakdown?.relevance}%

IDENTIFIED CORE SKILLS:
${resumeData.skills && resumeData.skills.length > 0 ? resumeData.skills.map(s => `• ${s}`).join('\n') : '(None parsed)'}

MISSING TARGET KEYWORDS:
${resumeData.missingKeywords && resumeData.missingKeywords.length > 0 ? resumeData.missingKeywords.map(k => `• ${k}`).join('\n') : '(None identified)'}

EVALUATED STRENGTHS:
${resumeData.strengths && resumeData.strengths.length > 0 ? resumeData.strengths.map(s => `• ${s}`).join('\n') : '(None)'}

ACTIONABLE RECOMMENDATIONS:
${resumeData.recommendations && resumeData.recommendations.length > 0 ? resumeData.recommendations.map(r => `• ${r}`).join('\n') : '(None)'}
====================================================
Generated by Atlyra Technical Platform`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(resumeData.name || 'Candidate').replace(/\s+/g, '_')}_ATS_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleLoadSampleResume = () => {
    const sample = {
      name: 'Alex Morgan',
      email: 'alex.morgan.dev@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      summary: 'Senior Software Engineer with 6+ years designing high-throughput distributed systems, event-driven architectures, and cloud-native services using Node.js, Go, PostgreSQL, and Kubernetes.',
      role: targetRole,
      atsScore: 88,
      breakdown: {
        keywords: 86,
        impact: 90,
        formatting: 92,
        relevance: 85
      },
      skills: ['TypeScript', 'Node.js', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'Kafka', 'System Design', 'Git', 'CI/CD'],
      missingKeywords: ['gRPC', 'Database Sharding', 'Chaos Engineering'],
      strengths: [
        'Robust experience with microservices and high-scale data stores (PostgreSQL, Redis)',
        'Demonstrated cloud architecture skills on AWS and Kubernetes',
        'Strong foundational focus on distributed systems patterns'
      ],
      recommendations: [
        'Quantify specific latency drops and throughput metrics in recent role points',
        'Highlight experience with gRPC and service mesh tooling for backend role fit',
        'Elaborate on disaster recovery and database sharding trade-offs'
      ],
      experience: [
        {
          role: 'Senior Backend Engineer',
          company: 'Nexus Scale Systems',
          duration: '2022 - Present',
          points: [
            'Architected distributed event-driven message bus processing 15M+ events daily with Apache Kafka and Go.',
            'Reduced p99 API latency by 42% through Redis multi-tier caching and query optimization in PostgreSQL.',
            'Mentored junior engineers and led technical design reviews across 3 cross-functional product squads.'
          ]
        },
        {
          role: 'Full Stack Engineer',
          company: 'Aether Labs',
          duration: '2019 - 2022',
          points: [
            'Delivered responsive dashboard UI using React, TypeScript, and GraphQL connected to Node.js microservices.',
            'Configured automated CI/CD pipelines with GitHub Actions and Terraform to deploy services to AWS EKS.'
          ]
        }
      ],
      projects: [
        {
          name: 'Distributed Rate Limiter & Token Bucket API',
          description: 'High-availability Redis-backed sliding window rate limiter capable of handling 50k req/sec.',
          technologies: ['Go', 'Redis', 'Docker', 'gRPC']
        }
      ],
      education: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'University of California, Berkeley',
          year: '2019'
        }
      ]
    };
    processUploadedData(sample, 'Alex_Morgan_Senior_CV.pdf');
  };

  return (
    <div className="flex-grow flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 font-sans text-zinc-100 animate-fadeIn">

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {errorMessage && (
        <div className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-mono shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-zinc-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-zinc-500 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Content Warning Banner (if file was uploaded but had no resume data) ─ */}
      {warningMessage && (
        <div className="bg-zinc-900/90 border border-zinc-600 text-zinc-300 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-mono shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={15} className="text-zinc-400 shrink-0" />
            <span>{warningMessage}</span>
          </div>
          <button onClick={() => setWarningMessage('')} className="text-zinc-500 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Top Header Toolbar ────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Resume Intelligence & ATS Diagnostic
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Zero-hallucination semantic parsing powered by Gemini 2.5 Flash
          </p>
        </div>

        {resumeData ? (
          <div className="flex items-center gap-2.5 flex-wrap">
            <label className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm">
              {isUploading ? <Loader2 size={13} className="animate-spin text-zinc-800" /> : <UploadCloud size={13} />}
              <span>{isUploading ? 'Analyzing...' : 'Replace Resume'}</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                disabled={isUploading}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
            </label>

            <button
              onClick={handleClearResume}
              className="px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-1.5 cursor-pointer"
              title="Remove stored resume"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedReport ? <Check size={13} /> : <Download size={13} />}
              <span>{copiedReport ? 'Downloaded' : 'Export Audit'}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLoadSampleResume}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-zinc-200" />
              <span>Load Sample CV</span>
            </button>
          </div>
        )}
      </header>

      {/* ── NO RESUME UPLOADED EMPTY STATE ──────────────────────────────────── */}
      {!resumeData ? (
        <div className="flex flex-col items-center justify-center py-6 px-4 max-w-3xl mx-auto w-full text-center space-y-7">
          
          {/* Upload Drop Zone Card */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
            }}
            className={`w-full rounded-3xl border transition-all duration-300 p-8 sm:p-12 flex flex-col items-center justify-center space-y-6 ${
              isDragOver
                ? 'border-zinc-300 bg-white/[0.06] scale-[1.01]'
                : 'border-white/[0.1] bg-[#0b0d13]/80 hover:border-white/[0.2]'
            }`}
          >
            {isUploading ? (
              <div className="py-8 flex flex-col items-center space-y-4">
                <Loader2 size={36} className="animate-spin text-white" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white font-mono">{uploadStatus || 'Analyzing document...'}</p>
                  <p className="text-xs text-zinc-400">Extracting AST and matching against target job requirements</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <UploadCloud size={28} className="text-zinc-200" />
                </div>

                <div className="space-y-2 max-w-md">
                  <h2 className="text-xl font-semibold text-white tracking-tight">
                    Upload Your Resume for Genuine Analysis
                  </h2>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Drag and drop your resume in PDF or DOCX format, or select a file to calculate your authentic ATS score, extract skills, and identify missing keywords.
                  </p>
                </div>

                {/* Target Role Selector */}
                <div className="w-full max-w-md space-y-2 text-left">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Target Role Alignment
                  </label>
                  <div className="flex flex-wrap gap-1.5 font-mono">
                    {COMMON_ROLES.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTargetRole(r)}
                        className={`text-[11px] px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          targetRole === r
                            ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                            : 'bg-white/[0.03] border border-white/[0.07] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Select & Sample Action */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <label className="linear-btn-primary px-8 py-3 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-glow-white hover:scale-105 active:scale-95 transition-all">
                    <FileText size={14} />
                    <span>Select Resume File (.pdf, .docx, .txt)</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleResume}
                    className="px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={13} className="text-zinc-200" />
                    <span>Test with Sample CV</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-2">
              <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                <ShieldCheck size={14} className="text-zinc-400" />
                <span>Zero Hallucination</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Only credentials and points explicitly written in your document are evaluated. No fake experience is injected.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-2">
              <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                <Target size={14} className="text-zinc-400" />
                <span>Calibrated Scoring</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Evaluated against the selected target role across keyword density, impact metrics, and depth.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-2">
              <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                <FileCheck2 size={14} className="text-zinc-400" />
                <span>ATS Gap Detection</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Identifies missing system tools, libraries, and frameworks expected by enterprise resume screeners.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* ── PARSED REALITY VIEW (ONLY SHOWN WITH GENUINE UPLOADED DATA) ───── */
        <>
          {/* Mobile Tab Segmented Dock */}
          <div className="lg:hidden flex items-center bg-[#0b0d13] p-1 rounded-xl border border-white/[0.06] font-mono text-xs">
            <button
              onClick={() => setMobileTab('insights')}
              className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mobileTab === 'insights' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <Target size={13} /> ATS Audit ({resumeData.atsScore || 0}%)
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mobileTab === 'preview' ? 'bg-white text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <FileText size={13} /> Document View
            </button>
          </div>

          {/* Main Dual Panel Grid */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* LEFT PANEL: Document View (Parsed Reality) */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              className={`w-full lg:w-1/2 rounded-2xl border transition-all flex-col overflow-hidden shadow-2xl ${
                mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
              } ${
                isDragOver ? 'border-zinc-400 bg-zinc-900/90' : 'border-white/[0.07] bg-[#0b0d13]'
              }`}
            >
              {/* Header Bar */}
              <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 truncate">
                  <FileText size={14} className="text-zinc-400 shrink-0" />
                  <span className="truncate">{fileName || 'Uploaded Resume'}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                  Verified Extracted
                </span>
              </div>

              {/* Document Sheet */}
              <div className="p-5 sm:p-7 max-h-[800px] overflow-y-auto overscroll-contain space-y-6 text-xs text-zinc-300 font-sans">
                {isUploading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
                    <Loader2 size={24} className="animate-spin text-zinc-400" />
                    <p className="text-xs font-mono text-zinc-300">{uploadStatus || 'Processing document...'}</p>
                    <p className="text-[11px] text-zinc-500">Extracting AST and matching against target job requirements</p>
                  </div>
                ) : (
                  <>
                    {/* Candidate Header */}
                    <div className="text-center border-b border-white/[0.06] pb-4 space-y-1">
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {resumeData.name || 'Candidate'}
                      </h2>
                      <p className="text-zinc-500 font-mono text-[11px]">
                        {[resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' · ') || 'Contact info not specified'}
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="space-y-1.5">
                      <h3 className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
                        Profile Summary
                      </h3>
                      <p className="leading-relaxed text-zinc-300">
                        {resumeData.summary || 'No summary statement provided in the document.'}
                      </p>
                    </div>

                    {/* Experience */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
                        Work Experience
                      </h3>
                      {resumeData.experience && resumeData.experience.length > 0 ? (
                        <div className="space-y-3.5">
                          {resumeData.experience.map((exp, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.015] space-y-1.5">
                              <div className="flex justify-between items-baseline font-mono text-xs">
                                <span className="text-white font-semibold">{exp.role}</span>
                                <span className="text-zinc-500 text-[10px]">{exp.duration}</span>
                              </div>
                              <div className="text-zinc-400 text-[11px] font-mono">{exp.company}</div>
                              {exp.points && exp.points.length > 0 && (
                                <ul className="list-disc pl-4 space-y-1 text-zinc-300 text-[11px] pt-1">
                                  {exp.points.map((pt, pIdx) => (
                                    <li key={pIdx} className="leading-relaxed">{pt}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] text-zinc-500 text-center font-mono text-[11px]">
                          No previous employment experience detected in document.
                        </div>
                      )}
                    </div>

                    {/* Projects */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
                        Key Projects
                      </h3>
                      {resumeData.projects && resumeData.projects.length > 0 ? (
                        <div className="space-y-3">
                          {resumeData.projects.map((proj, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.015] space-y-1.5">
                              <span className="text-white font-semibold block">{proj.name}</span>
                              {proj.description && <p className="text-zinc-300 text-[11px] leading-relaxed">{proj.description}</p>}
                              {proj.technologies && proj.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {proj.technologies.map((t, tIdx) => (
                                    <span key={tIdx} className="text-[9px] font-mono bg-white/[0.04] text-zinc-400 px-2 py-0.5 rounded border border-white/[0.05]">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] text-zinc-500 text-center font-mono text-[11px]">
                          No independent projects section identified in document.
                        </div>
                      )}
                    </div>

                    {/* Education */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
                        Education
                      </h3>
                      {resumeData.education && resumeData.education.length > 0 ? (
                        <div className="space-y-2">
                          {resumeData.education.map((edu, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-white/[0.05] bg-white/[0.015] flex justify-between items-baseline font-mono text-[11px]">
                              <div>
                                <span className="text-white font-semibold block">{edu.degree}</span>
                                <span className="text-zinc-400 text-[10px]">{edu.institution}</span>
                              </div>
                              <span className="text-zinc-500 text-[10px]">{edu.year}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] text-zinc-500 text-center font-mono text-[11px]">
                          No formal education credentials detected in document.
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
                        Parsed Technical Skills
                      </h3>
                      {resumeData.skills && resumeData.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.skills.map((s, idx) => (
                            <span key={idx} className="text-[10px] font-mono bg-white/[0.04] text-zinc-200 px-2.5 py-1 rounded-md border border-white/[0.06]">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] text-zinc-500 text-center font-mono text-[11px]">
                          No technical skills parsed from document.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: ATS Audit Scorecard & Diagnostics */}
            <div className={`w-full lg:w-1/2 flex-col gap-6 ${mobileTab === 'insights' ? 'flex' : 'hidden lg:flex'}`}>

              {/* Compatibility Score Bento */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                      ATS Scanner Diagnostics
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight">Compatibility Score</h2>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">
                      Target: <span className="text-zinc-200 font-medium">{targetRole}</span>
                    </p>

                    {/* Role Switcher */}
                    <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-xs">
                      {COMMON_ROLES.map(r => (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(r)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer ${
                            targetRole === r
                              ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                              : 'bg-white/[0.02] border border-white/[0.06] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Score Dial */}
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center self-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-zinc-900"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        stroke="#e4e4e7"
                        className="transition-all duration-1000 ease-out"
                        strokeWidth="3"
                        strokeDasharray={`${resumeData.atsScore || 0}, 100`}
                        fill="none"
                        strokeLinecap="round"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold font-mono text-white">
                        {resumeData.atsScore || 0}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* 4 Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  {[
                    { label: 'Keyword Match', val: resumeData.breakdown?.keywords || 0 },
                    { label: 'Impact & Metrics', val: resumeData.breakdown?.impact || 0 },
                    { label: 'Formatting & Parse', val: resumeData.breakdown?.formatting || 0 },
                    { label: 'Experience Depth', val: resumeData.breakdown?.relevance || 0 },
                  ].map(p => (
                    <div key={p.label} className="p-3 rounded-xl border border-white/[0.05] bg-white/[0.015] space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">{p.label}</span>
                        <span className="text-white font-bold">{p.val}%</span>
                      </div>
                      <div className="w-full bg-white/[0.05] rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-zinc-300 transition-all duration-500"
                          style={{ width: `${p.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Keywords & Suggestions */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d13] p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <Target size={15} className="text-zinc-400" />
                  Target Keyword Gap Analysis
                </h3>

                {resumeData.missingKeywords && resumeData.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.missingKeywords.map((k, idx) => (
                      <span key={idx} className="text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-md">
                        + {k}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 font-mono">No significant missing keywords detected.</p>
                )}

                {resumeData.recommendations && resumeData.recommendations.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.05] space-y-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold block">
                      Actionable Recommendations
                    </span>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {resumeData.recommendations.map((r, idx) => (
                        <li key={idx} className="leading-relaxed flex items-start gap-2">
                          <span className="text-zinc-500 font-mono">›</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
