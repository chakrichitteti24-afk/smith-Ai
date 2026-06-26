import React, { useState } from 'react';
import CodingWorkspace from './CodingWorkspace';

export default function PracticeTab({ profile, onStartPractice }) {
  const [activeTab, setActiveTab] = useState('interview'); // 'interview' or 'coding'

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Practice Center</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Hone your skills with AI-driven mock interviews and coding challenges.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('interview')}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'interview' ? 'var(--accent)' : 'var(--bg-elevated)',
            color: activeTab === 'interview' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          Mock Interviews
        </button>
        <button
          onClick={() => setActiveTab('coding')}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'coding' ? 'var(--accent)' : 'var(--bg-elevated)',
            color: activeTab === 'coding' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          Coding Sandbox
        </button>
      </div>

      {/* Interview Practice */}
      {activeTab === 'interview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div className="overview-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🤝</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>HR & Behavioral</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', flexGrow: 1, lineHeight: '1.5' }}>
              Practice standard HR questions, culture fit assessments, and behavioral STAR-method scenarios.
            </p>
            <button 
              className="view-report-btn"
              onClick={() => onStartPractice('Behavioral')}
              style={{ padding: '12px', background: 'var(--accent)', color: '#fff', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Start Behavioral Mock
            </button>
          </div>

          <div className="overview-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💻</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Technical Deep Dive</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', flexGrow: 1, lineHeight: '1.5' }}>
              Simulate technical rounds focusing on architecture, system design, and domain-specific knowledge for your target role.
            </p>
            <button 
              className="view-report-btn"
              onClick={() => onStartPractice('Technical')}
              style={{ padding: '12px', background: 'var(--accent)', color: '#fff', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Start Technical Mock
            </button>
          </div>

          <div className="overview-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🚀</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Project Portfolio</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', flexGrow: 1, lineHeight: '1.5' }}>
              Defend your resume projects. Smith will ask deep probing questions based on your parsed resume technologies.
            </p>
            <button 
              className="view-report-btn"
              onClick={() => onStartPractice('Project')}
              style={{ padding: '12px', background: 'var(--accent)', color: '#fff', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Start Project Mock
            </button>
          </div>

        </div>
      )}

      {/* Coding Practice */}
      {activeTab === 'coding' && (
        <div style={{ height: '75vh', minHeight: '600px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-medium)', borderRadius: '12px', overflow: 'hidden' }}>
          <CodingWorkspace 
            questionText="Write a function that reverses a string and handles edge cases."
            role={profile?.role || 'Software Engineer'}
            level={profile?.level || 'Junior'}
            history={[]}
            resumeContext={profile?.resumeContext}
            interviewType="Practice Round"
            onCodeSubmitted={(res) => console.log('Practice Code Submitted:', res)}
          />
        </div>
      )}

    </div>
  );
}
