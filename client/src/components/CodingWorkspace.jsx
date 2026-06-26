import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { runCode, submitCode } from '../services/api';

const TEMPLATES = {
  javascript: `function solution() {\n  // Write your code here\n  console.log("Hello from JavaScript!");\n}`,
  python: `def solution():\n    # Write your code here\n    print("Hello from Python!")\n\nsolution()`,
  java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println("Hello from Java!");\n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    cout << "Hello from C++!" << endl;\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    printf("Hello from C!\\n");\n    return 0;\n}`,
};

const CodingWorkspace = React.memo(function CodingWorkspace({
  questionText,
  role,
  level,
  history,
  resumeContext,
  interviewType,
  onCodeSubmitted, // callback when code is submitted and Smith responds
}) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(TEMPLATES.javascript);
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError] = useState('');
  const [evaluation, setEvaluation] = useState(null);

  // Sync template on language change
  useEffect(() => {
    setCode(TEMPLATES[language] || '');
  }, [language]);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your code to the default template?')) {
      setCode(TEMPLATES[language] || '');
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleOutput('Executing code...');
    setConsoleError('');
    setEvaluation(null);
    try {
      const result = await runCode({ code, language, input: customInput });
      if (result.stderr) {
        setConsoleError(result.stderr);
        setConsoleOutput('');
      } else {
        setConsoleOutput(result.stdout || 'Code executed successfully with no output.');
        setConsoleError('');
      }
    } catch (err) {
      setConsoleError(err.message || 'An error occurred while running the code.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setConsoleOutput('Submitting and evaluating code with Gemini AI...');
    setConsoleError('');
    setEvaluation(null);
    try {
      const result = await submitCode({
        code,
        language,
        questionText: questionText || 'Solve the coding challenge.',
        role,
        level,
        history,
        resumeContext,
        interviewType,
      });

      setEvaluation(result.evaluation);
      setConsoleOutput(result.evaluation.feedbackText || 'Evaluation complete.');
      
      if (onCodeSubmitted) {
        onCodeSubmitted(result);
      }
    } catch (err) {
      setConsoleError(err.message || 'An error occurred while submitting the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="coding-workspace">
      {/* Editor Header / Toolbar */}
      <div className="workspace-toolbar">
        <div className="toolbar-left">
          <span className="workspace-title">Coding Sandbox</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="lang-select"
            disabled={isRunning || isSubmitting}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
        </div>
        <div className="toolbar-actions">
          <button
            onClick={handleReset}
            className="action-btn action-btn--reset"
            disabled={isRunning || isSubmitting}
          >
            Reset
          </button>
          <button
            onClick={handleRun}
            className="action-btn action-btn--run"
            disabled={isRunning || isSubmitting}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button
            onClick={handleSubmit}
            className="action-btn action-btn--submit"
            disabled={isRunning || isSubmitting}
          >
            {isSubmitting ? 'Evaluating...' : 'Submit Code'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="editor-container">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: 'on',
            automaticLayout: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
            },
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      {/* Input / Console Split Panel */}
      <div className="workspace-console">
        <div className="console-tabs">
          <span className="console-tab active">Output Console</span>
        </div>
        <div className="console-body">
          {/* Custom Input */}
          <div className="console-input-row">
            <span className="console-label">StdIn:</span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Provide custom input here (optional)..."
              className="stdin-input"
              disabled={isRunning || isSubmitting}
            />
          </div>

          {/* Outputs */}
          <div className="console-output-area">
            {consoleError ? (
              <pre className="output-text output-text--error">{consoleError}</pre>
            ) : (
              <pre className="output-text">{consoleOutput || 'Ready to execute code...'}</pre>
            )}
          </div>

          {/* Structured Evaluation Details */}
          {evaluation && (
            <div className="evaluation-details animate-fade-in">
              <p className="eval-header">Gemini Assessment</p>
              <div className="eval-grid">
                <div className="eval-card">
                  <span className="eval-card__label">Correctness</span>
                  <span className="eval-card__desc">{evaluation.correctness}</span>
                </div>
                <div className="eval-card">
                  <span className="eval-card__label">Complexity</span>
                  <span className="eval-card__desc">
                    Time: <code>{evaluation.timeComplexity}</code> | Space: <code>{evaluation.spaceComplexity}</code>
                  </span>
                </div>
                <div className="eval-card">
                  <span className="eval-card__label">Edge Cases</span>
                  <span className="eval-card__desc">{evaluation.edgeCases}</span>
                </div>
                <div className="eval-card">
                  <span className="eval-card__label">Optimization</span>
                  <span className="eval-card__desc">{evaluation.optimization}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CodingWorkspace;
