/**
 * useAudioRecorder.js
 *
 * Records audio from the microphone using MediaRecorder.
 * - Reuses the MediaStream across recordings (eliminates init latency).
 * - Uses Hark for Voice Activity Detection to surface isSpeaking state ONLY.
 * - VAD does NOT trigger submission. Submission is ONLY via explicit stopRecording().
 * - All refs used throughout to prevent stale closures.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import hark from 'hark';

export function useAudioRecorder() {
  const mediaRecorderRef = useRef(null);
  const streamRef        = useRef(null);
  const chunksRef        = useRef([]);
  const isRecordingRef   = useRef(false);
  const harkRef          = useRef(null);
  const isSpeakingRef    = useRef(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const setSpeaking = useCallback((val) => {
    isSpeakingRef.current = val;
    setIsSpeaking(val);
  }, []);

  /** Acquire or reuse the microphone stream */
  const getStream = useCallback(async () => {
    if (streamRef.current) {
      const alive = streamRef.current.getTracks().every(t => t.readyState === 'live');
      if (alive) return streamRef.current;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;
    return stream;
  }, []);

  /** Start a new recording session */
  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return;

    try {
      const stream = await getStream();

      // Reset all state for this recording session
      chunksRef.current = [];

      // Choose best supported codec
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start(100); // 100ms chunks for low latency
      isRecordingRef.current = true;

      // ── Hark VAD — ONLY for isSpeaking visual indicator, NOT for submission ──
      if (harkRef.current) {
        try { harkRef.current.stop(); } catch { /* ignore */ }
        harkRef.current = null;
      }

      const speechEvents = hark(stream, {
        interval:  80,
        threshold: -60,
        play:      false,
      });
      harkRef.current = speechEvents;

      speechEvents.on('speaking', () => {
        setSpeaking(true);
      });

      speechEvents.on('stopped_speaking', () => {
        setSpeaking(false);
        // ← NO auto-submit here. User must click Submit Answer.
      });

    } catch (err) {
      console.error('[AudioRecorder] Failed to start recording:', err);
      throw err;
    }
  }, [getStream, setSpeaking]);

  /**
   * Stop recording and return the audio Blob.
   * This is the ONLY way recording ends — must be called explicitly.
   */
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      // Stop VAD
      if (harkRef.current) {
        try { harkRef.current.stop(); } catch { /* ignore */ }
        harkRef.current = null;
      }
      setSpeaking(false);

      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === 'inactive') {
        isRecordingRef.current = false;
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        chunksRef.current      = [];
        isRecordingRef.current = false;

        if (chunks.length === 0) {
          resolve(null);
          return;
        }
        resolve(new Blob(chunks, { type: recorder.mimeType }));
      };

      try {
        recorder.stop();
      } catch (err) {
        console.warn('[AudioRecorder] Error stopping recorder:', err);
        isRecordingRef.current = false;
        resolve(null);
      }
    });
  }, [setSpeaking]);

  /**
   * Returns a snapshot Blob of audio captured so far.
   * Does NOT stop recording.
   */
  const getCurrentBlob = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: recorder.mimeType });
  }, []);

  /** Full teardown — call on session end or unmount */
  const cleanup = useCallback(() => {
    if (harkRef.current) {
      try { harkRef.current.stop(); } catch { /* ignore */ }
      harkRef.current = null;
    }
    setSpeaking(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    chunksRef.current      = [];
    isRecordingRef.current = false;
  }, [setSpeaking]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    startRecording,
    stopRecording,
    getCurrentBlob,
    cleanup,
    isSpeaking,
    get isRecording() { return isRecordingRef.current; },
  };
}
