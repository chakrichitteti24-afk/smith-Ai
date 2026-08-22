import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { runPracticeCode, submitPracticeCode } from '../services/api';

const LANGUAGE_MAP = {
  Python: 'python',
  JavaScript: 'javascript',
  Java: 'java',
  'C++': 'cpp',
  C: 'c'
};

const getStarterCode = (q, lang) => {
  if (!q || !q.starterCode) return '';
  const key = LANGUAGE_MAP[lang] || lang.toLowerCase();
  return q.starterCode[key] || q.starterCode[lang] || q.starterCode[lang.toLowerCase()] || '';
};

export default function PracticeCodingWorkspace({
  question,
  questionIndex,
  totalQuestions,
  difficulty,
  sessionId,
  onBack,
  onNext,
  onPrev,
  onSolved
}) {
  const [language, setLanguage] = useState(
    () => question?.supportedLanguages?.[0] || 'Python'
  );
  const [code, setCode] = useState(() => getStarterCode(question, question?.supportedLanguages?.[0] || 'Python'));
  
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [verdict, setVerdict] = useState(null);

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setLanguage(selected);
    setCode(getStarterCode(question, selected));
    setResults(null);
    setVerdict(null);
  };

  const handleResetCode = () => {
    if (window.confirm("Reset code to starter template?")) {
      const resetVal = getStarterCode(question, language);
      setCode(resetVal);
      setResults(null);
      setVerdict(null);
    }
  };

  const handleRun = async () => {
    if (!question) return;
    setIsRunning(true);
    setVerdict(null);
    try {
      const res = await runPracticeCode({
        questionId: question.questionId,
        code,
        language,
        sessionId
      });
      setResults(res.results || []);
    } catch (err) {
      setVerdict({ status: 'Error', message: err.message || 'Run failed' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!question) return;
    setIsSubmitting(true);
    setResults(null);
    try {
      const res = await submitPracticeCode({
        questionId: question.questionId,
        code,
        language,
        sessionId
      });
      
      const vStatus = res.verdict || (res.allPassed ? 'Accepted' : 'Wrong Answer');
      setVerdict({
        status: vStatus,
        message: res.message || `Passed ${res.passedCount || 0} out of ${res.totalCount || 0} test cases.`,
        passedCount: res.passedCount,
        totalCount: res.totalCount
      });
      setResults(res.results || []);
      
      if (vStatus === 'Accepted') {
        onSolved(question.questionId);
      }
    } catch (err) {
      setVerdict({ status: 'Error', message: err.message || 'Submit failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleCases = question?.sampleTestCases || question?.examples || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: 'var(--bg-app)' }}>
      
      {/* 1. Header Toolbar */}
      <div style={{ height: '48px', padding: '0 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBack}
            className="pro-btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
          >
            ← Back to Question Bank
          </button>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Problem {questionIndex + 1} of {totalQuestions}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            {difficulty}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Language:</span>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            style={{ 
              background: 'var(--bg-surface-elevated)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-medium)', 
              padding: '4px 10px', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.8rem', 
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {(question?.supportedLanguages || ['Python', 'JavaScript', 'Java', 'C++']).map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

      </div>

      {/* 2. Split Problem Statement & Monaco Workspace */}
      <div className="practice-workspace-split" style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Column: Problem Information & Test Cases */}
        <div className="practice-problem-pane" style={{ flex: '0 0 45%', maxWidth: '600px', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                {question?.category || 'Basics'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                #{String(question?.questionId || 1).padStart(2, '0')}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.3' }}>
              {question?.title}
            </h2>
          </div>

          {/* Detailed Problem Breakdown */}
          <div style={{ padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.5px' }}>Task Summary</div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5' }}>
                Write an algorithm that takes input from standard input (<code>stdin</code>), processes it according to the rule, and prints the result to standard output (<code>stdout</code>).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Input Stream</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Standard Input (<code>stdin</code>)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Output Stream</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Standard Output (<code>stdout</code>)</div>
              </div>
            </div>
          </div>

          {/* Sample Test Cases Section */}
          {sampleCases.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                Sample Test Cases
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sampleCases.map((tc, idx) => (
                  <div key={idx} style={{ padding: '12px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>
                    <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '6px', fontSize: '0.75rem', fontFamily: 'inherit' }}>
                      Example #{idx + 1}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Input: </span>
                        <span style={{ color: 'var(--text-primary)', background: 'var(--bg-app)', padding: '2px 6px', borderRadius: '4px' }}>{tc.input}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Output: </span>
                        <span style={{ color: 'var(--success)', background: 'var(--bg-app)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{tc.expectedOutput || tc.output}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Execution Constraints</div>
            <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Time Limit: <strong>2.0 seconds</strong></li>
              <li>Memory Limit: <strong>256 MB</strong></li>
              <li>Pure function or standard I/O execution</li>
            </ul>
          </div>

        </div>

        {/* Right Column: Monaco Code Editor + Output Panel */}
        <div className="practice-editor-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          
          {/* Editor Subheader */}
          <div style={{ height: '36px', padding: '0 16px', background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Monaco Editor &bull; {language}
            </span>
            <button 
              onClick={handleResetCode}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset Code
            </button>
          </div>

          {/* Monaco Editor Canvas */}
          <div style={{ flex: 1, minHeight: '260px' }}>
            <Editor
              height="100%"
              language={LANGUAGE_MAP[language] || 'python'}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                lineNumbers: 'on',
                automaticLayout: true,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Test Case Execution Output Panel */}
          {(verdict || results) && (
            <div style={{ height: '200px', borderTop: '1px solid var(--border-medium)', background: 'var(--bg-surface)', padding: '14px 16px', overflowY: 'auto' }}>
              {verdict && (
                <div style={{ 
                  padding: '8px 12px', 
                  borderRadius: 'var(--radius-sm)', 
                  marginBottom: '10px', 
                  fontSize: '0.84rem', 
                  fontWeight: 700,
                  background: verdict.status === 'Accepted' ? 'var(--success-subtle)' : 'var(--danger-subtle)',
                  color: verdict.status === 'Accepted' ? 'var(--success)' : 'var(--danger)',
                  border: `1px solid ${verdict.status === 'Accepted' ? 'var(--success)' : 'var(--danger)'}`
                }}>
                  {verdict.status === 'Accepted' ? '✓ Accepted — All Test Cases Passed!' : `✕ ${verdict.status}: ${verdict.message}`}
                </div>
              )}

              {results && results.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Test Results</div>
                  {results.map((r, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', borderLeft: `3px solid ${r.passed ? 'var(--success)' : 'var(--danger)'}`, fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: r.passed ? 'var(--success)' : 'var(--danger)' }}>
                        <span>{r.passed ? '✓ Test Case Passed' : '✕ Test Case Failed'} #{i + 1}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{r.executionTimeMs}ms</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Input: <code>{r.input}</code> | Expected: <code>{r.expectedOutput}</code> | Actual: <code>{r.actualOutput?.trim() || '(empty)'}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Execution Controls */}
          <div style={{ height: '52px', padding: '0 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={onPrev} 
                disabled={questionIndex === 0} 
                className="pro-btn-secondary"
                style={{ opacity: questionIndex === 0 ? 0.4 : 1, cursor: questionIndex === 0 ? 'not-allowed' : 'pointer' }}
              >
                ← Prev Problem
              </button>
              <button 
                onClick={onNext} 
                disabled={questionIndex === totalQuestions - 1} 
                className="pro-btn-secondary"
                style={{ opacity: questionIndex === totalQuestions - 1 ? 0.4 : 1, cursor: questionIndex === totalQuestions - 1 ? 'not-allowed' : 'pointer' }}
              >
                Next Problem →
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleRun} 
                disabled={isRunning || isSubmitting}
                className="pro-btn-secondary"
                style={{ cursor: isRunning ? 'wait' : 'pointer', fontWeight: 700 }}
              >
                {isRunning ? 'Running...' : '▶ Run Code'}
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isRunning || isSubmitting}
                className="pro-btn-primary"
                style={{ width: 'auto', padding: '8px 18px', margin: 0, cursor: isSubmitting ? 'wait' : 'pointer' }}
              >
                {isSubmitting ? 'Evaluating...' : '🚀 Submit Solution'}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
