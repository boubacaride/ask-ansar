import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WELCOME_MESSAGE } from '@/app/api/chat';
import { ChatMessage } from '@/types/chat';

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, text: string, arabicText?: string, translation?: string) => void;
  clearMessages: () => void;
}

const initialState = {
  messages: [{
    id: Date.now().toString(),
    text: WELCOME_MESSAGE,
    isUser: false,
    timestamp: Date.now(),
    source: "Ansar Voyage"
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
      updateMessage: (id, text, arabicText, translation) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id
              ? { ...m, text, ...(arabicText !== undefined && { arabicText }), ...(translation !== undefined && { translation }) }
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
            source: "Ansar Voyage"
          }]
        })),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);