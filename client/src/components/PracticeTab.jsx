import React, { useState } from 'react';
import CodingWorkspace from './CodingWorkspace';
import { fetchPracticeQuestion } from '../services/api';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const PRACTICE_PROBLEMS = [
  { id: 'p1', title: 'Two Sum & Target Array', difficulty: 'Beginner', category: 'Arrays & Math', solved: true, summary: 'Find indices of two numbers that add up to a target value.' },
  { id: 'p2', title: 'Valid Palindrome & String Clean', difficulty: 'Beginner', category: 'Strings', solved: true, summary: 'Determine if a string is a valid palindrome after removing non-alphanumeric characters.' },
  { id: 'p3', title: 'LRU Cache Architecture', difficulty: 'Intermediate', category: 'Hash Maps & Linked Lists', solved: false, summary: 'Design and implement a Least Recently Used (LRU) data structure with O(1) ops.' },
  { id: 'p4', title: 'Binary Tree Level Order Traversal', difficulty: 'Intermediate', category: 'Trees & BFS', solved: false, summary: 'Return the level order traversal of a binary tree nodes values.' },
  { id: 'p5', title: 'Longest Substring Without Repeating Characters', difficulty: 'Intermediate', category: 'Sliding Window', solved: false, summary: 'Find the length of the longest substring without repeating characters.' },
  { id: 'p6', title: 'Merge k Sorted Linked Lists', difficulty: 'Advanced', category: 'Heaps & Linked Lists', solved: false, summary: 'Merge k sorted linked lists and return it as one sorted list.' },
  { id: 'p7', title: 'Trapping Rain Water Algorithm', difficulty: 'Advanced', category: 'Two Pointers & DP', solved: false, summary: 'Compute how much water an elevation map can trap after raining.' },
  { id: 'p8', title: 'Distributed Rate Limiter Design', difficulty: 'Expert', category: 'System Design & Concurrency', solved: false, summary: 'Implement a Token Bucket or Leaky Bucket rate limiting algorithm for APIs.' },
];

export default function PracticeTab({ profile, onStartPractice }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProblem, setActiveProblem] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solvedTitles, setSolvedTitles] = useState(['Two Sum & Target Array', 'Valid Palindrome & String Clean']);

  const loadQuestion = async (selectedDiff = selectedDifficulty, customTitle = null) => {
    setIsLoading(true);
    setError(null);
    setQuestionData(null);
    
    try {
      const data = await fetchPracticeQuestion({
        difficulty: selectedDiff,
        role: profile?.role || 'Software Engineer',
        solvedTitles,
      });
      if (customTitle) {
        data.title = customTitle;
      }
      setQuestionData(data);
    } catch (err) {
      setError(err.message || 'Failed to generate coding problem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProblem = (problem) => {
    setActiveProblem(problem);
    loadQuestion(problem.difficulty, problem.title);
  };

  const handleCodeSubmitted = () => {
    if (questionData) {
      setSolvedTitles(prev => [...new Set([...prev, questionData.title])]);
    }
  };

  const categories = ['All', ...new Set(PRACTICE_PROBLEMS.map(p => p.category))];

  const filteredProblems = PRACTICE_PROBLEMS.filter(p => {
    const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesDiff && matchesCat;
  });

  // If solving a specific problem in editor mode
  if (activeProblem || questionData || isLoading || error) {
    return (
      <div className="practice-workspace-wrapper" style={{ padding: '24px 32px', maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            onClick={() => { setActiveProblem(null); setQuestionData(null); setError(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Back to Problem List
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {questionData && (
              <span className={`difficulty-badge difficulty-badge--${selectedDifficulty.toLowerCase()}`} style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {selectedDifficulty}
              </span>
            )}
            <button 
              onClick={() => loadQuestion(selectedDifficulty)}
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent)', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: isLoading ? 'wait' : 'pointer' }}
            >
              Next Problem
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
            </button>
          </div>
        </div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--border-medium)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-surface)', position: 'relative' }}>
          {isLoading && (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Generating Problem...</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tailoring a {selectedDifficulty.toLowerCase()} coding question for {profile?.role || 'Software Engineer'}.</p>
            </div>
          )}

          {error && !isLoading && (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Execution Error</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>{error}</p>
              <button 
                onClick={() => loadQuestion(selectedDifficulty)}
                style={{ padding: '10px 20px', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Try Again
              </button>
            </div>
          )}

          {questionData && !isLoading && (
            <CodingWorkspace 
              questionText={`# ${questionData.title}\n\n${questionData.questionText}\n\n### Examples\n\n${questionData.examples?.map(ex => `**Input:** \`${ex.input}\`\n**Output:** \`${ex.output}\`\n*Explanation:* ${ex.explanation}`).join('\n\n')}`}
              role={profile?.role || 'Software Engineer'}
              level={profile?.level || 'Mid-Level'}
              difficulty={selectedDifficulty}
              history={[]}
              resumeContext={profile?.resumeContext}
              interviewType="Practice Round"
              onCodeSubmitted={handleCodeSubmitted}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header & Difficulty Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>Coding Practice</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Sharpen your algorithmic problem solving with curated LeetCode-style questions for {profile?.role || 'Software Engineer'}.
          </p>
        </div>

        {/* Difficulty Selector Pills */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-medium)' }}>
          {DIFFICULTIES.map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: selectedDifficulty === diff ? 'var(--accent)' : 'transparent',
                color: selectedDifficulty === diff ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out'
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '8px' }}>Categories:</span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: selectedCategory === cat ? 'var(--accent)' : 'var(--border-medium)',
              background: selectedCategory === cat ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              color: selectedCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Problem List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredProblems.map(p => {
          const isSolved = solvedTitles.includes(p.title) || p.solved;
          return (
            <div 
              key={p.id}
              onClick={() => handleSelectProblem(p)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: p.difficulty === 'Beginner' ? 'rgba(34, 197, 94, 0.1)' : p.difficulty === 'Intermediate' ? 'rgba(79, 140, 255, 0.1)' : p.difficulty === 'Advanced' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: p.difficulty === 'Beginner' ? 'var(--success)' : p.difficulty === 'Intermediate' ? 'var(--accent)' : p.difficulty === 'Advanced' ? 'var(--warning)' : 'var(--danger)',
                  }}>
                    {p.difficulty}
                  </span>

                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isSolved ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isSolved ? '✓ Solved' : 'Unsolved'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.3' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {p.summary}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', pt: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{p.category}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Solve Problem
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

