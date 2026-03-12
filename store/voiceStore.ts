import { create } from 'zustand';

type AudioState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'PLAYING_TTS';
type ConversationTurn = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceStore {
  audioState: AudioState;
  setAudioState: (state: AudioState) => void;

  interimTranscript: string;
  finalTranscript: string;
  setInterimTranscript: (text: string) => void;
  setFinalTranscript: (text: string) => void;
  clearTranscripts: () => void;

  sttError: string | null;
  setSttError: (error: string | null) => void;

  playingMessageId: string | null;
  setPlayingMessageId: (id: string | null) => void;

  isConversationMode: boolean;
  setConversationMode: (active: boolean) => void;
  conversationTurn: ConversationTurn;
  setConversationTurn: (turn: ConversationTurn) => void;

  recordingDuration: number;
  setRecordingDuration: (duration: number) => void;

  canRecord: () => boolean;
  canPlayTTS: () => boolean;
}

export const useVoiceStore = create<VoiceStore>()((set, get) => ({
  audioState: 'IDLE',
  setAudioState: (audioState) => set(() => ({ audioState })),

  interimTranscript: '',
  finalTranscript: '',
  setInterimTranscript: (interimTranscript) =>
    set(() => ({ interimTranscript })),
  setFinalTranscript: (finalTranscript) =>
    set(() => ({ finalTranscript })),
  clearTranscripts: () =>
    set(() => ({ interimTranscript: '', finalTranscript: '' })),

  sttError: null,
  setSttError: (sttError) => set(() => ({ sttError })),

  playingMessageId: null,
  setPlayingMessageId: (playingMessageId) =>
    set(() => ({ playingMessageId })),

  isConversationMode: false,
  setConversationMode: (isConversationMode) =>
    set(() => ({ isConversationMode })),
  conversationTurn: 'idle',
  setConversationTurn: (conversationTurn) =>
    set(() => ({ conversationTurn })),

  recordingDuration: 0,
  setRecordingDuration: (recordingDuration) =>
    set(() => ({ recordingDuration })),

  canRecord: () => {
    const { audioState } = get();
    return audioState === 'IDLE' || audioState === 'PLAYING_TTS';
  },
  canPlayTTS: () => {
    const { audioState } = get();
    return audioState === 'IDLE';
  },
}));
