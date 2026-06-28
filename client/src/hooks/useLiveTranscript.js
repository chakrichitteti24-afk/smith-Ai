/**
 * useLiveTranscript.js
 *
 * Uses the Web Speech API (SpeechRecognition) to provide real-time,
 * interim word-by-word transcripts while the user speaks.
 *
 * This runs IN PARALLEL with the MediaRecorder — the live transcript
 * is purely visual feedback. The actual Whisper transcription is still
 * used for AI processing.
 *
 * Falls back gracefully if SpeechRecognition is not available.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { cleanLiveText } from '../utils/textProcessing';

// Cross-browser SpeechRecognition
const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function useLiveTranscript(onError) {
  const [liveText, setLiveText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const recognitionRef = useRef(null);
  const finalTextRef = useRef('');
  const isStoppedRef = useRef(false);

  /**
   * Start live transcription.
   * Call this when the user begins speaking (LISTENING state).
   */
  const startLiveTranscript = useCallback(() => {
    if (!SpeechRecognition) return;

    // Clean up any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
    }

    finalTextRef.current = '';
    isStoppedRef.current = false;
    setLiveText('');
    setIsActive(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      if (isStoppedRef.current) return;

      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          // Use confidence scores if available (some browsers provide 0 for interim)
          // Wait briefly until confidence improves before rendering them.
          // By discarding interim results with very low confidence, we reduce flickering.
          if (result[0].confidence > 0.1 || result[0].confidence === 0) {
            interim += text;
          }
        }
      }

      if (finalTranscript) {
        finalTextRef.current += finalTranscript;
      }

      const combined = cleanLiveText(finalTextRef.current, interim);
      setLiveText(combined);
    };

    recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are normal operational errors
      if (event.error === 'network') {
        console.warn('[LiveTranscript] Network error, will attempt to recover naturally.');
        // Don't call onError, let onend restart it.
        return;
      }
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[LiveTranscript] SpeechRecognition error:', event.error);
        onError?.('Voice recognition stopped. Please try again.');
      }
    };

    recognition.onend = () => {
      // Auto-restart if we haven't explicitly stopped
      if (!isStoppedRef.current && recognitionRef.current) {
        // Add a small delay for network recovery
        setTimeout(() => {
          if (!isStoppedRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // May fail if already started, ignore
            }
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.warn('[LiveTranscript] Failed to start SpeechRecognition:', err);
    }
  }, []);

  /**
   * Stop live transcription.
   * Returns the last known live text (for display purposes only).
   */
  const stopLiveTranscript = useCallback(() => {
    isStoppedRef.current = true;
    setIsActive(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const lastText = liveText;
    return lastText;
  }, [liveText]);

  /**
   * Clear live text without stopping recognition.
   */
  const clearLiveText = useCallback(() => {
    finalTextRef.current = '';
    setLiveText('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isStoppedRef.current = true;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    liveText,
    isActive,
    isSupported: !!SpeechRecognition,
    startLiveTranscript,
    stopLiveTranscript,
    clearLiveText,
  };
}
