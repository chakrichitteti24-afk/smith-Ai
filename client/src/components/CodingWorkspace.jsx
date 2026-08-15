import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { runCode, submitCode } from '../services/api';

// ── Code Templates ──────────────────────────────────────────────────────────

const TEMPLATES = {
  javascript: `/**
 * @param {any} input
 * @return {any}
 */
function solution(input) {
  // Write your solution here
  
}`,
  python: `def solution(input):
    # Write your solution here
    pass`,
  java: `public class Solution {
    public static Object solution(Object input) {
        // Write your solution here
        return null;
    }
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

// Write your solution here
int main() {
    
    return 0;
}`,
  c: `#include <stdio.h>
#include <stdlib.h>

// Write your solution here
int main() {
    
    return 0;
}`,
};

const LANGUAGE_LABELS = {
  javascript: 'JavaScript',
  python: 'Python 3',
  java: 'Java 17',
  cpp: 'C++ 17',
  c: 'C 11',
};

const DIFFICULTY_STYLES = {
  Easy:        { color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  Medium:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  Hard:        { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  Beginner:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  Intermediate:{ color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  Expert:      { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
};

// ── Timer Hook ──────────────────────────────────────────────────────────────

function useCodingTimer(active) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (active) {
      ref.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
    return () => clearInterval(ref.current);
  }, [active]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ── Score Pill ──────────────────────────────────────────────────────────────

function ScorePill({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px', border: '1px solid var(--border-subtle)'
    }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 800, color, marginTop: '2px' }}>{value || '—'}</span>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

const CodingWorkspace = React.memo(function CodingWorkspace({
  questionText = '',
  questionNumber = 1,
  difficulty = 'Medium',
  role = 'Software Engineer',
  level = 'Mid Level',
  spokenLanguage = 'English',
  history = [],
  resumeContext = null,
  interviewType = 'Technical Round',
  onCodeSubmitted,
  defaultLanguage = 'javascript',
}) {
  const [language, setLanguage]         = useState(defaultLanguage);
  const [code, setCode]                 = useState(TEMPLATES[defaultLanguage] || TEMPLATES.javascript);
  const [customInput, setCustomInput]   = useState('');
  const [activeTab, setActiveTab]       = useState('testcase');
  const [isRunning, setIsRunning]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError]   = useState('');
  const [evaluation, setEvaluation]     = useState(null);
  const [submitted, setSubmitted]       = useState(false);

  const timer = useCodingTimer(!submitted);
  const diffStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.Medium;

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(TEMPLATES[newLang] || TEMPLATES.javascript);
  };

  const parseQuestionText = useCallback((raw) => {
    if (!raw) return { title: 'Coding Challenge', description: 'Solve the problem.' };
    const lines = raw.split('\n').filter(Boolean);
    const title = lines[0]?.replace(/^#+\s*/, '') || 'Coding Challenge';
    const description = lines.slice(1).join('\n').trim() || raw;
    return { title, description };
  }, []);

  const parsed = parseQuestionText(questionText);

  const handleReset = () => {
    setCode(TEMPLATES[language] || TEMPLATES.javascript);
    setConsoleOutput('');
    setConsoleError('');
    setEvaluation(null);
    setSubmitted(false);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleOutput('');
    setConsoleError('');
    setActiveTab('console');
    try {
      const result = await runCode({ code, language, stdin: customInput, input: customInput });
      if (result.error) {
        setConsoleError(result.error);
      } else {
        setConsoleOutput(result.stdout || '(No output produced)');
      }
    } catch (err) {
      setConsoleError(err.message || 'Execution error.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setEvaluation(null);
    setActiveTab('results');
    try {
      const result = await submitCode({
        code,
        language,
        spokenLanguage,
        questionText: questionText || 'Solve the coding challenge.',
        role,
        level,
        difficulty,
        history,
        resumeContext,
        interviewType,
      });

      setEvaluation(result.evaluation);
      setSubmitted(true);

      if (onCodeSubmitted) {
        onCodeSubmitted(result);
      }
    } catch (err) {
      setConsoleError(err.message || 'Submission failed.');
      setActiveTab('console');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isRunning || isSubmitting;

  return (
    <div className="cw-root macos-window">
      {/* ── TOP BAR WITH TRAFFIC LIGHTS ────────────────────────────────── */}
      <div className="cw-topbar macos-titlebar" style={{ padding: '8px 16px' }}>
        <div className="cw-topbar__left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="macos-traffic-lights">
            <span className="macos-traffic-dot macos-traffic-dot--red" />
            <span className="macos-traffic-dot macos-traffic-dot--yellow" />
            <span className="macos-traffic-dot macos-traffic-dot--green" />
          </div>
          <span className="cw-topbar__num" style={{ fontWeight: 800 }}>#{questionNumber}</span>
          <span className="cw-topbar__sep" />
          <span className="cw-topbar__title" style={{ fontWeight: 700 }}>Xcode IDE — {parsed.title}</span>
          <span
            className="cw-difficulty-badge"
            style={{ color: diffStyle.color, background: diffStyle.bg, padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}
          >
            {difficulty}
          </span>
        </div>

        <div className="cw-topbar__center">
          <div className="cw-lang-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            <select
              className="cw-lang-select"
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
              disabled={isBusy}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {Object.entries(LANGUAGE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cw-topbar__right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="cw-timer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{timer}</span>
          </div>

          <button className="cw-btn cw-btn--ghost" onClick={handleReset} disabled={isBusy} style={{ padding: '6px 12px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            Reset
          </button>
          <button
            className="cw-btn cw-btn--run"
            onClick={handleRun}
            disabled={isBusy || submitted}
            style={{ padding: '6px 14px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
          >
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
          <button
            className="cw-btn cw-btn--submit"
            onClick={handleSubmit}
            disabled={isBusy || submitted}
            style={{ padding: '6px 16px', borderRadius: '6px', background: 'var(--accent)', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 800, boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' }}
          >
            {isSubmitting ? 'Evaluating...' : submitted ? 'Submitted' : 'Submit Solution'}
          </button>
        </div>
      </div>

      {/* ── MAIN SPLIT ──────────────────────────────────────────────────── */}
      <div className="cw-split">

        {/* LEFT — Problem Statement */}
        <div className="cw-problem">
          <div className="cw-problem__header">
            <span className="cw-section-label">Problem Statement</span>
          </div>
          <div className="cw-problem__body">
            <div className="cw-problem__desc" style={{ whiteSpace: 'pre-wrap' }}>
              {parsed.description || "Follow Smith's instructions to complete the coding challenge."}
            </div>

            <div className="cw-problem__section">
              <p className="cw-problem__section-title">Evaluation Criteria</p>
              <ul className="cw-criteria-list">
                <li>✓ Correctness — does the solution produce correct results?</li>
                <li>✓ Time Complexity — efficiency at scale</li>
                <li>✓ Space Complexity — memory usage</li>
                <li>✓ Code Quality — naming, structure, readability</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT — Monaco Editor + Terminal */}
        <div className="cw-editor-pane">
          <div className="cw-editor-wrap">
            <Editor
              height="100%"
              language={language === 'python' ? 'python' : language === 'cpp' || language === 'c' ? 'cpp' : language}
              value={code}
              onChange={val => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                padding: { top: 12 },
                readOnly: submitted,
              }}
            />
          </div>

          {/* BOTTOM TABS */}
          <div className="cw-bottom">
            <div className="cw-tabs">
              <button
                className={`cw-tab ${activeTab === 'testcase' ? 'cw-tab--active' : ''}`}
                onClick={() => setActiveTab('testcase')}
              >
                Test Cases
              </button>
              <button
                className={`cw-tab ${activeTab === 'console' ? 'cw-tab--active' : ''}`}
                onClick={() => setActiveTab('console')}
              >
                Console
              </button>
              <button
                className={`cw-tab ${activeTab === 'results' ? 'cw-tab--active' : ''}`}
                onClick={() => setActiveTab('results')}
              >
                Results
              </button>
            </div>

            {/* Tab Panels */}
            <div className="cw-tab-panel">
              {activeTab === 'testcase' && (
                <div className="cw-tc-panel" style={{ padding: '12px' }}>
                  <textarea
                    className="cw-stdin"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Enter custom input..."
                    disabled={isBusy}
                    rows={3}
                    style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', borderRadius: '6px', padding: '8px', outline: 'none' }}
                  />
                </div>
              )}

              {activeTab === 'console' && (
                <div className="cw-console-panel" style={{ padding: '12px' }}>
                  {consoleError ? (
                    <pre className="cw-output cw-output--error" style={{ color: 'var(--danger)', margin: 0 }}>{consoleError}</pre>
                  ) : consoleOutput ? (
                    <pre className="cw-output" style={{ color: 'var(--text-primary)', margin: 0 }}>{consoleOutput}</pre>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Run your code to see output here</span>
                  )}
                </div>
              )}

              {activeTab === 'results' && (
                <div className="cw-results-panel" style={{ padding: '12px' }}>
                  {evaluation ? (
                    <div className="cw-results-content">
                      <div className="cw-score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        <ScorePill label="Passed" value={evaluation.passedTestCases} color="#22c55e" />
                        <ScorePill label="Failed" value={evaluation.failedTestCases} color="#ef4444" />
                        <ScorePill label="Time" value={evaluation.timeComplexity} color="#3b82f6" />
                        <ScorePill label="Space" value={evaluation.spaceComplexity} color="#8b5cf6" />
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Submit your solution to see evaluation here</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default CodingWorkspace;
