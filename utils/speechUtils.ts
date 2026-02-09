import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

interface WebSpeechSynthesisUtterance {
  text: string;
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

declare global {
  interface Window {
    speechSynthesis?: {
      speak: (utterance: any) => void;
      cancel: () => void;
      pause: () => void;
      resume: () => void;
      getVoices: () => any[];
    };
    SpeechSynthesisUtterance?: new (text: string) => any;
  }
}

export async function speak(text: string, options: SpeechOptions = {}): Promise<void> {
  if (!text || text.trim().length === 0) {
    console.warn('Speech: Empty text provided');
    return;
  }

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis && window.SpeechSynthesisUtterance) {
        const utterance = new window.SpeechSynthesisUtterance(text);

        if (options.language) {
          utterance.lang = options.language;
        }
        if (options.pitch !== undefined) {
          utterance.pitch = options.pitch;
        }
        if (options.rate !== undefined) {
          utterance.rate = options.rate;
        }
        if (options.volume !== undefined) {
          utterance.volume = options.volume;
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('Web Speech API not supported in this browser');
      }
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Speech.speak(text, {
        language: options.language,
        pitch: options.pitch,
        rate: options.rate,
      });
    } else {
      console.warn(`Speech not supported on platform: ${Platform.OS}`);
    }
  } catch (error) {
    console.error('Error in speak function:', error);
  }
}

export async function stop(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Speech.stop();
    }
  } catch (error) {
    console.error('Error in stop function:', error);
  }
}

export async function pause(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Speech.pause();
    }
  } catch (error) {
    console.error('Error in pause function:', error);
  }
}

export async function resume(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Speech.resume();
    }
  } catch (error) {
    console.error('Error in resume function:', error);
  }
}

export function isSpeechAvailable(): boolean {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' &&
           typeof window.speechSynthesis !== 'undefined' &&
           typeof window.SpeechSynthesisUtterance !== 'undefined';
  } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return true;
  }
  return false;
}

export async function getAvailableVoices(): Promise<string[]> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        return voices.map((voice: any) => voice.name);
      }
      return [];
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.map((voice) => voice.name || voice.identifier);
    }
    return [];
  } catch (error) {
    console.error('Error getting available voices:', error);
    return [];
  }
}
