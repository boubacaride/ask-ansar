import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

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

const LANGUAGE_MAP: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-SA',
};

export function useVoiceInput(
  onResult: (text: string) => void,
  language: string = 'en'
): VoiceInputHook {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const onResultRef = useRef(onResult);

  // Keep onResult ref current without causing re-initialization
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Web Speech API setup
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const instance = new SpeechRecognitionAPI();
    instance.continuous = false;
    instance.interimResults = false;
    instance.lang = LANGUAGE_MAP[language] || 'en-US';

    instance.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResultRef.current(text);
      setIsRecording(false);
    };

    instance.onerror = (event: any) => {
      setError(event.error);
      setIsRecording(false);
    };

    instance.onend = () => {
      setIsRecording(false);
    };

    setRecognition(instance);

    return () => {
      instance.abort();
    };
  }, [language]);

  // Native: transcribe audio via OpenAI Whisper
  const transcribeAudio = useCallback(async (uri: string) => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        setError('OpenAI API key not configured');
        return;
      }

      // Read the file and build form data
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('Whisper API error:', errBody);
        setError('Transcription failed. Please try again.');
        return;
      }

      const data = await response.json();
      if (data.text?.trim()) {
        onResultRef.current(data.text.trim());
      } else {
        setError('No speech detected. Please try again.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio');
    }
  }, [language]);

  const startRecording = useCallback(async () => {
    setError(null);

    if (Platform.OS === 'web') {
      if (!recognition) {
        setError('Speech recognition not initialized');
        return;
      }
      try {
        recognition.lang = LANGUAGE_MAP[language] || 'en-US';
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        setError('Failed to start recording');
        console.error('Web voice input error:', err);
      }
      return;
    }

    // Native: use expo-av recording → Whisper
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone permission is required for voice input');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start recording');
      setIsRecording(false);
      console.error('Native voice input error:', err);
    }
  }, [recognition, language]);

  const stopRecording = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        if (recognition) {
          recognition.stop();
        }
      } catch (err) {
        console.error('Error stopping web recording:', err);
      } finally {
        setIsRecording(false);
      }
      return;
    }

    // Native: stop recording and send to Whisper
    try {
      const recording = recordingRef.current;
      if (!recording) {
        setIsRecording(false);
        return;
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      recordingRef.current = null;

      if (uri) {
        await transcribeAudio(uri);
      }
    } catch (err) {
      console.error('Error stopping native recording:', err);
      setIsRecording(false);
    }
  }, [recognition, transcribeAudio]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
  };
}
