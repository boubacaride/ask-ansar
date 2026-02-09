import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsStore = {
  darkMode: boolean;
  voiceEnabled: boolean;
  language: string;
  toggleDarkMode: () => void;
  toggleVoice: () => void;
  setLanguage: (lang: string) => void;
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      darkMode: false,
      voiceEnabled: true,
      language: 'fr',
      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),
      toggleVoice: () =>
        set((state) => ({ voiceEnabled: !state.voiceEnabled })),
      setLanguage: (language) =>
        set(() => ({ language })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);