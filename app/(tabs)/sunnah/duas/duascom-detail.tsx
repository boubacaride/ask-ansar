import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { getDuaContent } from '@/utils/duasComData';

const ACCENT_COLOR = '#8DB600';

export default function DuasComDetailScreen() {
  const params = useLocalSearchParams<{
    duaId: string;
    duaTitle: string;
    duaUrl: string;
    categoryName: string;
    categoryId: string;
    categorySlug: string;
  }>();

  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();

  const duaContent = useMemo(() => getDuaContent(params.duaId), [params.duaId]);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f0f0f0',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    accent: ACCENT_COLOR,
    arabicBg: darkMode ? '#1a2a1a' : '#f1f8e9',
    arabicBorder: darkMode ? '#2a3a2a' : '#c5e1a5',
    translationBg: darkMode ? '#1a1a2e' : '#ffffff',
    transliterationBg: darkMode ? '#1e1e30' : '#fafafa',
    sectionHeader: darkMode ? '#2a2a3a' : '#e8f5e9',
    sourcesBg: darkMode ? '#1a1a25' : '#f5f5f5',
    sourcesBorder: darkMode ? '#2a2a3a' : '#e0e0e0',
    duaNumberBg: darkMode ? 'rgba(141, 182, 0, 0.15)' : 'rgba(141, 182, 0, 0.12)',
  };

  const handleGoBack = () => {
    if (params.categoryId) {
      router.navigate({
        pathname: '/(tabs)/sunnah/duas/duascom-category',
        params: {
          categoryId: params.categoryId,
          categoryName: params.categoryName || '',
          categorySlug: params.categorySlug || '',
        },
      });
    } else {
      router.navigate('/(tabs)/sunnah/duas/categories');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: params.duaTitle || 'Dou\'a',
      });
    } catch (e) {
      // ignore
    }
  };

  // No content found
  if (!duaContent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.card,
              borderBottomColor: colors.cardBorder,
              paddingTop: (Platform.OS === 'web' ? 20 : insets.top) + 6,
            },
          ]}
        >
          <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={2}>
              {params.duaTitle || 'Dou\'a'}
            </Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Contenu non disponible pour cette dou'a.
          </Text>
          <TouchableOpacity onPress={handleGoBack}>
            <Text style={[styles.emptyLink, { color: colors.accent }]}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={darkMode ? ['#0a0a0a', '#1a1a2e', '#0d2137'] : ['#f0f0f0', '#e8f5e9', '#dcedc8']}
        style={styles.gradient}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: darkMode ? 'rgba(10,10,10,0.9)' : 'rgba(255,255,255,0.95)',
              borderBottomColor: colors.cardBorder,
              paddingTop: (Platform.OS === 'web' ? 20 : insets.top) + 6,
            },
          ]}
        >
          <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={2}>
              {params.duaTitle || 'Dou\'a'}
            </Text>
            {params.categoryName ? (
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {params.categoryName}
              </Text>
            ) : null}
          </View>
          {Platform.OS !== 'web' ? (
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
        >
          {/* Dua Number Badge */}
          {duaContent.duaNumber != null && (
            <View style={[styles.duaNumberBadge, { backgroundColor: colors.duaNumberBg }]}>
              <MaterialCommunityIcons name="star-four-points" size={16} color={colors.accent} />
              <Text style={[styles.duaNumberText, { color: colors.accent }]}>
                Dou'a N{'\u00B0'} {duaContent.duaNumber}
              </Text>
            </View>
          )}

          {/* Arabic Text */}
          {duaContent.arabic ? (
            <View style={[styles.section, styles.arabicSection, { backgroundColor: colors.arabicBg, borderColor: colors.arabicBorder }]}>
              <Text style={[styles.arabicText, { color: colors.text }]}>
                {duaContent.arabic.trim()}
              </Text>
            </View>
          ) : null}

          {/* Translation */}
          {duaContent.translation ? (
            <View style={[styles.section, { backgroundColor: colors.translationBg, borderColor: colors.cardBorder }]}>
              <View style={[styles.sectionHeader, { backgroundColor: colors.sectionHeader }]}>
                <Ionicons name="language" size={18} color={colors.accent} />
                <Text style={[styles.sectionHeaderText, { color: colors.accent }]}>Traduction</Text>
              </View>
              <View style={styles.sectionContent}>
                <Text style={[styles.translationText, { color: colors.text }]}>
                  {duaContent.translation.trim()}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Transliteration */}
          {duaContent.transliteration ? (
            <View style={[styles.section, { backgroundColor: colors.transliterationBg, borderColor: colors.cardBorder }]}>
              <View style={[styles.sectionHeader, { backgroundColor: colors.sectionHeader }]}>
                <MaterialCommunityIcons name="format-text" size={18} color={colors.accent} />
                <Text style={[styles.sectionHeaderText, { color: colors.accent }]}>Translitt{'e\u0301'}ration</Text>
              </View>
              <View style={styles.sectionContent}>
                <Text style={[styles.transliterationText, { color: colors.text }]}>
                  {duaContent.transliteration.trim()}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Sources */}
          {duaContent.sources ? (
            <View style={[styles.sourcesContainer, { backgroundColor: colors.sourcesBg, borderColor: colors.sourcesBorder }]}>
              <MaterialCommunityIcons name="book-open-variant" size={14} color={colors.textSecondary} />
              <Text style={[styles.sourcesText, { color: colors.textSecondary }]}>
                {duaContent.sources.trim()}
              </Text>
            </View>
          ) : null}

          {/* Footer spacer */}
          <View style={styles.footer} />
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 14,
  },

  // Dua Number Badge
  duaNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  duaNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Section common
  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // Arabic
  arabicSection: {
    padding: 20,
    borderWidth: 1,
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 50,
    textAlign: 'right',
    writingDirection: 'rtl' as const,
    fontFamily: Platform.select({
      ios: 'Al Nile',
      android: 'NotoNaskhArabic-Regular',
      web: "'Noto Naskh Arabic', 'Traditional Arabic', 'Amiri', serif",
    }),
  },

  // Translation
  translationText: {
    fontSize: 15,
    lineHeight: 24,
  },

  // Transliteration
  transliterationText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // Sources
  sourcesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  sourcesText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  // Footer
  footer: {
    marginTop: 10,
    paddingBottom: 20,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  emptyLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});
