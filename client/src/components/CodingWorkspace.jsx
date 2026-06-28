/**
 * CodingWorkspace.jsx
 *
 * Professional LeetCode/HackerRank-style coding interface.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────┐
 *   │  TOP BAR: Question # · Difficulty · Lang · Timer     │
 *   ├─────────────────────┬────────────────────────────────┤
 *   │  PROBLEM STATEMENT  │  MONACO EDITOR                 │
 *   │  (scrollable)       │                                │
 *   │                     │                                │
 *   ├─────────────────────┴────────────────────────────────┤
 *   │  BOTTOM TABS: Test Cases | Console | Results         │
 *   └──────────────────────────────────────────────────────┘
 */

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
      padding: '10px 16px', borderRadius: '10px',
      background: `${color}14`, border: `1px solid ${color}30`,
      minWidth: '90px',
    }}>
      <span style={{ fontSize: '18px', fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>
        {value ?? '—'}
      </span>
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>
        {label}
      </span>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

const CodingWorkspace = React.memo(function CodingWorkspace({
  questionText,
  questionNumber = 1,
  role,
  level,
  difficulty = 'Medium',
  history,
  resumeContext,
  interviewType,
  onCodeSubmitted,
  defaultLanguage = 'javascript',
  spokenLanguage,
}) {
  const normalizedLang = TEMPLATES[defaultLanguage?.toLowerCase()] ? defaultLanguage.toLowerCase() : 'javascript';
  const [language, setLanguage]           = useState(normalizedLang);
  const [code, setCode]                   = useState(TEMPLATES[normalizedLang]);
  const [customInput, setCustomInput]     = useState('');
  const [isRunning, setIsRunning]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError]   = useState('');
  const [evaluation, setEvaluation]       = useState(null);
  const [activeTab, setActiveTab]         = useState('testcase'); // 'testcase' | 'console' | 'results'
  const [submitted, setSubmitted]         = useState(false);

  const timer = useCodingTimer(!submitted);

  // Reset template when language changes
  useEffect(() => {
    setCode(TEMPLATES[language] || '');
  }, [language]);

  const diffStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.Medium;

  // ── Parse the question text into sections ─────────────────────────────────

  const parseQuestion = useCallback((text) => {
    if (!text) return { description: "Follow Smith's instructions to complete the coding challenge.", examples: [], constraints: [] };

    // Very simple heuristic split — real questions from Smith will just be description
    const lines = text.split('\n');
    const description = lines.join('\n').trim();
    return { description, examples: [], constraints: [] };
  }, []);

  const parsed = parseQuestion(questionText);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleReset = () => {
    if (window.confirm('Reset code to the default template?')) {
      setCode(TEMPLATES[language] || '');
      setEvaluation(null);
      setConsoleOutput('');
      setConsoleError('');
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleOutput('Running sample tests...');
    setConsoleError('');
    setActiveTab('console');
    try {
      const result = await runCode({ code, language, input: customInput });
      if (result.stderr) {
        setConsoleError(result.stderr);
        setConsoleOutput('');
      } else {
        setConsoleOutput(result.stdout || '✓ Code executed successfully with no output.');
        setConsoleError('');
      }
    } catch (err) {
      setConsoleError(err.message || 'Execution error.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setConsoleOutput('');
    setConsoleError('');
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="cw-root">
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="cw-topbar">
        <div className="cw-topbar__left">
          <span className="cw-topbar__num">#{questionNumber}</span>
          <span className="cw-topbar__sep" />
          <span className="cw-topbar__title">Coding Assessment</span>
          <span
            className="cw-difficulty-badge"
            style={{ color: diffStyle.color, background: diffStyle.bg }}
          >
            {difficulty}
          </span>
        </div>

        <div className="cw-topbar__center">
          {/* Language Selector */}
          <div className="cw-lang-wrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            <select
              className="cw-lang-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              disabled={isBusy}
            >
              {Object.entries(LANGUAGE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cw-topbar__right">
          <div className="cw-timer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{timer}</span>
          </div>

          <button className="cw-btn cw-btn--ghost" onClick={handleReset} disabled={isBusy}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.39" />
            </svg>
            Reset
          </button>
          <button
            className="cw-btn cw-btn--run"
            onClick={handleRun}
            disabled={isBusy || submitted}
          >
            {isRunning ? (
              <><div className="cw-spinner" /> Running...</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>Run Tests</>
            )}
          </button>
          <button
            className="cw-btn cw-btn--submit"
            onClick={handleSubmit}
            disabled={isBusy || submitted}
          >
            {isSubmitting ? (
              <><div className="cw-spinner cw-spinner--white" /> Evaluating...</>
            ) : submitted ? (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>Submitted</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 2 15 22 11 13 2 9 22 2" /></svg>Submit Solution</>
            )}
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

            {/* Sample test cases section */}
            <div className="cw-problem__section">
              <p className="cw-problem__section-title">Sample Input / Output</p>
              <div className="cw-example-box">
                <div className="cw-example-row">
                  <span className="cw-example-label">Input:</span>
                  <code className="cw-example-val">Provide via StdIn below</code>
                </div>
                <div className="cw-example-row">
                  <span className="cw-example-label">Output:</span>
                  <code className="cw-example-val">Run your code to see output</code>
                </div>
              </div>
            </div>

            <div className="cw-problem__section">
              <p className="cw-problem__section-title">Evaluation Criteria</p>
              <ul className="cw-criteria-list">
                <li>✓ Correctness — does the solution produce correct results?</li>
                <li>✓ Time Complexity — efficiency at scale</li>
                <li>✓ Space Complexity — memory usage</li>
                <li>✓ Code Quality — naming, structure, readability</li>
                <li>✓ Edge Cases — handling of boundary inputs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT — Editor + Console */}
        <div className="cw-editor-pane">
          {/* Monaco Editor */}
          <div className="cw-editor-body">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={val => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'off',
                scrollBeyondLastLine: false,
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                scrollbar: { vertical: 'visible', horizontal: 'auto', verticalScrollbarSize: 6 },
                padding: { top: 14, bottom: 14 },
                overviewRulerLanes: 0,
              }}
            />
          </div>

          {/* Bottom Panel */}
          <div className="cw-bottom">
            {/* Tab Headers */}
            <div className="cw-tabs">
              <button
                className={`cw-tab ${activeTab === 'testcase' ? 'cw-tab--active' : ''}`}
                onClick={() => setActiveTab('testcase')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                Test Cases
              </button>
              <button
                className={`cw-tab ${activeTab === 'console' ? 'cw-tab--active' : ''}`}
                onClick={() => setActiveTab('console')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
                </svg>
                Console
                {consoleError && <span className="cw-tab__dot cw-tab__dot--error" />}
                {consoleOutput && !consoleError && <span className="cw-tab__dot cw-tab__dot--ok" />}
              </button>
              <button
                className={`cw-tab ${activeTab === 'results' ? 'cw-tab--active' : ''}`}
                onClick={() => setActiveTab('results')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Results
                {evaluation && <span className="cw-tab__dot cw-tab__dot--ok" />}
              </button>

              {isSubmitting && (
                <div className="cw-tabs__status">
                  <div className="cw-spinner cw-spinner--accent" />
                  <span>Gemini is evaluating your solution...</span>
                </div>
              )}
              {isRunning && (
                <div className="cw-tabs__status">
                  <div className="cw-spinner cw-spinner--accent" />
                  <span>Executing code...</span>
                </div>
              )}
            </div>

            {/* Tab Panels */}
            <div className="cw-tab-panel">

              {/* TEST CASES TAB */}
              {activeTab === 'testcase' && (
                <div className="cw-tc-panel">
                  <div className="cw-tc-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    Custom Input (StdIn)
                  </div>
                  <textarea
                    className="cw-stdin"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Enter custom input to pass to your program..."
                    disabled={isBusy}
                    rows={4}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button
                      className="cw-btn cw-btn--run"
                      onClick={handleRun}
                      disabled={isBusy || submitted}
                      style={{ fontSize: '12px', padding: '6px 14px' }}
                    >
                      {isRunning ? 'Running...' : 'Run with this Input'}
                    </button>
                  </div>
                </div>
              )}

              {/* CONSOLE TAB */}
              {activeTab === 'console' && (
                <div className="cw-console-panel">
                  {consoleError ? (
                    <div className="cw-console-error">
                      <div className="cw-console-error__header">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        Runtime Error
                      </div>
                      <pre className="cw-output cw-output--error">{consoleError}</pre>
                    </div>
                  ) : consoleOutput ? (
                    <div className="cw-console-ok">
                      <div className="cw-console-ok__header">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Execution Output
                      </div>
                      <pre className="cw-output">{consoleOutput}</pre>
                    </div>
                  ) : (
                    <div className="cw-console-empty">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.25, marginBottom: '8px' }}>
                        <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
                      </svg>
                      <span>Run your code to see output here</span>
                    </div>
                  )}
                </div>
              )}

              {/* RESULTS TAB */}
              {activeTab === 'results' && (
                <div className="cw-results-panel">
                  {isSubmitting ? (
                    <div className="cw-results-loading">
                      <div className="cw-spinner cw-spinner--accent" style={{ width: '24px', height: '24px', borderWidth: '3px' }} />
                      <span>Gemini AI is evaluating your solution...</span>
                    </div>
                  ) : evaluation ? (
                    <div className="cw-results-content">
                      {/* Verdict Banner */}
                      <div className={`cw-verdict ${evaluation.passed !== false ? 'cw-verdict--pass' : 'cw-verdict--fail'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          {evaluation.passed !== false
                            ? <polyline points="20 6 9 17 4 12"/>
                            : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                          }
                        </svg>
                        <span>{evaluation.passed !== false ? 'Solution Accepted' : 'Needs Improvement'}</span>
                      </div>

                      {/* Score Grid */}
                      <div className="cw-score-grid">
                        <ScorePill label="Correctness" value={evaluation.correctness} color="#22c55e" />
                        <ScorePill label="Time" value={evaluation.timeComplexity} color="#3b82f6" />
                        <ScorePill label="Space" value={evaluation.spaceComplexity} color="#8b5cf6" />
                        <ScorePill label="Quality" value={evaluation.codeQuality} color="#f59e0b" />
                      </div>

                      {/* Detail Cards */}
                      {[
                        { label: 'Edge Cases',   value: evaluation.edgeCases,   icon: '🔍' },
                        { label: 'Optimization', value: evaluation.optimization, icon: '⚡' },
                        { label: 'Feedback',     value: evaluation.feedbackText, icon: '💬' },
                      ].filter(d => d.value).map(d => (
                        <div key={d.label} className="cw-detail-card">
                          <div className="cw-detail-card__label">{d.icon} {d.label}</div>
                          <div className="cw-detail-card__text">{d.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="cw-results-empty">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2, marginBottom: '10px' }}>
                        <polyline points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      <span>Submit your solution to see the evaluation here</span>
                    </div>
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
