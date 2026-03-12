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
    audioState,
  } = useVoiceStore();

  useEffect(() => {
    // Check availability
    const checkAvailability = async () => {
      try {
        const status =
          await ExpoSpeechRecognitionModule.getPermissionsAsync();
        setIsAvailable(true);
      } catch {
        setIsAvailable(false);
      }
    };
    checkAvailability();
  }, []);

  // Listen to recognition result events
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

  // Listen to error events
  useSpeechRecognitionEvent('error', (event: any) => {
    const errorMessage = event.error || 'Speech recognition error';
    setError(errorMessage);
    setSttError(errorMessage);
    setIsRecording(false);
    setAudioState('IDLE');
    clearTimeout(timeoutRef.current!);
  });

  // Listen to end events
  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    if (useVoiceStore.getState().audioState === 'RECORDING') {
      setAudioState('PROCESSING');
      // Short delay then back to IDLE once final result is processed
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

        // If TTS is playing, stop it first
        if (audioState === 'PLAYING_TTS') {
          await speechStop();
          setAudioState('IDLE');
        }

        // Request permissions
        const permResult =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!permResult.granted) {
          const msg = 'Microphone permission denied';
          setError(msg);
          setSttError(msg);
          return;
        }

        // Start recognition
        await ExpoSpeechRecognitionModule.start({
          lang: lang || 'fr-FR',
          interimResults: true,
          continuous: true,
        });

        setIsRecording(true);
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
      }
    },
    [audioState],
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

  // Cleanup on unmount
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
  const startingRef = useRef(false); // track async start in progress

  const {
    setAudioState,
    setInterimTranscript,
    setFinalTranscript,
    setSttError,
    audioState,
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
      // Immediately stop the stream — we only needed the permission grant
      stream.getTracks().forEach((t) => t.stop());
      micPermissionGrantedRef.current = true;
      return true;
    } catch {
      return false;
    }
  }, []);

  const startRecording = useCallback(
    async (lang?: string) => {
      if (typeof window === 'undefined') return;
      if (startingRef.current) return; // prevent double-start

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

        // If TTS is playing, stop it first
        if (audioState === 'PLAYING_TTS') {
          await speechStop();
          setAudioState('IDLE');
        }

        // ── Step 1: Request mic permission SEPARATELY ──────────────
        // This shows the native dialog BEFORE we start speech recognition,
        // so the hold-to-talk gesture doesn't race with the permission popup.
        const hasPermission = await ensureMicPermission();
        if (!hasPermission) {
          const msg = 'Permission du microphone refusée';
          setError(msg);
          setSttError(msg);
          startingRef.current = false;
          return;
        }

        // Check if recording was cancelled while we were waiting for permission
        if (useVoiceStore.getState().audioState !== 'IDLE' &&
            useVoiceStore.getState().audioState !== 'PLAYING_TTS') {
          startingRef.current = false;
          return;
        }

        // Abort any existing recognition
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
        }

        const recognition = new SpeechRecognitionAPI();
        // iOS Safari doesn't handle continuous mode well — disable it
        recognition.continuous = !isIOSSafari();
        recognition.interimResults = true;
        recognition.lang = lang || 'fr-FR';

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
          // "aborted" errors are expected when we call cancel — don't surface them
          if (event.error === 'aborted') {
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
          setIsRecording(false);
          const currentState = useVoiceStore.getState().audioState;
          if (currentState === 'RECORDING') {
            setAudioState('PROCESSING');
            setTimeout(() => {
              if (useVoiceStore.getState().audioState === 'PROCESSING') {
                setAudioState('IDLE');
              }
            }, 500);
          }
          // If already PROCESSING or IDLE, don't change — let the guard timer handle it
          clearTimeout(timeoutRef.current!);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        setAudioState('RECORDING');
        startingRef.current = false;

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
    [audioState, ensureMicPermission],
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

    // ── Safety guard: if stuck in PROCESSING for >3s, force back to IDLE ──
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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimText('');
    setFinalText('');
    setInterimTranscript('');
    setFinalTranscript('');
    setAudioState('IDLE');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current!);
      clearTimeout(processingGuardRef.current!);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
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
