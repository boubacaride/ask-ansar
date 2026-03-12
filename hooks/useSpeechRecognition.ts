import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useVoiceStore } from '@/store/voiceStore';
import { stop as speechStop } from '@/utils/speechUtils';

interface UseSpeechRecognitionReturn {
  isAvailable: boolean;
  isRecording: boolean;
  interimText: string;
  finalText: string;
  error: string | null;
  startRecording: (lang?: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
}

// Web Speech API global declarations
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

const RECORDING_TIMEOUT_MS = 30_000;

/**
 * Cross-platform speech recognition hook.
 * - Native (iOS/Android): uses expo-speech-recognition
 * - Web: uses Web Speech API with interim results
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  if (Platform.OS !== 'web') {
    return useNativeSpeechRecognition();
  }
  return useWebSpeechRecognition();
}

// ─── NATIVE: expo-speech-recognition ────────────────────────────────

function useNativeSpeechRecognition(): UseSpeechRecognitionReturn {
  // Dynamic import to avoid web bundling issues
  const ExpoSpeechRecognition = require('expo-speech-recognition');
  const {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
  } = ExpoSpeechRecognition;

  const [isAvailable, setIsAvailable] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    setAudioState,
    setInterimTranscript,
    setFinalTranscript,
    setSttError,
  } = useVoiceStore();

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        await ExpoSpeechRecognitionModule.getPermissionsAsync();
        setIsAvailable(true);
      } catch {
        setIsAvailable(false);
      }
    };
    checkAvailability();
  }, []);

  useSpeechRecognitionEvent('result', (event: any) => {
    const results = event.results;
    if (results && results.length > 0) {
      const latest = results[results.length - 1];
      const transcript = latest?.transcript || '';

      if (event.isFinal || latest?.isFinal) {
        setFinalText(transcript);
        setFinalTranscript(transcript);
        setInterimText('');
        setInterimTranscript('');
      } else {
        setInterimText(transcript);
        setInterimTranscript(transcript);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event: any) => {
    const errorMessage = event.error || 'Speech recognition error';
    setError(errorMessage);
    setSttError(errorMessage);
    setIsRecording(false);
    setAudioState('IDLE');
    clearTimeout(timeoutRef.current!);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    if (useVoiceStore.getState().audioState === 'RECORDING') {
      setAudioState('PROCESSING');
      setTimeout(() => {
        if (useVoiceStore.getState().audioState === 'PROCESSING') {
          setAudioState('IDLE');
        }
      }, 500);
    }
    clearTimeout(timeoutRef.current!);
  });

  const startRecording = useCallback(
    async (lang?: string) => {
      try {
        setError(null);
        setSttError(null);
        setInterimText('');
        setFinalText('');
        setInterimTranscript('');
        setFinalTranscript('');

        // Always read latest state — never rely on closure
        const currentState = useVoiceStore.getState().audioState;
        if (currentState === 'PLAYING_TTS') {
          await speechStop();
          setAudioState('IDLE');
        }

        const permResult =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!permResult.granted) {
          setError('Microphone permission denied');
          setSttError('Microphone permission denied');
          return;
        }

        await ExpoSpeechRecognitionModule.start({
          lang: lang || 'fr-FR',
          interimResults: true,
          continuous: true,
        });

        setIsRecording(true);
        setAudioState('RECORDING');

        timeoutRef.current = setTimeout(() => {
          stopRecordingInternal();
        }, RECORDING_TIMEOUT_MS);
      } catch (err: any) {
        const msg = err?.message || 'Failed to start recording';
        setError(msg);
        setSttError(msg);
        setIsRecording(false);
        setAudioState('IDLE');
      }
    },
    [], // No audioState dep — we use getState()
  );

  const stopRecordingInternal = useCallback(async () => {
    try {
      clearTimeout(timeoutRef.current!);
      await ExpoSpeechRecognitionModule.stop();
    } catch {
      // ignore stop errors
    }
  }, []);

  const stopRecording = useCallback(async () => {
    setAudioState('PROCESSING');
    await stopRecordingInternal();
  }, [stopRecordingInternal]);

  const cancelRecording = useCallback(() => {
    clearTimeout(timeoutRef.current!);
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // ignore abort errors
    }
    setIsRecording(false);
    setInterimText('');
    setFinalText('');
    setInterimTranscript('');
    setFinalTranscript('');
    setAudioState('IDLE');
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current!);
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return {
    isAvailable,
    isRecording,
    interimText,
    finalText,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

// ─── WEB: Web Speech API ────────────────────────────────────────────

// Detect iOS Safari (WebKit without Chrome)
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iP(hone|od|ad)/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
}

/** Small delay to let iOS Safari release the previous recognition session */
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function useWebSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingGuardRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const micPermissionGrantedRef = useRef(false);
  const startingRef = useRef(false);
  const hasRecordedOnceRef = useRef(false); // track if we need iOS restart delay

  const {
    setAudioState,
    setInterimTranscript,
    setFinalTranscript,
    setSttError,
  } = useVoiceStore();

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsAvailable(false);
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsAvailable(!!SpeechRecognitionAPI);
  }, []);

  /**
   * Pre-request microphone permission via getUserMedia BEFORE calling
   * recognition.start(). This separates the native permission dialog
   * from the speech recognition start, preventing the hold-to-talk
   * race condition on iOS Safari.
   */
  const ensureMicPermission = useCallback(async (): Promise<boolean> => {
    if (micPermissionGrantedRef.current) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      micPermissionGrantedRef.current = true;
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Fully clean up old recognition before starting a new one.
   * Returns only after the old instance is discarded.
   */
  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      // Remove event listeners to prevent ghost callbacks
      const old = recognitionRef.current;
      old.onresult = null;
      old.onerror = null;
      old.onend = null;
      old.onstart = null;
      try { old.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  }, []);

  const startRecording = useCallback(
    async (lang?: string) => {
      if (typeof window === 'undefined') return;
      if (startingRef.current) return;

      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        const msg = 'Speech recognition not supported in this browser';
        setError(msg);
        setSttError(msg);
        return;
      }

      try {
        startingRef.current = true;
        setError(null);
        setSttError(null);
        setInterimText('');
        setFinalText('');
        setInterimTranscript('');
        setFinalTranscript('');

        // Always read latest state — never rely on closure
        const currentState = useVoiceStore.getState().audioState;
        if (currentState === 'PLAYING_TTS') {
          await speechStop();
          setAudioState('IDLE');
        }

        // Request mic permission separately (avoids iOS hold-to-talk race)
        const hasPermission = await ensureMicPermission();
        if (!hasPermission) {
          const msg = 'Permission du microphone refusée';
          setError(msg);
          setSttError(msg);
          startingRef.current = false;
          return;
        }

        // Re-check state after async permission step
        const stateAfterPerm = useVoiceStore.getState().audioState;
        if (stateAfterPerm !== 'IDLE' && stateAfterPerm !== 'PLAYING_TTS') {
          startingRef.current = false;
          return;
        }

        // Fully clean up any previous recognition instance
        cleanupRecognition();

        // On iOS Safari, add a small delay between recognition sessions
        // to avoid silent start failures
        if (isIOSSafari() && hasRecordedOnceRef.current) {
          await delay(150);
        }

        // Double-check state hasn't changed during the delay
        const stateBeforeStart = useVoiceStore.getState().audioState;
        if (stateBeforeStart !== 'IDLE' && stateBeforeStart !== 'PLAYING_TTS') {
          startingRef.current = false;
          return;
        }

        const recognition = new SpeechRecognitionAPI();
        // iOS Safari doesn't handle continuous mode well — disable it
        recognition.continuous = !isIOSSafari();
        recognition.interimResults = true;
        recognition.lang = lang || 'fr-FR';

        recognition.onstart = () => {
          // Confirm recording actually started
          setIsRecording(true);
          setAudioState('RECORDING');
          startingRef.current = false;
          hasRecordedOnceRef.current = true;
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0]?.transcript || '';
            if (result.isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          if (interim) {
            setInterimText(interim);
            setInterimTranscript(interim);
          }

          if (final) {
            setFinalText(final);
            setFinalTranscript(final);
            setInterimText('');
            setInterimTranscript('');
          }
        };

        recognition.onerror = (event: any) => {
          startingRef.current = false;
          // "aborted" errors are expected when we call cancel
          if (event.error === 'aborted' || event.error === 'no-speech') {
            setIsRecording(false);
            setAudioState('IDLE');
            clearTimeout(timeoutRef.current!);
            return;
          }
          const errorMessage = event.error || 'Speech recognition error';
          setError(errorMessage);
          setSttError(errorMessage);
          setIsRecording(false);
          setAudioState('IDLE');
          clearTimeout(timeoutRef.current!);
        };

        recognition.onend = () => {
          startingRef.current = false;
          setIsRecording(false);
          // Null out the ref so we know this instance is done
          recognitionRef.current = null;
          const state = useVoiceStore.getState().audioState;
          if (state === 'RECORDING') {
            setAudioState('PROCESSING');
            setTimeout(() => {
              if (useVoiceStore.getState().audioState === 'PROCESSING') {
                setAudioState('IDLE');
              }
            }, 500);
          }
          clearTimeout(timeoutRef.current!);
        };

        recognitionRef.current = recognition;
        recognition.start();

        // Set a tentative RECORDING state; onstart will confirm it.
        // This covers browsers where onstart fires synchronously.
        setAudioState('RECORDING');

        // 30-second timeout
        timeoutRef.current = setTimeout(() => {
          stopRecordingInternal();
        }, RECORDING_TIMEOUT_MS);
      } catch (err: any) {
        const msg = err?.message || 'Failed to start recording';
        setError(msg);
        setSttError(msg);
        setIsRecording(false);
        setAudioState('IDLE');
        startingRef.current = false;
      }
    },
    [ensureMicPermission, cleanupRecognition],
  );

  const stopRecordingInternal = useCallback(() => {
    clearTimeout(timeoutRef.current!);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const stopRecording = useCallback(async () => {
    setAudioState('PROCESSING');
    stopRecordingInternal();

    // Safety guard: if stuck in PROCESSING for >3s, force back to IDLE
    clearTimeout(processingGuardRef.current!);
    processingGuardRef.current = setTimeout(() => {
      if (useVoiceStore.getState().audioState === 'PROCESSING') {
        setAudioState('IDLE');
      }
    }, 3000);
  }, [stopRecordingInternal]);

  const cancelRecording = useCallback(() => {
    startingRef.current = false;
    clearTimeout(timeoutRef.current!);
    clearTimeout(processingGuardRef.current!);
    cleanupRecognition();
    setIsRecording(false);
    setInterimText('');
    setFinalText('');
    setInterimTranscript('');
    setFinalTranscript('');
    setAudioState('IDLE');
  }, [cleanupRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      startingRef.current = false;
      clearTimeout(timeoutRef.current!);
      clearTimeout(processingGuardRef.current!);
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  return {
    isAvailable,
    isRecording,
    interimText,
    finalText,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
