import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SeerahCategory, CATEGORY_CONFIGS, FilterState } from '@/types/seerahMap.d';
import { useSettings } from '@/store/settingsStore';
import { useSeerahMapStore } from '@/store/seerahMapStore';

interface FilterChipsProps {
  onSearch: (query: string) => void;
  eventCounts: Record<SeerahCategory, number>;
  locationCounts: Record<string, number>;
}

const LOCATIONS = [
  { key: 'mecque', label: 'Mecque', labelFr: 'La Mecque' },
  { key: 'médine', label: 'Médine', labelFr: 'Médine' },
  { key: 'taif', label: 'Taïf', labelFr: 'Taïf' },
  { key: 'badr', label: 'Badr', labelFr: 'Badr' },
  { key: 'uhud', label: 'Uhud', labelFr: 'Uhud' },
];

export const FilterChips: React.FC<FilterChipsProps> = ({
  onSearch,
  eventCounts,
  locationCounts,
}) => {
  const { darkMode, language } = useSettings();
  const { filters, setFilters, clearFilters, filteredEvents, events } = useSeerahMapStore();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchWidthAnim = useRef(new Animated.Value(48)).current;
  const inputRef = useRef<TextInput>(null);

  const colors = {
    background: darkMode ? 'rgba(26, 26, 46, 0.85)' : 'rgba(255, 255, 255, 0.85)',
    chip: darkMode ? '#252540' : '#ffffff',
    chipActive: '#0D5C63',
    chipBorder: darkMode ? '#3a3a55' : '#e5e5e5',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#0D5C63',
    secondary: '#C4A35A',
    search: darkMode ? '#1e1e2d' : '#f5f5f5',
  };

  const toggleSearch = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const expanding = !isSearchExpanded;
    setIsSearchExpanded(expanding);

    Animated.spring(searchWidthAnim, {
      toValue: expanding ? 200 : 48,
      friction: 8,
      tension: 100,
      useNativeDriver: false,
    }).start(() => {
      if (expanding) {
        inputRef.current?.focus();
      } else {
        setSearchQuery('');
        onSearch('');
      }
    });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setFilters({ searchQuery: text });
    onSearch(text);
  };

  const toggleCategory = (category: SeerahCategory) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const currentCategories = filters.categories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    setFilters({ categories: newCategories });
  };

  const toggleLocation = (location: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const currentLocations = filters.locations;
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter(l => l !== location)
      : [...currentLocations, location];

    setFilters({ locations: newLocations });
  };

  const toggleShowUnvisited = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFilters({ showOnlyUnvisited: !filters.showOnlyUnvisited });
  };

  const toggleShowFavorites = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFilters({ showOnlyFavorites: !filters.showOnlyFavorites });
  };

  const handleClearFilters = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    clearFilters();
    setSearchQuery('');
    onSearch('');
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.locations.length > 0 ||
    filters.showOnlyUnvisited ||
    filters.showOnlyFavorites ||
    searchQuery.length > 0;

  const categories = Object.values(CATEGORY_CONFIGS);

  return (
    <View style={styles.container}>
      {/* Search and filter pill */}
      <View style={[styles.searchPillContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.searchPill, { width: searchWidthAnim, backgroundColor: colors.search }]}>
          <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
            <Ionicons
              name={isSearchExpanded ? 'close' : 'search'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
          {isSearchExpanded && (
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          )}
        </Animated.View>

        {/* Result count */}
        <View style={styles.resultCount}>
          <Text style={[styles.resultCountText, { color: colors.textSecondary }]}>
            {filteredEvents.length}/{events.length} événements
          </Text>
        </View>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: colors.secondary }]}
            onPress={handleClearFilters}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsContainer}
        contentContainerStyle={styles.chipsContent}
      >
        {/* Category chips */}
        {categories.map(category => {
          const isActive = filters.categories.includes(category.id);
          const count = eventCounts[category.id] || 0;

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? category.color : colors.chip,
                  borderColor: isActive ? category.color : colors.chipBorder,
                },
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <FontAwesome5
                name={category.icon === 'kaaba' ? 'kaaba' : category.icon}
                size={12}
                color={isActive ? '#fff' : category.color}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? '#fff' : colors.text },
                ]}
              >
                {language === 'ar' ? category.labelAr : language === 'en' ? category.label : category.labelFr}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : `${category.color}20` },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: isActive ? '#fff' : category.color },
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.chipBorder }]} />

        {/* Location chips */}
        {LOCATIONS.map(location => {
          const isActive = filters.locations.includes(location.key);
          const count = locationCounts[location.key] || 0;

          if (count === 0) return null;

          return (
            <TouchableOpacity
              key={location.key}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.secondary : colors.chip,
                  borderColor: isActive ? colors.secondary : colors.chipBorder,
                },
              ]}
              onPress={() => toggleLocation(location.key)}
            >
              <FontAwesome5
                name="map-marker-alt"
                size={12}
                color={isActive ? '#fff' : colors.secondary}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? '#fff' : colors.text },
                ]}
              >
                {location.labelFr}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : `${colors.secondary}20` },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: isActive ? '#fff' : colors.secondary },
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.chipBorder }]} />

        {/* Special filters */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: filters.showOnlyUnvisited ? colors.primary : colors.chip,
              borderColor: filters.showOnlyUnvisited ? colors.primary : colors.chipBorder,
            },
          ]}
          onPress={toggleShowUnvisited}
        >
          <FontAwesome5
            name="eye-slash"
            size={12}
            color={filters.showOnlyUnvisited ? '#fff' : colors.primary}
          />
          <Text
            style={[
              styles.chipText,
              { color: filters.showOnlyUnvisited ? '#fff' : colors.text },
            ]}
          >
            Non visités
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: filters.showOnlyFavorites ? '#E91E63' : colors.chip,
              borderColor: filters.showOnlyFavorites ? '#E91E63' : colors.chipBorder,
            },
          ]}
          onPress={toggleShowFavorites}
        >
          <FontAwesome5
            name="heart"
            size={12}
            color={filters.showOnlyFavorites ? '#fff' : '#E91E63'}
            solid={filters.showOnlyFavorites}
          />
          <Text
            style={[
              styles.chipText,
              { color: filters.showOnlyFavorites ? '#fff' : colors.text },
            ]}
          >
            Favoris
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Search suggestions */}
      {isSearchExpanded && searchQuery.length === 0 && (
        <View style={[styles.suggestions, { backgroundColor: colors.background }]}>
          <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
            Essayez :
          </Text>
          {['Bataille de Badr', 'Révélation', 'Hijra', 'Naissance'].map(suggestion => (
            <TouchableOpacity
              key={suggestion}
              style={[styles.suggestionChip, { backgroundColor: colors.chip, borderColor: colors.chipBorder }]}
              onPress={() => handleSearch(suggestion)}
            >
              <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  searchPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8,
    borderRadius: 16,
    gap: 12,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchButton: {
    width: 48,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    paddingRight: 12,
  },
  resultCount: {
    flex: 1,
  },
  resultCountText: {
    fontSize: 12,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContainer: {
    maxHeight: 44,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 4,
  },
  suggestions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  suggestionsTitle: {
    fontSize: 12,
  },
  suggestionChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
  },
});
