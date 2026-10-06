/**
 * client/src/services/speech.js
 * 
 * Studio-Grade Neural Voice Engine for Smith AI.
 * 
 * Primary: High-fidelity Microsoft Edge Neural TTS via backend API
 * (100% human-like inflections, pauses, and studio acoustic quality).
 * 
 * Fallback: Enhanced browser SpeechSynthesis with natural neural voice filtering.
 */

import { fetchTTSAudioBlob } from './api';

export const CURATED_NEURAL_VOICES = [
  { id: 'en-US-ChristopherNeural', name: 'Smith (Executive Male)', gender: 'Male', accent: 'US', desc: 'Authoritative, calm, executive tech lead' },
  { id: 'en-US-BrianNeural', name: 'Smith (Conversational Male)', gender: 'Male', accent: 'US', desc: 'Warm, natural, conversational tech lead' },
  { id: 'en-US-AndrewNeural', name: 'Andrew (Energetic Male)', gender: 'Male', accent: 'US', desc: 'Crisp, modern, approachable' },
  { id: 'en-US-AvaNeural', name: 'Sarah (Executive Female)', gender: 'Female', accent: 'US', desc: 'Articulate, confident, senior interviewer' },
  { id: 'en-US-JennyNeural', name: 'Jenny (Friendly Female)', gender: 'Female', accent: 'US', desc: 'Warm, engaging, approachable' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (British Male)', gender: 'Male', accent: 'UK', desc: 'Formal, articulate British accent' },
  { id: 'en-IN-PrabhatNeural', name: 'Prabhat (Indian Male)', gender: 'Male', accent: 'IN', desc: 'Clear, professional Indian English' },
  { id: 'en-IN-NeerjaNeural', name: 'Neerja (Indian Female)', gender: 'Female', accent: 'IN', desc: 'Expressive, pleasant Indian English' }
];

export const DEFAULT_NEURAL_VOICE = 'en-US-ChristopherNeural';

const STORAGE_KEY = 'smith_ai_interviewer_voice';

export function getPreferredVoice() {
  if (typeof window === 'undefined') return DEFAULT_NEURAL_VOICE;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && CURATED_NEURAL_VOICES.some(v => v.id === saved)) {
    return saved;
  }
  return DEFAULT_NEURAL_VOICE;
}

export function setPreferredVoice(voiceId) {
  if (typeof window === 'undefined') return;
  if (CURATED_NEURAL_VOICES.some(v => v.id === voiceId)) {
    localStorage.setItem(STORAGE_KEY, voiceId);
  }
}

// Clean text for natural speech with human gaps, pauses, and cadence
export function cleanTextForSpeech(rawText) {
  if (!rawText) return '';
  let text = rawText
    .replace(/```[\s\S]*?```/g, ' [code challenge omitted for audio] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#+\s+/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/<=/g, ' less than or equal to ')
    .replace(/>=/g, ' greater than or equal to ')
    .replace(/!=/g, ' not equal to ')
    .replace(/==/g, ' equals ')
    .replace(/->/g, ' to ')
    .replace(/(\d+)\^(\d+)/g, '$1 to the power of $2')
    .replace(/</g, ' less than ')
    .replace(/>/g, ' greater than ')
    .replace(/\+/g, ' plus ')
    .replace(/[^\w\s.,?!'"—–-]/g, ' ') // preserve dashes and standard pauses
    .replace(/\s+/g, ' ')
    .trim();

  // Natural thinking pause on conversational reflections / filler sounds
  text = text.replace(/^(Hmm|Right|Got it|I see|Alright|Interesting|Fair enough|Okay|Understood|Well)([.,!]?)\s*/i, (match, word) => {
    return `${word}... `;
  });

  // Natural pause before transitional shifts
  text = text.replace(/\b(Now|Moving on|Let's move on|Looking at this|To dive deeper|In that case)([.,]?)\s*/gi, (match, phrase) => {
    return `${phrase}... `;
  });

  // Ensure natural breath gap between feedback sentence and next question
  text = text.replace(/([.?!])\s+([A-Z])/g, '$1 ... $2');

  // Normalize excessive dots
  text = text.replace(/\.{4,}/g, '...');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

let activeAudio = null;
let activeAudioUrl = null;
let activeAbortController = null;
let keepAliveInterval = null;

/**
 * Stop any ongoing speech immediately (both neural audio and browser speech synthesis).
 */
export function stopSpeech() {
  // Abort any pending fetch request
  if (activeAbortController) {
    try {
      activeAbortController.abort();
    } catch (_) {}
    activeAbortController = null;
  }

  // Stop HTML5 audio playback
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.onplay = null;
      activeAudio.onended = null;
      activeAudio.onerror = null;
    } catch (_) {}
    activeAudio = null;
  }

  if (activeAudioUrl) {
    try {
      URL.revokeObjectURL(activeAudioUrl);
    } catch (_) {}
    activeAudioUrl = null;
  }

  // Stop browser synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
  }
}

/**
 * Find the best natural English voice available in the browser (fallback only)
 */
function getBestBrowserVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prefer high quality English voices (Natural / Neural / Online)
  return (
    voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural'))) ||
    voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
    voices.find(v => v.lang.startsWith('en') && !v.name.includes('Desktop')) ||
    voices.find(v => v.lang.startsWith('en')) ||
    voices[0]
  );
}

/**
 * Fallback browser SpeechSynthesis implementation.
 */
function speakWithBrowserSynthesis(cleanedText, { onStart, onEnd, onError } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  const voice = getBestBrowserVoice();
  if (voice) utterance.voice = voice;

  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onstart = () => {
    keepAliveInterval = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
    }, 12000);

    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      console.warn('Speech synthesis error:', e);
      if (onError) onError(e);
    }
    if (onEnd) onEnd();
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const v = getBestBrowserVoice();
      if (v) utterance.voice = v;
      window.speechSynthesis.speak(utterance);
    };
  } else {
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Speak text out loud with full lifecycle callbacks.
 * Uses high-fidelity neural audio from server; seamlessly falls back to browser TTS.
 * 
 * @param {string} text - Text for Smith AI to speak
 * @param {object} options - { voice, onStart, onEnd, onError }
 */
export function speakText(text, { voice, onStart, onEnd, onError } = {}) {
  // Cancel any currently playing speech first
  stopSpeech();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    if (onEnd) onEnd();
    return () => {};
  }

  const selectedVoice = voice || getPreferredVoice();
  const abortCtrl = new AbortController();
  activeAbortController = abortCtrl;

  // Signal start callback right away so UI ripples/indicators activate
  if (onStart) onStart();

  fetchTTSAudioBlob(cleaned, selectedVoice)
    .then((blob) => {
      if (abortCtrl.signal.aborted) return;

      const audioUrl = URL.createObjectURL(blob);
      activeAudioUrl = audioUrl;

      const audio = new Audio(audioUrl);
      activeAudio = audio;

      audio.onended = () => {
        if (activeAudioUrl) {
          URL.revokeObjectURL(activeAudioUrl);
          activeAudioUrl = null;
        }
        activeAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (err) => {
        console.warn('Neural audio playback failed, falling back to browser synthesis:', err);
        if (activeAudioUrl) {
          URL.revokeObjectURL(activeAudioUrl);
          activeAudioUrl = null;
        }
        activeAudio = null;
        speakWithBrowserSynthesis(cleaned, { onStart, onEnd, onError });
      };

      return audio.play().catch((playErr) => {
        if (abortCtrl.signal.aborted) return;
        console.warn('Audio play() failed, falling back to browser synthesis:', playErr);
        speakWithBrowserSynthesis(cleaned, { onStart, onEnd, onError });
      });
    })
    .catch((fetchErr) => {
      if (abortCtrl.signal.aborted) return;
      console.warn('Neural TTS request failed, falling back to browser synthesis:', fetchErr.message);
      speakWithBrowserSynthesis(cleaned, { onStart, onEnd, onError });
    });

  return () => stopSpeech();
}
