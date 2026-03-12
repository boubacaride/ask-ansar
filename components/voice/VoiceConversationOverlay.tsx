import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { VoiceOrb } from './VoiceOrb';
import { LanguageBadge } from './LanguageBadge';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTTS } from '@/hooks/useTTS';
import { useSettings } from '@/store/settingsStore';
import { useVoiceStore } from '@/store/voiceStore';
import { FR } from '@/ui/strings.fr';

interface VoiceConversationOverlayProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSendMessage: (text: string) => Promise<string>;
}

type ConversationTurn =
  | 'greeting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'idle';

/** Map STT language setting to BCP-47 locale for speech recognition. */
const STT_LANG_MAP: Record<string, string> = {
  fr: 'fr-FR',
  ar: 'ar-SA',
  en: 'en-US',
};

/** Silence detection: auto-send after 2.5 seconds without new input. */
const SILENCE_TIMEOUT_MS = 2500;

/** Inactivity timeout: close overlay after 60 seconds of no speech. */
const INACTIVITY_TIMEOUT_MS = 60_000;

/** Voice command patterns for stop / repeat / cancel. */
const STOP_COMMANDS = ['stop', 'arr\u00eate', 'arreter', 'arr\u00eater', '\u062a\u0648\u0642\u0641'];
const REPEAT_COMMANDS = ['r\u00e9p\u00e8te', 'repete', 'repeat', '\u0623\u0639\u062f'];
const CANCEL_COMMANDS = ['annule', 'cancel', '\u0625\u0644\u063a\u0627\u0621'];

/**
 * Full-screen voice conversation overlay with a continuous listen/respond loop.
 * Coordinates STT, LLM, and TTS into a hands-free conversation experience.
 */
export function VoiceConversationOverlay({
  visible,
  onClose,
  darkMode,
  onSendMessage,
}: VoiceConversationOverlayProps) {
  const [turn, setTurn] = useState<ConversationTurn>('greeting');
  const [transcript, setTranscript] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [lastBotResponse, setLastBotResponse] = useState('');

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);
  const turnRef = useRef<ConversationTurn>('greeting');
  const closingRef = useRef(false);

  const { sttLanguage } = useSettings();
  const { setConversationMode, setConversationTurn } = useVoiceStore();

  const {
    isRecording,
    interimText,
    finalText,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useSpeechRecognition();

  const { speak: ttsSpeak, stop: ttsStop } = useTTS();

  // Keep turnRef in sync
  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  // Keep screen awake while visible
  useEffect(() => {
    if (!visible) return;

    let activated = false;

    const activate = async () => {
      if (Platform.OS === 'web') return;
      try {
        const KeepAwake = require('expo-keep-awake');
        await KeepAwake.activateKeepAwakeAsync('voice-conversation');
        activated = true;
      } catch {
        // expo-keep-awake not available
      }
    };

    activate();

    return () => {
      if (!activated) return;
      try {
        const KeepAwake = require('expo-keep-awake');
        KeepAwake.deactivateKeepAwake('voice-conversation');
      } catch {
        // ignore
      }
    };
  }, [visible]);

  // Map turn state to VoiceOrb state
  const orbState = (() => {
    switch (turn) {
      case 'listening':
        return 'listening';
      case 'processing':
        return 'processing';
      case 'speaking':
      case 'greeting':
        return 'speaking';
      case 'idle':
      default:
        return 'idle';
    }
  })();

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = undefined;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = undefined;
    }
  }, []);

  const handleClose = useCallback(async () => {
    if (closingRef.current) return;
    closingRef.current = true;

    clearTimers();

    // Stop any ongoing STT/TTS
    try {
      cancelRecording();
    } catch {
      // ignore
    }
    try {
      await ttsStop();
    } catch {
      // ignore
    }

    setConversationMode(false);
    setConversationTurn('idle');
    setTurn('idle');
    setTranscript('');
    setBotResponse('');
    closingRef.current = false;
    onClose();
  }, [clearTimers, cancelRecording, ttsStop, setConversationMode, setConversationTurn, onClose]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      // Play goodbye and close
      const goodbyeMsg = FR.voiceGoodbye;
      setTurn('speaking');
      setBotResponse(goodbyeMsg);
      try {
        await ttsSpeak(goodbyeMsg, 'voice-goodbye');
      } catch {
        // ignore TTS errors
      }
      if (mountedRef.current) {
        handleClose();
      }
    }, INACTIVITY_TIMEOUT_MS);
  }, [ttsSpeak, handleClose]);

  // ---------------------------------------------------------------------------
  // Start listening turn
  // ---------------------------------------------------------------------------

  const startListening = useCallback(async () => {
    if (!mountedRef.current || closingRef.current) return;

    setTurn('listening');
    setConversationTurn('listening');
    setTranscript('');
    setBotResponse('');
    resetInactivityTimer();

    const lang = STT_LANG_MAP[sttLanguage] || 'fr-FR';
    try {
      await startRecording(lang);
    } catch (err) {
      console.warn('[VoiceConversation] Failed to start recording:', err);
      // Fallback to idle
      if (mountedRef.current) {
        setTurn('idle');
        setConversationTurn('idle');
      }
    }
  }, [sttLanguage, startRecording, resetInactivityTimer, setConversationTurn]);

  // ---------------------------------------------------------------------------
  // Detect voice commands
  // ---------------------------------------------------------------------------

  const matchesCommand = (text: string, commands: string[]) => {
    const normalized = text.trim().toLowerCase();
    return commands.some((cmd) => normalized === cmd || normalized.includes(cmd));
  };

  // ---------------------------------------------------------------------------
  // Handle completed speech -> process -> respond -> loop
  // ---------------------------------------------------------------------------

  const handleSpeechComplete = useCallback(
    async (spokenText: string) => {
      if (!mountedRef.current || closingRef.current) return;

      const trimmed = spokenText.trim();
      if (!trimmed) {
        // Empty speech -> go back to listening
        startListening();
        return;
      }

      // Check voice commands before sending to bot
      if (matchesCommand(trimmed, STOP_COMMANDS)) {
        handleClose();
        return;
      }

      if (matchesCommand(trimmed, REPEAT_COMMANDS)) {
        if (lastBotResponse) {
          setTurn('speaking');
          setConversationTurn('speaking');
          setBotResponse(lastBotResponse);
          try {
            await ttsSpeak(lastBotResponse, 'voice-repeat-' + Date.now());
          } catch {
            // ignore
          }
          if (mountedRef.current && !closingRef.current) {
            // Brief pause then listen again
            setTimeout(() => {
              if (mountedRef.current && !closingRef.current) {
                startListening();
              }
            }, 1000);
          }
        } else {
          startListening();
        }
        return;
      }

      if (matchesCommand(trimmed, CANCEL_COMMANDS)) {
        // Cancel without sending - go back to listening
        startListening();
        return;
      }

      // Processing turn
      setTurn('processing');
      setConversationTurn('processing');
      setTranscript(trimmed);

      try {
        const responseText = await onSendMessage(trimmed);

        if (!mountedRef.current || closingRef.current) return;

        // Speaking turn
        setTurn('speaking');
        setConversationTurn('speaking');
        setBotResponse(responseText);
        setLastBotResponse(responseText);

        try {
          await ttsSpeak(responseText, 'voice-response-' + Date.now());
        } catch {
          // TTS failed, still continue the loop
        }

        // Brief pause then listen again
        if (mountedRef.current && !closingRef.current) {
          setTimeout(() => {
            if (mountedRef.current && !closingRef.current) {
              startListening();
            }
          }, 1000);
        }
      } catch (err) {
        console.warn('[VoiceConversation] Error processing message:', err);
        const errorMsg = 'D\u00e9sol\u00e9, une erreur est survenue.';
        setBotResponse(errorMsg);

        if (mountedRef.current && !closingRef.current) {
          setTimeout(() => {
            if (mountedRef.current && !closingRef.current) {
              startListening();
            }
          }, 2000);
        }
      }
    },
    [
      onSendMessage,
      ttsSpeak,
      lastBotResponse,
      startListening,
      handleClose,
      setConversationTurn,
    ],
  );

  // ---------------------------------------------------------------------------
  // Silence detection: auto-stop when user stops speaking
  // ---------------------------------------------------------------------------

  // Track interim text changes to reset silence timer
  const prevInterimRef = useRef('');

  useEffect(() => {
    if (turnRef.current !== 'listening' || !isRecording) return;

    const currentText = interimText || finalText;

    // If we got new interim text, reset the silence timer
    if (currentText !== prevInterimRef.current && currentText.length > 0) {
      prevInterimRef.current = currentText;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Update displayed transcript in real-time
      setTranscript(currentText);

      silenceTimerRef.current = setTimeout(async () => {
        if (!mountedRef.current || closingRef.current) return;
        if (turnRef.current !== 'listening') return;

        // Silence detected: stop recording and process
        try {
          await stopRecording();
        } catch {
          // ignore
        }

        // Use whatever text we have
        const textToSend = finalText || interimText || currentText;
        if (textToSend.trim()) {
          handleSpeechComplete(textToSend.trim());
        } else {
          startListening();
        }
      }, SILENCE_TIMEOUT_MS);
    }
  }, [interimText, finalText, isRecording, stopRecording, handleSpeechComplete, startListening]);

  // Handle final text from STT (user might manually stop or STT auto-finishes)
  useEffect(() => {
    if (!finalText || turnRef.current !== 'listening') return;

    // Clear silence timer since we got final text
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = undefined;
    }

    setTranscript(finalText);

    // Small debounce to allow STT to fully settle
    const timer = setTimeout(() => {
      if (mountedRef.current && turnRef.current === 'listening') {
        handleSpeechComplete(finalText);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [finalText, handleSpeechComplete]);

  // ---------------------------------------------------------------------------
  // Lifecycle: greeting on open, cleanup on close/unmount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      clearTimers();
      return;
    }

    // Start conversation
    closingRef.current = false;
    setConversationMode(true);

    const startConversation = async () => {
      setTurn('greeting');
      setConversationTurn('speaking');

      // Select greeting based on STT language
      let greeting: string;
      switch (sttLanguage) {
        case 'en':
          greeting = FR.voiceGreetingEn;
          break;
        case 'ar':
          greeting = FR.voiceGreetingAr;
          break;
        case 'fr':
        default:
          greeting = FR.voiceGreetingFr;
          break;
      }

      setBotResponse(greeting);
      setLastBotResponse(greeting);

      try {
        await ttsSpeak(greeting, 'voice-greeting-' + Date.now());
      } catch {
        // TTS failed, still proceed
      }

      // After greeting, start listening
      if (mountedRef.current && !closingRef.current) {
        startListening();
      }
    };

    // Small delay to let the modal animate in
    const timer = setTimeout(startConversation, 400);

    return () => {
      clearTimeout(timer);
      clearTimers();
    };
  }, [visible]);

  // ---------------------------------------------------------------------------
  // Status text
  // ---------------------------------------------------------------------------

  const statusText = (() => {
    switch (turn) {
      case 'listening':
        return FR.voiceListening;
      case 'processing':
        return FR.voiceThinking;
      case 'speaking':
      case 'greeting':
        return FR.voiceSpeaking;
      case 'idle':
      default:
        return FR.voiceIdle;
    }
  })();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Close button - top right */}
        <Pressable
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={28} color="#fff" />
        </Pressable>

        {/* Language badge - top left */}
        <View style={styles.topLeft}>
          <LanguageBadge darkMode={true} />
        </View>

        {/* Center content */}
        <View style={styles.centerContent}>
          <VoiceOrb state={orbState} darkMode={darkMode} />

          {/* Status text */}
          <Text style={styles.statusText}>{statusText}</Text>

          {/* Transcript display */}
          {transcript ? (
            <ScrollView
              style={styles.transcriptScroll}
              contentContainerStyle={styles.transcriptScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.transcriptText}>{transcript}</Text>
            </ScrollView>
          ) : null}

          {/* Bot response display */}
          {botResponse ? (
            <ScrollView
              style={styles.responseContainer}
              contentContainerStyle={styles.responseScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.responseText}>{botResponse}</Text>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 27, 42, 0.95)',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  topLeft: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 32,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  transcriptScroll: {
    marginTop: 20,
    maxHeight: 120,
    width: '100%',
  },
  transcriptScrollContent: {
    alignItems: 'center',
  },
  transcriptText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  responseContainer: {
    marginTop: 24,
    maxHeight: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  responseScrollContent: {
    alignItems: 'center',
  },
  responseText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
