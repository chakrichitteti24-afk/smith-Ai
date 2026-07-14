import React, { useState, useEffect } from 'react';
import CodingWorkspace from './CodingWorkspace';
import { fetchPracticeQuestion } from '../services/api';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function PracticeTab({ profile }) {
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionData, setQuestionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solvedTitles, setSolvedTitles] = useState([]);

  // Load a new question when difficulty changes or on manual trigger
  const loadQuestion = async (selectedDiff = difficulty) => {
    setIsLoading(true);
    setError(null);
    setQuestionData(null);
    
    try {
      const data = await fetchPracticeQuestion({
        difficulty: selectedDiff,
        role: profile?.role || 'Software Engineer',
        solvedTitles,
      });
      setQuestionData(data);
    } catch (err) {
      setError(err.message || 'Failed to generate coding problem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDifficultySelect = (diff) => {
    setDifficulty(diff);
    loadQuestion(diff);
  };

  const handleCodeSubmitted = (res) => {
    if (questionData) {
      // Mark as solved so we don't repeat it
      setSolvedTitles(prev => [...new Set([...prev, questionData.title])]);
    }
  };

  const handleNextQuestion = () => {
    loadQuestion(difficulty);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Coding Practice</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Hone your skills with AI-generated problems tailored to a {profile?.role || 'Software Engineer'}.
          </p>
        </div>
        
        {/* Difficulty Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-medium)', overflow: 'hidden' }}>
          {DIFFICULTIES.map(diff => (
            <button
              key={diff}
              onClick={() => handleDifficultySelect(diff)}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: difficulty === diff ? 'var(--accent)' : 'transparent',
                color: difficulty === diff ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isLoading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                opacity: (isLoading && difficulty !== diff) ? 0.5 : 1
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '700px', border: '1px solid var(--border-medium)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-elevated)', position: 'relative' }}>
        
        {!questionData && !isLoading && !error && (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💻</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Ready to code?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Select a difficulty level above to generate a new problem.</p>
            <button 
              onClick={() => loadQuestion()}
              style={{ padding: '12px 24px', background: 'var(--accent)', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
            >
              Generate Problem
            </button>
          </div>
        )}

        {isLoading && (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Generating Problem...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tailoring a {difficulty.toLowerCase()} question for {profile?.role || 'Software Engineer'}.</p>
          </div>
        )}

        {error && !isLoading && (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Error</h3>
            <p style={{ fontSize: '0.9rem' }}>{error}</p>
            <button 
              onClick={() => loadQuestion()}
              style={{ marginTop: '24px', padding: '10px 20px', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Try Again
            </button>
          </div>
        )}

        {questionData && !isLoading && (
          <>
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
              <button 
                onClick={handleNextQuestion}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
              >
                Skip / Next Question
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
              </button>
            </div>
            
            <CodingWorkspace 
              questionText={`# ${questionData.title}\n\n${questionData.questionText}\n\n### Examples\n\n${questionData.examples?.map(ex => `**Input:** \`${ex.input}\`\n**Output:** \`${ex.output}\`\n*Explanation:* ${ex.explanation}`).join('\n\n')}`}
              role={profile?.role || 'Software Engineer'}
              level={profile?.level || 'Mid-Level'}
              difficulty={difficulty}
              history={[]}
              resumeContext={profile?.resumeContext}
              interviewType="Practice Round"
              onCodeSubmitted={handleCodeSubmitted}
            />
          </>
        )}

      </div>
    </div>
  );
}
