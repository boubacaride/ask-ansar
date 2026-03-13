import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WELCOME_MESSAGE } from '@/app/api/chat';
import { ChatMessage, SourceBadge } from '@/types/chat';

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, text: string, arabicText?: string, translation?: string, sources?: SourceBadge[]) => void;
  clearMessages: () => void;
}

const initialState = {
  messages: [{
    id: Date.now().toString(),
    text: WELCOME_MESSAGE,
    isUser: false,
    timestamp: Date.now(),
    source: "Ansar Voyage",
    isWelcome: true,
  }]
};

export const useChatStore = create(
  persist<ChatStore>(
    (set) => ({
      ...initialState,
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      updateMessage: (id, text, arabicText, translation, sources) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id
              ? { ...m, text, ...(arabicText !== undefined && { arabicText }), ...(translation !== undefined && { translation }), ...(sources !== undefined && { sources }) }
              : m
          ),
        })),
      clearMessages: () =>
        set(() => ({
          messages: [{
            id: Date.now().toString(),
            text: WELCOME_MESSAGE,
            isUser: false,
            timestamp: Date.now(),
            source: "Ansar Voyage",
            isWelcome: true,
          }]
        })),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted: any, version: number) => {
        if (version === 0 || !version) {
          // Mark old welcome messages that don't have the isWelcome flag
          const state = persisted as ChatStore;
          if (state?.messages) {
            state.messages = state.messages.map((m) => {
              if (!m.isUser && m.text?.startsWith('Assalamou alaykoum')) {
                return { ...m, isWelcome: true };
              }
              return m;
            });
          }
        }
        return persisted as ChatStore;
      },
    }
  )
);