import React, { useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Mic, Loader } from 'lucide-react-native';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVoiceStore } from '@/store/voiceStore';
import { useSettings } from '@/store/settingsStore';

interface MicButtonProps {
  darkMode: boolean;
  onTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  disabled: boolean;
  onLongPress?: () => void;
}

const STT_LANG_MAP: Record<string, string> = {
  fr: 'fr-FR',
  ar: 'ar-SA',
  en: 'en-US',
};

export function MicButton({
  darkMode,
  onTranscript,
  onFinalTranscript,
  disabled,
  onLongPress,
}: MicButtonProps) {
  const { voiceInputMode, sttLanguage } = useSettings();
  const { audioState, setRecordingDuration, recordingDuration } =
    useVoiceStore();
  const {
    isAvailable,
    isRecording,
    interimText,
    finalText,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useSpeechRecognition();

  // Animation values
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const shakeValue = useRef(new Animated.Value(0)).current;

  // Timers
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  // ── Pulse animation (RECORDING state) ──────────────────────────────
  useEffect(() => {
    if (audioState === 'RECORDING') {
      const pulseAnimation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseScale, {
              toValue: 1.5,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseScale, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0.6,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0,
              duration: 1900,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
        pulseScale.setValue(1);
        pulseOpacity.setValue(0);
      };
    } else {
      pulseScale.setValue(1);
      pulseOpacity.setValue(0);
    }
  }, [audioState, pulseScale, pulseOpacity]);

  // ── Spin animation (PROCESSING state) ──────────────────────────────
  useEffect(() => {
    if (audioState === 'PROCESSING') {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      );
      spinAnimation.start();

      return () => {
        spinAnimation.stop();
        spinValue.setValue(0);
      };
    } else {
      spinValue.setValue(0);
    }
  }, [audioState, spinValue]);

  // ── Shake animation on error ───────────────────────────────────────
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeValue, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, shakeValue]);

  // ── Recording duration timer ───────────────────────────────────────
  useEffect(() => {
    if (audioState === 'RECORDING') {
      setRecordingDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(
          useVoiceStore.getState().recordingDuration + 1,
        );
      }, 1000);

      return () => {
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      };
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [audioState, setRecordingDuration]);

  // ── Stable callback refs (avoid re-firing effects on parent re-render) ──
  const onTranscriptRef = useRef(onTranscript);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onFinalTranscriptRef.current = onFinalTranscript; }, [onFinalTranscript]);

  // Track the last text we sent to the parent so we don't re-send it
  const lastSentInterimRef = useRef('');
  const lastSentFinalRef = useRef('');

  // ── Feed interim text to parent (only when the value actually changes) ──
  useEffect(() => {
    if (interimText && interimText !== lastSentInterimRef.current) {
      lastSentInterimRef.current = interimText;
      onTranscriptRef.current(interimText);
    }
    if (!interimText) {
      lastSentInterimRef.current = '';
    }
  }, [interimText]);

  // ── Feed final text to parent (only when the value actually changes) ──
  useEffect(() => {
    if (finalText && finalText !== lastSentFinalRef.current) {
      lastSentFinalRef.current = finalText;
      onFinalTranscriptRef.current(finalText);
    }
    if (!finalText) {
      lastSentFinalRef.current = '';
    }
  }, [finalText]);

  // ── Haptic helper ──────────────────────────────────────────────────
  const triggerHaptic = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptics not available
      }
    }
  }, []);

  // ── Start/Stop helpers ─────────────────────────────────────────────
  const doStartRecording = useCallback(async () => {
    const lang = STT_LANG_MAP[sttLanguage] || 'fr-FR';
    await triggerHaptic();
    await startRecording(lang);
  }, [sttLanguage, triggerHaptic, startRecording]);

  const doStopRecording = useCallback(async () => {
    await triggerHaptic();
    await stopRecording();
  }, [triggerHaptic, stopRecording]);

  // ── HOLD mode handlers ─────────────────────────────────────────────
  const handlePressIn = useCallback(() => {
    if (disabled || !isAvailable) return;

    if (voiceInputMode === 'hold') {
      isLongPressRef.current = false;

      // Start recording immediately for hold-to-talk.
      // NOTE: We do NOT start the longPress timer here because
      // startRecording() may show a permission dialog (first time on iOS).
      // The timer would fire during the dialog causing chaos.
      // Instead, long-press is handled by Pressable's built-in onLongPress.
      doStartRecording();
    }
  }, [
    disabled,
    isAvailable,
    voiceInputMode,
    doStartRecording,
  ]);

  const handlePressOut = useCallback(() => {
    // Clear long-press timer (safety)
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (voiceInputMode === 'hold' && !isLongPressRef.current) {
      const currentState = useVoiceStore.getState().audioState;
      if (currentState === 'RECORDING') {
        doStopRecording();
      } else if (currentState === 'IDLE' || currentState === 'PLAYING_TTS') {
        // Recording never fully started (e.g. permission dialog was showing).
        // No need to stop — just ensure we're clean.
        cancelRecording();
      }
    }
  }, [voiceInputMode, doStopRecording, cancelRecording]);

  // ── TAP mode handler ───────────────────────────────────────────────
  const handlePress = useCallback(() => {
    if (disabled || !isAvailable) return;

    if (voiceInputMode === 'tap') {
      if (audioState === 'RECORDING') {
        doStopRecording();
      } else if (audioState === 'IDLE' || audioState === 'PLAYING_TTS') {
        doStartRecording();
      }
    }
    // In hold mode, press/release is handled by pressIn/pressOut
  }, [disabled, isAvailable, voiceInputMode, audioState, doStartRecording, doStopRecording]);

  // ── Long press handler (both modes) ────────────────────────────────
  const handleLongPress = useCallback(() => {
    if (!onLongPress) return;

    // Cancel any active recording before opening mode sheet
    const currentState = useVoiceStore.getState().audioState;
    if (currentState === 'RECORDING') {
      isLongPressRef.current = true;
      cancelRecording();
    }
    onLongPress();
  }, [onLongPress, cancelRecording]);

  // ── Cleanup on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // ── Visual state derivation ────────────────────────────────────────
  const isIdle = audioState === 'IDLE' || audioState === 'PLAYING_TTS';
  const isProcessing = audioState === 'PROCESSING';
  const isRecordingState = audioState === 'RECORDING';

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Format duration as M:SS
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Don't render if speech recognition not available
  if (!isAvailable) return null;

  return (
    <View style={styles.wrapper}>
      {/* Recording duration displayed above */}
      {isRecordingState && (
        <View style={styles.durationContainer}>
          <View style={styles.redDot} />
          <Text
            style={[
              styles.durationText,
              darkMode && styles.durationTextDark,
            ]}
          >
            {formatDuration(recordingDuration)}
          </Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.buttonOuter,
          { transform: [{ translateX: shakeValue }] },
        ]}
      >
        {/* Pulse ring behind button */}
        {isRecordingState && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
        )}

        <Pressable
          style={[
            styles.micButton,
            isRecordingState && styles.micButtonRecording,
            (disabled || isProcessing) && styles.micButtonDisabled,
          ]}
          onPress={handlePress}
          onPressIn={voiceInputMode === 'hold' ? handlePressIn : undefined}
          onPressOut={voiceInputMode === 'hold' ? handlePressOut : undefined}
          onLongPress={handleLongPress}
          delayLongPress={800}
          disabled={disabled || isProcessing}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          {isProcessing ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Loader size={20} color="#1565C0" />
            </Animated.View>
          ) : (
            <Mic
              size={20}
              color={
                isRecordingState
                  ? '#FFFFFF'
                  : disabled
                    ? darkMode
                      ? '#4B5563'
                      : '#D1D5DB'
                    : '#90A4AE'
              }
            />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: -22,
    gap: 4,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  durationTextDark: {
    color: '#F87171',
  },
  buttonOuter: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1565C0',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  micButtonRecording: {
    backgroundColor: '#1565C0',
  },
  micButtonDisabled: {
    opacity: 0.5,
  },
});
