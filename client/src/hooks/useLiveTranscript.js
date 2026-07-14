/**
 * useLiveTranscript.js
 *
 * Real-time interim transcription using the browser's SpeechRecognition API.
 * Runs in parallel with MediaRecorder — purely for visual feedback.
 * The final high-accuracy Whisper result is used when Submit is clicked.
 *
 * Key guarantees:
 * - Every startLiveTranscript() call resets ALL state (empty slate).
 * - finalTextRef tracks confirmed words; never duplicated across restarts.
 * - On Chrome's 60s auto-end: the engine restarts but does NOT re-accumulate
 *   already-confirmed words (uses resultIndex correctly).
 * - liveTextRef gives stopLiveTranscript() the current text without stale closure.
 * - No auto-submission — this hook only manages text display.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

export function useLiveTranscript(onError) {
  const [liveText, setLiveText] = useState('');
  const [isActive, setIsActive] = useState(false);

  const recognitionRef = useRef(null);
  const finalTextRef   = useRef('');   // accumulated final (confirmed) words
  const liveTextRef    = useRef('');   // mirror of liveText state — avoids stale closure
  const isStoppedRef   = useRef(false);

  const updateLiveText = useCallback((text) => {
    liveTextRef.current = text;
    setLiveText(text);
  }, []);

  /** Tear down and fully reset the recognition engine */
  const _destroyRecognition = useCallback(() => {
    if (recognitionRef.current) {
      // Remove handlers first so onend doesn't auto-restart
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror  = null;
      recognitionRef.current.onend    = null;
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  }, []);

  /**
   * Build and start a fresh SpeechRecognition instance.
   * Called once on startLiveTranscript, and again on auto-restart.
   */
  const _createAndStart = useCallback(() => {
    if (!SpeechRecognition || isStoppedRef.current) return;

    _destroyRecognition();

    const recognition = new SpeechRecognition();
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.lang            = 'en-US';
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      if (isStoppedRef.current) return;

      // Only process results from the index the engine reported as new.
      // This prevents re-processing previously final results on restart.
      let newFinal   = '';
      let interimNow = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text   = result[0].transcript;
        if (result.isFinal) {
          newFinal += text;
        } else {
          interimNow += text;
        }
      }

      // Append only genuinely new confirmed words
      if (newFinal) {
        // Trim to avoid double-spaces and leading/trailing whitespace
        const separator = finalTextRef.current.length > 0 ? ' ' : '';
        finalTextRef.current = (finalTextRef.current + separator + newFinal.trim()).trim();
      }

      // Build the displayed text: confirmed + current interim
      const display = interimNow.trim()
        ? (finalTextRef.current + (finalTextRef.current ? ' ' : '') + interimNow.trim()).trim()
        : finalTextRef.current;

      updateLiveText(display);
    };

    recognition.onerror = (event) => {
      if (isStoppedRef.current) return;
      // no-speech and aborted are routine — ignore silently
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      // network errors are transient — let onend restart
      if (event.error === 'network') return;
      console.warn('[LiveTranscript] SpeechRecognition error:', event.error);
      onError?.('Voice recognition error. Please try again.');
    };

    recognition.onend = () => {
      if (isStoppedRef.current) return;
      // Chrome terminates after 60 s — restart to maintain continuous capture.
      // finalTextRef is preserved, so no words are duplicated.
      setTimeout(() => {
        if (!isStoppedRef.current) {
          _createAndStart();
        }
      }, 200);
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn('[LiveTranscript] Failed to start SpeechRecognition:', err);
    }
  }, [_destroyRecognition, onError, updateLiveText]);

  /**
   * Begin a completely fresh live transcription session.
   * Resets ALL buffers — nothing from a previous session carries over.
   */
  const startLiveTranscript = useCallback(() => {
    // Full reset
    finalTextRef.current = '';
    isStoppedRef.current = false;
    updateLiveText('');
    setIsActive(true);

    _createAndStart();
  }, [_createAndStart, updateLiveText]);

  /**
   * Stop recognition and return the current transcript text.
   * Uses ref so always returns up-to-date value (no stale closure).
   */
  const stopLiveTranscript = useCallback(() => {
    isStoppedRef.current = true;
    setIsActive(false);
    _destroyRecognition();
    return liveTextRef.current;
  }, [_destroyRecognition]);

  /**
   * Clear text without stopping recognition.
   * Use between interview turns so previous answer doesn't bleed into next.
   */
  const clearLiveText = useCallback(() => {
    finalTextRef.current = '';
    updateLiveText('');
  }, [updateLiveText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isStoppedRef.current = true;
      _destroyRecognition();
    };
  }, [_destroyRecognition]);

  return {
    liveText,
    isActive,
    isSupported: !!SpeechRecognition,
    startLiveTranscript,
    stopLiveTranscript,
    clearLiveText,
  };
}
