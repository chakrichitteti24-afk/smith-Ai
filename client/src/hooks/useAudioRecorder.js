/**
 * useAudioRecorder.js
 *
 * RESPONSIBILITY: Record audio from the microphone using MediaRecorder API.
 * Provides start/stop recording and returns audio as a Blob.
 *
 * Simple MediaRecorder → Blob → upload to server for Groq Whisper transcription.
 */

import { useRef, useCallback, useEffect } from 'react';

export function useAudioRecorder() {
  const mediaRecorderRef = useRef(null);
  const streamRef        = useRef(null);
  const chunksRef        = useRef([]);
  const isRecordingRef   = useRef(false);

  /**
   * Request microphone permission and start recording.
   * @returns {Promise<void>}
   */
  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      chunksRef.current = [];

      // Prefer webm/opus, fallback to webm, then mp4, then ogg
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

      recorder.start(250); // Collect data every 250ms
      isRecordingRef.current = true;
    } catch (err) {
      console.error('[AudioRecorder] Failed to start:', err);
      throw err;
    }
  }, []);

  /**
   * Stop recording and return the audio as a Blob.
   * @returns {Promise<Blob|null>} The recorded audio blob, or null if nothing recorded
   */
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === 'inactive') {
        isRecordingRef.current = false;
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        chunksRef.current = [];
        isRecordingRef.current = false;

        // Stop all mic tracks after the recorder finishes flushing buffers
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        if (chunks.length === 0) {
          resolve(null);
          return;
        }

        const blob = new Blob(chunks, { type: recorder.mimeType });
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  /**
   * Cleanup on unmount
   */
  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    isRecordingRef.current = false;
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    startRecording,
    stopRecording,
    cleanup,
    get isRecording() { return isRecordingRef.current; },
  };
}
