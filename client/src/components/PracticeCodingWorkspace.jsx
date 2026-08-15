import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { runPracticeCode, submitPracticeCode } from '../services/api';

const LANGUAGE_MAP = {
  Python: 'python',
  JavaScript: 'javascript',
  Java: 'java',
  C: 'c',
  'C++': 'cpp',
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
    if (window.confirm("Are you sure you want to reset your code to the starter template?")) {
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

  const renderVerdict = () => {
    if (!verdict) return null;
    
    let colorBg = 'var(--bg-elevated)';
    let colorText = 'var(--text-primary)';
    let statusText = verdict.status || 'Result';
    let messageText = verdict.message || '';
    
    if (statusText === 'Accepted') {
      colorBg = 'rgba(16, 185, 129, 0.15)';
      colorText = 'var(--success)';
      messageText = '✓ All test cases passed! Problem solved successfully. 🎉';
    } else if (statusText === 'Wrong Answer') {
      colorBg = 'rgba(244, 63, 94, 0.15)';
      colorText = 'var(--danger)';
    } else if (statusText === 'Runtime Error') {
      colorBg = 'rgba(245, 158, 11, 0.15)';
      colorText = 'var(--warning)';
    } else if (statusText === 'Compilation Error' || statusText === 'Error') {
      colorBg = 'rgba(244, 63, 94, 0.15)';
      colorText = 'var(--danger)';
    }

    return (
      <div style={{ 
        backgroundColor: colorBg, 
        color: colorText, 
        padding: '0.85rem 1.2rem', 
        borderRadius: 'var(--radius-md)', 
        marginBottom: '1rem',
        border: `1px solid ${colorText}`,
        fontSize: '0.92rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between'
      }}>
        <span>{statusText}: {messageText}</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', minHeight: '650px', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* macOS Header Bar */}
      <div className="macos-titlebar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="macos-traffic-lights">
            <span className="macos-traffic-dot macos-traffic-dot--red" />
            <span className="macos-traffic-dot macos-traffic-dot--yellow" />
            <span className="macos-traffic-dot macos-traffic-dot--green" />
          </div>
          <button 
            onClick={onBack} 
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '5px 14px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.15s ease' }}
          >
            ← Back to Questions
          </button>
        </div>
        
        <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Problem {questionIndex + 1} / {totalQuestions}</span>
          <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(10,132,255,0.15)', fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700 }}>
            {difficulty}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Language:</span>
          <select 
            value={language} 
            onChange={handleLanguageChange} 
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', padding: '5px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {(question?.supportedLanguages || ['Python', 'JavaScript', 'Java', 'C', 'C++']).map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Panel: Question Statement */}
        <div style={{ flex: '0 0 42%', borderRight: '1px solid var(--border-subtle)', overflowY: 'auto', padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: 800 }}>
            {question?.title}
          </h2>
          
          {question?.category && (
            <span style={{ display: 'inline-block', marginBottom: '1.25rem', padding: '0.25rem 0.75rem', background: 'var(--accent-subtle)', border: '1px solid var(--border-hover)', color: 'var(--accent)', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700 }}>
              {question.category}
            </span>
          )}
          
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.65', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            {question?.description?.split('\n').map((line, i) => (
              <p key={i} style={{ marginBottom: '0.75rem' }}>{line}</p>
            ))}
          </div>

          {question?.examples && question.examples.length > 0 && (
            <>
              <hr style={{ borderColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>Examples</h3>
              {question.examples.map((ex, i) => (
                <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                  <div style={{ marginBottom: '0.4rem' }}><strong style={{ color: 'var(--accent)' }}>Input:</strong> {ex.input}</div>
                  <div style={{ marginBottom: '0.4rem' }}><strong style={{ color: 'var(--success)' }}>Output:</strong> {ex.output}</div>
                  {ex.explanation && <div style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif', fontSize: '0.82rem', marginTop: '0.4rem' }}><em>Explanation:</em> {ex.explanation}</div>}
                </div>
              ))}
            </>
          )}

          {question?.constraints && question.constraints.length > 0 && (
            <>
              <hr style={{ borderColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Constraints</h3>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', fontSize: '0.88rem', lineHeight: '1.6' }}>
                {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </>
          )}
        </div>

        {/* Right Panel: Editor + Output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          
          {/* Editor Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Source Code</span>
            <button 
              onClick={handleResetCode} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
            >
              🔄 Reset Code
            </button>
          </div>

          {/* Monaco Editor Container */}
          <div style={{ flex: 1, minHeight: '300px', position: 'relative' }}>
            <Editor
              height="100%"
              language={LANGUAGE_MAP[language] || 'python'}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: 'on',
                automaticLayout: true,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Test Results Output Panel */}
          {(results || verdict) && (
            <div style={{ height: '240px', minHeight: '180px', borderTop: '2px solid var(--border-medium)', background: 'var(--bg-surface)', padding: '1rem', overflowY: 'auto' }}>
              {renderVerdict()}
              
              {results && results.length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700 }}>Test Case Results</h4>
                  {results.map((res, i) => (
                    <div key={i} style={{ 
                      padding: '0.75rem 1rem', 
                      marginBottom: '0.6rem',
                      background: 'var(--bg-elevated)',
                      borderLeft: `4px solid ${res.passed ? 'var(--success)' : 'var(--danger)'}`,
                      borderRadius: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 700 }}>
                        <span style={{ color: res.passed ? 'var(--success)' : 'var(--danger)' }}>
                          {res.passed ? '✓ Test Case Passed' : '✕ Test Case Failed'} #{i + 1}
                        </span>
                        {res.executionTime !== undefined && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>{res.executionTime}s</span>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><strong style={{ color: 'var(--text-muted)' }}>Input:</strong> {res.input}</div>
                        <div><strong style={{ color: 'var(--text-muted)' }}>Expected:</strong> {res.expectedOutput || res.expected}</div>
                        <div><strong style={{ color: 'var(--text-muted)' }}>Actual Output:</strong> {res.actualOutput || res.actual || '(empty)'}</div>
                        {res.error && <div style={{ color: 'var(--danger)', marginTop: '4px' }}><strong>Error:</strong> {res.error}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={onPrev} 
            disabled={questionIndex === 0} 
            style={{ padding: '0.5rem 1rem', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: '8px', cursor: questionIndex === 0 ? 'not-allowed' : 'pointer', opacity: questionIndex === 0 ? 0.5 : 1, fontWeight: 600, fontSize: '0.85rem' }}
          >
            ← Previous Question
          </button>
          <button 
            onClick={onNext} 
            disabled={questionIndex === totalQuestions - 1} 
            style={{ padding: '0.5rem 1rem', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: '8px', cursor: questionIndex === totalQuestions - 1 ? 'not-allowed' : 'pointer', opacity: questionIndex === totalQuestions - 1 ? 0.5 : 1, fontWeight: 600, fontSize: '0.85rem' }}
          >
            Next Question →
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={handleRun} 
            disabled={isRunning || isSubmitting}
            style={{ padding: '0.55rem 1.4rem', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: '8px', cursor: isRunning ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.88rem' }}
          >
            {isRunning ? 'Running Code...' : '▶ Run Code'}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isRunning || isSubmitting}
            style={{ padding: '0.55rem 1.5rem', background: 'var(--accent)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
          >
            {isSubmitting ? 'Submitting...' : '🚀 Submit Solution'}
          </button>
        </div>
      </div>
    </div>
  );
}
