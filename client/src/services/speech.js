/**
 * client/src/services/speech.js
 * 
 * High-reliability browser SpeechSynthesis service for Smith AI.
 * Handles voice selection, markdown stripping, Chrome silence timeout bug,
 * and promise-based speech playback.
 */

// Clean text for natural speech (remove markdown symbols, emojis, backticks)
export function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/gs, 'code block')
    .replace(/#+\s+/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[-*•]\s+/g, '')
    .replace(/[^\w\s.,?!'"-]/g, '') // remove weird emojis and symbols
    .replace(/\s+/g, ' ')
    .trim();
}

let keepAliveInterval = null;

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
  }
}

/**
 * Find the best natural English voice available in the browser
 */
function getBestVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prefer high quality English voices
  return (
    voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural'))) ||
    voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Samantha') || v.name.includes('Zira'))) ||
    voices.find(v => v.lang.startsWith('en')) ||
    voices[0]
  );
}

/**
 * Speak text out loud with full lifecycle callbacks
 */
export function speakText(text, { onStart, onEnd, onError } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    if (onEnd) onEnd();
    return () => {};
  }

  // Cancel any currently playing speech first
  stopSpeech();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    if (onEnd) onEnd();
    return () => {};
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  const voice = getBestVoice();
  if (voice) utterance.voice = voice;

  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onstart = () => {
    // Chrome workaround: speech can pause unexpectedly on long texts; pause/resume keeps it alive
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
    // 'canceled' or 'interrupted' is expected when user stops speech manually
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      console.warn('Speech synthesis error:', e);
      if (onError) onError(e);
    }
    if (onEnd) onEnd();
  };

  // Ensure voices are loaded (some browsers load voices asynchronously)
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const v = getBestVoice();
      if (v) utterance.voice = v;
      window.speechSynthesis.speak(utterance);
    };
  } else {
    window.speechSynthesis.speak(utterance);
  }

  return () => stopSpeech();
}
