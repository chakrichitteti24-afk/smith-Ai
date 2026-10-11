'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Grid,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Cpu,
  CornerDownLeft,
  Filter,
  CheckCheck,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  fetchPracticeQuestions,
  fetchPracticeQuestionById,
  runPracticeCode,
  submitPracticeCode,
  fetchPracticeStats
} from '../services/api';
import STATIC_QUESTIONS from '../data/fallbackQuestions';

const DIFFICULTY_CONFIG = {
  Beginner:     { dot: 'bg-zinc-500', text: 'text-zinc-400', label: 'Beginner' },
  Easy:         { dot: 'bg-zinc-400', text: 'text-zinc-300', label: 'Easy' },
  Intermediate: { dot: 'bg-zinc-300', text: 'text-zinc-200', label: 'Intermediate' },
  Medium:       { dot: 'bg-zinc-300', text: 'text-zinc-200', label: 'Medium' },
  Advanced:     { dot: 'bg-white',    text: 'text-white',    label: 'Advanced' },
  Hard:         { dot: 'bg-white',    text: 'text-white',    label: 'Hard' }
};

export default function Practice() {
  // View mode: 'cards' (Catalog) | 'workspace' (IDE)
  const [viewMode, setViewMode] = useState('cards');

  // Question catalog state
  const [questionsList, setQuestionsList] = useState(
    STATIC_QUESTIONS.map(q => ({
      questionId: q.questionId,
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      description: q.description
    }))
  );
  const [question, setQuestion] = useState(STATIC_QUESTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 100, solved: 0 });

  // Editor & Execution state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionVerdict, setExecutionVerdict] = useState(null); // 'Accepted' | 'Wrong Answer' | 'Error'
  const [activeConsoleTab, setActiveConsoleTab] = useState('results'); // 'results' | 'terminal'
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [mobileTab, setMobileTab] = useState('editor'); // 'problem' | 'editor' | 'terminal'
  const [testResults, setTestResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [specTab, setSpecTab] = useState('description'); // 'description' | 'cases' | 'hints'

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const runCodeRef = useRef();

  // Load questions and stats on mount
  useEffect(() => {
    async function initCatalog() {
      try {
        const res = await fetchPracticeQuestions({ limit: 100 });
        if (res.questions && res.questions.length > 0) {
          setQuestionsList(res.questions);
        }
      } catch (err) {
        console.warn('Using local static question catalog:', err.message);
      }

      try {
        const st = await fetchPracticeStats();
        if (st && st.total !== undefined) {
          setStats({ total: st.total, solved: st.solved || 0 });
        }
      } catch {}
    }
    initCatalog();
  }, []);

  // Update starter code when question or language changes
  useEffect(() => {
    if (question) {
      applyStarterCode(question, language);
    }
  }, [question, language]);

  const applyStarterCode = (q, lang) => {
    if (!q) return;
    const l = (lang || 'python').toLowerCase();
    if (q.starterCode) {
      if (l === 'python' && q.starterCode.python) { setCode(q.starterCode.python); return; }
      if (l === 'javascript' && q.starterCode.javascript) { setCode(q.starterCode.javascript); return; }
      if (l === 'java' && q.starterCode.java) { setCode(q.starterCode.java); return; }
      if ((l === 'c++' || l === 'cpp') && q.starterCode.cpp) { setCode(q.starterCode.cpp); return; }
    }

    if (l === 'python') {
      setCode(`# Read standard input and solve\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == "__main__":\n    main()\n`);
    } else if (l === 'javascript') {
      setCode(`const fs = require('fs');\n\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n`);
    } else if (l === 'c++' || l === 'cpp') {
      setCode(`#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n`);
    } else if (l === 'java') {
      setCode(`import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n`);
    } else {
      setCode('// Write your solution below\n');
    }
  };

  const selectQuestionById = async (qId) => {
    const id = parseInt(qId, 10);
    if (!id) return;

    setLoading(true);
    setErrorMessage('');
    setOutput('');
    setTestResults([]);
    setExecutionVerdict(null);
    setActiveTestCaseIdx(0);

    const localMatch = STATIC_QUESTIONS.find(q => q.questionId === id);
    if (localMatch) {
      setQuestion(localMatch);
      applyStarterCode(localMatch, language);
    }

    try {
      const detail = await fetchPracticeQuestionById(id);
      if (detail && detail.questionId) {
        setQuestion(detail);
        applyStarterCode(detail, language);
      }
    } catch (err) {
      console.warn('Fallback for question detail ID:', id, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPick = async (qId) => {
    await selectQuestionById(qId);
    setViewMode('workspace');
    setMobileTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentIdx = useMemo(() => {
    const activeId = question?.questionId || question?.id || 1;
    return questionsList.findIndex(q => (q.questionId || q.id) === activeId);
  }, [question, questionsList]);

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      selectQuestionById(questionsList[currentIdx - 1].questionId || questionsList[currentIdx - 1].id);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questionsList.length - 1) {
      selectQuestionById(questionsList[currentIdx + 1].questionId || questionsList[currentIdx + 1].id);
    }
  };

  const runCode = async (isSubmission = false) => {
    if (!question || isRunning) return;
    setIsRunning(true);
    setErrorMessage('');
    setActiveConsoleTab('results');
    setMobileTab('terminal');
    setOutput(
      isSubmission
        ? 'Executing solution against full evaluation suite in sandbox...'
        : 'Compiling and executing against sample test cases...'
    );

    try {
      let apiLang = language.toLowerCase();
      if (apiLang === 'c++') apiLang = 'cpp';

      const qId = question.questionId || question.id;
      const data = isSubmission
        ? await submitPracticeCode({ questionId: qId, code, language: apiLang })
        : await runPracticeCode({ questionId: qId, code, language: apiLang });

      if (data.error) {
        setOutput(`Error: ${data.error.message}`);
        setErrorMessage(data.error.message);
        setExecutionVerdict('Error');
        return;
      }

      const passedCount = data.results?.filter(r => r.passed).length || 0;
      const totalCount = data.results?.length || 0;
      const isPassed = data.allPassed || data.verdict === 'Accepted';

      setExecutionVerdict(isPassed ? 'Accepted' : 'Wrong Answer');
      setTestResults(data.results || []);
      setActiveTestCaseIdx(0);

      // Re-fetch stats on successful submission
      if (isSubmission && isPassed) {
        fetchPracticeStats().then(st => st && setStats({ total: st.total, solved: st.solved || 0 })).catch(() => {});
      }

      let outText = `Verdict: ${data.verdict || (isPassed ? 'ACCEPTED' : 'WRONG ANSWER')}\n`;
      outText += `Passed: ${passedCount} / ${totalCount} Cases\n\n`;
      if (data.message) outText += `Summary: ${data.message}\n\n`;

      data.results?.forEach(r => {
        outText += `[Case #${r.testCaseIndex || 1}] ${r.passed ? 'PASSED' : 'FAILED'} (${r.executionTimeMs || 0}ms)\n`;
        outText += `Input:    ${r.input}\nExpected: ${r.expectedOutput}\nActual:   ${r.actualOutput || '[empty]'}\n`;
        if (r.stderr) outText += `Stderr:\n${r.stderr}\n`;
        outText += `----------------------------------------\n`;
      });

      setOutput(outText);
    } catch (err) {
      setOutput(`Execution failure: ${err.message}`);
      setErrorMessage(err.message);
      setExecutionVerdict('Error');
    } finally {
      setIsRunning(false);
    }
  };

  runCodeRef.current = runCode;

  const handleEditorDidMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (runCodeRef.current) runCodeRef.current(false);
    });
    if (monaco?.editor?.setUnexpectedErrorHandler) {
      monaco.editor.setUnexpectedErrorHandler(err => {
        if (err && String(err).includes('Canceled')) return;
        console.error(err);
      });
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  const categoriesWithCounts = useMemo(() => {
    const counts = { All: questionsList.length };
    questionsList.forEach(q => { counts[q.category] = (counts[q.category] || 0) + 1; });
    return counts;
  }, [questionsList]);

  const filteredQuestions = useMemo(() => {
    return questionsList.filter(q => {
      if (selectedCategory !== 'All' && q.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        return q.title?.toLowerCase().includes(query)
          || q.category?.toLowerCase().includes(query)
          || String(q.questionId || q.id).includes(query);
      }
      return true;
    });
  }, [questionsList, selectedCategory, selectedDifficulty, searchQuery]);

  const activeQuestionId = question?.questionId || question?.id || 1;
  const supportedLanguages = question?.supportedLanguages || ['Python', 'JavaScript', 'Java', 'C++'];

  return (
    <div className="flex-grow flex flex-col gap-6 w-full max-w-7xl mx-auto pb-8 animate-fadeIn font-sans text-zinc-100">

      {/* ── Top Header & Mode Dock ─────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Code Arena
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
              {stats.solved} / {stats.total} Solved
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1.5 flex items-center gap-2">
            <span>GCC 13 · Node.js 22 · Python 3.12 · OpenJDK 21</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-300">Isolated 50ms Sandbox</span>
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-white/[0.02] border border-white/[0.07] rounded-full font-mono text-xs">
          <button
            onClick={() => { setViewMode('cards'); setMobileTab('problem'); }}
            className={`px-4 py-1.5 rounded-full transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'cards'
                ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Grid size={13} />
            <span>Problem Catalog ({questionsList.length})</span>
          </button>
          <button
            onClick={() => { setViewMode('workspace'); setMobileTab('editor'); }}
            className={`px-4 py-1.5 rounded-full transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'workspace'
                ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 size={13} />
            <span>Sandbox #{activeQuestionId}</span>
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-[#140b0d] border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs animate-fadeIn font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-zinc-400 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-zinc-500 hover:text-white cursor-pointer">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── VIEW 1: PROBLEM CATALOG ────────────────────────────────────────── */}
      {viewMode === 'cards' && (
        <div className="space-y-4 animate-fadeIn">

          {/* Search & Difficulty Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0b0d13] border border-white/[0.07]">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-3 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search challenges by title, category, or #id (e.g. 'Two Sum', '#21')..."
                className="w-full pl-9 pr-8 py-2 rounded-xl linear-input text-xs font-mono text-white placeholder-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto pb-1 md:pb-0 shrink-0">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'bg-white/[0.02] text-zinc-400 hover:text-white border border-white/[0.05]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Filters Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs no-scrollbar">
            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mr-1 shrink-0 flex items-center gap-1">
              <Layers size={12} /> Topics:
            </span>
            {Object.keys(categoriesWithCounts).map(cat => {
              const count = categoriesWithCounts[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.08] text-white border border-white/[0.15] font-medium'
                      : 'bg-white/[0.02] text-zinc-400 hover:text-zinc-200 border border-white/[0.04]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'text-zinc-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Count & Reset */}
          <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-500">
            <span>Showing {filteredQuestions.length} of {questionsList.length} problems</span>
            {(searchQuery || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedDifficulty('All'); }}
                className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw size={11} /> Reset filters
              </button>
            )}
          </div>

          {/* Problems Grid / Table */}
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center space-y-3 rounded-2xl bg-[#0b0d13] border border-white/[0.06]">
              <AlertCircle size={28} className="mx-auto text-zinc-500" />
              <p className="text-sm font-semibold text-zinc-200">No challenges match your criteria</p>
              <p className="text-xs text-zinc-500 font-mono">Try adjusting your keyword or topic filter.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedDifficulty('All'); }}
                className="px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredQuestions.map(q => {
                const qId = q.questionId || q.id;
                const isSelected = activeQuestionId === qId;
                const diff = DIFFICULTY_CONFIG[q.difficulty] || DIFFICULTY_CONFIG['Beginner'];

                return (
                  <div
                    key={qId}
                    onClick={() => handleCardPick(qId)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-white/[0.05] border-white/20 ring-1 ring-white/10'
                        : 'bg-[#0b0d13] border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Meta */}
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-zinc-400 tabular-nums">
                            #{qId}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md border border-white/[0.06] bg-white/[0.03] text-zinc-300">
                            {q.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                          <span className={`text-[10px] font-medium ${diff.text}`}>{diff.label}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-zinc-200 transition line-clamp-2 leading-snug">
                        {q.title}
                      </h3>

                      {/* Excerpt */}
                      {q.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {q.description.replace(/[#*`]/g, '').slice(0, 110)}...
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono text-zinc-500">
                      <span>{isSelected ? 'Open in Sandbox' : 'Solve Challenge'}</span>
                      <div className="w-6 h-6 rounded-full bg-white/[0.03] group-hover:bg-white group-hover:text-black flex items-center justify-center text-zinc-400 transition">
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: CODE ARENA SANDBOX (IDE WORKBENCH) ────────────────────── */}
      {viewMode === 'workspace' && (
        <div className="space-y-3 animate-fadeIn">

          {/* Workbench Command Ribbon */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#0b0d13] border border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
            {/* Left Nav */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setViewMode('cards')}
                className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-mono font-medium text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <Grid size={13} />
                <span>Catalog</span>
              </button>

              <div className="flex items-center gap-1 border-l border-white/[0.07] pl-2.5 font-mono">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentIdx <= 0}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition"
                  title="Previous challenge"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-medium text-white px-1">
                  #{activeQuestionId} <span className="text-zinc-500 font-normal">/ {questionsList.length}</span>
                </span>
                <button
                  onClick={handleNextQuestion}
                  disabled={currentIdx >= questionsList.length - 1}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition"
                  title="Next challenge"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Jump Dropdown */}
              <div className="relative font-mono">
                <select
                  value={activeQuestionId}
                  onChange={e => selectQuestionById(e.target.value)}
                  className="text-xs text-white bg-white/[0.03] border border-white/[0.07] rounded-xl px-2.5 py-1.5 outline-none appearance-none cursor-pointer pr-7 max-w-[200px] sm:max-w-[260px] truncate"
                >
                  {questionsList.map(q => {
                    const qId = q.questionId || q.id;
                    return (
                      <option key={qId} value={qId} className="bg-[#0b0d13] text-white">
                        #{qId}: {q.title}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Right Execution Actions */}
            <div className="flex items-center gap-2 font-mono">
              {/* Verdict Pill */}
              {executionVerdict && !isRunning && (
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full border font-medium flex items-center gap-1.5 ${
                    executionVerdict === 'Accepted'
                      ? 'bg-white/[0.08] text-white border-white/20'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {executionVerdict === 'Accepted'
                    ? <CheckCircle2 size={12} />
                    : <XCircle size={12} />}
                  <span>{executionVerdict}</span>
                </span>
              )}

              {/* Run Sample Tests */}
              <button
                onClick={() => runCode(false)}
                disabled={isRunning}
                className="px-3.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-mono font-medium text-zinc-200 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                title="Shortcut: Ctrl+Enter or Cmd+Enter"
              >
                {isRunning ? (
                  <Loader2 size={13} className="animate-spin text-zinc-400" />
                ) : (
                  <Play size={13} className="text-zinc-400" />
                )}
                <span>Run</span>
                <span className="hidden sm:inline text-[10px] text-zinc-500 pl-0.5">⌘↵</span>
              </button>

              {/* Submit to Evaluation Suite */}
              <button
                onClick={() => runCode(true)}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-xl text-xs font-mono font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                {isRunning ? (
                  <Loader2 size={13} className="animate-spin text-zinc-800" />
                ) : (
                  <CheckSquare size={13} className="text-zinc-900" />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* Mobile Tab Dock */}
          <div className="lg:hidden flex items-center bg-[#0b0d13] p-1 rounded-xl border border-white/[0.06] font-mono text-xs">
            {[
              { id: 'problem', label: 'Brief', icon: BookOpen },
              { id: 'editor',  label: 'Code',  icon: Code2 },
              { id: 'terminal', label: `Results${testResults.length > 0 ? ` (${testResults.filter(r => r.passed).length}/${testResults.length})` : ''}`, icon: Terminal },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMobileTab(id)}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobileTab === id ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* IDE Main Split Layout */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch flex-grow">

            {/* --------------------------------------------------------------- */}
            {/* LEFT PANE: Problem Specification & Sample Cases                  */}
            {/* --------------------------------------------------------------- */}
            <div
              className={`w-full lg:w-5/12 rounded-2xl bg-[#0b0d13] border border-white/[0.07] flex flex-col overflow-hidden ${
                mobileTab === 'problem' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {/* Header Info */}
              <div className="p-4 sm:p-5 border-b border-white/[0.06] space-y-2.5 font-mono">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-zinc-300 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md">
                      {question.category || 'Algorithms'}
                    </span>
                    <span className="text-[10px] text-zinc-400 bg-white/[0.02] border border-white/[0.05] px-2 py-0.5 rounded-md">
                      {question.difficulty || 'Easy'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Clock size={12} /> 2.0s limit · 256MB
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight font-sans">
                  #{activeQuestionId}: {question.title}
                </h2>
              </div>

              {/* Sub-tabs: Description vs Sample Cases */}
              <div className="flex items-center gap-4 px-5 border-b border-white/[0.05] bg-white/[0.01] font-mono text-xs">
                <button
                  onClick={() => setSpecTab('description')}
                  className={`py-2.5 border-b-2 transition cursor-pointer font-medium ${
                    specTab === 'description' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setSpecTab('cases')}
                  className={`py-2.5 border-b-2 transition cursor-pointer font-medium ${
                    specTab === 'cases' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Test Matrix ({question.sampleTestCases?.length || 0})
                </button>
              </div>

              {/* Scrollable Problem Spec */}
              <div className="p-5 sm:p-6 space-y-6 flex-grow overflow-y-auto overscroll-contain max-h-[600px] lg:max-h-[calc(100vh-290px)] text-xs text-zinc-300 font-sans leading-relaxed">
                {specTab === 'description' && (
                  <div className="prose prose-invert prose-xs max-w-none space-y-3">
                    <ReactMarkdown>{question.description || 'No description provided.'}</ReactMarkdown>
                  </div>
                )}

                {/* Sample Test Cases Tab */}
                {(specTab === 'cases' || specTab === 'description') && question.sampleTestCases && question.sampleTestCases.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 border-b border-white/[0.05] pb-1.5 flex items-center gap-1.5">
                      <Cpu size={12} /> Sample Test Cases
                    </div>

                    {question.sampleTestCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl p-3.5 bg-black/40 border border-white/[0.06] space-y-2 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider">
                          <span>Case #{idx + 1}</span>
                          <button
                            onClick={() => copyToClipboard(tc.input, idx)}
                            className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                            title="Copy input"
                          >
                            {copiedIdx === idx ? <Check size={11} className="text-zinc-200" /> : <Copy size={11} />}
                            <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>

                        <div>
                          <span className="text-zinc-500 text-[10px] block mb-1">Standard Input:</span>
                          <pre className="p-2.5 rounded-lg bg-black/60 border border-white/[0.04] text-zinc-200 overflow-x-auto text-[11px]">
                            {tc.input}
                          </pre>
                        </div>

                        <div>
                          <span className="text-zinc-500 text-[10px] block mb-1">Expected Output:</span>
                          <pre className="p-2.5 rounded-lg bg-black/60 border border-white/[0.04] text-zinc-200 overflow-x-auto text-[11px]">
                            {tc.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* RIGHT PANE: Monaco Editor + Interactive Terminal Runner         */}
            {/* --------------------------------------------------------------- */}
            <div
              className={`w-full lg:w-7/12 flex flex-col gap-3 ${
                mobileTab === 'problem' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Monaco IDE Container */}
              <div
                className={`rounded-2xl bg-[#090a10] border border-white/[0.08] overflow-hidden flex flex-col min-h-[380px] lg:min-h-[440px] shadow-2xl ${
                  mobileTab === 'terminal' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                {/* Editor Header Bar */}
                <div className="h-10 border-b border-white/[0.06] px-4 flex items-center justify-between bg-white/[0.02] font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                      <Code2 size={13} className="text-zinc-300" />
                      <span>Runtime:</span>
                    </span>
                    <select
                      value={language}
                      onChange={e => {
                        const newLang = e.target.value;
                        setLanguage(newLang);
                        applyStarterCode(question, newLang);
                      }}
                      className="bg-white/[0.04] text-white text-xs font-semibold outline-none cursor-pointer border border-white/[0.08] rounded-lg px-2.5 py-0.5"
                    >
                      {supportedLanguages.map(l => (
                        <option key={l} value={l} className="bg-[#0b0d13] text-white">
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => applyStarterCode(question, language)}
                      className="text-zinc-400 hover:text-white text-[11px] flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition"
                      title="Reset boilerplate template"
                    >
                      <RotateCcw size={11} /> Reset Template
                    </button>
                  </div>
                </div>

                {/* Monaco Editor Mount */}
                <div className="flex-grow min-h-[340px] lg:min-h-[390px] relative">
                  <Editor
                    height="100%"
                    defaultLanguage={language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()}
                    language={language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()}
                    theme="vs-dark"
                    value={code}
                    onMount={handleEditorDidMount}
                    onChange={val => setCode(val || '')}
                    options={{
                      automaticLayout: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: '"Geist Mono", "JetBrains Mono", Menlo, monospace',
                      padding: { top: 12, bottom: 12 },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                      wordWrap: 'on',
                      smoothScrolling: true,
                      cursorBlinking: 'smooth',
                      tabSize: 4,
                      scrollbar: {
                        alwaysConsumeMouseWheel: false,
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6
                      }
                    }}
                  />
                </div>
              </div>

              {/* Console / Test Runner Drawer */}
              <div
                className={`rounded-2xl bg-[#090a10] border border-white/[0.08] flex flex-col overflow-hidden min-h-[200px] lg:h-64 shadow-2xl ${
                  mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                {/* Console Tab Bar */}
                <div className="h-10 border-b border-white/[0.06] px-4 flex items-center justify-between bg-white/[0.02] font-mono text-xs">
                  <div className="flex items-center gap-4 h-full">
                    <button
                      onClick={() => setActiveConsoleTab('results')}
                      className={`h-full flex items-center gap-1.5 transition cursor-pointer font-medium ${
                        activeConsoleTab === 'results'
                          ? 'text-white border-b-2 border-white'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <CheckSquare size={13} />
                      <span>
                        Test Results {testResults.length > 0 && `(${testResults.filter(r => r.passed).length}/${testResults.length})`}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab('terminal')}
                      className={`h-full flex items-center gap-1.5 transition cursor-pointer font-medium ${
                        activeConsoleTab === 'terminal'
                          ? 'text-white border-b-2 border-white'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Terminal size={13} />
                      <span>Standard Output</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setOutput('');
                      setTestResults([]);
                      setExecutionVerdict(null);
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer font-mono"
                  >
                    Clear Console
                  </button>
                </div>

                {/* Console Drawer Content */}
                <div className="p-3.5 sm:p-4 font-mono text-xs flex-grow overflow-y-auto overscroll-contain">
                  {/* Test Cases Results */}
                  {activeConsoleTab === 'results' && (
                    <div className="space-y-3">
                      {testResults.length === 0 ? (
                        <div className="h-full py-8 text-center text-zinc-500 flex flex-col items-center justify-center space-y-1">
                          <Play size={18} className="text-zinc-600 mb-1" />
                          <p>Ready to execute. Press <span className="text-zinc-300">Run (⌘↵)</span> or <span className="text-zinc-300">Submit</span>.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Case Selector Tabs */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/[0.04]">
                            {testResults.map((r, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveTestCaseIdx(idx)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
                                  activeTestCaseIdx === idx
                                    ? 'bg-white/[0.1] text-white border border-white/20 font-medium'
                                    : 'bg-white/[0.02] text-zinc-400 hover:text-white border border-white/[0.04]'
                                }`}
                              >
                                {r.passed ? (
                                  <CheckCircle2 size={12} className="text-zinc-200" />
                                ) : (
                                  <XCircle size={12} className="text-zinc-500" />
                                )}
                                <span>Case {idx + 1}</span>
                              </button>
                            ))}
                          </div>

                          {/* Selected Case Breakdown */}
                          {testResults[activeTestCaseIdx] && (
                            <div className="space-y-2.5 pt-1 text-xs">
                              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                <span className="flex items-center gap-1.5">
                                  Status: {testResults[activeTestCaseIdx].passed ? (
                                    <span className="text-zinc-100 font-semibold">Passed</span>
                                  ) : (
                                    <span className="text-zinc-400 font-semibold">Failed</span>
                                  )}
                                </span>
                                <span>{testResults[activeTestCaseIdx].executionTimeMs || 1} ms</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                  <span className="text-zinc-500 text-[10px] block mb-1">Standard Input:</span>
                                  <pre className="text-zinc-200 text-[11px] overflow-x-auto whitespace-pre-wrap">
                                    {testResults[activeTestCaseIdx].input || '[none]'}
                                  </pre>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                  <span className="text-zinc-500 text-[10px] block mb-1">Expected Output:</span>
                                  <pre className="text-zinc-200 text-[11px] overflow-x-auto whitespace-pre-wrap">
                                    {testResults[activeTestCaseIdx].expectedOutput}
                                  </pre>
                                </div>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                <span className="text-zinc-500 text-[10px] block mb-1">Your Output:</span>
                                <pre className="text-zinc-200 text-[11px] overflow-x-auto whitespace-pre-wrap">
                                  {testResults[activeTestCaseIdx].actualOutput || '[No output produced]'}
                                </pre>
                              </div>

                              {testResults[activeTestCaseIdx].stderr && (
                                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-300">
                                  <span className="text-[10px] font-bold block mb-1">Compiler / Stderr:</span>
                                  <pre className="text-[11px] whitespace-pre-wrap">
                                    {testResults[activeTestCaseIdx].stderr}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw Output Tab */}
                  {activeConsoleTab === 'terminal' && (
                    <pre className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-xs">
                      {output || '# Process outputs will be printed here.'}
                    </pre>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="mt-8 pt-4 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-500">
        <span>Atlyra Code Arena · Execution Sandbox</span>
        <span className="text-zinc-400">
          Developed by{' '}
          <a
            href="https://cipherflux-labs.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-200 font-semibold hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white transition"
          >
            CipherFlux Labs
          </a>
        </span>
      </footer>

    </div>
  );
}
