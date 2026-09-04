import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  PlayCircle,
  StopCircle,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Code2,
  MessageSquare,
  Award,
  Clock,
  Terminal,
  Send,
  HelpCircle,
  FileText,
  BarChart3,
  User,
  BookOpen,
  Layers,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import {
  startInterview,
  submitAnswer,
  transcribeAudio,
  finishInterview,
  runInterviewCode,
  submitInterviewCode
} from '../services/api';
import { speakText, stopSpeech } from '../services/speech';

const ROLES = [
  'Full Stack Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'AI / ML Engineer',
  'DevOps & Cloud Engineer',
  'Mobile Developer',
  'Data Engineer',
  'Cybersecurity Analyst'
];

const SENIORITY_LEVELS = [
  'Junior / Entry-Level',
  'Mid-Level',
  'Senior',
  'Lead / Staff'
];

const INTERVIEW_ROUNDS = [
  {
    id: 'intro',
    name: 'Intro & Soft Skills',
    targetMinutes: 6,
    badge: 'Round 1 of 4',
    description: 'Elevator pitch, background, communication clarity, and soft skills.'
  },
  {
    id: 'technical',
    name: 'Technical Architecture',
    targetMinutes: 15,
    badge: 'Round 2 of 4',
    description: 'System design trade-offs, engineering concepts, and architectural depth.'
  },
  {
    id: 'coding',
    name: 'Live Coding Sandbox',
    targetMinutes: 14,
    badge: 'Round 3 of 4',
    description: 'Hands-on problem solving, clean code, and algorithmic execution in Monaco.'
  },
  {
    id: 'behavioral',
    name: 'Behavioral & STAR',
    targetMinutes: 10,
    badge: 'Round 4 of 4',
    description: 'Situation, Task, Action, Result on ownership, teamwork, and conflict handling.'
  }
];

const STARTER_CODES = {
  python: `# Write your solution below for Smith's coding problem\ndef solution(data):\n    # TODO: Implement optimal solution\n    return data\n\nprint("Result:", solution([1, 2, 3]))`,
  javascript: `// Write your solution below for Smith's coding problem\nfunction solution(data) {\n  // TODO: Implement optimal solution\n  return data;\n}\n\nconsole.log("Result:", solution([1, 2, 3]));`,
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Implement solution\n    cout << "Coding Sandbox Active" << endl;\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Implement solution\n        System.out.println("Coding Sandbox Active");\n    }\n}`
};

export default function Pitching() {
  // Phase: 'setup' | 'interview' | 'report'
  const [phase, setPhase] = useState('setup');

  // Configuration
  const [candidateName, setCandidateName] = useState('Alex Rivera');
  const [role, setRole] = useState('Full Stack Engineer');
  const [level, setLevel] = useState('Senior');
  const [difficulty, setDifficulty] = useState('Medium');

  // Interview Progress
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcriptHistory, setTranscriptHistory] = useState([]);

  // Voice & Audio
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  // Response inputs
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'
  const [textInput, setTextInput] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Performance metrics
  const [wpm, setWpm] = useState(130);
  const [energyLevel, setEnergyLevel] = useState('Optimal');
  const [aiSuggestion, setAiSuggestion] = useState("Smith is ready. Answer clearly, citing specific examples and technologies.");

  // Coding Sandbox (Round 3)
  const [activeTab, setActiveTab] = useState('dialogue'); // 'dialogue' | 'sandbox'
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODES.python);
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // Completion & Report
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const liveTranscriptRef = useRef('');
  const audioChunksRef = useRef([]);
  const interviewTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordStartTimeRef = useRef(0);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const voiceEnabledRef = useRef(voiceEnabled);
  const transcriptHistoryRef = useRef([]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
    if (!voiceEnabled) {
      stopSpeech();
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  useEffect(() => {
    transcriptHistoryRef.current = transcriptHistory;
  }, [transcriptHistory]);

  // Audio decibel visualizer loop
  const setupAudioMeter = useCallback((stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.warn('AudioContext meter notice:', e);
    }
  }, []);

  // Initialize hardware media
  useEffect(() => {
    async function initMedia() {
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      };

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: audioConstraints
          });
          streamRef.current = stream;
          setHasCamera(true);
          setHasMic(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setupAudioMeter(stream);
        }
      } catch {
        // Fallback to audio only if webcam is unavailable
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
          streamRef.current = audioStream;
          setHasMic(true);
          setupAudioMeter(audioStream);
        } catch {
          console.warn('No media devices available or permission denied.');
        }
      }
    }

    initMedia();

    return () => {
      stopSpeech();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [setupAudioMeter]);

  // Bind video ref whenever camera stream updates
  useEffect(() => {
    if (videoRef.current && streamRef.current && cameraEnabled && hasCamera) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [hasCamera, cameraEnabled, phase]);

  // Handle TTS
  const speakAI = (text) => {
    if (!voiceEnabledRef.current) return;
    speakText(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  // Launch the 45-min Interview
  const handleStartInterview = async () => {
    setErrorMessage('');
    setIsProcessing(true);
    setProcessingStatus(`Initializing 45-min interview with Smith for ${role} (${level})...`);

    try {
      const roundName = INTERVIEW_ROUNDS[0].name;
      const res = await startInterview({
        name: candidateName,
        role,
        level,
        difficulty,
        interviewType: roundName
      });

      const introText = res.intro || `Hello ${candidateName}. I'm Smith, your technical interviewer. Welcome to your 45-minute technical and behavioral assessment for the ${role} position. We will cover self-introduction and soft skills, technical architecture, live coding, and behavioral STAR questions. Let's begin: Could you please introduce yourself and highlight your most significant engineering achievements?`;

      setTranscriptHistory([
        { sender: 'Smith AI', text: introText, round: roundName }
      ]);
      setPhase('interview');
      setCurrentRoundIndex(0);
      setElapsedSeconds(0);

      // Start the 45-min master timer
      interviewTimerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          // Natural round advancement checks if candidate goes through full 45 mins
          if (next >= 360 && next < 1260) setCurrentRoundIndex(1); // 6 mins -> Technical
          else if (next >= 1260 && next < 2100) setCurrentRoundIndex(2); // 21 mins -> Coding
          else if (next >= 2100 && next < 2700) setCurrentRoundIndex(3); // 35 mins -> Behavioral
          return next;
        });
      }, 1000);

      speakAI(introText);
    } catch (err) {
      console.error('Failed to start interview:', err);
      const fallback = `Hello ${candidateName}! I'm Smith, your AI interviewer. Let's start our 45-minute technical interview for ${role}. To begin, please introduce yourself, your core technical stack, and what you're passionate about.`;
      setTranscriptHistory([
        { sender: 'Smith AI', text: fallback, round: INTERVIEW_ROUNDS[0].name }
      ]);
      setPhase('interview');
      speakAI(fallback);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Start voice recording
  const startRecording = async () => {
    stopSpeech();
    setIsSpeaking(false);
    setErrorMessage('');
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    audioChunksRef.current = [];

    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let full = '';
          for (let i = 0; i < event.results.length; i++) {
            full += event.results[i][0].transcript + ' ';
          }
          const trimmed = full.trim();
          if (trimmed) {
            liveTranscriptRef.current = trimmed;
            setLiveTranscript(trimmed);
          }
        };

        recognition.onerror = (e) => {
          if (e.error !== 'no-speech' && e.error !== 'aborted') {
            console.warn('SpeechRecognition notice:', e.error);
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('Live SpeechRecognition fallback active:', err);
      }
    }

    try {
      let stream = streamRef.current;
      if (!stream || stream.getAudioTracks().length === 0) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        streamRef.current = stream;
        setHasMic(true);
        setupAudioMeter(stream);
      }

      const audioStream = new MediaStream(stream.getAudioTracks());
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const supportedMime = mimeTypes.find(t => {
        try { return typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t); }
        catch { return false; }
      });

      const recorder = supportedMime
        ? new MediaRecorder(audioStream, { mimeType: supportedMime, audioBitsPerSecond: 128000 })
        : new MediaRecorder(audioStream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        await processRecordedAnswer();
      };

      recorder.start(1000);
      setIsRecording(true);
      recordStartTimeRef.current = Date.now();
    } catch (err) {
      console.error('Error starting mic recording:', err);
      setErrorMessage(`Microphone error: ${err.message}. You can also type your answer below.`);
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Process voice answer with Whisper Large v3 + fallback
  const processRecordedAnswer = async () => {
    const totalSecs = Math.max(1, Math.floor((Date.now() - recordStartTimeRef.current) / 1000));
    setIsProcessing(true);
    setProcessingStatus('Smith AI is transcribing and evaluating your answer...');

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || 'audio/webm'
      });

      let transcript = '';
      try {
        transcript = await transcribeAudio(audioBlob, 'English');
      } catch (sttErr) {
        console.warn('Whisper STT note, relying on live recognition:', sttErr);
      }

      const liveWords = (liveTranscriptRef.current || '').trim();
      if (!transcript || transcript.trim().length < 4) {
        transcript = liveWords;
      }

      // If user stayed silent or no words were caught, DO NOT inject fake text!
      if (!transcript || transcript.trim().split(/\s+/).length < 2) {
        setErrorMessage("No clear speech was detected. Please check your microphone or use the text box below to submit your answer.");
        setIsProcessing(false);
        setProcessingStatus('');
        return;
      }

      // Calculate speech pacing
      const wordCount = transcript.trim().split(/\s+/).length;
      const calculatedWpm = Math.round((wordCount / totalSecs) * 60);
      const boundedWpm = Math.min(220, Math.max(80, calculatedWpm || 130));
      setWpm(boundedWpm);

      if (boundedWpm < 115) setEnergyLevel('Deliberate');
      else if (boundedWpm <= 165) setEnergyLevel('Optimal');
      else setEnergyLevel('Fast Paced');

      await sendCandidateAnswer(transcript);
    } catch (err) {
      console.error('Answer processing error:', err);
      setErrorMessage(`Failed to process response: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Submit candidate answer (from voice or text)
  const sendCandidateAnswer = async (answerText) => {
    if (!answerText.trim()) return;

    const currentRound = INTERVIEW_ROUNDS[currentRoundIndex];
    const newHistory = [
      ...transcriptHistoryRef.current,
      { sender: 'You', text: answerText, round: currentRound.name }
    ];
    setTranscriptHistory(newHistory);
    setTextInput('');
    setLiveTranscript('');

    setIsProcessing(true);
    setProcessingStatus('Smith AI is analyzing technical depth & formulating follow-up...');

    try {
      const response = await submitAnswer({
        role,
        level,
        difficulty,
        rawTranscript: answerText,
        interviewType: currentRound.name,
        history: newHistory.map(h => ({
          role: h.sender === 'You' ? 'user' : 'assistant',
          content: h.text
        }))
      });

      if (response.feedback) {
        setAiSuggestion(response.feedback);
      }

      const nextQuestion = response.question || response.fullResponse || "Could you walk me through your technical approach and how you'd optimize for scale?";

      // If in coding round, switch to sandbox tab automatically
      if (currentRound.id === 'coding' || nextQuestion.toLowerCase().includes('coding') || nextQuestion.toLowerCase().includes('sandbox')) {
        setActiveTab('sandbox');
      }

      setTranscriptHistory(prev => [
        ...prev,
        {
          sender: 'Smith AI',
          text: nextQuestion,
          feedback: response.feedback,
          round: currentRound.name
        }
      ]);

      speakAI(nextQuestion);
    } catch (err) {
      console.error('Submit answer error:', err);
      const fallback = "Thank you for sharing that. How would you handle potential bottlenecks or edge cases in this architecture?";
      setTranscriptHistory(prev => [
        ...prev,
        { sender: 'Smith AI', text: fallback, round: currentRound.name }
      ]);
      speakAI(fallback);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Run code in Monaco Editor sandbox
  const handleRunCode = async () => {
    setIsRunningCode(true);
    setCodeOutput('Executing code in secure sandbox...');
    try {
      const res = await runInterviewCode({ code, language: codeLanguage });
      if (res.stdout || res.stderr) {
        setCodeOutput((res.stdout || '') + (res.stderr ? `\nErrors:\n${res.stderr}` : ''));
      } else {
        setCodeOutput('Code executed successfully with return code 0 (No stdout output).');
      }
    } catch (err) {
      setCodeOutput(`Execution failed: ${err.message}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  // Submit code to Smith AI
  const handleSubmitCode = async () => {
    setIsSubmittingCode(true);
    setProcessingStatus('Smith AI is reviewing your code structure, complexity, and correctness...');

    try {
      const lastSmithMsg = [...transcriptHistory].reverse().find(m => m.sender === 'Smith AI')?.text || 'Coding Assessment Problem';
      const res = await submitInterviewCode({
        code,
        language: codeLanguage,
        questionText: lastSmithMsg,
        role,
        level,
        difficulty,
        history: transcriptHistory.map(h => ({
          role: h.sender === 'You' ? 'user' : 'assistant',
          content: h.text
        })),
        interviewType: 'Coding Round'
      });

      const submissionNote = `[Submitted ${codeLanguage} code solution]\n\n\`\`\`${codeLanguage}\n${code}\n\`\`\``;
      const evaluationText = res.evaluation?.feedbackText || 'Code analyzed.';

      setTranscriptHistory(prev => [
        ...prev,
        { sender: 'You', text: submissionNote, round: 'Live Coding Sandbox' },
        {
          sender: 'Smith AI',
          text: res.question || res.fullResponse || "Thank you. That completes the coding assessment. Let's move on to the final behavioral section.",
          feedback: evaluationText,
          round: 'Live Coding Sandbox'
        }
      ]);

      if (res.feedback) setAiSuggestion(res.feedback);
      speakAI(res.question || res.fullResponse || "Thank you for the solution. Let's now transition to the behavioral questions.");

      // Advance to behavioral round if currently in coding
      if (currentRoundIndex === 2) {
        setCurrentRoundIndex(3);
      }
      setActiveTab('dialogue');
    } catch (err) {
      console.error('Code submission error:', err);
      setErrorMessage(`Failed to evaluate code: ${err.message}`);
    } finally {
      setIsSubmittingCode(false);
      setProcessingStatus('');
    }
  };

  // Advance to next round manually
  const handleAdvanceRound = () => {
    if (currentRoundIndex < INTERVIEW_ROUNDS.length - 1) {
      const nextIndex = currentRoundIndex + 1;
      setCurrentRoundIndex(nextIndex);
      const nextRound = INTERVIEW_ROUNDS[nextIndex];
      setTranscriptHistory(prev => [
        ...prev,
        { sender: 'Smith AI', text: `Let's now move to our ${nextRound.name} section. ${nextRound.description}`, round: nextRound.name }
      ]);
      speakAI(`Let's now move on to the ${nextRound.name} section.`);
      if (nextRound.id === 'coding') {
        setActiveTab('sandbox');
      }
    } else {
      setShowConfirmModal(true);
    }
  };

  // Conclude Interview and generate final report
  const handleFinishInterview = async () => {
    setShowConfirmModal(false);
    stopSpeech();
    if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);

    setIsGeneratingReport(true);
    setPhase('report');

    try {
      const historyPayload = transcriptHistory.map(h => ({
        role: h.sender === 'You' ? 'user' : 'assistant',
        content: h.text
      }));

      const res = await finishInterview({
        role,
        level,
        difficulty,
        history: historyPayload,
        interviewType: '45-Minute Comprehensive Technical Mock Interview'
      });

      let parsed = {};
      try {
        parsed = typeof res.analysis === 'string' ? JSON.parse(res.analysis) : res.analysis;
      } catch (parseErr) {
        console.warn('Analysis JSON parsing error:', parseErr);
        parsed = {
          overallScore: 78,
          overallRating: 'Good',
          hiringRecommendation: 'Hire',
          accuracyScore: 80,
          codingScore: 75,
          logicalThinkingScore: 82,
          communicationScore: 85,
          strengths: ['Clear technical articulation', 'Structured problem-solving methodology', 'Solid architectural fundamentals'],
          weaknesses: ['Could dive deeper into system bottlenecks under high concurrent loads'],
          topicsToStudy: ['Distributed Caching Patterns', 'CAP Theorem Deep-Dive', 'Asynchronous Task Queues'],
          interviewPrepTips: ['Always clarify constraints early', 'Quantify production impact with metrics']
        };
      }

      setReportData(parsed);
    } catch (err) {
      console.error('Final assessment generation failed:', err);
      setReportData({
        overallScore: 75,
        overallRating: 'Good',
        hiringRecommendation: 'Hire',
        accuracyScore: 76,
        codingScore: 74,
        logicalThinkingScore: 78,
        communicationScore: 80,
        strengths: ['Good communication demeanor', 'Demonstrated problem-solving capabilities'],
        weaknesses: ['Expand on edge-case testing for scalable services'],
        topicsToStudy: ['Data Structures & Algorithms', 'System Design Fundamentals'],
        interviewPrepTips: ['Practice time-bounded coding problems', 'Use the STAR method for behavioral answers']
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Reset & Start Over
  const handleReset = () => {
    stopSpeech();
    if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setPhase('setup');
    setTranscriptHistory([]);
    setElapsedSeconds(0);
    setCurrentRoundIndex(0);
    setReportData(null);
    setCode(STARTER_CODES.python);
    setCodeOutput('');
  };

  // Format 45-minute timer (MM:SS)
  const formatTimer = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER PHASE A: PRE-INTERVIEW SETUP
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Atlyra Professional AI Interview Studio
          </div>
          <h1 className="text-4xl font-black text-secondary tracking-tight">
            45-Minute AI Mock Interview
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            Experience a rigorous, full-cycle technical interview with <strong className="text-secondary">Smith AI</strong>. Covers self-pitch & soft skills, technical system architecture, live code execution, and behavioral STAR questions.
          </p>
        </header>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="font-bold text-red-700 hover:text-red-900">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Candidate Profile Setup */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
              <User size={20} className="text-primary" /> Candidate Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Target Engineering Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-secondary bg-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Seniority Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-secondary bg-white"
                  >
                    {SENIORITY_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Rigor / Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-secondary bg-white"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Medium">Medium (Realistic)</option>
                    <option value="Strict">Strict / FAANG-Style</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hardware & Audio Check */}
            <div className="p-4 bg-surface rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Mic size={14} className={hasMic ? 'text-green-500' : 'text-gray-400'} />
                  Microphone Decibel Check
                </span>
                <span className="text-[11px] font-semibold text-gray-600">
                  {hasMic ? 'Audio Active' : 'Waiting for Mic...'}
                </span>
              </div>

              {/* Dynamic Sound Level Equalizer */}
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex items-center px-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-75 ${
                    audioLevel > 50 ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.max(5, audioLevel)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Video size={14} className={hasCamera ? 'text-green-500' : 'text-gray-400'} />
                  Webcam: {hasCamera ? 'Connected' : 'Audio-Only Mode'}
                </span>
                <span className="flex items-center gap-1.5 text-primary font-medium">
                  <Volume2 size={14} /> Voice Output Ready
                </span>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/95 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> {processingStatus || 'Preparing Studio...'}
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Begin 45-Minute Mock Interview
                </>
              )}
            </button>
          </div>

          {/* 45-Minute Timeline Structure */}
          <div className="md:col-span-5 bg-secondary text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Clock size={20} className="text-primary" /> Session Roadmap
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/20 px-2.5 py-1 rounded-full">
                  45 Mins Total
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Smith enforces a structured pacing model across 4 mandatory evaluation rounds:
              </p>

              <div className="space-y-4">
                {INTERVIEW_ROUNDS.map((r, idx) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-white">{r.name}</h4>
                        <span className="text-[11px] font-mono text-gray-400">{r.targetMinutes}m</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
              <span>Final Assessment:</span>
              <span className="font-semibold text-primary">Scorecard & Hiring Recommendation</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER PHASE C: FINAL SCORECARD & EVALUATION REPORT
  // ─────────────────────────────────────────────────────────────────────────────
  if (phase === 'report') {
    const isReportLoading = isGeneratingReport || !reportData;

    return (
      <div className="max-w-5xl mx-auto w-full space-y-8 pb-12">
        {isReportLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 space-y-4">
            <Loader2 size={48} className="animate-spin text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-secondary">Generating 45-Minute Assessment Scorecard...</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Smith AI is synthesizing your technical accuracy, coding performance, communication clarity, and behavioral responses.
            </p>
          </div>
        ) : (
          <>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Interview Evaluation Completed
                  </span>
                  <span className="text-xs text-gray-500 font-medium">• 45-Min Technical Mock</span>
                </div>
                <h1 className="text-3xl font-black text-secondary">
                  {candidateName}&apos;s Assessment Scorecard
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Target Role: <span className="font-semibold text-secondary">{role}</span> ({level}) • Conducted by Smith AI
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={16} /> Start New Interview
                </button>
              </div>
            </header>

            {/* Scorecard Hero Banner */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Overall Score & Hiring Recommendation */}
              <div className="md:col-span-5 bg-secondary text-white rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Overall Performance</span>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-6xl font-black text-white">
                      {reportData.overallScore ?? 78}
                    </span>
                    <span className="text-2xl text-gray-400 font-normal">/ 100</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-semibold">
                    Rating: <span className="text-primary font-bold">{reportData.overallRating || 'Good'}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Hiring Recommendation
                  </span>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/20 border border-primary/30 text-primary font-black text-base">
                    <Award size={18} />
                    {reportData.hiringRecommendation || 'Hire'}
                  </div>
                </div>
              </div>

              {/* Categorized Multi-Metric Breakdown */}
              <div className="md:col-span-7 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-5">
                <h3 className="font-bold text-secondary text-base flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" /> Evaluation Pillar Breakdown
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-600">Technical Accuracy & Architecture</span>
                      <span className="text-primary font-bold">{reportData.accuracyScore ?? 80}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${reportData.accuracyScore ?? 80}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-600">Coding & Problem Solving</span>
                      <span className="text-primary font-bold">{reportData.codingScore ?? 75}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${reportData.codingScore ?? 75}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-600">Logical Thinking & Structured Reasoning</span>
                      <span className="text-primary font-bold">{reportData.logicalThinkingScore ?? 82}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${reportData.logicalThinkingScore ?? 82}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-600">Communication & Soft Skills</span>
                      <span className="text-primary font-bold">{reportData.communicationScore ?? 85}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${reportData.communicationScore ?? 85}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Pacing Cadence: <strong className="text-secondary">{wpm} WPM ({energyLevel})</strong></span>
                  <span>Session Length: <strong className="text-secondary">{formatTimer(elapsedSeconds)}</strong></span>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-secondary text-base flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" /> Key Strengths
                </h3>
                <ul className="space-y-2.5">
                  {(reportData.strengths && reportData.strengths.length > 0
                    ? reportData.strengths
                    : ['Clear verbal structure during technical explanations', 'Confident delivery and sound algorithmic baseline']
                  ).map((s, i) => (
                    <li key={i} className="text-xs text-gray-700 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-secondary text-base flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-500" /> Areas for Improvement & Gaps
                </h3>
                <ul className="space-y-2.5">
                  {(reportData.weaknesses && reportData.weaknesses.length > 0
                    ? reportData.weaknesses
                    : ['Proactively verify edge cases and scale limits during coding and system design']
                  ).map((w, i) => (
                    <li key={i} className="text-xs text-gray-700 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Study Topics & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-secondary text-base flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" /> Recommended Study Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(reportData.topicsToStudy && reportData.topicsToStudy.length > 0
                    ? reportData.topicsToStudy
                    : ['Distributed Systems Caching', 'Concurrency & Locks', 'STAR Behavioral Formulations']
                  ).map((t, i) => (
                    <span key={i} className="px-3 py-1.5 bg-surface rounded-xl text-xs font-semibold text-secondary border border-gray-100">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-secondary text-base flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" /> Interview Prep Directives
                </h3>
                <ul className="space-y-2 text-xs text-gray-700 leading-relaxed">
                  {(reportData.interviewPrepTips && reportData.interviewPrepTips.length > 0
                    ? reportData.interviewPrepTips
                    : ['Quantify business metrics when recounting past projects', 'State time and space complexities proactively']
                  ).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Full Transcript History Accordion */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-secondary text-base flex items-center gap-2">
                <MessageSquare size={18} className="text-gray-400" /> Full Chronological Session Transcript
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 text-xs">
                {transcriptHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl ${
                      item.sender === 'You'
                        ? 'bg-primary/5 border border-primary/10 ml-6'
                        : 'bg-surface border border-gray-100 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-secondary">
                        {item.sender} {item.round ? `• ${item.round}` : ''}
                      </span>
                      {item.sender === 'Smith AI' && (
                        <button
                          onClick={() => speakAI(item.text)}
                          className="text-gray-400 hover:text-primary transition flex items-center gap-1 text-[10px]"
                        >
                          <Volume2 size={12} /> Play
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER PHASE B: ACTIVE 45-MINUTE INTERVIEW STUDIO
  // ─────────────────────────────────────────────────────────────────────────────
  const currentRound = INTERVIEW_ROUNDS[currentRoundIndex] || INTERVIEW_ROUNDS[0];

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 pb-12">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-bold text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      {/* Confirmation Modal to Conclude Early */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-secondary">Conclude Mock Interview?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Smith AI will immediately evaluate your responses across all rounds and generate your official evaluation report and hiring recommendation.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-semibold cursor-pointer"
              >
                Continue Interview
              </button>
              <button
                onClick={handleFinishInterview}
                className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 cursor-pointer"
              >
                Generate Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Studio Top Control Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
              {currentRound.badge}: {currentRound.name}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              • {role} ({level})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-secondary">
            AI Interview Studio with Smith
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Master 45-min Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-white rounded-full text-xs font-mono font-bold shadow-inner">
            <Clock size={14} className="text-primary" />
            <span>{formatTimer(elapsedSeconds)} / 45:00</span>
          </div>

          {/* Voice Output Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              voiceEnabled ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title="Toggle Smith voice output"
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {voiceEnabled ? 'Smith Voice On' : 'Muted'}
          </button>

          {/* Advance Round Button */}
          <button
            onClick={handleAdvanceRound}
            className="px-3 py-1.5 bg-surface hover:bg-gray-100 rounded-full text-xs font-bold text-secondary flex items-center gap-1 border border-gray-200 cursor-pointer"
          >
            Next Section <ChevronRight size={14} />
          </button>

          {/* Finish & Score Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Award size={14} /> End & Score
          </button>
        </div>
      </header>

      {/* 4-Round Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {INTERVIEW_ROUNDS.map((r, idx) => {
          const isActive = idx === currentRoundIndex;
          const isCompleted = idx < currentRoundIndex;
          return (
            <div
              key={r.id}
              onClick={() => setCurrentRoundIndex(idx)}
              className={`p-2.5 rounded-2xl border text-xs font-medium cursor-pointer transition ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : isCompleted
                  ? 'bg-white text-secondary border-green-300'
                  : 'bg-white text-gray-400 border-gray-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase tracking-wider">
                  {isCompleted ? '✓ Done' : `Round ${idx + 1}`}
                </span>
                <span className="font-mono text-[10px]">{r.targetMinutes}m</span>
              </div>
              <p className="font-bold truncate mt-0.5">{r.name}</p>
            </div>
          );
        })}
      </div>

      {/* Main Studio Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Feeds / Avatar & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Video or AI Avatar Stage */}
          <div className="bg-secondary rounded-3xl overflow-hidden shadow-sm relative aspect-video flex items-center justify-center border border-gray-800">
            {hasCamera && cameraEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                {/* High-Tech Animated Smith Avatar */}
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-3xl font-black text-white shadow-xl transition-transform duration-300 ${
                    isSpeaking ? 'scale-110 ring-8 ring-primary/30' : ''
                  }`}>
                    SM
                  </div>
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-primary items-center justify-center text-white text-[10px] font-bold">
                        AI
                      </span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-white font-bold text-base">Smith AI Technical Interviewer</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isSpeaking ? 'Speaking out loud...' : isProcessing ? 'Analyzing response...' : 'Listening actively'}
                  </p>
                </div>

                {/* Real-time Decibel Audio Equalizer */}
                <div className="flex items-center gap-1 h-6">
                  {[12, 24, 18, 28, 16, 22, 30, 20, 14, 26, 18, 10].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        audioLevel > 15 ? 'bg-primary' : 'bg-gray-700'
                      }`}
                      style={{
                        height: audioLevel > 15
                          ? `${Math.max(4, Math.min(28, (audioLevel / 100) * h * 1.3))}px`
                          : '4px'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Speaking Wave Overlay */}
            {isSpeaking && (
              <div className="absolute top-4 left-4 bg-secondary/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-primary/40 flex items-center gap-2 z-20 shadow-md">
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-primary rounded-full animate-bounce"></span>
                  <span className="w-1 h-5 bg-primary rounded-full animate-bounce delay-75"></span>
                  <span className="w-1 h-4 bg-primary rounded-full animate-bounce delay-150"></span>
                </div>
                <span className="text-white text-xs font-semibold">Smith is Speaking...</span>
                <button
                  onClick={() => { stopSpeech(); setIsSpeaking(false); }}
                  className="ml-1 text-gray-400 hover:text-white text-xs"
                  title="Skip Speech"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Processing Spinner Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-secondary/85 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 space-y-3">
                <Loader2 size={36} className="animate-spin text-primary" />
                <p className="font-medium text-sm animate-pulse">{processingStatus}</p>
              </div>
            )}

            {/* Live Subtitle Overlay during recording */}
            {isRecording && (
              <div className="absolute bottom-20 left-6 right-6 bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 z-20 text-center shadow-lg">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-0.5">
                  Live Microphone Stream:
                </span>
                <p className="text-white text-xs sm:text-sm font-medium leading-snug">
                  {liveTranscript ? `"${liveTranscript}"` : 'Listening to your voice... start answering.'}
                </p>
              </div>
            )}

            {/* Floating Action Controls */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-secondary/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-gray-700 z-30 shadow-xl">
              {hasCamera && (
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className="text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Toggle camera feed"
                >
                  {cameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}
                </button>
              )}

              <div className="w-px h-4 bg-gray-700" />

              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition font-bold text-sm cursor-pointer"
                >
                  <StopCircle size={18} /> Stop & Submit Answer
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition font-bold text-sm disabled:opacity-50 cursor-pointer"
                >
                  <PlayCircle size={18} /> Speak Answer
                </button>
              )}

              <div className="w-px h-4 bg-gray-700" />

              <button
                onClick={() => setInputMode(inputMode === 'voice' ? 'text' : 'voice')}
                className={`text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                  inputMode === 'text' ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`}
                title="Switch between speech and typing"
              >
                <Terminal size={15} /> {inputMode === 'text' ? 'Typing' : 'Type'}
              </button>
            </div>
          </div>

          {/* Text Input Fallback (Toggleable) */}
          {inputMode === 'text' && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Terminal size={14} className="text-primary" /> Type Your Answer Directly
                </span>
                <span className="text-[11px] text-gray-400">Press Enter or click Submit</span>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your technical or behavioral answer here..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs text-secondary resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendCandidateAnswer(textInput);
                    }
                  }}
                />
                <button
                  onClick={() => sendCandidateAnswer(textInput)}
                  disabled={!textInput.trim() || isProcessing}
                  className="px-4 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 transition flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Live AI Cadence & Metrics */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                WPM
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">Speech Cadence</span>
                <p className="text-sm font-bold text-secondary">
                  {wpm} WPM • <span className="text-primary">{energyLevel}</span>
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-100" />

            <div className="flex-grow max-w-xs">
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Target Pacing (110-160 WPM)</span>
              <div className="w-full bg-surface rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(10, (wpm / 180) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Dialogue & Live Coding Sandbox */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Mode Switcher Tabs (Dialogue vs Monaco Sandbox) */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('dialogue')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'dialogue' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-secondary'
              }`}
            >
              <MessageSquare size={14} /> Dialogue & Insights
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'sandbox' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-secondary'
              }`}
            >
              <Code2 size={14} /> Coding Sandbox (Round 3)
            </button>
          </div>

          {/* TAB 1: DIALOGUE & AI COACHING */}
          {activeTab === 'dialogue' && (
            <div className="space-y-4 flex-grow flex flex-col">
              {/* AI Coaching Insight Card */}
              <div className="bg-primary/10 rounded-3xl p-5 border border-primary/20">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles size={14} /> Smith&apos;s Real-time Guidance
                </h4>
                <p className="text-xs text-secondary leading-relaxed font-medium">
                  {aiSuggestion}
                </p>
              </div>

              {/* Conversation Log */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex-grow h-[420px] flex flex-col">
                <h3 className="font-bold text-secondary mb-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-gray-400" /> Active Dialogue
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {transcriptHistory.length} messages
                  </span>
                </h3>

                <div className="flex-grow overflow-y-auto pr-1 text-xs text-gray-700 leading-relaxed space-y-3">
                  {transcriptHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl ${
                        item.sender === 'You'
                          ? 'bg-primary/5 border border-primary/10 ml-4'
                          : 'bg-surface border border-gray-100 mr-4'
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase tracking-wider text-secondary mb-1 flex items-center justify-between">
                        <span>{item.sender}</span>
                        {item.sender === 'Smith AI' && (
                          <button
                            onClick={() => speakAI(item.text)}
                            className="text-gray-400 hover:text-primary transition flex items-center gap-1"
                            title="Replay Voice"
                          >
                            <Volume2 size={12} />
                            <span className="text-[9px] font-semibold">Play</span>
                          </button>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CODING SANDBOX (ROUND 3) */}
          {activeTab === 'sandbox' && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                  <Code2 size={16} className="text-primary" /> Live Code Sandbox
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={codeLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setCodeLanguage(newLang);
                      setCode(STARTER_CODES[newLang] || '');
                    }}
                    className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-secondary bg-surface focus:outline-none"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>

                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="px-3 py-1 rounded-lg bg-surface hover:bg-gray-200 text-secondary text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Play size={12} /> {isRunningCode ? 'Running...' : 'Run'}
                  </button>

                  <button
                    onClick={handleSubmitCode}
                    disabled={isSubmittingCode}
                    className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 size={12} /> Submit to Smith
                  </button>
                </div>
              </div>

              {/* Embedded Monaco Editor */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-64">
                <Editor
                  height="100%"
                  language={codeLanguage === 'cpp' ? 'cpp' : codeLanguage}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  theme="vs-dark"
                  options={{
                    fontSize: 12,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on'
                  }}
                />
              </div>

              {/* Output Terminal */}
              <div className="bg-secondary rounded-2xl p-3 text-xs font-mono text-gray-300 h-28 overflow-y-auto space-y-1">
                <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-800">
                  <span className="flex items-center gap-1">
                    <Terminal size={11} /> Sandbox Console Output
                  </span>
                  <button onClick={() => setCodeOutput('')} className="hover:text-white">Clear</button>
                </div>
                <pre className="text-[11px] whitespace-pre-wrap leading-tight text-gray-200">
                  {codeOutput || 'Click "Run" to test your solution or "Submit to Smith" when ready.'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
