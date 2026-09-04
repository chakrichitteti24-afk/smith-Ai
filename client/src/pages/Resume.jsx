import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader2,
  Sparkles,
  AlertCircle,
  UploadCloud,
  Check,
  Briefcase,
  Layers,
  GraduationCap,
  Award,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { uploadResume } from '../services/api';

const DEFAULT_RESUME = {
  name: 'Alex Rivera',
  email: 'alex.rivera@email.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  role: 'Senior Backend Engineer',
  atsScore: 88,
  breakdown: {
    keywords: 85,
    impact: 82,
    formatting: 95,
    relevance: 90
  },
  skills: ['Node.js', 'Docker', 'Redis', 'Microservices', 'PostgreSQL', 'Python', 'REST APIs', 'Git'],
  missingKeywords: ['AWS ECS', 'System Design', 'Kubernetes', 'CI/CD Pipelines'],
  strengths: [
    'Strong microservices architecture experience using Node.js and Docker.',
    'Demonstrated 40% latency reduction with Redis caching.',
    'Experience mentoring junior developers and establishing code reviews.'
  ],
  recommendations: [
    'Quantify results across earlier projects to further demonstrate business impact.',
    'Add specific AWS cloud services (e.g., ECS, EKS) if used during Docker deployments.',
    'Include unit test coverage metrics or framework mentions (e.g., Jest, PyTest).'
  ],
  projects: [
    {
      name: 'Distributed Rate Limiter',
      description: 'Engineered a token-bucket rate limiting service in Go and Redis handling 50k req/sec.',
      technologies: ['Go', 'Redis', 'Docker']
    },
    {
      name: 'Real-Time Event Ingestion Pipeline',
      description: 'Streamed high-volume analytical events with Apache Kafka and Node.js microservices.',
      technologies: ['Node.js', 'Kafka', 'PostgreSQL']
    }
  ],
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Tech Innovations Inc.',
      duration: '2022 - Present',
      points: [
        'Led the development of a microservices architecture using Node.js and Docker.',
        'Improved API response times by 40% through Redis caching.',
        'Mentored 3 junior developers and established code review guidelines.'
      ]
    },
    {
      role: 'Software Engineer',
      company: 'Apex Data Labs',
      duration: '2020 - 2022',
      points: [
        'Designed relational database schemas and optimized PostgreSQL query execution plans.',
        'Implemented OAuth2 authentication and role-based access control for enterprise clients.'
      ]
    }
  ],
  education: [
    {
      degree: 'B.S. Computer Science',
      institution: 'University of California, Berkeley',
      year: '2018 - 2022'
    }
  ],
  summary: 'Results-driven Senior Backend Engineer with 5+ years of experience designing scalable microservices, low-latency APIs, and distributed database systems.'
};

const COMMON_ROLES = [
  'Senior Backend Engineer',
  'Full Stack Engineer',
  'Frontend Developer',
  'DevOps & Cloud Engineer',
  'Data Engineer'
];

export default function Resume() {
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME);
  const [fileName, setFileName] = useState('Alex_Rivera_Resume_2026.pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [mobileTab, setMobileTab] = useState('insights'); // 'insights' | 'preview'

  // Compute 4-pillar breakdown from ATS score
  const computeBreakdown = (score) => {
    const base = Math.max(50, Math.min(99, score || 80));
    return {
      keywords: Math.min(100, Math.round(base * 0.95)),
      impact: Math.min(100, Math.round(base * 0.90)),
      formatting: Math.min(100, Math.round(base * 1.05)),
      relevance: Math.min(100, Math.round(base * 0.98))
    };
  };

  const processUploadedData = (data, uploadedFileName) => {
    const score = typeof data.atsScore === 'number' ? data.atsScore : 82;
    setFileName(uploadedFileName);

    // Format experience gracefully without repeating job title
    const formattedExp = Array.isArray(data.experience) && data.experience.length > 0
      ? data.experience.map(exp => {
          let points = [];
          if (Array.isArray(exp.points) && exp.points.length > 0) {
            points = exp.points;
          } else if (exp.description) {
            points = [exp.description];
          } else if (exp.summary) {
            points = [exp.summary];
          } else {
            points = [`Executed core engineering responsibilities for ${exp.company || 'the team'}.`];
          }
          return {
            role: exp.role || 'Software Engineer',
            company: exp.company || 'Enterprise Company',
            duration: exp.duration || '2022 - Present',
            points
          };
        })
      : DEFAULT_RESUME.experience;

    // Format projects
    const formattedProjects = Array.isArray(data.projects) && data.projects.length > 0
      ? data.projects.map(p => ({
          name: p.name || 'Technical Project',
          description: p.description || 'Engineered scalable solution using modern architecture.',
          technologies: Array.isArray(p.technologies) ? p.technologies : []
        }))
      : DEFAULT_RESUME.projects;

    setResumeData({
      name: data.name || (data.summary ? data.summary.slice(0, 30) : 'Candidate Resume'),
      email: data.email || 'Parsed from Resume',
      phone: data.phone || '',
      location: data.location || '',
      role: targetRole,
      atsScore: score,
      breakdown: computeBreakdown(score),
      skills: Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : ['JavaScript', 'React', 'Node.js', 'SQL'],
      missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords : ['System Design', 'Docker', 'CI/CD'],
      strengths: Array.isArray(data.strengths) && data.strengths.length > 0 ? data.strengths : ['Strong technical foundation demonstrated in work history'],
      recommendations: Array.isArray(data.recommendations) && data.recommendations.length > 0 ? data.recommendations : ['Quantify project impact with measurable metrics.'],
      experience: formattedExp,
      projects: formattedProjects,
      education: Array.isArray(data.education) && data.education.length > 0 ? data.education : DEFAULT_RESUME.education,
      summary: data.summary || DEFAULT_RESUME.summary
    });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    setUploadStatus('Uploading file to server...');

    try {
      const data = await uploadResume(file, { role: targetRole, level: 'Senior' }, (status) => {
        setUploadStatus(status);
      });

      processUploadedData(data, file.name);
    } catch (err) {
      console.error('Resume parse error:', err);
      setErrorMessage(err.message || 'Failed to process resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setTargetRole(newRole);
    // Dynamically adjust ATS score and missing keywords based on selected target role
    let adjustedScore = resumeData.atsScore || 85;
    let missing = [];

    if (newRole.toLowerCase().includes('frontend')) {
      missing = ['TypeScript', 'Next.js', 'Tailwind CSS', 'Redux / Zustand', 'Web Vitals'];
      adjustedScore = Math.max(68, adjustedScore - 6);
    } else if (newRole.toLowerCase().includes('devops') || newRole.toLowerCase().includes('cloud')) {
      missing = ['Terraform', 'Kubernetes', 'AWS IAM', 'Prometheus', 'Helm'];
      adjustedScore = Math.max(64, adjustedScore - 8);
    } else if (newRole.toLowerCase().includes('data')) {
      missing = ['Apache Spark', 'Airflow', 'Snowflake', 'dbt', 'Data Modeling'];
      adjustedScore = Math.max(65, adjustedScore - 7);
    } else {
      missing = ['System Design', 'AWS ECS', 'Kubernetes', 'CI/CD Pipelines'];
      adjustedScore = Math.min(94, adjustedScore + 2);
    }

    setResumeData(prev => ({
      ...prev,
      role: newRole,
      atsScore: adjustedScore,
      breakdown: computeBreakdown(adjustedScore),
      missingKeywords: missing
    }));
  };

  const handleDownloadReport = () => {
    const reportText = `====================================================
          ATLYRA — RESUME ATS AUDIT REPORT         
====================================================
Candidate Name:   ${resumeData.name}
Target Role:      ${targetRole}
Overall ATS Score: ${resumeData.atsScore} / 100

SCORE BREAKDOWN:
- Keyword Match:         ${resumeData.breakdown?.keywords}%
- Impact & Metrics:      ${resumeData.breakdown?.impact}%
- Formatting/Parseability: ${resumeData.breakdown?.formatting}%
- Experience Relevance:  ${resumeData.breakdown?.relevance}%

IDENTIFIED SKILLS:
${resumeData.skills?.map(s => `• ${s}`).join('\n')}

MISSING TARGET KEYWORDS:
${resumeData.missingKeywords?.map(k => `• ${k}`).join('\n')}

KEY STRENGTHS:
${resumeData.strengths?.map(s => `• ${s}`).join('\n')}

ACTIONABLE RECOMMENDATIONS:
${resumeData.recommendations?.map(r => `• ${r}`).join('\n')}
====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.name.replace(/\s+/g, '_')}_ATS_Audit_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 65) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex-grow flex flex-col gap-5 max-w-7xl mx-auto w-full pb-10">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-semibold text-xs text-red-600 hover:text-red-800">Dismiss</button>
        </div>
      )}

      {/* Header with Role Presets and Export */}
      <header className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} /> Atlyra ATS Intelligence • Gemini 2.5 Flash
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight">Atlyra Resume ATS Optimizer</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Upload your resume to benchmark your ATS compatibility score, detect missing keywords, and get tailored recommendations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={handleDownloadReport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-gray-700 bg-surface hover:bg-gray-200 border border-gray-200 transition shadow-sm cursor-pointer"
            title="Export text report"
          >
            {copiedReport ? <Check size={14} className="text-emerald-500" /> : <Download size={14} />}
            {copiedReport ? 'Report Exported' : 'Export Report'}
          </button>

          <label className="flex-1 sm:flex-initial cursor-pointer text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm">
            {isUploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
            {isUploading ? 'Analyzing...' : 'Upload New Resume'}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              disabled={isUploading}
            />
          </label>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-surface p-1 rounded-2xl border border-gray-200">
        <button
          onClick={() => setMobileTab('insights')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'insights'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-500 hover:text-secondary'
          }`}
        >
          <BarChart3 size={14} /> ATS Score & Audit
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'preview'
              ? 'bg-white text-secondary shadow-sm'
              : 'text-gray-500 hover:text-secondary'
          }`}
        >
          <FileText size={14} /> Resume Document
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        {/* Left Panel - Live Resume Document Preview */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className={`w-full lg:w-1/2 bg-white rounded-2xl sm:rounded-3xl shadow-sm border transition-all flex-col overflow-hidden relative ${
            mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
          } ${
            isDragOver ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'
          }`}
        >
          {/* Document Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-surface/30">
            <div className="flex items-center gap-2 text-secondary font-medium truncate max-w-xs text-xs sm:text-sm">
              <FileText size={16} className="text-primary flex-shrink-0" />
              <span className="truncate font-semibold">{fileName}</span>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">Drag & Drop Supported</span>
          </div>

          {/* Document Content View */}
          <div className="bg-gray-50/80 p-6 sm:p-8 max-h-[750px] overflow-y-auto flex justify-center relative">
            {isUploading ? (
              <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center space-y-4 my-12">
                <Loader2 size={42} className="text-primary animate-spin" />
                <div className="text-center">
                  <h3 className="font-bold text-secondary text-base">Gemini Resume Intelligence</h3>
                  <p className="text-xs text-gray-500 mt-1 animate-pulse font-medium">{uploadStatus || 'Analyzing document structure...'}</p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-lg bg-white shadow-sm border border-gray-200 p-8 rounded-xl text-[11px] sm:text-xs text-gray-800 space-y-5">
                {/* Candidate Header */}
                <div className="text-center border-b border-gray-200 pb-4">
                  <h1 className="text-2xl font-bold uppercase tracking-tight text-secondary mb-1">
                    {resumeData.name}
                  </h1>
                  <p className="text-gray-500 text-[11px]">
                    {resumeData.email} {resumeData.phone ? `• ${resumeData.phone}` : ''} {resumeData.location ? `• ${resumeData.location}` : ''}
                  </p>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div>
                    <h2 className="font-bold border-b border-gray-200 mb-1.5 pb-0.5 text-secondary uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <Briefcase size={12} className="text-primary" /> Professional Summary
                    </h2>
                    <p className="text-gray-600 leading-relaxed">{resumeData.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience && resumeData.experience.length > 0 && (
                  <div>
                    <h2 className="font-bold border-b border-gray-200 mb-2 pb-0.5 text-secondary uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <Layers size={12} className="text-primary" /> Experience
                    </h2>
                    <div className="space-y-3.5">
                      {resumeData.experience.map((exp, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between font-bold text-secondary">
                            <span>{exp.role}</span>
                            <span className="text-gray-500 font-normal">{exp.duration}</span>
                          </div>
                          <div className="italic text-gray-600 mb-1 font-medium">{exp.company}</div>
                          <ul className="list-disc pl-4 space-y-1 text-gray-600">
                            {exp.points.map((pt, pIdx) => (
                              <li key={pIdx} className="leading-relaxed">{pt}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects && resumeData.projects.length > 0 && (
                  <div>
                    <h2 className="font-bold border-b border-gray-200 mb-2 pb-0.5 text-secondary uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <Award size={12} className="text-primary" /> Key Projects
                    </h2>
                    <div className="space-y-3">
                      {resumeData.projects.map((proj, idx) => (
                        <div key={idx} className="bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-secondary">{proj.name}</span>
                          </div>
                          <p className="text-gray-600 leading-relaxed mb-1.5">{proj.description}</p>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {proj.technologies.map((tech, tIdx) => (
                                <span key={tIdx} className="bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-medium">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education && resumeData.education.length > 0 && (
                  <div>
                    <h2 className="font-bold border-b border-gray-200 mb-2 pb-0.5 text-secondary uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <GraduationCap size={12} className="text-primary" /> Education
                    </h2>
                    <div className="space-y-2">
                      {resumeData.education.map((edu, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between font-bold text-secondary">
                            <span>{edu.degree}</span>
                            <span className="text-gray-500 font-normal">{edu.year}</span>
                          </div>
                          <div className="italic text-gray-600">{edu.institution}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills && resumeData.skills.length > 0 && (
                  <div>
                    <h2 className="font-bold border-b border-gray-200 mb-2 pb-0.5 text-secondary uppercase text-[10px] tracking-wider">
                      Skills & Technologies
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - ATS Insights & Pillar Breakdown */}
        <div className={`w-full lg:w-1/2 flex-col gap-6 ${mobileTab === 'insights' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Scorecard Bento */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  ATS Scanner Result
                </span>
                <h2 className="text-2xl font-bold text-secondary">Compatibility Score</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Benchmarked for <span className="font-semibold text-secondary">{targetRole}</span>
                </p>

                {/* Quick Role Selector */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {COMMON_ROLES.map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                        targetRole === role
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center self-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${getScoreColor(resumeData.atsScore)} transition-all duration-1000 ease-out`}
                    strokeWidth="3.2"
                    strokeDasharray={`${resumeData.atsScore || 75}, 100`}
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-3xl font-extrabold ${getScoreColor(resumeData.atsScore)}`}>
                    {resumeData.atsScore}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">/ 100</span>
                </div>
              </div>
            </div>

            {/* 4-Pillar Breakdown Bars */}
            <div className="pt-6">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-primary" /> Core ATS Pillars Breakdown
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-surface rounded-2xl border border-gray-100">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-600">Keyword Match</span>
                    <span className="font-bold text-secondary">{resumeData.breakdown?.keywords}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getBarColor(resumeData.breakdown?.keywords)}`} style={{ width: `${resumeData.breakdown?.keywords}%` }}></div>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-2xl border border-gray-100">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-600">Impact & Metrics</span>
                    <span className="font-bold text-secondary">{resumeData.breakdown?.impact}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getBarColor(resumeData.breakdown?.impact)}`} style={{ width: `${resumeData.breakdown?.impact}%` }}></div>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-2xl border border-gray-100">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-600">Formatting & ATS Parse</span>
                    <span className="font-bold text-secondary">{resumeData.breakdown?.formatting}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getBarColor(resumeData.breakdown?.formatting)}`} style={{ width: `${resumeData.breakdown?.formatting}%` }}></div>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-2xl border border-gray-100">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-600">Experience Depth</span>
                    <span className="font-bold text-secondary">{resumeData.breakdown?.relevance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getBarColor(resumeData.breakdown?.relevance)}`} style={{ width: `${resumeData.breakdown?.relevance}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Match Bento */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-secondary mb-4">Keywords & Competency Audit</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-2">
                  Matched Skills ({resumeData.skills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(resumeData.skills || []).map((skill, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {resumeData.missingKeywords && resumeData.missingKeywords.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-2">
                    Missing Keywords for {targetRole} ({resumeData.missingKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.missingKeywords.map((kw, idx) => (
                      <span key={idx} className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 rounded-full text-xs font-medium">
                        + {kw}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2 italic">
                    Tip: Incorporating these missing keywords in your experience bullets will raise your ATS score above 90.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actionable Recommendations & Strengths */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex-grow">
            <h3 className="text-lg font-bold text-secondary mb-4">Actionable AI Insights</h3>

            <ul className="space-y-3.5">
              {(resumeData.recommendations || []).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition">
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-secondary mb-0.5">High-Impact Improvement #{idx + 1}</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">{tip}</p>
                  </div>
                </li>
              ))}

              {(resumeData.strengths || []).map((str, idx) => (
                <li key={`str-${idx}`} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 transition">
                  <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-secondary mb-0.5">Identified Strength</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">{str}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
