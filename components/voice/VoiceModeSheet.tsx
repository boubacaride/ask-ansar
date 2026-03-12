import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Mic, ToggleLeft, Headphones, X } from 'lucide-react-native';
import { useSettings } from '@/store/settingsStore';
import { FR } from '@/ui/strings.fr';

interface VoiceModeSheetProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSelectConversationMode: () => void;
}

type VoiceInputMode = 'hold' | 'tap';

interface ModeOption {
  id: 'hold' | 'tap' | 'conversation';
  label: string;
  description: string;
  icon: typeof Mic;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'hold',
    label: FR.voiceModeHold,
    description: FR.voiceModeHoldDesc,
    icon: Mic,
  },
  {
    id: 'tap',
    label: FR.voiceModeTap,
    description: FR.voiceModeTapDesc,
    icon: ToggleLeft,
  },
  {
    id: 'conversation',
    label: FR.voiceModeConversation,
    description: FR.voiceModeConversationDesc,
    icon: Headphones,
  },
];

export function VoiceModeSheet({
  visible,
  onClose,
  darkMode,
  onSelectConversationMode,
}: VoiceModeSheetProps) {
  const { voiceInputMode, setVoiceInputMode } = useSettings();

  const handleSelect = useCallback(
    async (optionId: 'hold' | 'tap' | 'conversation') => {
      // Haptic feedback on native platforms
      if (Platform.OS !== 'web') {
        try {
          const Haptics = require('expo-haptics');
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
          // Haptics not available
        }
      }

      if (optionId === 'conversation') {
        onSelectConversationMode();
      } else {
        setVoiceInputMode(optionId as VoiceInputMode);
      }
      onClose();
    },
    [onClose, onSelectConversationMode, setVoiceInputMode],
  );

  const isSelected = (optionId: string) => {
    if (optionId === 'conversation') return false;
    return voiceInputMode === optionId;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, darkMode && styles.sheetDark]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, darkMode && styles.titleDark]}>
              {FR.voiceModeTitle}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={24} color={darkMode ? '#F3F4F6' : '#333'} />
            </Pressable>
          </View>

          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View
              style={[styles.handle, darkMode && styles.handleDark]}
            />
          </View>

          {/* Options */}
          <View style={styles.options}>
            {MODE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = isSelected(option.id);

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.option,
                    darkMode && styles.optionDark,
                    selected && styles.optionSelected,
                    selected && darkMode && styles.optionSelectedDark,
                  ]}
                  onPress={() => handleSelect(option.id)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      selected
                        ? styles.iconContainerSelected
                        : darkMode
                          ? styles.iconContainerDark
                          : styles.iconContainerLight,
                    ]}
                  >
                    <Icon
                      size={20}
                      color={selected ? '#FFFFFF' : darkMode ? '#4A9EFF' : '#1565C0'}
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        darkMode && styles.optionLabelDark,
                        selected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionDesc,
                        darkMode && styles.optionDescDark,
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                  {selected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>&#10003;</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.select({ ios: 44, android: 24, default: 24 }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  titleDark: {
    color: '#F3F4F6',
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  handleDark: {
    backgroundColor: '#4B5563',
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    gap: 14,
  },
  optionDark: {
    backgroundColor: '#374151',
  },
  optionSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1.5,
    borderColor: '#1565C0',
  },
  optionSelectedDark: {
    backgroundColor: '#1E3A5F',
    borderColor: '#4A9EFF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerLight: {
    backgroundColor: '#E3F2FD',
  },
  iconContainerDark: {
    backgroundColor: '#1E3A5F',
  },
  iconContainerSelected: {
    backgroundColor: '#1565C0',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionLabelDark: {
    color: '#F3F4F6',
  },
  optionLabelSelected: {
    color: '#1565C0',
  },
  optionDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  optionDescDark: {
    color: '#9CA3AF',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
