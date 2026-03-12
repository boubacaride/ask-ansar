import { useCallback } from 'react';
import { speak as speechSpeak, stop as speechStop } from '@/utils/speechUtils';
import { useVoiceStore } from '@/store/voiceStore';
import { useSettings } from '@/store/settingsStore';

interface UseTTSReturn {
  isPlaying: boolean;
  playingMessageId: string | null;
  speak: (text: string, messageId: string) => Promise<void>;
  stop: () => Promise<void>;
}

/** Map short STT language codes to full BCP-47 locale tags for TTS. */
const LANG_MAP: Record<string, string> = {
  fr: 'fr-FR',
  ar: 'ar-SA',
  en: 'en-US',
};

/**
 * TTS hook that wraps utils/speechUtils with voice-store state management.
 * Coordinates with the global audioState so recording and TTS never collide.
 */
export function useTTS(): UseTTSReturn {
  const audioState = useVoiceStore((s) => s.audioState);
  const playingMessageId = useVoiceStore((s) => s.playingMessageId);
  const setAudioState = useVoiceStore((s) => s.setAudioState);
  const setPlayingMessageId = useVoiceStore((s) => s.setPlayingMessageId);

  const sttLanguage = useSettings((s) => s.sttLanguage);
  const ttsSpeed = useSettings((s) => s.ttsSpeed);

  const isPlaying = audioState === 'PLAYING_TTS';

  const speak = useCallback(
    async (text: string, messageId: string) => {
      // Block if currently recording -- never interrupt STT
      if (useVoiceStore.getState().audioState === 'RECORDING') {
        return;
      }

      // If already playing something, stop it first
      if (
        useVoiceStore.getState().audioState === 'PLAYING_TTS' ||
        useVoiceStore.getState().playingMessageId
      ) {
        await speechStop();
        setAudioState('IDLE');
        setPlayingMessageId(null);
      }

      try {
        setAudioState('PLAYING_TTS');
        setPlayingMessageId(messageId);

        const language = LANG_MAP[sttLanguage] || 'fr-FR';

        await speechSpeak(text, {
          language,
          rate: ttsSpeed,
          pitch: 0.95,
        });
      } catch (err) {
        console.warn('[useTTS] speak error:', err);
      } finally {
        // Only reset if we are still the active player
        if (useVoiceStore.getState().playingMessageId === messageId) {
          setAudioState('IDLE');
          setPlayingMessageId(null);
        }
      }
    },
    [sttLanguage, ttsSpeed],
  );

  const stop = useCallback(async () => {
    try {
      await speechStop();
    } catch (err) {
      console.warn('[useTTS] stop error:', err);
    } finally {
      setAudioState('IDLE');
      setPlayingMessageId(null);
    }
  }, []);

  return {
    isPlaying,
    playingMessageId,
    speak,
    stop,
  };
}
