import React, { useState, useEffect, useMemo } from 'react';
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
  Cpu,
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
  Filter,
  RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  fetchPracticeQuestions,
  fetchPracticeQuestionById,
  runPracticeCode,
  submitPracticeCode
} from '../services/api';
import STATIC_QUESTIONS from '../data/fallbackQuestions';
import AtlyraSymbol from '../components/AtlyraSymbol';

const CATEGORY_COLORS = {
  Basics: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Loops: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  Numbers: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Array: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  String: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Searching: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Sorting: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  Hashing: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Two Pointers': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Prefix Sum': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Linked List': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Stack: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
  Queue: 'bg-pink-500/15 text-pink-400 border-pink-500/30'
};

const DIFFICULTY_COLORS = {
  Beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  Easy: 'bg-green-500/15 text-green-400 border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.15)]',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  Hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
};

export default function Practice() {
  // View mode: 'cards' (Problem Cards Grid) | 'workspace' (Coding IDE)
  const [viewMode, setViewMode] = useState('cards');

  // Question list & active question
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

  // Editor & execution state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'results'
  const [mobileTab, setMobileTab] = useState('editor'); // 'cards' | 'problem' | 'editor' | 'terminal'
  const [testResults, setTestResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Card filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Load questions from backend on mount and sync with database
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchPracticeQuestions({ limit: 100 });
        if (res.questions && res.questions.length > 0) {
          setQuestionsList(res.questions);
        }
      } catch (err) {
        console.warn('Using local static question catalog:', err.message);
      }
    }
    loadData();
  }, []);

  // Initialize starter code on question or language change
  useEffect(() => {
    if (question) {
      applyStarterCode(question, language);
    }
  }, [question, language]);

  const applyStarterCode = (q, lang) => {
    if (!q) return;
    const l = (lang || 'python').toLowerCase();
    if (q.starterCode) {
      if (l === 'python' && q.starterCode.python) {
        setCode(q.starterCode.python);
        return;
      }
      if (l === 'javascript' && q.starterCode.javascript) {
        setCode(q.starterCode.javascript);
        return;
      }
      if (l === 'java' && q.starterCode.java) {
        setCode(q.starterCode.java);
        return;
      }
      if ((l === 'c++' || l === 'cpp') && q.starterCode.cpp) {
        setCode(q.starterCode.cpp);
        return;
      }
    }

    // Default clean boilerplates (NO ANSWERS, stubs only)
    if (l === 'python') {
      setCode(`# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == "__main__":\n    main()\n`);
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

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    applyStarterCode(question, lang);
  };

  const handleEditorDidMount = (editor, monaco) => {
    if (monaco && monaco.editor && monaco.editor.setUnexpectedErrorHandler) {
      monaco.editor.setUnexpectedErrorHandler((err) => {
        if (
          err &&
          (err.message === 'Canceled' ||
           err.name === 'Canceled' ||
           String(err).includes('Canceled'))
        ) {
          return;
        }
        console.error(err);
      });
    }
  };

  // Select question by ID
  const selectQuestionById = async (qId) => {
    const id = parseInt(qId, 10);
    if (!id) return;

    setLoading(true);
    setErrorMessage('');
    setOutput('');
    setTestResults([]);

    // 1. Instant local fallback
    const localMatch = STATIC_QUESTIONS.find(q => q.questionId === id);
    if (localMatch) {
      setQuestion(localMatch);
      applyStarterCode(localMatch, language);
    }

    // 2. Fetch full question from backend
    try {
      const detail = await fetchPracticeQuestionById(id);
      if (detail && detail.questionId) {
        setQuestion(detail);
        applyStarterCode(detail, language);
      }
    } catch (err) {
      console.warn('Using static question fallback for ID:', id, err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle picking a problem card
  const handleCardPick = async (qId) => {
    await selectQuestionById(qId);
    setViewMode('workspace');
    setMobileTab('problem');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation handlers
  const currentIdx = useMemo(() => {
    const activeId = question?.questionId || question?.id || 1;
    return questionsList.findIndex(q => (q.questionId || q.id) === activeId);
  }, [question, questionsList]);

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      const prevQ = questionsList[currentIdx - 1];
      selectQuestionById(prevQ.questionId || prevQ.id);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questionsList.length - 1) {
      const nextQ = questionsList[currentIdx + 1];
      selectQuestionById(nextQ.questionId || nextQ.id);
    }
  };

  // Run or Submit code
  const runCode = async (isSubmission = false) => {
    if (!question) return;
    setIsRunning(true);
    setErrorMessage('');
    setActiveTab(isSubmission ? 'results' : 'console');
    setOutput(
      isSubmission
        ? '⏳ Submitting code against all test suites on real compiler container...'
        : '⏳ Compiling and executing code on real runtime container...'
    );

    // On mobile, automatically show the terminal tab
    setMobileTab('terminal');

    try {
      let apiLang = language.toLowerCase();
      if (apiLang === 'c++') apiLang = 'cpp';

      const qId = question.questionId || question.id;
      const data = isSubmission
        ? await submitPracticeCode({ questionId: qId, code, language: apiLang })
        : await runPracticeCode({ questionId: qId, code, language: apiLang });

      if (data.error) {
        setOutput(`❌ Execution Error: ${data.error.message}`);
        setErrorMessage(data.error.message);
        return;
      }

      const passedCount = data.results?.filter(r => r.passed).length || 0;
      const totalCount = data.results?.length || 0;
      const isPassed = data.allPassed || data.verdict === 'Accepted';

      let outText = `========================================\n`;
      outText += `VERDICT: ${data.verdict || (isPassed ? 'ACCEPTED' : 'WRONG ANSWER')}\n`;
      outText += `PASSED:  ${passedCount} / ${totalCount} Test Cases\n`;
      outText += `========================================\n\n`;

      if (data.message) {
        outText += `Note: ${data.message}\n\n`;
      }

      data.results?.forEach(r => {
        outText += `[Test Case #${r.testCaseIndex}] ${r.passed ? '✅ PASSED' : '❌ FAILED'} (${r.executionTimeMs || 0}ms)\n`;
        outText += `Input:    ${r.input}\n`;
        outText += `Expected: ${r.expectedOutput}\n`;
        outText += `Actual:   ${r.actualOutput || '[No Output]'}\n`;
        if (r.stderr) {
          outText += `Compiler/Runtime Diagnostics:\n${r.stderr}\n`;
        }
        outText += `----------------------------------------\n`;
      });

      setOutput(outText);
      setTestResults(data.results || []);
    } catch (err) {
      setOutput(`Execution error: ${err.message}`);
      setErrorMessage(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // Distinct categories list with counts
  const categoriesWithCounts = useMemo(() => {
    const counts = { All: questionsList.length };
    questionsList.forEach(q => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, [questionsList]);

  // Filtered questions for Cards View
  const filteredQuestions = useMemo(() => {
    return questionsList.filter(q => {
      // Category filter
      if (selectedCategory !== 'All' && q.category !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = q.title?.toLowerCase().includes(query);
        const matchesCategory = q.category?.toLowerCase().includes(query);
        const matchesId = String(q.questionId || q.id).includes(query);
        return matchesTitle || matchesCategory || matchesId;
      }
      return true;
    });
  }, [questionsList, selectedCategory, selectedDifficulty, searchQuery]);

  const supportedLanguages = question?.supportedLanguages || ['Python', 'JavaScript', 'Java', 'C++'];
  const activeQuestionId = question?.questionId || question?.id || 1;

  return (
    <div className="flex-grow flex flex-col gap-4 w-full max-w-7xl mx-auto pb-8 px-2 sm:px-4 animate-fadeIn">
      {/* Minimal Header & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Problem Bank
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            100 curated challenges &bull; GCC, Node.js, Python 3, OpenJDK
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center bg-white/[0.03] p-1 rounded-full border border-white/[0.08] gap-1">
          <button
            onClick={() => {
              setViewMode('cards');
              setMobileTab('cards');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white/[0.1] text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Grid size={13} /> Problems ({questionsList.length})
          </button>
          <button
            onClick={() => {
              setViewMode('workspace');
              setMobileTab('editor');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'workspace'
                ? 'bg-white/[0.1] text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 size={13} /> Workspace #{activeQuestionId}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs animate-fadeIn backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="font-bold text-rose-300 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: PROBLEM CARDS GRID VIEW                                          */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Search and Filter Bar */}
          <div className="linear-card rounded-2xl sm:rounded-3xl border border-white/[0.08] p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3.5 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search size={15} className="absolute left-3.5 top-3 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search 100 questions by title, #id, or topic..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl linear-input text-xs font-medium text-white placeholder-zinc-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Difficulty Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 font-mono">
                <span className="text-xs text-zinc-400 font-medium mr-1 flex items-center gap-1">
                  <Filter size={12} /> Level:
                </span>
                {['All', 'Beginner', 'Easy', 'Medium', 'Hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills (Horizontal Scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono">
              <span className="text-xs text-zinc-400 font-medium mr-1 shrink-0 flex items-center gap-1">
                <Layers size={12} /> Topics:
              </span>
              {Object.keys(categoriesWithCounts).map(cat => {
                const count = categoriesWithCounts[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.1] text-white border border-white/[0.15] font-semibold'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white/[0.05] text-zinc-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Count Header */}
          <div className="flex items-center justify-between px-2 font-mono">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Showing {filteredQuestions.length} of {questionsList.length} Problems
            </span>
            {(searchQuery || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                }}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} /> Reset Filters
              </button>
            )}
          </div>

          {/* Problem Cards Responsive Grid */}
          {filteredQuestions.length === 0 ? (
            <div className="glass-card border border-white/10 rounded-3xl p-12 text-center space-y-3">
              <AlertCircle size={32} className="mx-auto text-gray-500" />
              <h3 className="text-base font-bold text-white">No problems matched your filter</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
                Try clearing your search term or selecting a different category or difficulty level.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                }}
                className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-400 hover:from-emerald-400 hover:to-primary text-[#060e20] rounded-xl text-xs font-black transition cursor-pointer shadow-glow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredQuestions.map(q => {
                const qId = q.questionId || q.id;
                const isSelected = activeQuestionId === qId;
                const catClass = CATEGORY_COLORS[q.category] || 'bg-white/5 text-gray-300 border-white/10';
                const diffClass = DIFFICULTY_COLORS[q.difficulty] || 'bg-white/5 text-gray-300 border-white/10';

                return (
                  <div
                    key={qId}
                    onClick={() => handleCardPick(qId)}
                    className={`linear-card rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-white/30 ring-1 ring-white/20 shadow-glow-white bg-white/[0.06]'
                        : 'border-white/[0.07] hover:border-white/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-medium text-zinc-300 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-md">
                            #{qId}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${catClass}`}>
                            {q.category}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${diffClass}`}>
                          {q.difficulty}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-medium text-white group-hover:text-zinc-200 transition line-clamp-2 leading-snug">
                        {q.title}
                      </h3>

                      {/* Brief description teaser */}
                      {q.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans font-normal">
                          {q.description.replace(/[#*`]/g, '').slice(0, 100)}...
                        </p>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono">
                      {isSelected ? (
                        <span className="text-[11px] font-medium text-zinc-200 flex items-center gap-1">
                          <Sparkles size={12} className="text-white" /> Active in IDE
                        </span>
                      ) : (
                        <span className="text-[11px] font-normal text-zinc-500 group-hover:text-zinc-300 transition">
                          Open in Arena
                        </span>
                      )}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-white text-black'
                            : 'bg-white/[0.04] text-zinc-400 group-hover:bg-white group-hover:text-black'
                        }`}
                      >
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

      {/* ========================================================================= */}
      {/* MODE 2: CODE WORKSPACE / ARENA VIEW                                      */}
      {/* ========================================================================= */}
      {viewMode === 'workspace' && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {/* Workspace Quick Nav Header */}
          <div className="linear-card border border-white/[0.08] rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setViewMode('cards')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition flex items-center gap-1.5 cursor-pointer"
              >
                <Grid size={13} /> Cards ({questionsList.length})
              </button>

              <div className="flex items-center gap-1 border-l border-white/[0.08] pl-2.5 font-mono">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentIdx <= 0}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition"
                  title="Previous Problem"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-xs font-mono font-medium text-white px-1">
                  #{activeQuestionId} <span className="text-zinc-500 font-normal">/ {questionsList.length}</span>
                </span>
                <button
                  onClick={handleNextQuestion}
                  disabled={currentIdx >= questionsList.length - 1}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition"
                  title="Next Problem"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Quick Jump Dropdown */}
              <div className="relative font-mono">
                <select
                  value={activeQuestionId}
                  onChange={e => selectQuestionById(e.target.value)}
                  className="text-xs font-medium text-white linear-input rounded-xl px-2.5 py-1.5 outline-none transition appearance-none cursor-pointer pr-7 max-w-[200px] sm:max-w-[260px] truncate"
                >
                  {questionsList.map(q => {
                    const qId = q.questionId || q.id;
                    return (
                      <option key={qId} value={qId} className="bg-[#0c0d14] text-white">
                        #{qId}: {q.title}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Run & Submit Actions */}
            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={() => runCode(false)}
                disabled={isRunning}
                className="linear-btn-secondary px-3.5 py-1.5 text-xs font-mono font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isRunning ? <Loader2 size={13} className="animate-spin text-white" /> : <Play size={13} />} Run Tests
              </button>
              <button
                onClick={() => runCode(true)}
                disabled={isRunning}
                className="linear-btn-primary px-4 py-1.5 text-xs font-mono font-semibold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isRunning ? <Loader2 size={13} className="animate-spin text-black" /> : <CheckSquare size={13} />} Submit Solution
              </button>
            </div>
          </div>

          {/* Mobile-Only Responsive Segmented Navigation Control */}
          <div className="lg:hidden flex items-center bg-[#060e20] p-1 rounded-2xl gap-1 shrink-0 border border-white/10 font-mono">
            <button
              onClick={() => setMobileTab('problem')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === 'problem' ? 'bg-white/15 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen size={14} /> Problem
            </button>
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === 'editor' ? 'bg-white/15 text-primary shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code2 size={14} /> Editor
            </button>
            <button
              onClick={() => setMobileTab('terminal')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === 'terminal' ? 'bg-white/15 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Terminal size={14} /> Output {testResults.length > 0 && `(${testResults.filter(r => r.passed).length}/${testResults.length})`}
            </button>
          </div>

          {/* Main IDE Container: Desktop Side-by-Side, Mobile Stacks */}
          <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch min-h-[calc(100vh-220px)]">
            {/* Left Panel - Problem Description */}
            <div
              className={`w-full lg:w-5/12 glass-card rounded-3xl shadow-glass border border-white/10 flex flex-col overflow-hidden transition-all ${
                mobileTab === 'problem' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <div className="p-4 sm:p-5 border-b border-white/10 bg-white/5 space-y-2.5 font-mono">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary bg-primary/15 border border-primary/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {question.category || 'Algorithms'}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-300 bg-white/10 px-2 py-0.5 rounded">
                      {question.difficulty || 'Beginner'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">
                    <Clock size={12} /> Limit: 2.0s
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-black text-white tracking-tight font-sans">
                  #{activeQuestionId}: {question.title}
                </h2>
              </div>

              <div className="p-4 sm:p-6 space-y-5 flex-grow overflow-y-auto prose prose-invert prose-sm max-w-none text-gray-300 max-h-[600px] lg:max-h-[calc(100vh-280px)]">
                <ReactMarkdown>{question.description || 'No description provided.'}</ReactMarkdown>

                {question.sampleTestCases && question.sampleTestCases.length > 0 && (
                  <div className="pt-2">
                    <h3 className="font-bold text-sm text-white border-b border-white/10 pb-2">Sample Test Cases</h3>
                    {question.sampleTestCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="bg-[#030712] rounded-2xl p-4 font-mono text-xs text-gray-300 space-y-2.5 mt-3 border border-white/10"
                      >
                        <div className="flex items-center justify-between text-primary text-[10px] font-bold uppercase tracking-wider">
                          <span>Sample #{idx + 1}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold block mb-1">Standard Input (stdin):</span>
                          <pre className="bg-[#060e20] p-2.5 rounded-xl text-gray-200 border border-white/10 overflow-x-auto text-[11px]">
                            {tc.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold block mb-1">Expected Output (stdout):</span>
                          <pre className="bg-[#060e20] p-2.5 rounded-xl text-gray-200 border border-white/10 overflow-x-auto text-[11px]">
                            {tc.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - IDE & Output Terminal */}
            <div
              className={`w-full lg:w-7/12 flex flex-col gap-4 ${
                mobileTab === 'problem' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Editor Pane */}
              <div
                className={`bg-[#030712] rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl min-h-[380px] lg:min-h-[440px] ${
                  mobileTab === 'terminal' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <div className="h-11 border-b border-white/10 flex items-center px-4 justify-between bg-[#060e20]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">Language:</span>
                    <select
                      value={language}
                      onChange={handleLanguageChange}
                      className="bg-[#0b1326] text-white text-xs font-mono font-semibold outline-none cursor-pointer border border-white/15 rounded-lg px-2.5 py-1"
                    >
                      {supportedLanguages.map(lang => (
                        <option key={lang} value={lang} className="bg-[#0b1326] text-white">
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => applyStarterCode(question, language)}
                      className="text-[11px] font-mono text-gray-400 hover:text-white transition flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer"
                      title="Reset boilerplate template"
                    >
                      <RotateCcw size={11} /> Reset Code
                    </button>
                  </div>
                </div>

                <div className="flex-grow min-h-[320px] lg:min-h-[380px]">
                  <Editor
                    height="100%"
                    defaultLanguage={language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()}
                    language={language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()}
                    theme="vs-dark"
                    value={code}
                    onMount={handleEditorDidMount}
                    onChange={val => setCode(val || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: '"Geist Mono", "JetBrains Mono", Menlo, monospace',
                      padding: { top: 12 },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on'
                    }}
                  />
                </div>
              </div>

              {/* Terminal / Results Pane */}
              <div
                className={`bg-[#030712] rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl min-h-[220px] lg:h-64 ${
                  mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <div className="h-10 border-b border-white/10 flex items-center px-4 justify-between bg-[#060e20]">
                  <div className="flex items-center gap-4 font-mono">
                    <button
                      onClick={() => setActiveTab('console')}
                      className={`text-xs font-semibold h-full flex items-center gap-1.5 transition cursor-pointer ${
                        activeTab === 'console'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Terminal size={14} /> Console Output
                    </button>
                    <button
                      onClick={() => setActiveTab('results')}
                      className={`text-xs font-semibold h-full flex items-center gap-1.5 transition cursor-pointer ${
                        activeTab === 'results'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <CheckSquare size={14} /> Test Results ({testResults.length})
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setOutput('');
                      setTestResults([]);
                    }}
                    className="text-[10px] font-mono text-gray-500 hover:text-gray-300 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="p-4 font-mono text-xs flex-grow overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-56">
                  {activeTab === 'console' && (
                    <div className={output ? 'text-gray-200' : 'text-gray-500'}>
                      {output || '# Click "Run Tests" to execute against samples, or "Submit Solution" to test all suites.'}
                    </div>
                  )}

                  {activeTab === 'results' && (
                    <div className="space-y-2">
                      {testResults.length === 0 ? (
                        <p className="text-gray-500">No test results yet. Click "Run Tests" or "Submit Solution".</p>
                      ) : (
                        testResults.map((r, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border font-mono text-xs ${
                              r.passed
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-glow-sm'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                {r.passed ? <CheckCircle2 size={13} className="text-primary" /> : <XCircle size={13} className="text-rose-400" />} Test Case #{r.testCaseIndex}
                              </span>
                              <span className="text-[10px] text-gray-400">{r.executionTimeMs || 1}ms</span>
                            </div>
                            <div className="mt-1.5 text-[11px] space-y-1 text-gray-300">
                              <div><span className="text-gray-500 font-semibold">Input:</span> {r.input}</div>
                              <div><span className="text-gray-500 font-semibold">Expected:</span> {r.expectedOutput}</div>
                              <div><span className="text-gray-500 font-semibold">Actual:</span> {r.actualOutput}</div>
                              {r.stderr && (
                                <div className="text-rose-400 mt-1 whitespace-pre-wrap">
                                  <span className="font-semibold text-rose-300">Compiler / Runtime stderr:</span>{'\n'}{r.stderr}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Attribution */}
      <footer className="mt-8 pt-4 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-500">
        <span>Atlyra Code Arena</span>
        <span className="text-zinc-400">
          Developed by{' '}
          <a
            href="https://cipherflux-labs.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-200 font-semibold hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition"
          >
            CipherFlux Labs
          </a>
        </span>
      </footer>
    </div>
  );
}

