import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/store/settingsStore';
import { getSurahVerses, SurahData, QuranVerse } from '@/utils/quranUtils';
import * as Clipboard from 'expo-clipboard';
import { speak } from '@/utils/speechUtils';
import { getQuranAudioPlayer, cleanupQuranAudioPlayer, QuranAudioPlayer } from '@/utils/quranAudio';
import { SurahAudioPlayer } from '@/components/SurahAudioPlayer';

interface QuranViewerProps {
  visible: boolean;
  surahNumber: number;
  surahName: string;
  onClose: () => void;
}

type LanguageTab = 'arabic' | 'french' | 'english';

export function QuranViewer({ visible, surahNumber, surahName, onClose }: QuranViewerProps) {
  const { darkMode } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageTab>('arabic');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<QuranVerse | null>(null);
  const [tafsirModalVisible, setTafsirModalVisible] = useState(false);
  const [tafsirContent, setTafsirContent] = useState<string>('');
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState<string | null>(null);
  const [contentLanguage, setContentLanguage] = useState<'fr' | 'ar'>('fr');
  const [tafsirLanguage, setTafsirLanguage] = useState<'fr' | 'ar'>('fr');
  const [isTranslating, setIsTranslating] = useState(false);

  const [lessonsModalVisible, setLessonsModalVisible] = useState(false);
  const [lessonsContent, setLessonsContent] = useState<string>('');
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  const [lessonsLanguage, setLessonsLanguage] = useState<'fr' | 'ar'>('fr');

  const [reflectionsModalVisible, setReflectionsModalVisible] = useState(false);
  const [reflectionsContent, setReflectionsContent] = useState<string>('');
  const [reflectionsLoading, setReflectionsLoading] = useState(false);
  const [reflectionsError, setReflectionsError] = useState<string | null>(null);
  const [reflectionsLanguage, setReflectionsLanguage] = useState<'fr' | 'ar'>('fr');

  const [audioPlaying, setAudioPlaying] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioPlayerRef = useRef<QuranAudioPlayer | null>(null);

  const [surahAudioPlayerVisible, setSurahAudioPlayerVisible] = useState(false);

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
      loadSurahVerses();
    }
  }, [visible, surahNumber]);

  useEffect(() => {
    audioPlayerRef.current = getQuranAudioPlayer();

    const player = audioPlayerRef.current;
    if (player) {
      player.onEnded(() => {
        setAudioPlaying(null);
        setAudioLoading(null);
      });

      player.onError((error) => {
        setAudioError(error);
        setAudioPlaying(null);
        setAudioLoading(null);
      });
    }

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop();
      }
    };
  }, [visible]);

  const loadSurahVerses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSurahVerses(surahNumber, true, true);
      setSurahData(data);
    } catch (err) {
      console.error('Error loading surah verses:', err);
      setError('Erreur lors du chargement des versets');
    } finally {
      setLoading(false);
    }
  };

  const getVerseText = (verse: QuranVerse): string => {
    let text = '';
    if (selectedLanguage === 'arabic') {
      text = verse.text;
    } else if (selectedLanguage === 'french' && verse.frenchText) {
      text = verse.frenchText;
    } else if (selectedLanguage === 'english' && verse.englishText) {
      text = verse.englishText;
    }
    text += `\n\n[Sourate ${surahData?.name} - Verset ${verse.numberInSurah}]`;
    return text;
  };

  const handleCopyVerse = async (verse: QuranVerse) => {
    const text = getVerseText(verse);
    await Clipboard.setStringAsync(text);
  };

  const handleSharePress = (verse: QuranVerse) => {
    setSelectedVerse(verse);
    setShareModalVisible(true);
  };

  const handleShareViaEmail = () => {
    if (!selectedVerse) return;
    const text = getVerseText(selectedVerse);
    const subject = encodeURIComponent(`Sourate ${surahData?.name} - Verset ${selectedVerse.numberInSurah}`);
    const body = encodeURIComponent(text);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
    setShareModalVisible(false);
  };

  const handleShareViaWhatsApp = () => {
    if (!selectedVerse) return;
    const text = getVerseText(selectedVerse);
    const encodedText = encodeURIComponent(text);
    Linking.openURL(`whatsapp://send?text=${encodedText}`);
    setShareModalVisible(false);
  };

  const handleCopyFromModal = async () => {
    if (!selectedVerse) return;
    await handleCopyVerse(selectedVerse);
    setShareModalVisible(false);
  };

  const fetchTafsir = async (verse: QuranVerse, language: 'fr' | 'ar' = tafsirLanguage) => {
    setTafsirLoading(true);
    setTafsirError(null);
    setIsTranslating(false);

    try {
      const tafsirId = language === 'fr' ? 169 : 16;
      const verseKey = `${surahNumber}:${verse.numberInSurah}`;
      const response = await fetch(
        `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tafsir');
      }

      const data = await response.json();

      if (data.tafsir && data.tafsir.text) {
        const htmlContent = data.tafsir.text;
        let textContent = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

        setTafsirLoading(false);

        if (language === 'fr') {
          setIsTranslating(true);
          try {
            const { translateToFrench } = await import('../utils/translation-service');
            textContent = await translateToFrench(textContent, 'general', `tafsir_${verseKey}`);
          } catch (translationErr) {
            console.error('Translation error:', translationErr);
          } finally {
            setIsTranslating(false);
          }
        }

        setTafsirContent(textContent);
      } else {
        setTafsirError('Aucun tafsir disponible pour ce verset');
      }
    } catch (err) {
      console.error('Error fetching tafsir:', err);
      setTafsirError('Erreur lors du chargement du tafsir');
      setTafsirLoading(false);
      setIsTranslating(false);
    }
  };

  const handleOpenTafsir = (verse: QuranVerse) => {
    setSelectedVerse(verse);
    setTafsirModalVisible(true);
    fetchTafsir(verse);
  };

  const handleTafsirLanguageChange = (language: 'fr' | 'ar') => {
    setTafsirLanguage(language);
    if (selectedVerse) {
      fetchTafsir(selectedVerse, language);
    }
  };

  const generateLessons = async (verse: QuranVerse, language: 'fr' | 'ar' = lessonsLanguage) => {
    setLessonsLoading(true);
    setLessonsError(null);

    try {
      const verseKey = `${surahNumber}:${verse.numberInSurah}`;

      const { getCachedAIContent, setCachedAIContent, formatMarkdownText } = await import('../utils/aiContentCache');

      const cached = await getCachedAIContent(verseKey, 'lessons', language);
      if (cached) {
        setLessonsContent(formatMarkdownText(cached));
        setLessonsLoading(false);
        return;
      }

      const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        throw new Error('API key not configured');
      }

      const verseText = verse.englishText || verse.text;
      const verseReference = `${surahName} (${surahNumber}:${verse.numberInSurah})`;
      const languageName = language === 'fr' ? 'français' : 'arabe';

      const systemPrompt = language === 'fr'
        ? `Tu es un érudit islamique expert qui fournit des leçons éducatives sur le Coran. Réponds en ${languageName} de manière claire et pédagogique.`
        : `أنت عالم إسلامي خبير يقدم دروسًا تعليمية حول القرآن. أجب باللغة العربية بطريقة واضحة وتربوية.`;

      const userPrompt = language === 'fr'
        ? `Fournis 3-5 leçons pratiques et enseignements clés que l'on peut tirer de ce verset du Coran:\n\n"${verseText}"\n\n[${verseReference}]\n\nPrésente les leçons de manière structurée avec des titres clairs. Chaque leçon doit être pratique et applicable dans la vie quotidienne d'un musulman. Concentre-toi sur les enseignements moraux, les applications de la vie quotidienne et les conseils spirituels.`
        : `قدم 3-5 دروس عملية وتعاليم رئيسية يمكن استخلاصها من هذه الآية القرآنية:\n\n"${verseText}"\n\n[${verseReference}]\n\nقدم الدروس بطريقة منظمة مع عناوين واضحة. يجب أن يكون كل درس عمليًا وقابلاً للتطبيق في الحياة اليومية للمسلم. ركز على التعاليم الأخلاقية وتطبيقات الحياة اليومية والإرشادات الروحية.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lessons');
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      await setCachedAIContent(verseKey, 'lessons', language, content);

      setLessonsContent(formatMarkdownText(content));
    } catch (err) {
      console.error('Error generating lessons:', err);
      setLessonsError('Erreur lors de la génération des leçons');
    } finally {
      setLessonsLoading(false);
    }
  };

  const generateReflections = async (verse: QuranVerse, language: 'fr' | 'ar' = reflectionsLanguage) => {
    setReflectionsLoading(true);
    setReflectionsError(null);

    try {
      const verseKey = `${surahNumber}:${verse.numberInSurah}`;

      const { getCachedAIContent, setCachedAIContent, formatMarkdownText } = await import('../utils/aiContentCache');

      const cached = await getCachedAIContent(verseKey, 'reflections', language);
      if (cached) {
        setReflectionsContent(formatMarkdownText(cached));
        setReflectionsLoading(false);
        return;
      }

      const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        throw new Error('API key not configured');
      }

      const verseText = verse.englishText || verse.text;
      const verseReference = `${surahName} (${surahNumber}:${verse.numberInSurah})`;
      const languageName = language === 'fr' ? 'français' : 'arabe';

      const systemPrompt = language === 'fr'
        ? `Tu es un érudit islamique qui aide les croyants à réfléchir profondément sur le Coran. Réponds en ${languageName} de manière inspirante et contemplative.`
        : `أنت عالم إسلامي يساعد المؤمنين على التفكر بعمق في القرآن. أجب باللغة العربية بطريقة ملهمة وتأملية.`;

      const userPrompt = language === 'fr'
        ? `Fournis 3-5 points de réflexion spirituelle et méditation profonde sur ce verset du Coran:\n\n"${verseText}"\n\n[${verseReference}]\n\nChaque réflexion doit encourager l'introspection personnelle, la connexion spirituelle avec Allah, et l'application des valeurs islamiques dans la vie quotidienne. Écris des réflexions profondes qui incitent à la méditation et à la croissance personnelle.`
        : `قدم 3-5 نقاط للتأمل الروحي والتفكر العميق في هذه الآية القرآنية:\n\n"${verseText}"\n\n[${verseReference}]\n\nيجب أن يشجع كل تأمل على الاستبطان الشخصي والارتباط الروحي مع الله وتطبيق القيم الإسلامية في الحياة اليومية. اكتب تأملات عميقة تدعو إلى التفكر والنمو الشخصي.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reflections');
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      await setCachedAIContent(verseKey, 'reflections', language, content);

      setReflectionsContent(formatMarkdownText(content));
    } catch (err) {
      console.error('Error generating reflections:', err);
      setReflectionsError('Erreur lors de la génération des réflexions');
    } finally {
      setReflectionsLoading(false);
    }
  };

  const handleOpenLessons = (verse: QuranVerse) => {
    setSelectedVerse(verse);
    setLessonsModalVisible(true);
    generateLessons(verse);
  };

  const handleLessonsLanguageChange = (language: 'fr' | 'ar') => {
    setLessonsLanguage(language);
    if (selectedVerse) {
      generateLessons(selectedVerse, language);
    }
  };

  const handleOpenReflections = (verse: QuranVerse) => {
    setSelectedVerse(verse);
    setReflectionsModalVisible(true);
    generateReflections(verse);
  };

  const handleReflectionsLanguageChange = (language: 'fr' | 'ar') => {
    setReflectionsLanguage(language);
    if (selectedVerse) {
      generateReflections(selectedVerse, language);
    }
  };

  const handleAudioPlayPause = async (verse: QuranVerse) => {
    const verseId = verse.number;
    const player = audioPlayerRef.current;

    if (!player) {
      setAudioError('Lecteur audio non disponible');
      return;
    }

    if (audioPlaying === verseId) {
      player.pause();
      setAudioPlaying(null);
      return;
    }

    try {
      setAudioError(null);
      setAudioLoading(verseId);

      if (audioPlaying !== null) {
        player.stop();
        setAudioPlaying(null);
      }

      await player.load(surahNumber, verse.numberInSurah);
      await player.play();

      setAudioLoading(null);
      setAudioPlaying(verseId);
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError('Erreur lors de la lecture de l\'audio');
      setAudioLoading(null);
      setAudioPlaying(null);
    }
  };

  const handlePlayArabic = async (text: string) => {
    await speak(text, {
      language: 'ar',
      pitch: 1.0,
      rate: 0.85,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{surahName}</Text>
            {surahData && (
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {surahData.numberOfVerses} versets - {surahData.revelationType}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setSurahAudioPlayerVisible(true)}
            style={styles.playAllButton}
          >
            <Ionicons name="play-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Chargement des versets...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadSurahVerses}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && surahData && (
          <>
            <View style={[styles.controls, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.toggleButton, selectedLanguage === 'arabic' && { backgroundColor: colors.primary }]}
                onPress={() => setSelectedLanguage('arabic')}
              >
                <Text style={[styles.toggleButtonText, { color: selectedLanguage === 'arabic' ? '#fff' : colors.text }]}>
                  العربية
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, selectedLanguage === 'french' && { backgroundColor: colors.primary }]}
                onPress={() => setSelectedLanguage('french')}
              >
                <Text style={[styles.toggleButtonText, { color: selectedLanguage === 'french' ? '#fff' : colors.text }]}>
                  Français
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, selectedLanguage === 'english' && { backgroundColor: colors.primary }]}
                onPress={() => setSelectedLanguage('english')}
              >
                <Text style={[styles.toggleButtonText, { color: selectedLanguage === 'english' ? '#fff' : colors.text }]}>
                  English
                </Text>
              </TouchableOpacity>
            </View>

            {audioError && (
              <View style={[styles.audioErrorBanner, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.audioErrorText, { color: colors.error }]}>{audioError}</Text>
                <TouchableOpacity onPress={() => setAudioError(null)}>
                  <Ionicons name="close" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.bismillahContainer}>
                <Text style={[styles.bismillah, { color: colors.accent }]}>
                  {surahNumber !== 1 && surahNumber !== 9 && 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'}
                </Text>
              </View>

              {surahData.verses.map((verse) => (
                <View key={verse.number} style={[styles.verseCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.verseHeader, { borderBottomColor: colors.border }]}>
                    <View style={[styles.verseNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.verseNumberText}>{verse.numberInSurah}</Text>
                    </View>
                    <View style={styles.verseActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleAudioPlayPause(verse)}
                        disabled={audioLoading === verse.number}
                      >
                        {audioLoading === verse.number ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : audioPlaying === verse.number ? (
                          <Ionicons name="pause" size={20} color={colors.primary} />
                        ) : (
                          <Ionicons name="play" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                      {selectedLanguage === 'arabic' && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handlePlayArabic(verse.text)}
                        >
                          <Ionicons name="volume-high" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleCopyVerse(verse)}
                      >
                        <Ionicons name="copy-outline" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSharePress(verse)}
                      >
                        <Ionicons name="share-outline" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {selectedLanguage === 'arabic' && (
                    <Text style={[styles.arabicText, { color: colors.text }]}>
                      {verse.text}
                    </Text>
                  )}

                  {selectedLanguage === 'french' && verse.frenchText && (
                    <Text style={[styles.translationText, { color: colors.text }]}>
                      {verse.frenchText}
                    </Text>
                  )}

                  {selectedLanguage === 'english' && verse.englishText && (
                    <Text style={[styles.translationText, { color: colors.text }]}>
                      {verse.englishText}
                    </Text>
                  )}

                  <View style={[styles.languageSelectorContainer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.languageSelectorLabel, { color: colors.textSecondary }]}>
                      Langue du contenu:
                    </Text>
                    <View style={styles.languageButtons}>
                      <TouchableOpacity
                        style={[
                          styles.languageButton,
                          contentLanguage === 'fr' && { backgroundColor: colors.primary },
                          { borderColor: colors.border }
                        ]}
                        onPress={() => setContentLanguage('fr')}
                      >
                        <Text style={[styles.languageButtonText, { color: contentLanguage === 'fr' ? '#fff' : colors.text }]}>
                          Français
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.languageButton,
                          contentLanguage === 'ar' && { backgroundColor: colors.primary },
                          { borderColor: colors.border }
                        ]}
                        onPress={() => setContentLanguage('ar')}
                      >
                        <Text style={[styles.languageButtonText, { color: contentLanguage === 'ar' ? '#fff' : colors.text }]}>
                          العربية
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.resourcesToolbar, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                      style={styles.resourceButton}
                      onPress={() => setSurahAudioPlayerVisible(true)}
                    >
                      <Ionicons name="musical-notes" size={20} color={colors.primary} />
                      <Text style={[styles.resourceButtonText, { color: colors.primary }]}>Écouter</Text>
                    </TouchableOpacity>
                    <View style={[styles.resourceDivider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity
                      style={styles.resourceButton}
                      onPress={() => handleOpenTafsir(verse)}
                    >
                      <Ionicons name="book-outline" size={20} color={colors.primary} />
                      <Text style={[styles.resourceButtonText, { color: colors.primary }]}>Tafsir</Text>
                    </TouchableOpacity>
                    <View style={[styles.resourceDivider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity
                      style={styles.resourceButton}
                      onPress={() => handleOpenLessons(verse)}
                    >
                      <Ionicons name="school-outline" size={20} color={colors.primary} />
                      <Text style={[styles.resourceButtonText, { color: colors.primary }]}>Leçons</Text>
                    </TouchableOpacity>
                    <View style={[styles.resourceDivider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity
                      style={styles.resourceButton}
                      onPress={() => handleOpenReflections(verse)}
                    >
                      <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                      <Text style={[styles.resourceButtonText, { color: colors.primary }]}>Réflexions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <Modal
          visible={shareModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setShareModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.shareModalOverlay}
            activeOpacity={1}
            onPress={() => setShareModalVisible(false)}
          >
            <View style={[styles.shareModalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.shareModalTitle, { color: colors.text }]}>Partager le verset</Text>

              <TouchableOpacity
                style={[styles.shareOption, { borderBottomColor: colors.border }]}
                onPress={handleShareViaEmail}
              >
                <Ionicons name="mail-outline" size={24} color={colors.primary} />
                <Text style={[styles.shareOptionText, { color: colors.text }]}>Partager par Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareOption, { borderBottomColor: colors.border }]}
                onPress={handleShareViaWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                <Text style={[styles.shareOptionText, { color: colors.text }]}>Partager via WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareOption, { borderBottomWidth: 0 }]}
                onPress={handleCopyFromModal}
              >
                <Ionicons name="copy-outline" size={24} color={colors.primary} />
                <Text style={[styles.shareOptionText, { color: colors.text }]}>Copier dans le presse-papiers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareModalCancel, { backgroundColor: colors.background }]}
                onPress={() => setShareModalVisible(false)}
              >
                <Text style={[styles.shareModalCancelText, { color: colors.text }]}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={tafsirModalVisible}
          animationType="slide"
          onRequestClose={() => setTafsirModalVisible(false)}
          presentationStyle="pageSheet"
        >
          <View style={[styles.tafsirContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.tafsirHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setTafsirModalVisible(false)}
                style={styles.tafsirCloseButton}
              >
                <Ionicons name="arrow-back" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.tafsirTitle, { color: colors.text }]}>Tafsir</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={[styles.tafsirLanguageSelector, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.tafsirLanguageButton,
                  tafsirLanguage === 'fr' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => handleTafsirLanguageChange('fr')}
              >
                <Text style={[styles.tafsirLanguageButtonText, { color: tafsirLanguage === 'fr' ? '#fff' : colors.text }]}>
                  Français
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tafsirLanguageButton,
                  tafsirLanguage === 'ar' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => handleTafsirLanguageChange('ar')}
              >
                <Text style={[styles.tafsirLanguageButtonText, { color: tafsirLanguage === 'ar' ? '#fff' : colors.text }]}>
                  العربية
                </Text>
              </TouchableOpacity>
            </View>

            {(tafsirLoading || isTranslating) && (
              <View style={styles.tafsirLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.tafsirLoadingText, { color: colors.textSecondary }]}>
                  {isTranslating ? 'Traduction en cours...' : 'Chargement du tafsir...'}
                </Text>
              </View>
            )}

            {tafsirError && (
              <View style={styles.tafsirErrorContainer}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
                <Text style={[styles.tafsirErrorText, { color: colors.error }]}>{tafsirError}</Text>
              </View>
            )}

            {!tafsirLoading && !isTranslating && !tafsirError && tafsirContent && (
              <ScrollView style={styles.tafsirContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.tafsirCard, { backgroundColor: colors.card }]}>
                  <Text
                    style={[
                      styles.tafsirText,
                      {
                        color: colors.text,
                        textAlign: tafsirLanguage === 'ar' ? 'right' : 'left',
                        writingDirection: tafsirLanguage === 'ar' ? 'rtl' : 'ltr'
                      }
                    ]}
                  >
                    {tafsirContent}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </Modal>

        <Modal
          visible={lessonsModalVisible}
          animationType="slide"
          onRequestClose={() => setLessonsModalVisible(false)}
          presentationStyle="pageSheet"
        >
          <View style={[styles.tafsirContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.tafsirHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setLessonsModalVisible(false)}
                style={styles.tafsirCloseButton}
              >
                <Ionicons name="arrow-back" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.tafsirTitle, { color: colors.text }]}>Leçons</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={[styles.tafsirLanguageSelector, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.tafsirLanguageButton,
                  lessonsLanguage === 'fr' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => handleLessonsLanguageChange('fr')}
              >
                <Text style={[styles.tafsirLanguageButtonText, { color: lessonsLanguage === 'fr' ? '#fff' : colors.text }]}>
                  Français
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tafsirLanguageButton,
                  lessonsLanguage === 'ar' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => handleLessonsLanguageChange('ar')}
              >
                <Text style={[styles.tafsirLanguageButtonText, { color: lessonsLanguage === 'ar' ? '#fff' : colors.text }]}>
                  العربية
                </Text>
              </TouchableOpacity>
            </View>

            {lessonsLoading && (
              <View style={styles.tafsirLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.tafsirLoadingText, { color: colors.textSecondary }]}>
                  Génération des leçons...
                </Text>
              </View>
            )}

            {lessonsError && (
              <View style={styles.tafsirErrorContainer}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
                <Text style={[styles.tafsirErrorText, { color: colors.error }]}>{lessonsError}</Text>
              </View>
            )}

            {!lessonsLoading && !lessonsError && lessonsContent && (
              <ScrollView style={styles.tafsirContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.tafsirCard, { backgroundColor: colors.card }]}>
                  <Text
                    style={[
                      styles.tafsirText,
                      {
                        color: colors.text,
                        textAlign: lessonsLanguage === 'ar' ? 'right' : 'left',
                        writingDirection: lessonsLanguage === 'ar' ? 'rtl' : 'ltr'
                      }
                    ]}
                  >
                    {lessonsContent}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </Modal>

        <Modal
          visible={reflectionsModalVisible}
          animationType="slide"
          onRequestClose={() => setReflectionsModalVisible(false)}
          presentationStyle="pageSheet"
        >
          <View style={[styles.tafsirContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.tafsirHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setReflectionsModalVisible(false)}
                style={styles.tafsirCloseButton}
              >
                <Ionicons name="arrow-back" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.tafsirTitle, { color: colors.text }]}>Réflexions</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={[styles.tafsirLanguageSelector, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.tafsirLanguageButton,
                  reflectionsLanguage === 'fr' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => handleReflectionsLanguageChange('fr')}
              >
                <Text style={[styles.tafsirLanguageButtonText, { color: reflectionsLanguage === 'fr' ? '#fff' : colors.text }]}>
                  Français
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tafsirLanguageButton,
                  reflectionsLanguage === 'ar' && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => handleReflectionsLanguageChange('ar')}
              >
                <Text style={[styles.tafsirLanguageButtonText, { color: reflectionsLanguage === 'ar' ? '#fff' : colors.text }]}>
                  العربية
                </Text>
              </TouchableOpacity>
            </View>

            {reflectionsLoading && (
              <View style={styles.tafsirLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.tafsirLoadingText, { color: colors.textSecondary }]}>
                  Génération des réflexions...
                </Text>
              </View>
            )}

            {reflectionsError && (
              <View style={styles.tafsirErrorContainer}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
                <Text style={[styles.tafsirErrorText, { color: colors.error }]}>{reflectionsError}</Text>
              </View>
            )}

            {!reflectionsLoading && !reflectionsError && reflectionsContent && (
              <ScrollView style={styles.tafsirContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.tafsirCard, { backgroundColor: colors.card }]}>
                  <Text
                    style={[
                      styles.tafsirText,
                      {
                        color: colors.text,
                        textAlign: reflectionsLanguage === 'ar' ? 'right' : 'left',
                        writingDirection: reflectionsLanguage === 'ar' ? 'rtl' : 'ltr'
                      }
                    ]}
                  >
                    {reflectionsContent}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </Modal>

        <SurahAudioPlayer
          visible={surahAudioPlayerVisible}
          surahNumber={surahNumber}
          surahName={surahName}
          onClose={() => setSurahAudioPlayerVisible(false)}
        />
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
  closeButton: {
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
  playAllButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
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
  controls: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  audioErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  audioErrorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  bismillahContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  bismillah: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  verseCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  verseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  verseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 12,
  },
  translationText: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 8,
  },
  languageSelectorContainer: {
    padding: 16,
    borderTopWidth: 1,
    marginTop: 12,
  },
  languageSelectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resourcesToolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginTop: 8,
  },
  resourceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  resourceButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resourceDivider: {
    width: 1,
    height: '100%',
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shareModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 20,
    textAlign: 'center',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
  },
  shareOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  shareModalCancel: {
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  shareModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tafsirContainer: {
    flex: 1,
  },
  tafsirHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tafsirCloseButton: {
    padding: 8,
  },
  tafsirTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  tafsirLanguageSelector: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
  },
  tafsirLanguageButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tafsirLanguageButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tafsirLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  tafsirLoadingText: {
    fontSize: 14,
  },
  tafsirErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  tafsirErrorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  tafsirContent: {
    flex: 1,
  },
  tafsirCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tafsirText: {
    fontSize: 16,
    lineHeight: 28,
  },
});
