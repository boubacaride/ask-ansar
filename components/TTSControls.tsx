import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { seerahUtils, VoiceOption } from '@/utils/seerahUtils';
import { useAuth } from '@/hooks/useAuth';

interface TTSControlsProps {
  visible: boolean;
  onClose: () => void;
  currentPage: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  darkMode: boolean;
}

export function TTSControls({
  visible,
  onClose,
  currentPage,
  onNextPage,
  onPreviousPage,
  darkMode,
}: TTSControlsProps) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('fr-FR');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    accent: '#c9a227',
    inputBg: darkMode ? '#252538' : '#f5f5f5',
  };

  useEffect(() => {
    loadVoices();
    loadPreferences();
  }, []);

  useEffect(() => {
    if (visible) {
      loadPreferences();
    }
  }, [visible]);

  const loadVoices = async () => {
    const availableVoices = await seerahUtils.getAvailableVoices();
    setVoices(availableVoices);
  };

  const loadPreferences = async () => {
    const prefs = await seerahUtils.getPreferences(user?.id);
    if (prefs.voice_language) setSelectedVoice(prefs.voice_language);
    if (prefs.voice_speed) setSpeed(prefs.voice_speed);
    if (prefs.voice_pitch) setPitch(prefs.voice_pitch);
  };

  const savePreferences = async () => {
    await seerahUtils.savePreferences(
      {
        voice_language: selectedVoice,
        voice_speed: speed,
        voice_pitch: pitch,
      },
      user?.id
    );
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await seerahUtils.stopSpeaking();
      setIsPlaying(false);
    } else {
      const sampleText = `Page ${currentPage}. Biographie du Prophète Muhammad. Le Nectar Cacheté.`;

      await seerahUtils.speak(sampleText, {
        language: selectedVoice,
        pitch: pitch,
        rate: speed,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });

      setIsPlaying(true);
    }
  };

  const handleStop = async () => {
    await seerahUtils.stopSpeaking();
    setIsPlaying(false);
  };

  const getLanguageFlag = (lang: string) => {
    if (lang.startsWith('fr')) return '🇫🇷';
    if (lang.startsWith('ar')) return '🇸🇦';
    if (lang.startsWith('en')) return '🇬🇧';
    return '🌐';
  };

  const getLanguageName = (lang: string) => {
    if (lang.startsWith('fr')) return 'Français';
    if (lang.startsWith('ar')) return 'العربية';
    if (lang.startsWith('en')) return 'English';
    return lang;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.headerLeft}>
              <FontAwesome5 name="headphones" size={20} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Lecture Audio
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Voix
              </Text>

              <TouchableOpacity
                style={[styles.voiceSelector, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                onPress={() => setShowVoiceSelector(!showVoiceSelector)}
              >
                <Text style={[styles.voiceText, { color: colors.text }]}>
                  {getLanguageFlag(selectedVoice)} {getLanguageName(selectedVoice)}
                </Text>
                <FontAwesome5
                  name={showVoiceSelector ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showVoiceSelector && (
                <View style={[styles.voiceList, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                  {['fr-FR', 'ar-SA', 'en-US'].map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        styles.voiceOption,
                        selectedVoice === lang && { backgroundColor: colors.primary + '20' },
                      ]}
                      onPress={() => {
                        setSelectedVoice(lang);
                        setShowVoiceSelector(false);
                        savePreferences();
                      }}
                    >
                      <Text style={[styles.voiceOptionText, { color: colors.text }]}>
                        {getLanguageFlag(lang)} {getLanguageName(lang)}
                      </Text>
                      {selectedVoice === lang && (
                        <FontAwesome5 name="check" size={14} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Vitesse
                </Text>
                <Text style={[styles.sliderValue, { color: colors.primary }]}>
                  {speed.toFixed(1)}x
                </Text>
              </View>
              <View style={styles.controlRow}>
                <TouchableOpacity
                  style={[styles.adjustButton, { backgroundColor: colors.inputBg }]}
                  onPress={() => {
                    const newSpeed = Math.max(0.5, speed - 0.1);
                    setSpeed(newSpeed);
                    savePreferences();
                  }}
                >
                  <FontAwesome5 name="minus" size={16} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.presetButtons}>
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[
                        styles.presetButton,
                        { backgroundColor: colors.inputBg },
                        Math.abs(speed - preset) < 0.05 && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => {
                        setSpeed(preset);
                        savePreferences();
                      }}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          { color: colors.text },
                          Math.abs(speed - preset) < 0.05 && { color: '#fff' },
                        ]}
                      >
                        {preset}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.adjustButton, { backgroundColor: colors.inputBg }]}
                  onPress={() => {
                    const newSpeed = Math.min(2.0, speed + 0.1);
                    setSpeed(newSpeed);
                    savePreferences();
                  }}
                >
                  <FontAwesome5 name="plus" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Tonalité
                </Text>
                <Text style={[styles.sliderValue, { color: colors.accent }]}>
                  {pitch.toFixed(1)}
                </Text>
              </View>
              <View style={styles.controlRow}>
                <TouchableOpacity
                  style={[styles.adjustButton, { backgroundColor: colors.inputBg }]}
                  onPress={() => {
                    const newPitch = Math.max(0.5, pitch - 0.1);
                    setPitch(newPitch);
                    savePreferences();
                  }}
                >
                  <FontAwesome5 name="minus" size={16} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.presetButtons}>
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[
                        styles.presetButton,
                        { backgroundColor: colors.inputBg },
                        Math.abs(pitch - preset) < 0.05 && { backgroundColor: colors.accent },
                      ]}
                      onPress={() => {
                        setPitch(preset);
                        savePreferences();
                      }}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          { color: colors.text },
                          Math.abs(pitch - preset) < 0.05 && { color: '#fff' },
                        ]}
                      >
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.adjustButton, { backgroundColor: colors.inputBg }]}
                  onPress={() => {
                    const newPitch = Math.min(2.0, pitch + 0.1);
                    setPitch(newPitch);
                    savePreferences();
                  }}
                >
                  <FontAwesome5 name="plus" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Contrôles
              </Text>

              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                  onPress={onPreviousPage}
                >
                  <FontAwesome5 name="step-backward" size={20} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.playButton, { backgroundColor: isPlaying ? colors.accent : colors.primary }]}
                  onPress={handlePlayPause}
                >
                  <FontAwesome5
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                  onPress={handleStop}
                >
                  <FontAwesome5 name="stop" size={20} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
                  onPress={onNextPage}
                >
                  <FontAwesome5 name="step-forward" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.pageInfo, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <FontAwesome5 name="book-open" size={16} color={colors.primary} />
              <Text style={[styles.pageText, { color: colors.text }]}>
                Page actuelle: {currentPage}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  voiceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  voiceText: {
    fontSize: 15,
    fontWeight: '500',
  },
  voiceList: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  voiceOptionText: {
    fontSize: 15,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetButtons: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
