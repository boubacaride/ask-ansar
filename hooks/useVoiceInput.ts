import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { speak } from '@/utils/speechUtils';

type VoiceInputHook = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoiceInput(onResult: (text: string) => void): VoiceInputHook {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Initialize Web Speech API
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;

        recognitionInstance.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          onResult(text);
          setIsRecording(false);
        };

        recognitionInstance.onerror = (event: any) => {
          setError(event.error);
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        setError('Speech recognition not supported in this browser');
      }
    }

    return () => {
      if (Platform.OS === 'web' && recognition) {
        recognition.abort();
      }
    };
  }, [onResult]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      if (Platform.OS === 'web') {
        if (recognition) {
          recognition.start();
          setIsRecording(true);
        } else {
          setError('Speech recognition not initialized');
        }
      } else {
        setError('Voice input is only available on web browsers');
      }
    } catch (err) {
      setError('Failed to start recording');
      setIsRecording(false);
      console.error('Voice input error:', err);
    }
  }, [recognition]);

  const stopRecording = useCallback(async () => {
    try {
      if (Platform.OS === 'web' && recognition) {
        recognition.stop();
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
    } finally {
      setIsRecording(false);
    }
  }, [recognition]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
  };
}