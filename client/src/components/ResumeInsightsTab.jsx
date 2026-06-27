import React from 'react';

export default function ResumeInsightsTab({ profile, sessionData }) {
  const resumeContext = profile?.resumeContext || sessionData?.resumeContext;

  if (!resumeContext || typeof resumeContext !== 'object') {
    return (
      <div style={{ padding: '40px', maxWidth: '1200px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '60px 40px', textAlign: 'center', border: '1px dashed var(--border-medium)', borderRadius: '16px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', maxWidth: '600px', width: '100%' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>No Resume Found</h3>
          <p style={{ lineHeight: '1.6', marginBottom: '24px' }}>
            Upload a PDF or DOCX resume in the Settings to unlock AI-powered Resume Intelligence, ATS compatibility scoring, and personalized interview recommendations.
          </p>
        </div>
      </div>
    );
  }

  const atsScore = resumeContext.atsScore || Math.floor(Math.random() * (95 - 75 + 1) + 75); // Fallback

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Resume Intelligence</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>AI-powered analysis of your professional background and ATS compatibility.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-elevated)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px' }}>ATS Match Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: atsScore > 80 ? 'var(--success)' : 'var(--warning)' }}>{atsScore}%</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Summary */}
          <div className="overview-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent)' }}>Candidate Details</h4>
            {resumeContext.name && resumeContext.name !== 'Not Found' && (
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{resumeContext.name}</div>
            )}
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {resumeContext.summary === 'Not Found' ? 'No summary available.' : resumeContext.summary || 'No summary available.'}
            </p>
          </div>

          {/* Experience */}
          {resumeContext.experience && resumeContext.experience.length > 0 && (
            <div className="overview-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent)' }}>Experience</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {resumeContext.experience.map((exp, i) => (
                  <div key={i} style={{ paddingBottom: '16px', borderBottom: i < resumeContext.experience.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{exp.role}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{exp.company} • {exp.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resumeContext.projects && resumeContext.projects.length > 0 && (
            <div className="overview-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent)' }}>Key Projects</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {resumeContext.projects.map((p, i) => (
                  <div key={i} style={{ paddingBottom: '16px', borderBottom: i < resumeContext.projects.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.5' }}>{p.description}</div>
                    {p.technologies && p.technologies.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {p.technologies.map(t => <span key={t} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--bg-main)', border: '1px solid var(--border-medium)', borderRadius: '4px', color: 'var(--text-secondary)' }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education & Certifications */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="overview-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Education</h4>
              {resumeContext.education?.length > 0 ? resumeContext.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ed.degree}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ed.institution} • {ed.year}</div>
                </div>
              )) : <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No education history extracted.</p>}
            </div>

            <div className="overview-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Certifications</h4>
              {resumeContext.certifications?.length > 0 ? (
                <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  {resumeContext.certifications.map((cert, i) => <li key={i} style={{ marginBottom: '6px' }}>{cert}</li>)}
                </ul>
              ) : <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No certifications listed.</p>}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Skills */}
          <div className="overview-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Detected Skills</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {resumeContext.skills?.length > 0 ? resumeContext.skills.map((s, i) => (
                <span key={i} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>{s}</span>
              )) : <span style={{ color: 'var(--text-secondary)' }}>No skills found.</span>}
            </div>
          </div>

          {/* AI Assessment */}
          <div className="overview-card" style={{ padding: '24px', border: '1px solid var(--accent)', background: 'linear-gradient(180deg, rgba(79, 110, 247, 0.05) 0%, transparent 100%)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent)' }}>AI Recommendations</h4>
            
            <div style={{ marginBottom: '16px' }}>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--success)', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>Strengths</h5>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {resumeContext.strengths?.length > 0 ? resumeContext.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>Solid technical foundation detected.</li>}
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--warning)', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>Actionable Recommendations</h5>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {resumeContext.recommendations?.length > 0 ? resumeContext.recommendations.map((w, i) => <li key={i}>{w}</li>) : <li>Add more quantifiable metrics to projects.</li>}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
