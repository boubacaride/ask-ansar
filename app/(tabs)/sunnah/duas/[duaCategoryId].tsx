import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { fetchDuasByCategory, Dua, CATEGORY_DESCRIPTIONS, getVerseRefsForDua } from '@/utils/duaUtils';
import { useSettings } from '@/store/settingsStore';
import { generateChatResponseStream } from '@/llm';
import FormattedText from '@/components/FormattedText';
import { speak, stop, isSpeechAvailable, playQuranVerseAudio, QURAN_RECITERS, QuranReciterId } from '@/utils/speechUtils';

export default function DuaCategoryDetailScreen() {
  const params = useLocalSearchParams<{
    duaCategoryId: string;
    categoryLabel: string;
    categoryColor: string;
    categoryIcon: string;
  }>();

  const { darkMode } = useSettings();
  const [duas, setDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'fr' | 'en'>('fr');
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [expandedDua, setExpandedDua] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [detailStates, setDetailStates] = useState<Map<string, { text: string; loading: boolean }>>(new Map());
  const detailAbortRef = useRef<AbortController | null>(null);
  const [playingDuaId, setPlayingDuaId] = useState<string | null>(null);
  const [expandedBenefits, setExpandedBenefits] = useState<Set<string>>(new Set());
  const [selectedSpeed, setSelectedSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [selectedReciter, setSelectedReciter] = useState<QuranReciterId>('mishari');
  const [generatingMishari, setGeneratingMishari] = useState(false);
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);
  const [reciterDropdownOpen, setReciterDropdownOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [expandedDescSections, setExpandedDescSections] = useState<Set<number>>(new Set([0]));

  const categoryDescription = CATEGORY_DESCRIPTIONS[params.duaCategoryId];

  const SPEED_LABELS: Record<string, string> = { slow: 'Lent', medium: 'Moyen', fast: 'Rapide' };
  const RECITER_OPTIONS: { id: QuranReciterId; label: string; shortLabel: string }[] = [
    { id: 'mishari', label: QURAN_RECITERS.mishari.label, shortLabel: 'Mishari' },
    { id: 'abdulbaset', label: QURAN_RECITERS.abdulbaset.label, shortLabel: 'AbdulBaset' },
    { id: 'husary', label: QURAN_RECITERS.husary.label, shortLabel: 'Al-Husary' },
  ];

  const categoryColor = params.categoryColor || '#00796b';

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    accent: categoryColor,
    inputBg: darkMode ? '#252538' : '#f5f5f5',
  };

  useEffect(() => {
    loadDuas();
  }, [params.duaCategoryId]);

  const loadDuas = async () => {
    setLoading(true);
    setError(null);
    setPage(0);

    try {
      const results = await fetchDuasByCategory(params.duaCategoryId, 20, 0);
      setDuas(results);
      setHasMore(results.length >= 20);

      if (results.length === 0) {
        setError("Aucune dou'a trouv\u00e9e pour cette cat\u00e9gorie.");
      }
    } catch (err) {
      console.error('Error loading duas:', err);
      setError("Erreur lors du chargement des dou'as. Veuillez r\u00e9essayer.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreDuas = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const offset = nextPage * 20;
      const results = await fetchDuasByCategory(params.duaCategoryId, 20, offset);

      if (results.length > 0) {
        setDuas(prev => [...prev, ...results]);
        setPage(nextPage);
        setHasMore(results.length >= 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more duas:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCopy = async (dua: Dua) => {
    let text = dua.arabicText;
    if (selectedLanguage === 'fr') {
      text += '\n\n' + (dua.frenchText || dua.englishText);
    } else if (selectedLanguage === 'en') {
      text += '\n\n' + dua.englishText;
    }
    if (showTransliteration && dua.transliteration) {
      text += '\n\n' + dua.transliteration;
    }
    text += `\n\n[${dua.reference}]`;
    await Clipboard.setStringAsync(text);
  };

  const SPEED_MAP = { slow: 0.3, medium: 0.5, fast: 0.7 };

  const handlePlayAudio = async (dua: Dua) => {
    console.log('[Audio] handlePlayAudio called, dua:', dua.id, 'reciter:', selectedReciter);
    if (playingDuaId === dua.id) {
      console.log('[Audio] Stopping current playback');
      await stop();
      setPlayingDuaId(null);
      return;
    }

    try {
      setPlayingDuaId(dua.id);

      // Get verse refs from explicit field or auto-parse from Quranic reference
      const verseRefs = getVerseRefsForDua(dua);

      if (verseRefs.length > 0) {
        // Pre-recorded Quran recitation from selected reciter
        console.log('[Audio] Using pre-recorded audio for', dua.id, 'verseRefs:', verseRefs, 'reciter:', selectedReciter);
        await playQuranVerseAudio(verseRefs, selectedReciter);
      } else {
        // TTS fallback for non-Quranic duas (Mishari voice clone)
        console.log('[Audio] No verse refs, using TTS for', dua.id);
        setGeneratingMishari(true);
        await speak(dua.arabicText, {
          language: 'ar',
          rate: SPEED_MAP[selectedSpeed],
          gender: 'mishari',
        });
      }
      console.log('[Audio] Audio finished for:', dua.id);
    } catch (err) {
      console.error('[Audio] Error in handlePlayAudio:', err);
      Alert.alert(
        'Audio',
        "Impossible de lire l'audio. V\u00e9rifiez votre connexion internet.",
        [{ text: 'OK' }]
      );
    } finally {
      setPlayingDuaId(null);
      setGeneratingMishari(false);
    }
  };

  const getTranslationText = (dua: Dua): string => {
    if (selectedLanguage === 'fr') {
      return dua.frenchText || dua.englishText;
    }
    return dua.englishText;
  };

  const handleVoirPlus = useCallback((dua: Dua) => {
    const key = dua.id;

    if (detailStates.get(key)?.text) return;

    detailAbortRef.current?.abort();
    const controller = new AbortController();
    detailAbortRef.current = controller;

    setDetailStates(prev => {
      const next = new Map(prev);
      next.set(key, { text: '', loading: true });
      return next;
    });

    const duaContext = dua.frenchText || dua.englishText || dua.arabicText;
    const prompt = `Voici une dou'a islamique (${dua.reference}):\nArabe: "${dua.arabicText.slice(0, 300)}"\nTraduction: "${duaContext.slice(0, 500)}"\n\nDonne une explication detaillee et approfondie de cette dou'a. Inclus obligatoirement:\n1. Le contexte et la signification de cette dou'a\n2. Quand et comment la reciter (moments recommandes)\n3. Les bienfaits et vertus de cette dou'a selon les sources authentiques\n4. Les preuves du Coran et de la Sunna liees a cette dou'a\n5. Les lecons spirituelles a en tirer\nSois pedagogique et structure ta reponse clairement.`;

    generateChatResponseStream(
      prompt,
      (token) => {
        if (controller.signal.aborted) return;
        setDetailStates(prev => {
          const next = new Map(prev);
          const current = next.get(key);
          next.set(key, {
            text: (current?.text ?? '') + token,
            loading: true,
          });
          return next;
        });
      },
      controller.signal,
      'topic-detail',
    )
      .then(() => {
        if (controller.signal.aborted) return;
        setDetailStates(prev => {
          const next = new Map(prev);
          const current = next.get(key);
          if (current) next.set(key, { ...current, loading: false });
          return next;
        });
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setDetailStates(prev => {
          const next = new Map(prev);
          next.set(key, { text: '', loading: false });
          return next;
        });
      });
  }, [detailStates]);

  const renderLanguageButtons = () => (
    <View style={styles.controlsRow}>
      <View style={styles.languageContainer}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            { borderColor: colors.primary },
            selectedLanguage === 'ar' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedLanguage('ar')}
        >
          <Text style={[styles.languageButtonText, { color: selectedLanguage === 'ar' ? '#fff' : colors.primary }]}>
            العربية
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.languageButton,
            { borderColor: colors.primary },
            selectedLanguage === 'fr' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedLanguage('fr')}
        >
          <Text style={[styles.languageButtonText, { color: selectedLanguage === 'fr' ? '#fff' : colors.primary }]}>
            Fran{'\u00e7'}ais
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.languageButton,
            { borderColor: colors.primary },
            selectedLanguage === 'en' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedLanguage('en')}
        >
          <Text style={[styles.languageButtonText, { color: selectedLanguage === 'en' ? '#fff' : colors.primary }]}>
            English
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.translitButton,
          { borderColor: colors.primary },
          showTransliteration && { backgroundColor: colors.primary },
        ]}
        onPress={() => setShowTransliteration(!showTransliteration)}
      >
        <MaterialCommunityIcons
          name="format-letter-case"
          size={18}
          color={showTransliteration ? '#fff' : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderAudioControls = () => (
    <View style={styles.audioControlsRow}>
      {/* Vitesse dropdown */}
      <View style={[styles.dropdownWrapper, { zIndex: speedDropdownOpen ? 20 : 10 }]}>
        <TouchableOpacity
          style={[styles.dropdownTrigger, { borderColor: colors.primary, backgroundColor: colors.inputBg }]}
          onPress={() => {
            setSpeedDropdownOpen(!speedDropdownOpen);
            setReciterDropdownOpen(false);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="speedometer-outline" size={15} color={colors.primary} />
          <Text style={[styles.dropdownTriggerText, { color: colors.text }]}>
            {SPEED_LABELS[selectedSpeed]}
          </Text>
          <Ionicons
            name={speedDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {speedDropdownOpen && (
          <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {(['slow', 'medium', 'fast'] as const).map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.dropdownItem,
                  selectedSpeed === speed && { backgroundColor: `${colors.primary}15` },
                ]}
                onPress={() => {
                  setSelectedSpeed(speed);
                  setSpeedDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dropdownItemText,
                  { color: selectedSpeed === speed ? colors.primary : colors.text },
                  selectedSpeed === speed && { fontWeight: '700' },
                ]}>
                  {SPEED_LABELS[speed]}
                </Text>
                {selectedSpeed === speed && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Reciter dropdown */}
      <View style={[styles.dropdownWrapper, { zIndex: reciterDropdownOpen ? 20 : 10 }]}>
        <TouchableOpacity
          style={[styles.dropdownTrigger, { borderColor: colors.primary, backgroundColor: colors.inputBg }]}
          onPress={() => {
            setReciterDropdownOpen(!reciterDropdownOpen);
            setSpeedDropdownOpen(false);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="mic" size={15} color={colors.primary} />
          <Text style={[styles.dropdownTriggerText, { color: colors.text }]} numberOfLines={1}>
            {RECITER_OPTIONS.find(r => r.id === selectedReciter)?.shortLabel || 'Mishari'}
          </Text>
          <Ionicons
            name={reciterDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {reciterDropdownOpen && (
          <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {RECITER_OPTIONS.map((reciter) => (
              <TouchableOpacity
                key={reciter.id}
                style={[
                  styles.dropdownItem,
                  selectedReciter === reciter.id && { backgroundColor: `${colors.primary}15` },
                ]}
                onPress={() => {
                  setSelectedReciter(reciter.id);
                  setReciterDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="mic"
                  size={14}
                  color={selectedReciter === reciter.id ? colors.primary : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  styles.dropdownItemText,
                  { color: selectedReciter === reciter.id ? colors.primary : colors.text, flex: 1 },
                  selectedReciter === reciter.id && { fontWeight: '700' },
                ]} numberOfLines={1}>
                  {reciter.label}
                </Text>
                {selectedReciter === reciter.id && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={darkMode ? ['#0a0a0a', '#1a1a2e'] : ['#f8f9fa', '#e8f5e9']}
          style={styles.gradient}
        >
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {params.categoryLabel || "Dou'as"}
              </Text>
            </View>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Chargement des dou'as...
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={darkMode ? ['#0a0a0a', '#1a1a2e'] : ['#f8f9fa', '#e8f5e9']}
          style={styles.gradient}
        >
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {params.categoryLabel || "Dou'as"}
              </Text>
            </View>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.accent} />
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadDuas}
            >
              <Text style={styles.retryButtonText}>R{'\u00e9'}essayer</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={darkMode ? ['#0a0a0a', '#1a1a2e'] : ['#f8f9fa', '#e8f5e9']}
        style={styles.gradient}
      >
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.categoryIconHeader, { backgroundColor: `${categoryColor}20` }]}>
              <MaterialCommunityIcons
                name={(params.categoryIcon || 'hands-pray') as any}
                size={20}
                color={categoryColor}
              />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {params.categoryLabel || "Dou'as"}
            </Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        {renderLanguageButtons()}
        {renderAudioControls()}

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          onScroll={(e) => {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 500;
            if (isCloseToBottom && hasMore && !loadingMore) {
              loadMoreDuas();
            }
          }}
          scrollEventThrottle={400}
        >
          {/* Category description (e.g. Ruqyah info) */}
          {categoryDescription && (
            <View style={[styles.descriptionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <TouchableOpacity
                style={styles.descriptionHeader}
                onPress={() => setDescriptionExpanded(!descriptionExpanded)}
                activeOpacity={0.7}
              >
                <View style={[styles.descriptionIconCircle, { backgroundColor: `${categoryColor}20` }]}>
                  <MaterialCommunityIcons name="information" size={20} color={categoryColor} />
                </View>
                <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                  {'À propos de la '}{categoryDescription.title}
                </Text>
                <MaterialCommunityIcons
                  name={descriptionExpanded ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {descriptionExpanded && (
                <View style={styles.descriptionContent}>
                  {categoryDescription.sections.map((section, sIndex) => {
                    const isSectionExpanded = expandedDescSections.has(sIndex);
                    return (
                      <View key={sIndex} style={styles.descriptionSection}>
                        {section.heading && (
                          <TouchableOpacity
                            style={[styles.descSectionHeadingRow, { borderTopColor: colors.cardBorder }]}
                            onPress={() => {
                              setExpandedDescSections(prev => {
                                const next = new Set(prev);
                                if (next.has(sIndex)) next.delete(sIndex);
                                else next.add(sIndex);
                                return next;
                              });
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.descSectionHeading, { color: categoryColor }]}>
                              {section.heading}
                            </Text>
                            <MaterialCommunityIcons
                              name={isSectionExpanded ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color={categoryColor}
                            />
                          </TouchableOpacity>
                        )}
                        {(section.heading ? isSectionExpanded : true) && (
                          <Text style={[styles.descSectionBody, { color: colors.text }]}>
                            {section.body}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {duas.length} dou'a{duas.length > 1 ? 's' : ''} trouv{'\u00e9'}e{duas.length > 1 ? 's' : ''}
            {hasMore && ' (glissez pour en voir plus)'}
          </Text>

          {duas.map((dua, index) => {
            const isExpanded = expandedDua === dua.id;
            const translationText = getTranslationText(dua);

            return (
              <View
                key={`${dua.id}-${index}`}
                style={[styles.duaCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                {/* Title + Repetition badge */}
                <View style={[styles.cardHeader, { borderBottomColor: colors.cardBorder }]}>
                  <View style={[styles.titleBadge, { backgroundColor: colors.inputBg }]}>
                    <Text style={[styles.titleBadgeText, { color: colors.accent }]} numberOfLines={1}>
                      {dua.title || dua.reference}
                    </Text>
                  </View>
                  {dua.repetitions > 1 && (
                    <View style={[styles.repBadge, { backgroundColor: `${categoryColor}20` }]}>
                      <Text style={[styles.repBadgeText, { color: categoryColor }]}>
                        {'\u00d7'}{dua.repetitions}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Recommended for tags */}
                {dua.recommendedFor ? (
                  <View style={styles.recommendedRow}>
                    {dua.recommendedFor.split('|').map((tag, i) => (
                      <View key={i} style={[styles.recommendedTag, { backgroundColor: `${colors.primary}15` }]}>
                        <Text style={[styles.recommendedTagText, { color: colors.primary }]}>
                          {tag.trim()}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Arabic text — always shown */}
                <View style={styles.textSection}>
                  <Text style={[styles.arabicText, { color: colors.text }]}>
                    {dua.arabicText}
                  </Text>
                </View>

                {/* Transliteration — always shown */}
                {dua.transliteration ? (
                  <View style={[styles.translitSection, { borderTopColor: colors.cardBorder }]}>
                    <Text style={[styles.translitText, { color: colors.textSecondary }]}>
                      {dua.transliteration}
                    </Text>
                  </View>
                ) : null}

                {/* Translation */}
                {selectedLanguage !== 'ar' && translationText ? (
                  <TouchableOpacity
                    onPress={() => setExpandedDua(isExpanded ? null : dua.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.translationSection, { borderTopColor: colors.cardBorder }]}>
                      <Text
                        style={[styles.translationText, { color: colors.text }]}
                        numberOfLines={isExpanded ? undefined : 4}
                      >
                        {translationText}
                      </Text>
                      {translationText.length > 200 && (
                        <Text style={[styles.expandText, { color: colors.primary }]}>
                          {isExpanded ? 'Voir moins' : 'Voir plus'}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ) : null}

                {/* Arabic-only mode: show translation as collapsed */}
                {selectedLanguage === 'ar' && translationText ? (
                  <TouchableOpacity
                    onPress={() => setExpandedDua(isExpanded ? null : dua.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.translationSection, { borderTopColor: colors.cardBorder }]}>
                      {isExpanded ? (
                        <Text style={[styles.translationText, { color: colors.textSecondary }]}>
                          {dua.frenchText || dua.englishText}
                        </Text>
                      ) : (
                        <Text style={[styles.expandText, { color: colors.primary }]}>
                          Voir la traduction
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ) : null}

                {/* AI Explanation */}
                {(() => {
                  const detail = detailStates.get(dua.id);
                  return (
                    <>
                      {!detail && (
                        <TouchableOpacity
                          style={[styles.voirPlusButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleVoirPlus(dua)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons name="book-open-variant" size={14} color="#ffffff" />
                          <Text style={styles.voirPlusText}>Explication</Text>
                        </TouchableOpacity>
                      )}

                      {detail && (
                        <View style={[styles.detailSection, { borderTopColor: colors.cardBorder }]}>
                          {detail.loading && !detail.text && (
                            <View style={styles.detailLoading}>
                              <ActivityIndicator size="small" color={colors.primary} />
                              <Text style={[styles.detailLoadingText, { color: colors.textSecondary }]}>
                                Chargement de l'explication...
                              </Text>
                            </View>
                          )}
                          {detail.text ? (
                            <View>
                              <FormattedText text={detail.text} darkMode={darkMode} />
                              {detail.loading && (
                                <Text style={[styles.streamingDots, { color: colors.primary }]}>...</Text>
                              )}
                            </View>
                          ) : null}
                        </View>
                      )}
                    </>
                  );
                })()}

                {/* Benefit & Virtue */}
                {dua.benefit ? (
                  <View style={[styles.benefitSection, { borderTopColor: colors.cardBorder }]}>
                    <TouchableOpacity
                      style={[styles.benefitToggle, { backgroundColor: `${colors.accent}10` }]}
                      onPress={() => {
                        setExpandedBenefits(prev => {
                          const next = new Set(prev);
                          if (next.has(dua.id)) next.delete(dua.id);
                          else next.add(dua.id);
                          return next;
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={expandedBenefits.has(dua.id) ? 'chevron-up' : 'star'}
                        size={14}
                        color={colors.accent}
                      />
                      <Text style={[styles.benefitToggleText, { color: colors.accent }]}>
                        {expandedBenefits.has(dua.id) ? 'Masquer' : 'Bienfait & Vertu'}
                      </Text>
                    </TouchableOpacity>
                    {expandedBenefits.has(dua.id) && (
                      <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                        {dua.benefit}
                      </Text>
                    )}
                  </View>
                ) : null}

                {/* Reference + Actions */}
                <View style={styles.cardFooter}>
                  <Text style={[styles.referenceText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {dua.reference}
                  </Text>
                  <View style={styles.footerActions}>
                    {isSpeechAvailable() && (
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { borderColor: playingDuaId === dua.id ? colors.accent : colors.cardBorder },
                          playingDuaId === dua.id && { backgroundColor: `${colors.accent}15` },
                        ]}
                        onPress={() => handlePlayAudio(dua)}
                        disabled={generatingMishari && playingDuaId !== dua.id}
                      >
                        {generatingMishari && playingDuaId === dua.id ? (
                          <ActivityIndicator size="small" color={colors.accent} />
                        ) : (
                          <Ionicons
                            name={playingDuaId === dua.id ? 'stop-circle' : 'volume-high'}
                            size={16}
                            color={playingDuaId === dua.id ? colors.accent : colors.primary}
                          />
                        )}
                        <Text style={[styles.actionButtonText, { color: playingDuaId === dua.id ? colors.accent : colors.primary }]}>
                          {generatingMishari && playingDuaId === dua.id
                            ? 'Génération...'
                            : playingDuaId === dua.id
                              ? 'Stop'
                              : getVerseRefsForDua(dua).length > 0
                                ? 'Écouter'
                                : 'Écouter'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.cardBorder }]}
                      onPress={() => handleCopy(dua)}
                    >
                      <Ionicons name="copy-outline" size={16} color={colors.primary} />
                      <Text style={[styles.actionButtonText, { color: colors.primary }]}>Copier</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}

          {loadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingMoreText, { color: colors.textSecondary }]}>
                Chargement...
              </Text>
            </View>
          )}

          {!hasMore && duas.length > 0 && (
            <View style={styles.endOfListContainer}>
              <Text style={[styles.endOfListText, { color: colors.textSecondary }]}>
                Fin de la liste
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  categoryIconHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  translitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  duaCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  titleBadge: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 8,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  repBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  repBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  textSection: {
    padding: 16,
  },
  arabicText: {
    fontFamily: 'NotoNaskhArabic-Regular',
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    writingDirection: 'rtl' as const,
  },
  translitSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  translitText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  translationSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  translationText: {
    fontSize: 15,
    lineHeight: 24,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  voirPlusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  voirPlusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  detailSection: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  detailLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  detailLoadingText: {
    fontSize: 14,
  },
  streamingDots: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  referenceText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  endOfListContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  recommendedTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  recommendedTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  benefitSection: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  benefitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  benefitToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  benefitText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    paddingBottom: 4,
  },
  audioControlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 30,
    overflow: 'visible' as any,
  },
  dropdownWrapper: {
    position: 'relative',
    minWidth: 140,
    overflow: 'visible' as any,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dropdownTriggerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
      default: { elevation: 6 },
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
  descriptionCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  descriptionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  descriptionContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  descriptionSection: {
    marginBottom: 8,
  },
  descSectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    marginTop: 4,
  },
  descSectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  descSectionBody: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.88,
  },
});
