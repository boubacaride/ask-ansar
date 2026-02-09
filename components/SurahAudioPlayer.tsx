import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/store/settingsStore';

interface SurahAudioPlayerProps {
  visible: boolean;
  surahNumber: number;
  surahName: string;
  onClose: () => void;
}

interface Reciter {
  id: number;
  name: string;
  arabicName: string;
}

const RECITERS: Reciter[] = [
  { id: 7, name: 'Mishari Rashid al-Afasy', arabicName: 'مشاري راشد العفاسي' },
  { id: 2, name: 'AbdulBaset AbdulSamad', arabicName: 'عبد الباسط عبد الصمد' },
  { id: 3, name: 'Abdur-Rahman as-Sudais', arabicName: 'عبد الرحمن السديس' },
  { id: 4, name: 'Abu Bakr al-Shatri', arabicName: 'أبو بكر الشاطري' },
  { id: 6, name: 'Mahmoud Khalil Al-Husary', arabicName: 'محمود خليل الحصري' },
];

export function SurahAudioPlayer({
  visible,
  surahNumber,
  surahName,
  onClose,
}: SurahAudioPlayerProps) {
  const { darkMode } = useSettings();
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showReciterList, setShowReciterList] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    accent: '#c9a227',
    error: '#dc2626',
    border: darkMode ? '#2d2d44' : '#e0e0e0',
  };

  useEffect(() => {
    if (visible && surahNumber) {
      fetchAudioUrl();
    }

    return () => {
      cleanupAudio();
    };
  }, [visible, surahNumber, selectedReciter]);

  useEffect(() => {
    if (!visible) {
      cleanupAudio();
    }
  }, [visible]);

  const fetchAudioUrl = async () => {
    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch(
        `https://api.quran.com/api/v4/chapter_recitations/${selectedReciter.id}/${surahNumber}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch audio');
      }

      const data = await response.json();
      const url = data.audio_file?.audio_url;

      if (!url) {
        throw new Error('Audio URL not found');
      }

      setAudioUrl(url);
      setupAudioElement(url);
    } catch (err) {
      console.error('Error fetching audio:', err);
      setError('Erreur lors du chargement de l\'audio');
    } finally {
      setLoading(false);
    }
  };

  const setupAudioElement = (url: string) => {
    if (Platform.OS === 'web') {
      cleanupAudio();

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      });

      audio.addEventListener('error', () => {
        setError('Erreur lors de la lecture de l\'audio');
        setIsPlaying(false);
      });
    }
  };

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const handlePlayPause = async () => {
    if (!audioRef.current) {
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);

        progressIntervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Erreur lors de la lecture');
      setIsPlaying(false);
    }
  };

  const handleSeek = (percentage: number) => {
    if (audioRef.current && duration > 0) {
      const newTime = (percentage / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleReciterChange = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    setShowReciterList(false);
    cleanupAudio();
  };

  const handleClose = () => {
    cleanupAudio();
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Écouter</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {surahName}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.reciterSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Récitateur</Text>
            <TouchableOpacity
              style={[styles.reciterSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowReciterList(!showReciterList)}
            >
              <View style={styles.reciterInfo}>
                <Text style={[styles.reciterName, { color: colors.text }]}>
                  {selectedReciter.name}
                </Text>
                <Text style={[styles.reciterArabicName, { color: colors.textSecondary }]}>
                  {selectedReciter.arabicName}
                </Text>
              </View>
              <Ionicons
                name={showReciterList ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showReciterList && (
              <View style={[styles.reciterList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {RECITERS.map((reciter) => (
                  <TouchableOpacity
                    key={reciter.id}
                    style={[
                      styles.reciterItem,
                      { borderBottomColor: colors.border },
                      selectedReciter.id === reciter.id && { backgroundColor: colors.primary + '15' },
                    ]}
                    onPress={() => handleReciterChange(reciter)}
                  >
                    <View style={styles.reciterItemContent}>
                      <Text style={[styles.reciterItemName, { color: colors.text }]}>
                        {reciter.name}
                      </Text>
                      <Text style={[styles.reciterItemArabic, { color: colors.textSecondary }]}>
                        {reciter.arabicName}
                      </Text>
                    </View>
                    {selectedReciter.id === reciter.id && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Chargement de l'audio...
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
                onPress={fetchAudioUrl}
              >
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && audioUrl && (
            <View style={styles.playerSection}>
              <View style={[styles.playerCard, { backgroundColor: colors.card }]}>
                <View style={styles.albumArt}>
                  <Ionicons name="book" size={48} color={colors.primary} />
                </View>

                <View style={styles.progressSection}>
                  <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
                    <TouchableOpacity
                      style={styles.progressBarTouchable}
                      onPress={(e) => {
                        const { locationX, currentTarget } = e.nativeEvent as any;
                        const width = currentTarget?.offsetWidth || 300;
                        const percentage = (locationX / width) * 100;
                        handleSeek(percentage);
                      }}
                    >
                      <View
                        style={[
                          styles.progressBar,
                          { backgroundColor: colors.primary, width: `${progressPercentage}%` },
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeContainer}>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                      {formatTime(currentTime)}
                    </Text>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                      {formatTime(duration)}
                    </Text>
                  </View>
                </View>

                <View style={styles.controls}>
                  <TouchableOpacity
                    style={[styles.playButton, { backgroundColor: colors.primary }]}
                    onPress={handlePlayPause}
                  >
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={32}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  reciterSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  reciterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reciterInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reciterArabicName: {
    fontSize: 14,
  },
  reciterList: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  reciterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  reciterItemContent: {
    flex: 1,
  },
  reciterItemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  reciterItemArabic: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    minHeight: 400,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    minHeight: 400,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playerSection: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 400,
  },
  playerCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  albumArt: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 137, 123, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressSection: {
    width: '100%',
    marginBottom: 32,
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarTouchable: {
    height: '100%',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
