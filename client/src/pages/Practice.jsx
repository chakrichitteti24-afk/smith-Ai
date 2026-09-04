import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  CheckSquare,
  Clock,
  Terminal,
  Loader2,
  ChevronDown,
  AlertCircle,
  BookOpen,
  Code2,
  Cpu
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  fetchPracticeQuestions,
  fetchPracticeQuestionById,
  runPracticeCode,
  submitPracticeCode
} from '../services/api';

const FALLBACK_QUESTION = {
  questionId: 1,
  title: 'Check whether a number is even or odd.',
  category: 'Basics',
  difficulty: 'Beginner',
  description: 'Given an integer `n`, determine whether it is even or odd.\n\n### Input Format\nA single integer `n` from standard input.\n\n### Output Format\nPrint `"Even"` if the number is even, or `"Odd"` if the number is odd.',
  sampleTestCases: [
    { input: '4', expectedOutput: 'Even' },
    { input: '5', expectedOutput: 'Odd' }
  ],
  starterCode: {
    python: `import sys\n\ndef solution(n: int) -> str:\n    # Write your solution below\n    pass\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    if line:\n        print(solution(int(line)))\n`,
    javascript: `const fs = require('fs');\n\nfunction solution(n) {\n  // Write your solution below\n  \n}\n\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) console.log(solution(parseInt(input, 10)));\n`,
    cpp: `#include <iostream>\nusing namespace std;\n\nstring solution(int n) {\n    // Write your solution below\n    return "";\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << solution(n) << endl;\n    }\n    return 0;\n}\n`,
    java: `import java.util.*;\n\npublic class Solution {\n    public static String solution(int n) {\n        // Write your solution below\n        return "";\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            System.out.println(solution(sc.nextInt()));\n        }\n    }\n}\n`
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
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'results'
  const [mobileTab, setMobileTab] = useState('problem'); // 'problem' | 'editor' | 'terminal'
  const [testResults, setTestResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Load question list and initial question
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const res = await fetchPracticeQuestions({ limit: 50 });
        const list = res.questions || [];
        setQuestionsList(list);

        const initialId = list[0]?.questionId || 1;
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
    else setCode('// Write your solution below\n');
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    applyStarterCode(question, lang);
  };

  const handleQuestionSelect = async (e) => {
    const qId = parseInt(e.target.value, 10);
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

    // On mobile, automatically show the terminal tab so the candidate sees results
    setMobileTab('terminal');

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
      <div className="flex-grow flex flex-col items-center justify-center gap-3 min-h-[50vh]">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
        <p className="text-sm font-medium text-gray-500">Loading DSA Arena from Neon DB...</p>
      </div>
    );
  }

  const supportedLanguages = question?.supportedLanguages || ['Python', 'JavaScript', 'Java', 'C++'];

  return (
    <div className="flex-grow flex flex-col gap-3 w-full max-w-7xl mx-auto pb-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-semibold text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      {/* Mobile-Only Responsive Segmented Navigation Control */}
      <div className="lg:hidden flex items-center bg-gray-100 p-1 rounded-2xl gap-1 shrink-0">
        <button
          onClick={() => setMobileTab('problem')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'problem' ? 'bg-white text-secondary shadow-xs' : 'text-gray-500 hover:text-secondary'
          }`}
        >
          <BookOpen size={14} /> Problem
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'editor' ? 'bg-white text-primary shadow-xs' : 'text-gray-500 hover:text-secondary'
          }`}
        >
          <Code2 size={14} /> Editor
        </button>
        <button
          onClick={() => setMobileTab('terminal')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'terminal' ? 'bg-white text-secondary shadow-xs' : 'text-gray-500 hover:text-secondary'
          }`}
        >
          <Terminal size={14} /> Output {testResults.length > 0 && `(${testResults.filter(r => r.passed).length}/${testResults.length})`}
        </button>
      </div>

      {/* Main Container: On Desktop (lg+) Side-by-Side, on Mobile Stacks cleanly */}
      <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch min-h-[calc(100vh-170px)]">
        {/* Left Panel - Problem Description */}
        <div
          className={`w-full lg:w-5/12 bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-hidden transition-all ${
            mobileTab === 'problem' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-surface/50 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {question.category || 'Algorithms'}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {question.difficulty || 'Beginner'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
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

            <h2 className="text-base sm:text-lg font-bold text-secondary tracking-tight">{question.title}</h2>
          </div>

          <div className="p-4 sm:p-6 space-y-5 flex-grow overflow-y-auto prose prose-sm max-w-none text-gray-700 max-h-[600px] lg:max-h-[calc(100vh-260px)]">
            <ReactMarkdown>{question.description || 'No description provided.'}</ReactMarkdown>

            {question.sampleTestCases && question.sampleTestCases.length > 0 && (
              <div className="pt-2">
                <h3 className="font-bold text-sm text-secondary border-b pb-2">Sample Test Cases</h3>
                {question.sampleTestCases.map((tc, idx) => (
                  <div key={idx} className="bg-surface rounded-xl p-3 font-mono text-xs text-secondary space-y-1.5 mt-3 border border-gray-100">
                    <div>
                      <span className="text-gray-500 font-bold block mb-0.5">Input:</span>
                      <pre className="bg-white p-2 rounded text-secondary border border-gray-100 overflow-x-auto text-[11px]">{tc.input}</pre>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block mb-0.5">Expected Output:</span>
                      <pre className="bg-white p-2 rounded text-secondary border border-gray-100 overflow-x-auto text-[11px]">{tc.expectedOutput}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - IDE & Terminal */}
        <div
          className={`w-full lg:w-7/12 flex flex-col gap-4 ${
            mobileTab === 'problem' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Editor Pane */}
          <div
            className={`bg-[#121412] rounded-3xl overflow-hidden flex flex-col border border-gray-800 shadow-xl min-h-[360px] lg:min-h-[420px] ${
              mobileTab === 'terminal' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="h-10 border-b border-gray-800 flex items-center px-4 justify-between bg-[#1A1C1A]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Language:</span>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent text-gray-200 text-xs font-semibold outline-none cursor-pointer border border-gray-700 rounded px-2 py-0.5"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang} value={lang} className="bg-gray-900 text-white">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons in Editor Header for Mobile Accessibility */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => runCode(false)}
                  disabled={isRunning}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Run
                </button>
                <button
                  onClick={() => runCode(true)}
                  disabled={isRunning}
                  className="px-3.5 py-1 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition shadow-xs disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {isRunning ? <Loader2 size={12} className="animate-spin" /> : <CheckSquare size={12} />} Submit
                </button>
              </div>
            </div>

            <div className="flex-grow min-h-[300px] lg:min-h-[360px]">
              <Editor
                height="100%"
                defaultLanguage={language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()}
                language={language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Menlo, monospace',
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>

          {/* Terminal / Results Pane */}
          <div
            className={`bg-[#121412] rounded-3xl border border-gray-800 flex flex-col overflow-hidden shadow-xl min-h-[200px] lg:h-64 ${
              mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="h-10 border-b border-gray-800 flex items-center px-4 justify-between bg-[#1A1C1A]">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`text-xs font-semibold h-full flex items-center gap-1.5 transition cursor-pointer ${
                    activeTab === 'console' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Terminal size={14} /> Console
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`text-xs font-semibold h-full flex items-center gap-1.5 transition cursor-pointer ${
                    activeTab === 'results' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <CheckSquare size={14} /> Test Results ({testResults.length})
                </button>
              </div>
              <button
                onClick={() => setOutput('')}
                className="text-[10px] text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="p-4 font-mono text-xs flex-grow overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-56">
              <div className={output ? 'text-gray-200' : 'text-gray-500'}>
                {output || '# Click "Run Code" to test against samples, or "Submit Code" to test all hidden suites.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
