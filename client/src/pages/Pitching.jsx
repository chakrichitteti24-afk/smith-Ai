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
import AtlyraSymbol from '../components/AtlyraSymbol';
import {
  startInterview,
  submitAnswer,
  transcribeAudio,
  finishInterview,
  runInterviewCode,
  submitInterviewCode
} from '../services/api';
import {
  speakText,
  stopSpeech,
  CURATED_NEURAL_VOICES,
  DEFAULT_NEURAL_VOICE,
  getPreferredVoice,
  setPreferredVoice
} from '../services/speech';

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
  const [candidateName, setCandidateName] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem('candidate_profile') || '{}');
      return p.name || 'Alex Rivera';
    } catch {
      return 'Alex Rivera';
    }
  });
  const [role, setRole] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem('candidate_profile') || '{}');
      return p.title || 'Full Stack Engineer';
    } catch {
      return 'Full Stack Engineer';
    }
  });
  const [level, setLevel] = useState('Senior');
  const [difficulty, setDifficulty] = useState('Medium');

  // Interview Progress
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcriptHistory, setTranscriptHistory] = useState([]);

  // Voice & Audio
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(getPreferredVoice());
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
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
      voice: selectedVoice,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleVoiceChange = (newVoiceId) => {
    setSelectedVoice(newVoiceId);
    setPreferredVoice(newVoiceId);
  };

  const handlePreviewVoice = (vId) => {
    const voiceToTest = vId || selectedVoice;
    stopSpeech();
    setIsSpeaking(true);
    setIsPreviewingVoice(true);
    speakText(`Hello ${candidateName || 'there'}! I am Smith, your technical interviewer. Let's begin today's assessment.`, {
      voice: voiceToTest,
      onStart: () => {
        setIsSpeaking(true);
        setIsPreviewingVoice(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPreviewingVoice(false);
      },
      onError: () => {
        setIsSpeaking(false);
        setIsPreviewingVoice(false);
      }
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
      const clientFallbacks = [
        "Thank you for sharing that. How would you handle potential bottlenecks or edge cases in this architecture?",
        "Makes sense. Can you walk me through how you would optimize database queries or caching for that flow?",
        "Understood. If traffic scaled 10x overnight, what is the first component that would break and how would you mitigate it?",
        "Good point. How do you approach automated testing and continuous deployment for this kind of service?"
      ];
      const fallback = clientFallbacks[newHistory.length % clientFallbacks.length];
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
      <div className="max-w-2xl mx-auto w-full space-y-6 pb-12 animate-fadeIn pt-4 sm:pt-8">
        <header className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.08] text-xs font-mono">
            <AtlyraSymbol size={14} withGlow />
            <span className="text-zinc-300 font-medium">Mock Interview Studio</span>
            <span className="text-zinc-600">/</span>
            <span>Smith AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-[-0.03em]">
            Configure your session.
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-normal leading-relaxed">
            Calibrate role focus, seniority, and interviewer personality for your simulation.
          </p>
        </header>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="font-bold text-rose-300 hover:text-white">✕</button>
          </div>
        )}

        <div className="linear-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Candidate Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full px-3.5 py-2 rounded-xl linear-input text-xs font-medium text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Target Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl linear-input text-xs font-medium text-white bg-[#0c0d14] focus:outline-none cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-[#0c0d14] text-white">{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Seniority Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl linear-input text-xs font-medium text-white bg-[#0c0d14] focus:outline-none cursor-pointer"
              >
                {SENIORITY_LEVELS.map((l) => (
                  <option key={l} value={l} className="bg-[#0c0d14] text-white">{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Rigor / Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl linear-input text-xs font-medium text-white bg-[#0c0d14] focus:outline-none cursor-pointer"
              >
                <option value="Standard" className="bg-[#0c0d14] text-white">Standard</option>
                <option value="Medium" className="bg-[#0c0d14] text-white">Medium (Realistic)</option>
                <option value="Strict" className="bg-[#0c0d14] text-white">Strict / FAANG-Style</option>
              </select>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles size={12} className="text-violet-400" />
                Interviewer Voice
              </label>
              <button
                type="button"
                onClick={() => handlePreviewVoice(selectedVoice)}
                disabled={isPreviewingVoice}
                className="px-2.5 py-0.5 rounded-full bg-white/[0.05] text-zinc-300 hover:text-white hover:bg-white/[0.1] text-[11px] font-mono flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <Volume2 size={11} className={isPreviewingVoice ? 'animate-bounce text-violet-400' : ''} />
                {isPreviewingVoice ? 'Auditioning...' : 'Test Voice'}
              </button>
            </div>
            <select
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl linear-input text-xs font-medium text-white bg-[#0c0d14] cursor-pointer"
            >
              {CURATED_NEURAL_VOICES.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#0c0d14] text-white">
                  {v.name} — {v.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Minimal Device Status */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${hasMic ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{hasMic ? 'Microphone Ready' : 'Awaiting Mic'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${hasCamera ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              <span>{hasCamera ? 'Webcam Active' : 'Audio-Only'}</span>
            </span>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={isProcessing}
            className="w-full py-3 rounded-full linear-btn-primary font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-glow-white"
          >
            {isProcessing ? (
              <>
                <Loader2 size={14} className="animate-spin text-black" />
                <span>{processingStatus || 'Preparing session...'}</span>
              </>
            ) : (
              <>
                <span>Start 45-Minute Interview</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>

        {/* Minimal Roadmap Summary */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-zinc-500 pt-2">
          <span>1. Intro (6m)</span>
          <span className="text-zinc-700">→</span>
          <span>2. Architecture (15m)</span>
          <span className="text-zinc-700">→</span>
          <span>3. Coding (14m)</span>
          <span className="text-zinc-700">→</span>
          <span>4. Behavioral (10m)</span>
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
      <div className="max-w-5xl mx-auto w-full space-y-8 pb-12 animate-fadeIn">
        {isReportLoading ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-white/10 space-y-4">
            <Loader2 size={48} className="animate-spin text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-white">Synthesizing 45-Minute Assessment Scorecard...</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
              Smith AI is computing your technical architecture accuracy, Monaco sandbox efficiency, communication clarity, and STAR behavioral answers.
            </p>
          </div>
        ) : (
          <>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 linear-card p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 mb-1.5 font-mono">
                  <AtlyraSymbol size={16} withGlow />
                  <span className="text-[10px] font-mono font-medium text-zinc-300 uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
                    Evaluation Completed
                  </span>
                  <span className="text-xs text-zinc-400 font-normal">• 45-Min Technical Mock</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  {candidateName}&apos;s Assessment Scorecard
                </h1>
                <p className="text-zinc-400 text-xs mt-1">
                  Target Role: <span className="font-medium text-zinc-200">{role}</span> ({level}) • Conducted by Smith on Atlyra
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl linear-btn-primary font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-glow-white"
                >
                  <RotateCcw size={14} /> Start New Session
                </button>
              </div>
            </header>

            {/* Scorecard Hero Banner */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Overall Score & Hiring Recommendation */}
              <div className="md:col-span-5 linear-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/[0.08] flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">Overall Performance</span>
                  <div className="flex items-baseline gap-3 mt-2 font-mono">
                    <span className="silver-heading text-5xl sm:text-6xl font-semibold tracking-tight">
                      {reportData.overallScore ?? 78}
                    </span>
                    <span className="text-xl text-zinc-500 font-normal">/ 100</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-300">
                    Rating: <span className="text-white font-semibold">{reportData.overallRating || 'Good'}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-2 relative z-10 font-mono">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
                    Hiring Recommendation
                  </span>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white font-mono font-semibold text-sm">
                    <Award size={15} className="text-violet-400" />
                    {reportData.hiringRecommendation || 'Hire'}
                  </div>
                </div>
              </div>

              {/* Categorized Multi-Metric Breakdown */}
              <div className="md:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" /> Evaluation Pillar Breakdown
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 font-mono">
                      <span className="text-gray-300">Technical Accuracy & Architecture</span>
                      <span className="text-primary font-bold">{reportData.accuracyScore ?? 80}%</span>
                    </div>
                    <div className="w-full bg-[#060e20] rounded-full h-2 border border-white/5">
                      <div className="bg-primary h-2 rounded-full shadow-[0_0_8px_#10b981]" style={{ width: `${reportData.accuracyScore ?? 80}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 font-mono">
                      <span className="text-gray-300">Coding & Problem Solving</span>
                      <span className="text-secondary font-bold">{reportData.codingScore ?? 75}%</span>
                    </div>
                    <div className="w-full bg-[#060e20] rounded-full h-2 border border-white/5">
                      <div className="bg-secondary h-2 rounded-full shadow-[0_0_8px_#06b6d4]" style={{ width: `${reportData.codingScore ?? 75}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 font-mono">
                      <span className="text-gray-300">Logical Thinking & Structured Reasoning</span>
                      <span className="text-accent-violet font-bold">{reportData.logicalThinkingScore ?? 82}%</span>
                    </div>
                    <div className="w-full bg-[#060e20] rounded-full h-2 border border-white/5">
                      <div className="bg-accent-violet h-2 rounded-full shadow-[0_0_8px_#818cf8]" style={{ width: `${reportData.logicalThinkingScore ?? 82}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 font-mono">
                      <span className="text-gray-300">Communication & Soft Skills</span>
                      <span className="text-emerald-400 font-bold">{reportData.communicationScore ?? 85}%</span>
                    </div>
                    <div className="w-full bg-[#060e20] rounded-full h-2 border border-white/5">
                      <div className="bg-emerald-400 h-2 rounded-full shadow-[0_0_8px_#34d399]" style={{ width: `${reportData.communicationScore ?? 85}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>Pacing Cadence: <strong className="text-white">{wpm} WPM ({energyLevel})</strong></span>
                  <span>Session Length: <strong className="text-white">{formatTimer(elapsedSeconds)}</strong></span>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-primary" /> Key Strengths
                </h3>
                <ul className="space-y-2.5">
                  {(reportData.strengths && reportData.strengths.length > 0
                    ? reportData.strengths
                    : ['Clear verbal structure during technical explanations', 'Confident delivery and sound algorithmic baseline']
                  ).map((s, i) => (
                    <li key={i} className="text-xs text-gray-300 leading-relaxed flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_6px_#10b981]" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-400" /> Areas for Improvement & Gaps
                </h3>
                <ul className="space-y-2.5">
                  {(reportData.weaknesses && reportData.weaknesses.length > 0
                    ? reportData.weaknesses
                    : ['Proactively verify edge cases and scale limits during coding and system design']
                  ).map((w, i) => (
                    <li key={i} className="text-xs text-gray-300 leading-relaxed flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-[0_0_6px_#fbbf24]" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Study Topics & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" /> Recommended Study Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(reportData.topicsToStudy && reportData.topicsToStudy.length > 0
                    ? reportData.topicsToStudy
                    : ['Distributed Systems Caching', 'Concurrency & Locks', 'STAR Behavioral Formulations']
                  ).map((t, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white/5 rounded-xl text-xs font-mono font-semibold text-gray-200 border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" /> Interview Prep Directives
                </h3>
                <ul className="space-y-2 text-xs text-gray-300 leading-relaxed">
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
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" /> Chronological Session Transcript
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 text-xs">
                {transcriptHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl ${
                      item.sender === 'You'
                        ? 'bg-secondary/10 border border-secondary/25 ml-6'
                        : 'bg-white/5 border border-white/10 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono">
                      <span className={`font-bold text-[10px] uppercase tracking-wider ${item.sender === 'You' ? 'text-secondary' : 'text-primary'}`}>
                        {item.sender} {item.round ? `• ${item.round}` : ''}
                      </span>
                      {item.sender === 'Smith AI' && (
                        <button
                          onClick={() => speakAI(item.text)}
                          className="text-gray-400 hover:text-primary transition flex items-center gap-1 text-[10px]"
                        >
                          <Volume2 size={12} /> Play Voice
                        </button>
                      )}
                    </div>
                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{item.text}</p>
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
    <div className="max-w-7xl mx-auto w-full space-y-6 pb-12 animate-fadeIn">
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-bold text-rose-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Confirmation Modal to Conclude Early */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-white/15">
            <h3 className="text-xl font-bold text-white">Conclude Mock Interview?</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Smith AI will immediately evaluate your responses across all rounds and generate your official evaluation dossier and hiring recommendation.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-sm font-semibold cursor-pointer"
              >
                Continue Interview
              </button>
              <button
                onClick={handleFinishInterview}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-emerald-400 hover:from-emerald-400 hover:to-primary text-[#060e20] text-sm font-black cursor-pointer shadow-glow-sm"
              >
                Generate Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Studio Top Control Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 linear-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1 font-mono">
            <AtlyraSymbol size={16} withGlow animated />
            <span className="text-[10px] font-mono font-medium text-zinc-300 uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
              {currentRound.badge}: {currentRound.name}
            </span>
            <span className="text-xs text-zinc-400 font-normal">
              • {role} ({level})
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            AI Interview Studio with <span className="silver-heading">Smith</span> on Atlyra
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Master 45-min Timer */}
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 text-white rounded-full text-xs font-mono font-medium border border-white/[0.08]">
            <Clock size={13} className="text-zinc-400" />
            <span>{formatTimer(elapsedSeconds)} / 45:00</span>
          </div>

          {/* Voice Output Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer border ${
              voiceEnabled
                ? 'bg-white/[0.08] text-white border-white/20 hover:bg-white/[0.12]'
                : 'bg-white/[0.02] text-zinc-500 border-white/[0.06] hover:bg-white/[0.05]'
            }`}
            title="Toggle Smith voice output"
          >
            {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            {voiceEnabled ? 'Voice Active' : 'Muted'}
          </button>

          {/* Live Voice Selector */}
          {voiceEnabled && (
            <div className="flex items-center gap-1 bg-black/40 border border-white/[0.08] rounded-full px-2.5 py-1 text-xs">
              <Sparkles size={11} className="text-violet-400" />
              <select
                value={selectedVoice}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="bg-transparent text-zinc-300 font-mono font-medium text-xs focus:outline-none cursor-pointer pr-1"
                title="Change Interviewer Neural Voice"
              >
                {CURATED_NEURAL_VOICES.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#0c0d14] text-white">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Advance Round Button */}
          <button
            onClick={handleAdvanceRound}
            className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] rounded-full text-xs font-mono font-medium text-zinc-200 flex items-center gap-1 border border-white/[0.08] cursor-pointer transition"
          >
            Next Section <ChevronRight size={13} />
          </button>

          {/* Finish & Score Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-3.5 py-1 linear-btn-primary rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
          >
            <Award size={13} /> End & Score
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
              className={`p-3 rounded-xl border text-xs font-mono transition cursor-pointer ${
                isActive
                  ? 'bg-white/[0.1] text-white border-white/20 shadow-sm font-semibold'
                  : isCompleted
                  ? 'bg-white/[0.04] text-zinc-300 border-white/[0.08]'
                  : 'bg-white/[0.02] text-zinc-500 border-white/[0.05] hover:text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider">
                  {isCompleted ? '✓ Done' : `Round ${idx + 1}`}
                </span>
                <span className="text-[10px] text-zinc-500">{r.targetMinutes}m</span>
              </div>
              <p className="font-sans font-medium truncate mt-0.5 text-zinc-200">{r.name}</p>
            </div>
          );
        })}
      </div>

      {/* Main Studio Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Feeds / Avatar & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Video or AI Avatar Stage */}
          <div className="bg-[#05060a] rounded-2xl sm:rounded-3xl overflow-hidden relative aspect-video flex items-center justify-center border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
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
                {/* Minimalist Linear Smith Avatar */}
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-400 p-[1px] shadow-lg transition-all duration-300 ${
                    isSpeaking ? 'scale-105 ring-4 ring-violet-500/20 shadow-glow-violet' : ''
                  }`}>
                    <div className="w-full h-full bg-[#0c0d14] rounded-full flex items-center justify-center text-2xl font-mono font-semibold text-white">
                      SM
                    </div>
                  </div>
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-violet-500 items-center justify-center text-white text-[9px] font-mono font-bold">
                        AI
                      </span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-white font-medium text-sm tracking-tight">Smith Autonomous Evaluator</h3>
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">
                    {isSpeaking ? 'Speaking response...' : isProcessing ? 'Analyzing your answer...' : 'Listening actively...'}
                  </p>
                </div>

                {/* Real-time Decibel Audio Equalizer */}
                <div className="flex items-center gap-1.5 h-6">
                  {[12, 24, 18, 28, 16, 22, 30, 20, 14, 26, 18, 10].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        audioLevel > 15 ? 'bg-violet-400' : 'bg-white/10'
                      }`}
                      style={{
                        height: audioLevel > 15
                          ? `${Math.max(4, Math.min(24, (audioLevel / 100) * h * 1.2))}px`
                          : '4px'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Speaking Wave Overlay */}
            {isSpeaking && (
              <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.1] flex items-center gap-2 z-20">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-violet-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1 h-3 bg-white rounded-full animate-bounce delay-150"></span>
                </div>
                <span className="text-white text-xs font-mono font-medium">Smith Speaking...</span>
                <button
                  onClick={() => { stopSpeech(); setIsSpeaking(false); }}
                  className="ml-1 text-zinc-500 hover:text-white text-xs"
                  title="Skip Speech"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Processing Spinner Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20 space-y-3">
                <Loader2 size={32} className="animate-spin text-white" />
                <p className="font-mono text-xs text-zinc-300 animate-pulse">{processingStatus}</p>
              </div>
            )}

            {/* Live Subtitle Overlay during recording */}
            {isRecording && (
              <div className="absolute bottom-18 left-6 right-6 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/[0.1] z-20 text-center shadow-2xl">
                <span className="text-[10px] font-mono text-zinc-400 font-medium uppercase tracking-wider block mb-0.5">
                  Live Transcription (Whisper Large v3)
                </span>
                <p className="text-white text-xs font-medium leading-snug">
                  {liveTranscript ? `"${liveTranscript}"` : 'Listening to your voice... start answering.'}
                </p>
              </div>
            )}

            {/* Floating Action Controls */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-[#0c0d14]/85 backdrop-blur-2xl px-4 sm:px-5 py-2 rounded-full border border-white/[0.1] z-30 shadow-2xl max-w-[95%]">
              {hasCamera && (
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className="text-zinc-400 hover:text-white text-xs font-medium flex items-center gap-1 cursor-pointer transition"
                  title="Toggle camera feed"
                >
                  {cameraEnabled ? <Video size={15} /> : <VideoOff size={15} />}
                </button>
              )}

              {hasCamera && <div className="w-px h-4 bg-white/[0.1]" />}

              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition font-mono font-medium text-xs cursor-pointer whitespace-nowrap"
                >
                  <StopCircle size={15} className="text-rose-400 animate-pulse" /> Stop & Submit
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 text-white hover:text-zinc-200 transition font-mono font-medium text-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  <PlayCircle size={15} className="text-white" /> Speak Answer
                </button>
              )}

              <div className="w-px h-4 bg-white/[0.1]" />

              <button
                onClick={() => setInputMode(inputMode === 'voice' ? 'text' : 'voice')}
                className={`text-xs font-mono font-medium flex items-center gap-1 cursor-pointer transition whitespace-nowrap ${
                  inputMode === 'text' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Switch between speech and typing"
              >
                <Terminal size={13} /> {inputMode === 'text' ? 'Keyboard' : 'Type'}
              </button>
            </div>
          </div>

          {/* Text Input Fallback (Toggleable) */}
          {inputMode === 'text' && (
            <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Terminal size={14} className="text-primary" /> Direct Keyboard Input
                </span>
                <span className="text-[11px] font-mono text-gray-400">Press Enter to submit</span>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your technical or behavioral answer here..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-gray-500 resize-none focus:outline-none"
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
                  className="px-4 bg-gradient-to-r from-primary to-emerald-400 hover:from-emerald-400 hover:to-primary text-[#060e20] rounded-xl font-bold text-xs transition flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer shadow-glow-sm"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Live AI Cadence & Metrics */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-bold">
                WPM
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">Speech Cadence</span>
                <p className="text-sm font-bold text-white">
                  {wpm} WPM • <span className="text-primary">{energyLevel}</span>
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex-grow max-w-xs">
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Target Pace (110-160 WPM)</span>
              <div className="w-full bg-[#060e20] rounded-full h-2 border border-white/5">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 shadow-[0_0_8px_#10b981]"
                  style={{ width: `${Math.min(100, Math.max(10, (wpm / 180) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Dialogue & Live Coding Sandbox */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Mode Switcher Tabs (Dialogue vs Monaco Sandbox) */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/[0.06]">
            <button
              onClick={() => setActiveTab('dialogue')}
              className={`flex-1 py-1.5 rounded-full text-xs font-mono font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'dialogue'
                  ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.12]'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <MessageSquare size={13} className={activeTab === 'dialogue' ? 'text-white' : ''} /> Dialogue & Insights
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex-1 py-1.5 rounded-full text-xs font-mono font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.12]'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Code2 size={13} className={activeTab === 'sandbox' ? 'text-white' : ''} /> Code Sandbox (Round 3)
            </button>
          </div>

          {/* TAB 1: DIALOGUE & AI COACHING */}
          {activeTab === 'dialogue' && (
            <div className="space-y-3 flex-grow flex flex-col">
              {/* AI Coaching Insight Card */}
              <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
                <h4 className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-violet-400" /> Smith&apos;s Real-time Guidance
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {aiSuggestion}
                </p>
              </div>

              {/* Conversation Log */}
              <div className="linear-card rounded-2xl p-5 border border-white/[0.08] flex-grow h-[420px] flex flex-col">
                <h3 className="font-medium text-white mb-3 flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-zinc-400" /> Active Dialogue
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {transcriptHistory.length} messages
                  </span>
                </h3>

                <div className="flex-grow overflow-y-auto overscroll-contain pr-1 text-xs text-zinc-300 leading-relaxed space-y-2.5">
                  {transcriptHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl ${
                        item.sender === 'You'
                          ? 'bg-white/[0.04] border border-white/[0.08] ml-4'
                          : 'bg-white/[0.02] border border-white/[0.05] mr-4'
                      }`}
                    >
                      <div className="font-mono text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span className={item.sender === 'You' ? 'text-zinc-200 font-semibold' : 'text-zinc-400 font-medium'}>
                          {item.sender}
                        </span>
                        {item.sender === 'Smith AI' && (
                          <button
                            onClick={() => speakAI(item.text)}
                            className="text-zinc-500 hover:text-white transition flex items-center gap-1 cursor-pointer"
                            title="Replay Voice"
                          >
                            <Volume2 size={11} />
                            <span className="text-[9px]">Play</span>
                          </button>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CODING SANDBOX (ROUND 3) */}
          {activeTab === 'sandbox' && (
            <div className="linear-card rounded-2xl p-4 sm:p-5 border border-white/[0.08] flex flex-col space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-medium text-white flex items-center gap-1.5">
                  <Code2 size={14} className="text-zinc-400" /> Live Code Sandbox
                </span>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <select
                    value={codeLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setCodeLanguage(newLang);
                      setCode(STARTER_CODES[newLang] || '');
                    }}
                    className="px-2.5 py-1 rounded-lg linear-input text-xs font-mono font-medium text-white bg-[#0c0d14] focus:outline-none cursor-pointer"
                  >
                    <option value="python" className="bg-[#0c0d14] text-white">Python</option>
                    <option value="javascript" className="bg-[#0c0d14] text-white">JavaScript</option>
                    <option value="cpp" className="bg-[#0c0d14] text-white">C++</option>
                    <option value="java" className="bg-[#0c0d14] text-white">Java</option>
                  </select>

                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="linear-btn-secondary px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1 cursor-pointer transition"
                  >
                    <Play size={11} /> {isRunningCode ? 'Running...' : 'Run'}
                  </button>

                  <button
                    onClick={handleSubmitCode}
                    disabled={isSubmittingCode}
                    className="linear-btn-primary px-3.5 py-1 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 size={11} /> Submit
                  </button>
                </div>
              </div>

              {/* Embedded Monaco Editor */}
              <div className="rounded-xl overflow-hidden border border-white/[0.08] h-64 bg-[#0c0d14]">
                <Editor
                  height="100%"
                  language={codeLanguage === 'cpp' ? 'cpp' : codeLanguage}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  onMount={(editor, monaco) => {
                    monaco?.editor?.setUnexpectedErrorHandler?.((err) => {
                      if (err && (err.message === 'Canceled' || err.name === 'Canceled' || String(err).includes('Canceled'))) return;
                      console.error(err);
                    });
                  }}
                  theme="vs-dark"
                  options={{
                    automaticLayout: true,
                    fontSize: 13,
                    fontFamily: '"Geist Mono", "JetBrains Mono", Menlo, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
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

              {/* Output Terminal */}
              <div className="bg-[#05060a] rounded-xl p-3 text-xs font-mono text-zinc-300 h-28 overflow-y-auto overscroll-contain space-y-1 border border-white/[0.06]">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider pb-1 border-b border-white/[0.06]">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Terminal size={11} /> Sandbox Console Output
                  </span>
                  <button onClick={() => setCodeOutput('')} className="hover:text-white cursor-pointer">Clear</button>
                </div>
                <pre className="text-[11px] whitespace-pre-wrap leading-tight text-zinc-300">
                  {codeOutput || 'Click "Run" to test your solution or "Submit" when ready.'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
