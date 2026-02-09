import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { fetchHadithsByCategory, CategoryHadith } from '@/utils/categoryHadithUtils';
import { useSettings } from '@/store/settingsStore';

interface TopicHadithScreenProps {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}

export function TopicHadithScreen({
  categoryId,
  categoryName,
  categoryIcon,
  categoryColor,
}: TopicHadithScreenProps) {
  const { darkMode } = useSettings();
  const [hadiths, setHadiths] = useState<CategoryHadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'fr' | 'en'>('fr');
  const [expandedHadith, setExpandedHadith] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

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
    loadHadiths();
  }, [categoryId]);

  const loadHadiths = async () => {
    setLoading(true);
    setError(null);
    setPage(0);

    try {
      console.log(`Loading hadiths for category: ${categoryId}`);
      const results = await fetchHadithsByCategory(categoryId, 20, 0);
      console.log(`✓ Loaded ${results.length} hadiths`);
      setHadiths(results);
      setHasMore(results.length >= 20);

      if (results.length === 0) {
        setError('Aucun hadith trouvé pour cette catégorie.');
      }
    } catch (err) {
      console.error('Error loading hadiths:', err);
      setError('Erreur lors du chargement des hadiths. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreHadiths = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const offset = nextPage * 20;
      console.log(`Loading more hadiths (offset: ${offset})...`);
      const results = await fetchHadithsByCategory(categoryId, 20, offset);

      if (results.length > 0) {
        console.log(`✓ Loaded ${results.length} more hadiths`);
        setHadiths(prev => [...prev, ...results]);
        setPage(nextPage);
        setHasMore(results.length >= 20);
      } else {
        console.log('No more hadiths to load');
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more hadiths:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCopy = async (hadith: CategoryHadith) => {
    let text = '';
    if (selectedLanguage === 'ar') {
      text = hadith.arabicText;
    } else if (selectedLanguage === 'fr') {
      text = hadith.frenchText || hadith.englishText;
    } else {
      text = hadith.englishText;
    }

    text += `\n\n[${hadith.reference}]`;
    await Clipboard.setStringAsync(text);
  };

  const getDisplayText = (hadith: CategoryHadith): string => {
    if (selectedLanguage === 'ar') {
      return hadith.arabicText;
    } else if (selectedLanguage === 'fr') {
      return hadith.frenchText || hadith.englishText;
    }
    return hadith.englishText;
  };

  const renderLanguageButtons = () => (
    <View style={styles.languageContainer}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          { borderColor: colors.primary },
          selectedLanguage === 'ar' && { backgroundColor: colors.primary },
        ]}
        onPress={() => setSelectedLanguage('ar')}
      >
        <Text
          style={[
            styles.languageButtonText,
            { color: selectedLanguage === 'ar' ? '#fff' : colors.primary },
          ]}
        >
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
        <Text
          style={[
            styles.languageButtonText,
            { color: selectedLanguage === 'fr' ? '#fff' : colors.primary },
          ]}
        >
          Français
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
        <Text
          style={[
            styles.languageButtonText,
            { color: selectedLanguage === 'en' ? '#fff' : colors.primary },
          ]}
        >
          English
        </Text>
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {categoryName}
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Chargement des hadiths...
            </Text>
            <Text style={[styles.subStatusText, { color: colors.textSecondary }]}>
              Vérification du cache local puis recherche dans les collections...
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {categoryName}
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.accent} />
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadHadiths}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.categoryIconHeader, { backgroundColor: `${categoryColor}20` }]}>
              <FontAwesome5 name={categoryIcon as any} size={20} color={categoryColor} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {categoryName}
            </Text>
          </View>
          <View style={styles.placeholder} />
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
              loadMoreHadiths();
            }
          }}
          scrollEventThrottle={400}
        >
          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {hadiths.length} hadith{hadiths.length > 1 ? 's' : ''} trouvé{hadiths.length > 1 ? 's' : ''}
            {hasMore && ' (glissez pour en voir plus)'}
          </Text>

          {hadiths.map((hadith, index) => {
            const isExpanded = expandedHadith === hadith.hadithNumber;
            const displayText = getDisplayText(hadith);

            return (
              <View
                key={`${hadith.collectionId}-${hadith.hadithNumber}-${index}`}
                style={[
                  styles.hadithCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={[styles.cardHeader, { borderBottomColor: colors.cardBorder }]}>
                  <View style={[styles.collectionBadge, { backgroundColor: colors.inputBg }]}>
                    <Text style={[styles.collectionBadgeText, { color: colors.accent }]}>
                      {hadith.collectionName}
                    </Text>
                  </View>
                  <Text style={[styles.hadithNumber, { color: colors.primary }]}>
                    #{hadith.hadithNumber}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setExpandedHadith(isExpanded ? null : hadith.hadithNumber)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.textSection}>
                    <Text
                      style={[
                        styles.hadithText,
                        { color: colors.text },
                        selectedLanguage === 'ar' && styles.arabicText,
                      ]}
                      numberOfLines={isExpanded ? undefined : 4}
                    >
                      {displayText}
                    </Text>
                    {displayText.length > 200 && (
                      <Text style={[styles.expandText, { color: colors.primary }]}>
                        {isExpanded ? 'Voir moins' : 'Voir plus'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.cardBorder }]}
                    onPress={() => handleCopy(hadith)}
                  >
                    <Ionicons name="copy-outline" size={18} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                      Copier
                    </Text>
                  </TouchableOpacity>
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

          {!hasMore && hadiths.length > 0 && (
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
  placeholder: {
    width: 40,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hadithCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  collectionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  collectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hadithNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  textSection: {
    padding: 16,
  },
  hadithText: {
    fontSize: 15,
    lineHeight: 24,
  },
  arabicText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 17,
    lineHeight: 32,
    textAlign: 'right',
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
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
  subStatusText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.7,
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
