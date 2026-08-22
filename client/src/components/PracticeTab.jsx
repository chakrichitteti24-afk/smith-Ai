import { useState, useEffect, useCallback } from 'react';
import PracticeCodingWorkspace from './PracticeCodingWorkspace';
import { fetchPracticeQuestions, fetchPracticeStats, fetchPracticeQuestionById } from '../services/api';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CATEGORIES = ['All', 'Basics', 'Loops', 'Numbers', 'Array', 'String', 'Searching', 'Sorting', 'Hashing', 'Two Pointers', 'Prefix Sum', 'Linked List', 'Stack', 'Queue', 'Mixed'];

export default function PracticeTab() {
  const [view, setView] = useState('list');
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
        <div className="pro-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading question workspace...</p>
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
    <div className="pro-page-container">
      
      {/* Header */}
      <div className="pro-header">
        <div>
          <h2 className="pro-header-title">Coding Practice Bank</h2>
          <p className="pro-header-subtitle">
            HackerRank-style algorithmic practice environment driven directly by your question bank.
          </p>
        </div>

        {/* Difficulty Selector */}
        <div className="pro-chip-row">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(1); }}
              className={`pro-chip ${difficulty === d ? 'active' : ''}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Card */}
      <div className="pro-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.86rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-primary)' }}>
              {category === 'All' ? 'Total Solved' : `${category} Topic Progress`}: {solvedCount} / {totalViewCount} Solved
            </span>
            <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-full)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="pro-pill-badge">
            Total: <strong>{totalQuestions || 100}</strong>
          </div>
          <div className="pro-pill-badge">
            Solved: <strong style={{ color: 'var(--success)' }}>{solvedCount}</strong>
          </div>
          <div className="pro-pill-badge">
            Remaining: <strong style={{ color: 'var(--warning)' }}>{Math.max(0, (totalQuestions || 100) - solvedCount)}</strong>
          </div>
        </div>
      </div>

      {/* Topic Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '6px' }}>
          Topic:
        </span>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); setPage(1); }}
            className={`pro-chip ${category === c ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid of Problems */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.88rem' }}>Loading questions from database...</p>
        </div>
      ) : error ? (
        <div className="pro-card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '12px' }}>{error}</p>
          <button onClick={loadQuestions} className="pro-btn-secondary">Retry</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {questions.map((q, idx) => {
              const isSolved = solvedIds.has(q.questionId);
              const cardNum = String((page - 1) * limit + idx + 1).padStart(2, '0');
              
              return (
                <div 
                  key={q.questionId}
                  onClick={() => openWorkspace(idx)}
                  className="pro-card"
                  style={{ cursor: 'pointer', justifyContent: 'space-between', gap: '14px', padding: '20px' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                        #{cardNum}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: isSolved ? 'var(--success-subtle)' : 'var(--bg-surface-elevated)', color: isSolved ? 'var(--success)' : 'var(--text-muted)' }}>
                        {isSolved ? '✓ Solved' : 'Unsolved'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {q.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {q.category}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>
                      Solve →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalQuestions > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="pro-btn-secondary"
                style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                ← Prev
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Page {page} of {Math.ceil(totalQuestions / limit)}
              </span>
              <button 
                disabled={page * limit >= totalQuestions} 
                onClick={() => setPage(p => p + 1)}
                className="pro-btn-secondary"
                style={{ opacity: page * limit >= totalQuestions ? 0.5 : 1, cursor: page * limit >= totalQuestions ? 'not-allowed' : 'pointer' }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
