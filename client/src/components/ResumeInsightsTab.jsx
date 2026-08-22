import { useRef, useState } from 'react';

export default function ResumeInsightsTab({ profile, setProfile, onUpload, isUploading }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const simulatedEvent = { target: { files: [file] } };
      onUpload(simulatedEvent);
    }
  };

  // ── Empty State: Upload Zone ──────────────────────────────────────────────
  if (!hasResume) {
    return (
      <div className="pro-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="pro-card"
          style={{ 
            padding: '56px 40px', 
            textAlign: 'center', 
            maxWidth: '620px', 
            width: '100%', 
            border: isDragOver ? '2px dashed var(--accent)' : '1px dashed var(--border-medium)',
            background: isDragOver ? 'var(--accent-subtle)' : 'var(--bg-surface)',
            alignItems: 'center'
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--border-accent)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Resume Intelligence & ATS Auditor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55', marginBottom: '24px', maxWidth: '460px' }}>
            Upload your resume to extract engineering competencies, calculate your live ATS match score, and generate tailored interview rounds.
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
            className="pro-btn-primary"
            style={{ maxWidth: '300px' }}
          >
            {isUploading ? 'Auditing with AI...' : 'Upload Resume (PDF / DOCX)'}
          </button>
        </div>
      </div>
    );
  }

  // ── Populated State: Intelligence Center ──────────────────────────────────
  const atsScore = resumeContext.atsScore || 0;
  const roleKeywords = profile.role ? profile.role.toLowerCase().split(' ') : [];
  const matchedSkills = resumeContext.skills?.filter(s => roleKeywords.some(rk => s.toLowerCase().includes(rk))) || [];
  const keywordMatchPct = Math.min(100, Math.floor((matchedSkills.length / Math.max(1, roleKeywords.length)) * 100));

  return (
    <div className="pro-page-container">
      
      {/* Header */}
      <div className="pro-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', background: 'var(--success-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              ● RESUME CONNECTED
            </span>
          </div>
          <h2 className="pro-header-title">Resume Intelligence Center</h2>
          <p className="pro-header-subtitle">
            {profile.resumeName} &bull; Analyzed on {profile.resumeDate}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.docx" onChange={onUpload} />
          <button onClick={handleRemoveResume} className="pro-btn-secondary" style={{ color: 'var(--danger)' }}>
            Remove
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="pro-btn-secondary">
            {isUploading ? 'Analyzing...' : 'Replace Resume'}
          </button>
        </div>
      </div>

      {/* Top 3 Score Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        
        <div className="pro-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>ATS Match Score</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {atsScore}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--success)', background: 'var(--success-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
            Grade {atsScore >= 80 ? 'A+' : 'A'}
          </span>
        </div>

        <div className="pro-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Role Keyword Match</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>
              {keywordMatchPct}%
            </div>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Target: {profile.role}</span>
        </div>

        <div className="pro-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Overall Quality</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {atsScore > 80 ? 'Exceptional' : 'Strong Profile'}
            </div>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--success)' }}>✓ Production Ready</span>
        </div>

      </div>

      {/* Main Analysis Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Skills & Experience */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="pro-card">
            <div className="pro-card-header">
              <div className="pro-card-title">Extracted Technical Skills</div>
              <span style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700 }}>
                {resumeContext.skills?.length || 0} Detected
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {resumeContext.skills?.map((s, i) => (
                <span key={i} style={{ padding: '4px 10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="pro-card">
            <div className="pro-card-header">
              <div className="pro-card-title">Experience & Projects</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {resumeContext.experience?.map((exp, i) => (
                <div key={i} style={{ paddingLeft: '12px', borderLeft: '2px solid var(--accent)' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exp.role}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{exp.company} &bull; {exp.duration}</div>
                </div>
              ))}

              {resumeContext.projects?.map((p, i) => (
                <div key={i} style={{ paddingLeft: '12px', borderLeft: '2px solid var(--border-medium)' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>{p.description}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Interview Formulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="pro-card" style={{ border: '1px solid var(--border-accent)' }}>
            <div className="pro-card-header">
              <div className="pro-card-title">Live Interview Personalization</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700 }}>AI FORMULATED</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
              Smith AI connects to this resume to challenge you on your real stack:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resumeContext.projects?.[0] && (
                <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>System Architecture Challenge</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                    "Can you walk me through the system design and performance tradeoffs you made on <strong>{resumeContext.projects[0].name}</strong>?"
                  </div>
                </div>
              )}

              {resumeContext.skills?.[0] && (
                <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>Deep-Dive Technical Challenge</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                    "How do you handle concurrency, state synchronization, and edge cases when working with <strong>{resumeContext.skills[0]}</strong>?"
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pro-card">
            <div className="pro-card-header">
              <div className="pro-card-title">AI Optimization Recommendations</div>
            </div>
            <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {resumeContext.recommendations?.map((r, i) => (
                <li key={i}>{r}</li>
              )) || <li>Include more quantifiable business impact metrics (e.g. throughput increased by X%).</li>}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
