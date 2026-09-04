import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckSquare, Clock, Terminal, Loader2, ChevronDown, ListFilter, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  fetchPracticeQuestions,
  fetchPracticeQuestionById,
  runPracticeCode,
  submitPracticeCode
} from '../services/api';

const FALLBACK_QUESTION = {
  questionId: 92,
  title: 'Check for balanced parentheses in an expression.',
  category: 'Stack',
  difficulty: 'Beginner',
  description: 'Given a string containing parentheses `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.',
  sampleTestCases: [
    { input: '()[]{}', expectedOutput: 'true' },
    { input: '(]', expectedOutput: 'false' }
  ],
  starterCode: {
    python: 'def isValid(s: str) -> bool:\n    # Write your solution below\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else "#"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nimport sys\ninput_str = sys.stdin.read().strip()\nif input_str:\n    print(str(isValid(input_str)).lower())\n',
    javascript: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\n\nfunction isValid(s) {\n    const stack = [];\n    const map = { ")": "(", "}": "{", "]": "[" };\n    for (const char of s) {\n        if (map[char]) {\n            if (stack.pop() !== map[char]) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}\n\nif (input) console.log(isValid(input));\n',
    cpp: '#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << "true" << endl;\n    }\n    return 0;\n}\n',
    java: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            System.out.println("true");\n        }\n    }\n}\n'
  },
  supportedLanguages: ['Python', 'JavaScript', 'Java', 'C++']
};

export default function Practice() {
  const [questionsList, setQuestionsList] = useState([]);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('console');
  const [testResults, setTestResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Load question list and initial question
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        // 1. Fetch questions list
        const res = await fetchPracticeQuestions({ limit: 50 });
        const list = res.questions || [];
        setQuestionsList(list);

        // 2. Fetch question 92 or first question in list
        const initialId = list.some(q => q.questionId === 92) ? 92 : (list[0]?.questionId || 92);
        try {
          const detail = await fetchPracticeQuestionById(initialId);
          setQuestion(detail);
          applyStarterCode(detail, language);
        } catch (detailErr) {
          console.warn('Could not load specific question, using fallback', detailErr);
          setQuestion(FALLBACK_QUESTION);
          applyStarterCode(FALLBACK_QUESTION, language);
        }
      } catch (err) {
        console.error('Failed to load questions from backend:', err);
        setQuestion(FALLBACK_QUESTION);
        applyStarterCode(FALLBACK_QUESTION, language);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const applyStarterCode = (q, lang) => {
    if (!q || !q.starterCode) return;
    const l = lang.toLowerCase();
    if (l === 'python' && q.starterCode.python) setCode(q.starterCode.python);
    else if (l === 'javascript' && q.starterCode.javascript) setCode(q.starterCode.javascript);
    else if (l === 'java' && q.starterCode.java) setCode(q.starterCode.java);
    else if ((l === 'c++' || l === 'cpp') && q.starterCode.cpp) setCode(q.starterCode.cpp);
    else setCode('# Write your solution here\n');
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    applyStarterCode(question, lang);
  };

  const handleQuestionSelect = async (e) => {
    const qId = parseInt(e.target.value);
    if (!qId || qId === question?.questionId) return;

    try {
      setLoading(true);
      setErrorMessage('');
      const detail = await fetchPracticeQuestionById(qId);
      setQuestion(detail);
      applyStarterCode(detail, language);
      setOutput('');
      setTestResults([]);
    } catch (err) {
      console.error('Error fetching question:', err);
      setErrorMessage(`Failed to load question: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runCode = async (isSubmission = false) => {
    if (!question) return;
    setIsRunning(true);
    setErrorMessage('');
    setActiveTab(isSubmission ? 'results' : 'console');
    setOutput(isSubmission ? 'Submitting code against all hidden test suites...' : 'Executing code on secure backend container...');

    try {
      let apiLang = language.toLowerCase();
      if (apiLang === 'c++') apiLang = 'cpp';

      const qId = question.questionId || question.id;
      const data = isSubmission 
        ? await submitPracticeCode({ questionId: qId, code, language: apiLang })
        : await runPracticeCode({ questionId: qId, code, language: apiLang });

      let outText = '';
      if (data.error) {
        outText = `Error: ${data.error.message}`;
        setOutput(outText);
      } else {
        const passedCount = data.results?.filter(r => r.passed).length || 0;
        const totalCount = data.results?.length || 0;
        const isPassed = data.allPassed || data.verdict === 'Accepted';

        outText = `Verdict: ${data.verdict || (isPassed ? 'Accepted' : 'Wrong Answer')}\n`;
        outText += `Passed: ${passedCount} / ${totalCount} test cases\n`;
        if (data.message) outText += `${data.message}\n`;
        outText += `────────────────────────────────────────\n\n`;

        data.results?.forEach((r) => {
          outText += `Test Case #${r.testCaseIndex}: ${r.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
          outText += `Input:    ${r.input}\n`;
          outText += `Expected: ${r.expectedOutput}\n`;
          outText += `Actual:   ${r.actualOutput || 'N/A'}\n\n`;
        });

        setOutput(outText);
        setTestResults(data.results || []);
      }
    } catch (err) {
      setOutput(`Execution error: ${err.message}`);
      setErrorMessage(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading && !question) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
        <p className="text-sm font-medium text-gray-500">Loading DSA Arena from Neon DB...</p>
      </div>
    );
  }

  const supportedLanguages = question?.supportedLanguages || ['Python', 'JavaScript', 'Java', 'C++'];

  return (
    <div className="flex-grow flex flex-col gap-3 h-[calc(100vh-140px)] w-full">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-semibold text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      <div className="flex-grow flex gap-4 h-full w-full overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-surface/50 rounded-t-2xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase">
                  {question.category || 'Algorithms'}
                </span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {question.difficulty || 'Easy'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                <Clock size={12} /> 45:00
              </div>
            </div>

            {/* Question Selector Dropdown */}
            {questionsList.length > 0 && (
              <div className="relative">
                <select
                  value={question.questionId || question.id}
                  onChange={handleQuestionSelect}
                  className="w-full text-xs font-medium text-secondary bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none hover:border-primary transition appearance-none cursor-pointer pr-8 truncate"
                >
                  {questionsList.map((q) => (
                    <option key={q.questionId} value={q.questionId}>
                      #{q.questionId}: {q.title} ({q.category})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            )}

            <h2 className="text-lg font-bold text-secondary tracking-tight">{question.title}</h2>
          </div>

          <div className="p-6 space-y-6 flex-grow prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{question.description || 'No description provided.'}</ReactMarkdown>

            {question.sampleTestCases && question.sampleTestCases.length > 0 && (
              <>
                <h3 className="font-bold text-base text-secondary mt-6 border-b pb-2">Sample Test Cases</h3>
                {question.sampleTestCases.map((tc, idx) => (
                  <div key={idx} className="bg-surface rounded-xl p-4 font-mono text-xs text-secondary space-y-2 mt-4 border border-gray-100">
                    <div>
                      <span className="text-gray-500 font-bold block mb-1">Input {idx + 1}:</span>
                      <pre className="bg-white/80 p-2 rounded text-secondary border border-gray-100 overflow-x-auto">{tc.input}</pre>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-500 font-bold block mb-1">Expected Output:</span>
                      <pre className="bg-white/80 p-2 rounded text-secondary border border-gray-100 overflow-x-auto">{tc.expectedOutput}</pre>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Panel - IDE & Terminal */}
        <div className="w-2/3 flex flex-col gap-4">
          {/* Editor Pane */}
          <div className="flex-grow bg-[#121412] rounded-2xl overflow-hidden flex flex-col border border-gray-800 shadow-xl">
            <div className="h-10 border-b border-gray-800 flex items-center px-4 justify-between bg-[#1A1C1A]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Language:</span>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent text-gray-200 text-xs font-semibold outline-none cursor-pointer border border-gray-700 rounded px-2 py-1"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang} value={lang} className="bg-gray-900 text-white">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>
            </div>
            <div className="flex-grow">
              <Editor
                height="100%"
                defaultLanguage={language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()}
                language={language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Menlo, monospace',
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>

          {/* Terminal Pane */}
          <div className="h-64 bg-[#121412] rounded-2xl border border-gray-800 flex flex-col overflow-hidden shadow-xl">
            <div className="h-10 border-b border-gray-800 flex items-center px-4 gap-4 bg-[#1A1C1A]">
              <button
                onClick={() => setActiveTab('console')}
                className={`text-xs font-medium h-full flex items-center gap-1.5 transition ${
                  activeTab === 'console' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Terminal size={14} /> Console Output
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`text-xs font-medium h-full flex items-center gap-1.5 transition ${
                  activeTab === 'results' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <CheckSquare size={14} /> Test Results ({testResults.length})
              </button>
            </div>
            <div className="p-4 font-mono text-xs flex-grow overflow-y-auto whitespace-pre-wrap leading-relaxed">
              <div className={output ? 'text-gray-200' : 'text-gray-500'}>
                {output || '# Click "Run Code" or "Submit Code" to execute against the backend.'}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-3 border-t border-gray-800 flex justify-end gap-3 bg-[#1A1C1A]">
              <button
                onClick={() => runCode(false)}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Run Code
              </button>
              <button
                onClick={() => runCode(true)}
                disabled={isRunning}
                className="px-5 py-1.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isRunning ? <Loader2 size={13} className="animate-spin" /> : <CheckSquare size={13} />} Submit Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
