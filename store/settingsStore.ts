import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VoiceInputMode = 'hold' | 'tap';
type SttLanguage = 'fr' | 'ar' | 'en';

type SettingsStore = {
  darkMode: boolean;
  voiceEnabled: boolean;
  language: string;
  voiceInputMode: VoiceInputMode;
  sttLanguage: SttLanguage;
  autoReadEnabled: boolean;
  ttsSpeed: number;
  toggleDarkMode: () => void;
  toggleVoice: () => void;
  setLanguage: (lang: string) => void;
  setVoiceInputMode: (mode: VoiceInputMode) => void;
  setSttLanguage: (lang: SttLanguage) => void;
  toggleAutoRead: () => void;
  setTtsSpeed: (speed: number) => void;
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      darkMode: false,
      voiceEnabled: true,
      language: 'fr',
      voiceInputMode: 'hold' as VoiceInputMode,
      sttLanguage: 'fr' as SttLanguage,
      autoReadEnabled: false,
      ttsSpeed: 0.9,
      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),
      toggleVoice: () =>
        set((state) => ({ voiceEnabled: !state.voiceEnabled })),
      setLanguage: (language) =>
        set(() => ({ language })),
      setVoiceInputMode: (voiceInputMode) =>
        set(() => ({ voiceInputMode })),
      setSttLanguage: (sttLanguage) =>
        set(() => ({ sttLanguage })),
      toggleAutoRead: () =>
        set((state) => ({ autoReadEnabled: !state.autoReadEnabled })),
      setTtsSpeed: (ttsSpeed) =>
        set(() => ({ ttsSpeed })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);