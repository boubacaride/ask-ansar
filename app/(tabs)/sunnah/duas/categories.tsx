import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { getAllLetterGroups, searchCategories, getDataStats, LetterGroup, DuasComCategory } from '@/utils/duasComData';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LETTER_BAR_COLOR = '#8DB600'; // Olive green matching Duas.com
const LETTER_BAR_COLOR_DARK = '#6B8E23';

export default function DuasComCategoriesScreen() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const [expandedLetters, setExpandedLetters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DuasComCategory[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const letterGroups = getAllLetterGroups();
  const stats = getDataStats();

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f0f0f0',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    letterBar: darkMode ? LETTER_BAR_COLOR_DARK : LETTER_BAR_COLOR,
    letterBarText: '#ffffff',
    letterBadge: '#ffffff',
    letterBadgeText: darkMode ? '#333' : '#333',
    categoryRow: darkMode ? '#1a1a2a' : '#f8f8f8',
    categoryRowBorder: darkMode ? '#2a2a3a' : '#e8e8e8',
    categoryText: darkMode ? '#d0d0d0' : '#444444',
    primary: '#00796b',
    accent: '#8DB600',
    inputBg: darkMode ? '#252538' : '#ffffff',
    inputBorder: darkMode ? '#3d3d5c' : '#cccccc',
    duaCount: darkMode ? '#808090' : '#999999',
  };

  const toggleLetter = useCallback((letter: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLetters(prev => {
      const next = new Set(prev);
      if (next.has(letter)) {
        next.delete(letter);
      } else {
        next.add(letter);
      }
      return next;
    });
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const results = searchCategories(text);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, []);

  const handleCategoryPress = useCallback((category: DuasComCategory) => {
    router.push({
      pathname: '/(tabs)/sunnah/duas/duascom-category',
      params: {
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
      },
    });
  }, []);

  const scrollToLetter = useCallback((letter: string) => {
    // Expand the letter and scroll to it
    setExpandedLetters(prev => {
      const next = new Set(prev);
      next.add(letter);
      return next;
    });
  }, []);

  const renderLetterStrip = () => {
    const activeLetters = letterGroups
      .filter(g => g.categories.length > 0)
      .map(g => g.letter);

    return (
      <View style={styles.letterStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.letterStripContent}
        >
          {letterGroups.map(group => {
            const isActive = group.categories.length > 0;
            const isExpanded = expandedLetters.has(group.letter);
            return (
              <TouchableOpacity
                key={group.letter}
                style={[
                  styles.letterChip,
                  {
                    backgroundColor: isExpanded
                      ? colors.letterBar
                      : isActive
                      ? (darkMode ? '#2a2a3a' : '#e8e8e8')
                      : 'transparent',
                    borderColor: isActive
                      ? (darkMode ? '#3a3a4a' : '#d0d0d0')
                      : 'transparent',
                  },
                ]}
                onPress={() => isActive && toggleLetter(group.letter)}
                disabled={!isActive}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.letterChipText,
                    {
                      color: isExpanded
                        ? '#ffffff'
                        : isActive
                        ? colors.text
                        : (darkMode ? '#444' : '#ccc'),
                      fontWeight: isExpanded ? '700' : '600',
                    },
                  ]}
                >
                  {group.letter.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderSearchResults = () => {
    if (searchQuery.trim().length === 0) return null;

    return (
      <View style={styles.searchResultsContainer}>
        <Text style={[styles.searchResultsTitle, { color: colors.textSecondary }]}>
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
        </Text>
        {searchResults.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.searchResultRow,
              {
                backgroundColor: colors.categoryRow,
                borderColor: colors.categoryRowBorder,
              },
            ]}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: colors.categoryText }]}>
                {category.name}
              </Text>
              <Text style={[styles.duaCountText, { color: colors.duaCount }]}>
                {category.duas.length} dua{category.duas.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.duaCount} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderLetterGroup = (group: LetterGroup) => {
    const isExpanded = expandedLetters.has(group.letter);
    const hasCategories = group.categories.length > 0;

    if (!hasCategories) return null;

    return (
      <View key={group.letter} style={styles.letterGroup}>
        {/* Letter accordion bar */}
        <TouchableOpacity
          style={[styles.letterBar, { backgroundColor: colors.letterBar }]}
          onPress={() => toggleLetter(group.letter)}
          activeOpacity={0.8}
        >
          <View style={styles.letterBarLeft}>
            <View style={styles.letterBadge}>
              <Text style={[styles.letterBadgeText, { color: colors.letterBadgeText }]}>
                {group.letter.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.letterBarTitle, { color: colors.letterBarText }]}>
              {group.categories.length} categor{group.categories.length !== 1 ? 'ies' : 'y'}
            </Text>
          </View>
          <View style={[styles.expandIcon, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#ffffff"
            />
          </View>
        </TouchableOpacity>

        {/* Category rows (expanded content) */}
        {isExpanded && (
          <View style={styles.categoriesContainer}>
            {group.categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryRow,
                  {
                    backgroundColor: colors.categoryRow,
                    borderBottomColor: colors.categoryRowBorder,
                    borderBottomWidth: index < group.categories.length - 1 ? 1 : 0,
                  },
                ]}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: colors.categoryText }]}>
                    {category.name}
                  </Text>
                  <Text style={[styles.duaCountText, { color: colors.duaCount }]}>
                    {category.duas.length} dua{category.duas.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.duaCount} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: `${LETTER_BAR_COLOR}20` }]}>
              <MaterialCommunityIcons name="format-list-bulleted" size={26} color={colors.accent} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Duas.com Categories</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {stats.totalCategories} categories {'\u00B7'} {stats.totalDuas} duas
              </Text>
            </View>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search categories..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* A-Z Letter strip */}
        {renderLetterStrip()}

        {/* Main content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {searchQuery.trim().length > 0 ? (
            renderSearchResults()
          ) : (
            <>
              {/* Breadcrumb */}
              <View style={styles.breadcrumb}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={[styles.breadcrumbLink, { color: colors.accent }]}>Dou'as</Text>
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                <Text style={[styles.breadcrumbCurrent, { color: colors.textSecondary }]}>
                  Categories A-Z
                </Text>
              </View>

              {/* Letter groups */}
              {letterGroups.map(group => renderLetterGroup(group))}

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.duaCount }]}>
                  Data sourced from Duas.com
                </Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/sunnah/duas/duascom-webview', params: { url: 'https://duas.com', title: 'Duas.com' } })}>
                  <Text style={[styles.footerLink, { color: colors.accent }]}>
                    Visit Duas.com {'\u2197'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
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
    fontSize: 19,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
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

  // Letter strip
  letterStrip: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  letterStripContent: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
  },
  letterChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  letterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    marginTop: 4,
  },
  breadcrumbLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  breadcrumbCurrent: {
    fontSize: 13,
  },

  // Letter group
  letterGroup: {
    marginBottom: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  letterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  letterBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  letterBarTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Category rows
  categoriesContainer: {
    borderRadius: 0,
    overflow: 'hidden',
    marginTop: -4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    paddingLeft: 56,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  duaCountText: {
    fontSize: 12,
  },

  // Search results
  searchResultsContainer: {
    marginTop: 8,
  },
  searchResultsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },

  // Footer
  footer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 6,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
  },
});
