import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { getCategoryById, DuasComCategory, DuaLink } from '@/utils/duasComData';

const ACCENT_COLOR = '#8DB600';

export default function DuasComCategoryDetailScreen() {
  const params = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
    categorySlug: string;
  }>();

  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const category = useMemo(() => getCategoryById(params.categoryId), [params.categoryId]);

  const filteredDuas = useMemo(() => {
    if (!category) return [];
    if (!searchQuery.trim()) return category.duas;
    const q = searchQuery.toLowerCase().trim();
    return category.duas.filter(d => d.title.toLowerCase().includes(q));
  }, [category, searchQuery]);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f0f0f0',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00796b',
    accent: ACCENT_COLOR,
    inputBg: darkMode ? '#252538' : '#ffffff',
    inputBorder: darkMode ? '#3d3d5c' : '#cccccc',
    duaCard: darkMode ? '#1a1a2a' : '#ffffff',
    duaCardBorder: darkMode ? '#2a2a3a' : '#e8e8e8',
    duaNumber: darkMode ? '#808090' : '#999999',
    linkColor: darkMode ? '#7CB342' : '#558B2F',
  };

  const openExternalUrl = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const handleDuaPress = (dua: DuaLink) => {
    openExternalUrl(dua.url);
  };

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: (Platform.OS === 'web' ? 20 : insets.top) + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Category not found</Text>
        </View>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            This category could not be found.
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.emptyLink, { color: colors.accent }]}>Go back</Text>
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
              borderBottomColor: colors.cardBorder,
              paddingTop: (Platform.OS === 'web' ? 20 : insets.top) + 10,
            },
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: `${ACCENT_COLOR}20` }]}>
              <MaterialCommunityIcons name="tag-outline" size={24} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={2}>
                {params.categoryName || category.name}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {category.duas.length} dua{category.duas.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Search bar */}
        {category.duas.length > 5 && (
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search duas..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Breadcrumb */}
        <View style={styles.breadcrumbContainer}>
          <TouchableOpacity onPress={() => router.navigate('/(tabs)/sunnah/duas/categories')}>
            <Text style={[styles.breadcrumbLink, { color: colors.accent }]}>Categories</Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
          <Text style={[styles.breadcrumbCurrent, { color: colors.textSecondary }]} numberOfLines={1}>
            {category.name}
          </Text>
        </View>

        {/* Dua list */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {filteredDuas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="magnify" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No duas found matching your search.
              </Text>
            </View>
          ) : (
            filteredDuas.map((dua, index) => (
              <TouchableOpacity
                key={dua.id || index}
                style={[
                  styles.duaCard,
                  {
                    backgroundColor: colors.duaCard,
                    borderColor: colors.duaCardBorder,
                  },
                ]}
                onPress={() => handleDuaPress(dua)}
                activeOpacity={0.7}
              >
                <View style={styles.duaCardContent}>
                  <View style={[styles.duaNumber, { backgroundColor: `${ACCENT_COLOR}15` }]}>
                    <Text style={[styles.duaNumberText, { color: colors.accent }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.duaInfo}>
                    <Text style={[styles.duaTitle, { color: colors.text }]} numberOfLines={3}>
                      {dua.title}
                    </Text>
                    <View style={styles.duaLinkRow}>
                      <MaterialCommunityIcons
                        name="open-in-new"
                        size={14}
                        color={colors.linkColor}
                      />
                      <Text style={[styles.duaLinkText, { color: colors.linkColor }]}>
                        Open on Duas.com
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.duaNumber} />
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.openSourceButton, { borderColor: colors.accent }]}
              onPress={() => openExternalUrl(category.sourceUrl)}
            >
              <MaterialCommunityIcons name="open-in-new" size={16} color={colors.accent} />
              <Text style={[styles.openSourceText, { color: colors.accent }]}>
                View on Duas.com
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 12,
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
    gap: 12,
    marginLeft: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },

  // Breadcrumb
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  breadcrumbLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  breadcrumbCurrent: {
    fontSize: 13,
    flex: 1,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Dua card
  duaCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  duaCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  duaNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  duaNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  duaInfo: {
    flex: 1,
  },
  duaTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
  duaLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duaLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Empty state
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

  // Footer
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  openSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  openSourceText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
