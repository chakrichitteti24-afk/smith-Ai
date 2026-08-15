import { useState, useEffect, useCallback } from 'react';
import PracticeCodingWorkspace from './PracticeCodingWorkspace';
import { fetchPracticeQuestions, fetchPracticeStats, fetchPracticeQuestionById } from '../services/api';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CATEGORIES = ['All', 'Basics', 'Loops', 'Numbers', 'Array', 'String', 'Searching', 'Sorting', 'Hashing', 'Two Pointers', 'Prefix Sum', 'Linked List', 'Stack', 'Queue', 'Mixed'];

export default function PracticeTab() {
  const [view, setView] = useState('list'); // 'list' or 'workspace'
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('smith_practice_session');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('smith_practice_session', sid);
    }
    return sid;
  });
  
  const [difficulty, setDifficulty] = useState('Beginner');
  const [category, setCategory] = useState('All');
  
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const limit = 20;

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [solvedIds, setSolvedIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('smith_practice_solved') || '[]');
      return new Set(saved);
    } catch {
      return new Set();
    }
  });
  const [stats, setStats] = useState({ total: 0, solved: 0, attempted: 0 });
  const [fullQuestion, setFullQuestion] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  const loadQuestions = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchPracticeQuestions({ difficulty, category, page, limit });
      setQuestions(res.questions || []);
      setTotalQuestions(res.total || 0);
      
      const statsRes = await fetchPracticeStats({ difficulty, sessionId });
      setStats(statsRes);
    } catch (err) {
      setError(err.message || 'Failed to load practice questions');
    } finally {
      setLoading(false);
    }
  }, [difficulty, category, page, sessionId]);

  useEffect(() => {
    let active = true;
    if (!sessionId) return;

    queueMicrotask(() => {
      if (active) {
        setLoading(true);
        setError('');
      }
    });

    Promise.all([
      fetchPracticeQuestions({ difficulty, category, page, limit }),
      fetchPracticeStats({ difficulty, sessionId })
    ]).then(([res, statsRes]) => {
      if (!active) return;
      setQuestions(res.questions || []);
      setTotalQuestions(res.total || 0);
      setStats(statsRes);
    }).catch(err => {
      if (active) setError(err.message || 'Failed to load practice questions');
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [difficulty, category, page, sessionId]);

  const handleSolved = (questionId) => {
    const newSolved = new Set(solvedIds);
    newSolved.add(questionId);
    setSolvedIds(newSolved);
    localStorage.setItem('smith_practice_solved', JSON.stringify(Array.from(newSolved)));
  };

  const openWorkspace = async (index) => {
    setSelectedQuestionIndex(index);
    setFullQuestion(null);
    setView('workspace');
    setWorkspaceLoading(true);
    try {
      const q = await fetchPracticeQuestionById(questions[index].questionId);
      setFullQuestion(q);
    } catch {
      setFullQuestion(null);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const loadAdjacentQuestion = async (newIndex) => {
    if (newIndex < 0 || newIndex >= questions.length) return;
    setSelectedQuestionIndex(newIndex);
    setFullQuestion(null);
    setWorkspaceLoading(true);
    try {
      const q = await fetchPracticeQuestionById(questions[newIndex].questionId);
      setFullQuestion(q);
    } catch {
      setFullQuestion(null);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  if (view === 'workspace') {
    if (workspaceLoading || !fullQuestion) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading question workspace...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }
    return (
      <PracticeCodingWorkspace
        question={fullQuestion}
        questionIndex={selectedQuestionIndex + (page - 1) * limit}
        totalQuestions={totalQuestions}
        difficulty={difficulty}
        sessionId={sessionId}
        onBack={() => setView('list')}
        onNext={() => loadAdjacentQuestion(selectedQuestionIndex + 1)}
        onPrev={() => loadAdjacentQuestion(selectedQuestionIndex - 1)}
        onSolved={handleSolved}
      />
    );
  }

  const solvedCount = stats.solved || solvedIds.size;
  const totalViewCount = category === 'All' ? (stats.total || 100) : (totalQuestions || questions.length);
  const progressPercent = totalViewCount > 0 ? Math.round((solvedCount / totalViewCount) * 100) : 0;

  return (
    <div style={{ padding: '36px 40px', maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header & Difficulty Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Coding Practice Bank
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            HackerRank-style algorithmic practice environment driven directly by your database.
          </p>
        </div>

        {/* Difficulty Pills */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: difficulty === d ? 'var(--accent)' : 'transparent',
                color: difficulty === d ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Overview Card */}
      <div style={{ background: 'var(--bg-card)', padding: '24px 28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-card)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-primary)' }}>
              {category === 'All' ? 'Beginner Total Progress' : `${category} Topic Progress`}: {solvedCount} / {totalViewCount} Solved
            </span>
            <span style={{ color: 'var(--accent)' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'var(--bg-elevated)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalQuestions || 100}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Challenges</div>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>{solvedCount}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Solved</div>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning)' }}>{Math.max(0, (totalQuestions || 100) - solvedCount)}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Remaining</div>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '6px' }}>
          Topics:
        </span>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); setPage(1); }}
            style={{
              padding: '6px 14px',
              background: category === c ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              color: category === c ? 'var(--accent)' : 'var(--text-secondary)',
              border: `1px solid ${category === c ? 'var(--accent)' : 'var(--border-medium)'}`,
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Loading / Error States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.9rem' }}>Loading questions from database...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--danger)', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-medium)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Failed to Load Questions</h3>
          <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>{error}</p>
          <button onClick={loadQuestions} style={{ padding: '8px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px dashed var(--border-medium)' }}>
          <p style={{ fontSize: '0.95rem' }}>No practice challenges found for this topic filter.</p>
        </div>
      ) : (
        /* HackerRank Style Grid of Problem Cards / Boxes */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {questions.map((q, idx) => {
              const isSolved = solvedIds.has(q.questionId);
              const cardNum = String((page - 1) * limit + idx + 1).padStart(2, '0');
              
              return (
                <div 
                  key={q.questionId}
                  onClick={() => openWorkspace(idx)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '16px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>
                        #{cardNum}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: isSolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: isSolved ? 'var(--success)' : 'var(--text-muted)',
                        border: `1px solid ${isSolved ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`
                      }}>
                        {isSolved ? '✓ Solved' : 'Unsolved'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
                      {q.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '3px 9px', borderRadius: '8px' }}>
                      {q.category}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Solve Challenge →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalQuestions > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '8px 18px', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontWeight: 600, fontSize: '0.85rem' }}
              >
                ← Previous Page
              </button>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>
                Page {page} of {Math.ceil(totalQuestions / limit)}
              </span>
              <button 
                disabled={page * limit >= totalQuestions} 
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '8px 18px', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: '8px', cursor: page * limit >= totalQuestions ? 'not-allowed' : 'pointer', opacity: page * limit >= totalQuestions ? 0.5 : 1, fontWeight: 600, fontSize: '0.85rem' }}
              >
                Next Page →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
