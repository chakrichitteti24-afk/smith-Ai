import React, { useRef } from 'react';

export default function ResumeInsightsTab({ profile, setProfile, onUpload, isUploading }) {
  const fileInputRef = useRef(null);
  const resumeContext = profile?.resumeContext;
  const hasResume = !!resumeContext && Object.keys(resumeContext).length > 0;

  const handleRemoveResume = () => {
    if (window.confirm('Are you sure you want to remove your resume?')) {
      const newProfile = { ...profile };
      delete newProfile.resumeContext;
      delete newProfile.resumeName;
      delete newProfile.resumeDate;
      delete newProfile.resumeSize;
      
      setProfile(newProfile);
      localStorage.setItem('smith_user_profile', JSON.stringify(newProfile));
    }
  };

  // --- Empty State ---
  if (!hasResume) {
    return (
      <div style={{ padding: '40px', maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '60px 40px', textAlign: 'center', border: '1px solid var(--border-medium)', borderRadius: '16px', backgroundColor: 'var(--bg-surface)', maxWidth: '640px', width: '100%', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(79, 110, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent)' }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Resume Intelligence Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '32px' }}>
            Upload your resume to unlock enterprise-grade AI analysis, ATS compatibility scoring, and dynamically personalized interview rounds based on your actual experience. 
            <br/><br/>
            <span style={{ fontSize: '0.9rem' }}>If no resume is uploaded, interviews will proceed using standard generic questions.</span>
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".pdf,.docx" 
            onChange={onUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{ padding: '14px 28px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: isUploading ? 'wait' : 'pointer', transition: 'all 0.2s', opacity: isUploading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(79, 110, 247, 0.3)' }}
          >
            {isUploading ? 'Analyzing Document...' : 'Upload Resume (PDF/DOCX)'}
          </button>
        </div>
      </div>
    );
  }

  // --- Intelligence Center Populated State ---
  
  // Ensure we use the actual ATS score from the rigorous backend analysis
  const atsScore = resumeContext.atsScore || 0;
  
  // Keyword match approximation based on skills vs role (kept conservative)
  const roleKeywords = profile.role ? profile.role.toLowerCase().split(' ') : [];
  const matchedSkills = resumeContext.skills?.filter(s => roleKeywords.some(rk => s.toLowerCase().includes(rk))) || [];
  const keywordMatchPct = Math.min(100, Math.floor((matchedSkills.length / Math.max(1, roleKeywords.length)) * 100));
  
  // Missing keywords from rigorous backend
  const missingKeywords = resumeContext.missingKeywords || [];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
      
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Resume Intelligence Center</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)', background: 'var(--success-dim)', padding: '4px 10px', borderRadius: '20px' }}>
              <span className="status-dot status-dot--listening" style={{ width: '6px', height: '6px' }}></span>
              Active & Analyzed
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {profile.resumeName} • Uploaded {profile.resumeDate}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.docx" onChange={onUpload} />
          
          <button 
            onClick={handleRemoveResume}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
          >
            Remove
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: isUploading ? 'wait' : 'pointer', opacity: isUploading ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(79, 110, 247, 0.25)' }}
          >
            {isUploading ? 'Analyzing...' : 'Replace Resume'}
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="overview-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>ATS Match Score</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: atsScore >= 80 ? 'var(--success)' : atsScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{atsScore}</div>
          </div>
          <svg width="48" height="48" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-elevated)" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={atsScore >= 80 ? "var(--success)" : atsScore >= 60 ? "var(--warning)" : "var(--danger)"} strokeWidth="3" strokeDasharray={`${atsScore}, 100`} />
          </svg>
        </div>

        <div className="overview-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>Role Keyword Match</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)' }}>{keywordMatchPct}%</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-dim)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
        </div>

        <div className="overview-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>Resume Strength</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{atsScore > 85 ? 'Excellent' : atsScore > 70 ? 'Strong' : 'Average'}</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-medium)' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Parsed Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="overview-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Skills Analysis</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {resumeContext.skills?.length > 0 ? resumeContext.skills.map((s, i) => (
                <span key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
                  {s}
                </span>
              )) : <span style={{ color: 'var(--text-secondary)' }}>No skills extracted.</span>}
            </div>
          </div>

          <div className="overview-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Experience & Projects Analysis</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px' }}>Professional Experience</h4>
                {resumeContext.experience?.length > 0 ? resumeContext.experience.map((exp, i) => (
                  <div key={i} style={{ paddingLeft: '16px', borderLeft: '2px solid var(--border-medium)', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{exp.role}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{exp.company} • {exp.duration}</div>
                  </div>
                )) : <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No experience extracted.</div>}
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px' }}>Key Projects</h4>
                {resumeContext.projects?.length > 0 ? resumeContext.projects.map((p, i) => (
                  <div key={i} style={{ paddingLeft: '16px', borderLeft: '2px solid var(--border-medium)', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>{p.description}</div>
                  </div>
                )) : <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No projects extracted.</div>}
              </div>
            </div>
          </div>
          
          <div className="overview-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Education Analysis</h3>
            {resumeContext.education?.length > 0 ? resumeContext.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{ed.degree}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ed.institution} • {ed.year}</div>
              </div>
            )) : <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No education history extracted.</p>}
          </div>
        </div>

        {/* Right Column: AI Intelligence & Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Interview Preview */}
          <div className="overview-card" style={{ padding: '24px', background: 'linear-gradient(145deg, var(--bg-surface) 0%, rgba(79, 110, 247, 0.03) 100%)', border: '1px solid var(--accent-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Interview Personalization Preview</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              Because your resume is uploaded, Smith AI will dynamically tailor the interview. Expect questions like:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resumeContext.projects?.length > 0 && (
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROJECT DIVE</span>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '4px' }}>"Can you walk me through your technical decisions on <strong>{resumeContext.projects[0].name}</strong>?"</div>
                </div>
              )}
              {resumeContext.skills?.length > 0 && (
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', borderLeft: '3px solid var(--warning)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>SKILL VALIDATION</span>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '4px' }}>"How have you applied <strong>{resumeContext.skills[0]}</strong> in a production environment?"</div>
                </div>
              )}
            </div>
          </div>

          <div className="overview-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>AI Assessment & Suggestions</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <svg width="16" height="16" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Identified Strengths</h4>
              </div>
              <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {resumeContext.strengths?.length > 0 ? resumeContext.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>Solid overall layout and structure.</li>}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <svg width="16" height="16" fill="none" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Areas for Improvement</h4>
              </div>
              <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {resumeContext.recommendations?.length > 0 ? resumeContext.recommendations.map((w, i) => <li key={i}>{w}</li>) : <li>Add more quantifiable metrics to experience.</li>}
              </ul>
            </div>

            {missingKeywords.length > 0 && (
              <div style={{ padding: '16px', background: 'var(--warning-dim)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Missing Core Keywords</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Based on typical {profile.role} roles, consider adding:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {missingKeywords.map(kw => (
                    <span key={kw} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--bg-surface)', border: '1px solid var(--warning)', borderRadius: '4px', color: 'var(--text-primary)' }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
