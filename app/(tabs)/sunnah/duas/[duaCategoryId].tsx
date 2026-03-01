import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { fetchDuasByCategory, Dua } from '@/utils/duaUtils';
import { useSettings } from '@/store/settingsStore';
import { generateChatResponseStream } from '@/llm';
import FormattedText from '@/components/FormattedText';
import { speak, stop, isSpeechAvailable } from '@/utils/speechUtils';

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

  const handlePlayAudio = async (dua: Dua) => {
    if (playingDuaId === dua.id) {
      await stop();
      setPlayingDuaId(null);
      return;
    }

    setPlayingDuaId(dua.id);
    await speak(dua.arabicText, {
      language: 'ar-SA',
      rate: 0.8,
      pitch: 1.0,
    });
    setPlayingDuaId(null);
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={darkMode ? ['#0a0a0a', '#1a1a2e'] : ['#f8f9fa', '#e8f5e9']}
          style={styles.gradient}
        >
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/sunnah/duas')}>
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/sunnah/duas')}>
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/sunnah/duas')}>
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

                {/* Arabic text — always shown */}
                <View style={styles.textSection}>
                  <Text style={[styles.arabicText, { color: colors.text }]}>
                    {dua.arabicText}
                  </Text>
                </View>

                {/* Transliteration — toggled */}
                {showTransliteration && dua.transliteration ? (
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
                      >
                        <Ionicons
                          name={playingDuaId === dua.id ? 'stop-circle' : 'volume-high'}
                          size={16}
                          color={playingDuaId === dua.id ? colors.accent : colors.primary}
                        />
                        <Text style={[styles.actionButtonText, { color: playingDuaId === dua.id ? colors.accent : colors.primary }]}>
                          {playingDuaId === dua.id ? 'Stop' : '\u00c9couter'}
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
});
