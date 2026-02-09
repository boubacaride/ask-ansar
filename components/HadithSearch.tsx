import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HadithData {
  hadithnumber: string;
  text: string;
  grades?: Array<{ name: string; grade: string }>;
  reference?: {
    book: number;
    hadith: number;
  };
}

interface HadithCollection {
  metadata: {
    name: string;
    section: {
      [key: string]: {
        hadithnumber: string;
        arabicnumber: string;
        text: string;
      };
    };
  };
  hadiths: HadithData[];
}

interface SearchResult extends HadithData {
  collectionId: string;
  collectionName: string;
}

interface HadithSearchProps {
  darkMode: boolean;
}

const COLLECTION_FILTERS = [
  {
    id: 'all',
    name: 'Toutes les collections',
    color: '#0d9488',
    author: '',
    hadithCount: 0,
    description: 'Rechercher dans toutes les collections de hadiths'
  },
  {
    id: 'bukhari',
    name: 'Sahih al-Boukhari',
    color: '#c9a227',
    fullName: 'Sahih al-Boukhari',
    author: 'Imam al-Boukhari',
    hadithCount: 7563,
    description: 'La collection la plus authentique'
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    color: '#c9a227',
    fullName: 'Sahih Muslim',
    author: 'Imam Muslim',
    hadithCount: 7563,
    description: 'Deuxième collection la plus authentique'
  },
  {
    id: 'tirmidhi',
    name: 'Jami at-Tirmidhi',
    color: '#3f51b5',
    fullName: 'Jami at-Tirmidhi',
    author: 'Imam at-Tirmidhi',
    hadithCount: 3956,
    description: 'Collection des Sunan'
  },
  {
    id: 'abudawud',
    name: 'Sunan Abou Dawoud',
    color: '#9c27b0',
    fullName: 'Sunan Abou Dawoud',
    author: 'Imam Abou Dawoud',
    hadithCount: 5274,
    description: 'Collection spécialisée en jurisprudence'
  },
  {
    id: 'nasai',
    name: "Sunan an-Nasa'i",
    color: '#673ab7',
    fullName: "Sunan an-Nasa'i",
    author: "Imam an-Nasa'i",
    hadithCount: 5761,
    description: 'Collection rigoureuse des Sunan'
  },
  {
    id: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    color: '#e91e63',
    fullName: 'Sunan Ibn Majah',
    author: 'Imam Ibn Majah',
    hadithCount: 4341,
    description: 'Sixième livre des Sunan'
  },
];

const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const CACHE_PREFIX = 'hadith_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export function HadithSearch({ darkMode }: HadithSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [cachedCollections, setCachedCollections] = useState<Map<string, HadithData[]>>(new Map());
  const [loadingProgress, setLoadingProgress] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    accent: '#c9a227',
    error: '#dc2626',
    border: darkMode ? '#2d2d44' : '#e0e0e0',
    inputBg: darkMode ? '#252538' : '#f5f5f5',
    inputBorder: darkMode ? '#3d3d5c' : '#ced4da',
  };

  const loadCachedData = async (collectionId: string): Promise<HadithData[] | null> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${collectionId}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return data;
        }
      }
    } catch (err) {
      console.log('Cache read error:', err);
    }
    return null;
  };

  const saveCachedData = async (collectionId: string, data: HadithData[]) => {
    try {
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${collectionId}`,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (err) {
      console.log('Cache write error:', err);
    }
  };

  const fetchCollection = async (collectionId: string): Promise<HadithData[]> => {
    if (cachedCollections.has(collectionId)) {
      return cachedCollections.get(collectionId)!;
    }

    const cachedData = await loadCachedData(collectionId);
    if (cachedData) {
      setCachedCollections((prev) => new Map(prev).set(collectionId, cachedData));
      return cachedData;
    }

    setLoadingProgress(`Chargement de ${collectionId}...`);

    let response = await fetch(`${HADITH_API_BASE}/editions/fra-${collectionId}.json`);

    if (!response.ok) {
      setLoadingProgress(`Version française non disponible, chargement en arabe...`);
      response = await fetch(`${HADITH_API_BASE}/editions/ara-${collectionId}.json`);

      if (!response.ok) {
        throw new Error(`Erreur de chargement: ${collectionId}`);
      }
    }

    const data = await response.json();
    const hadiths: HadithData[] = data.hadiths || [];

    setCachedCollections((prev) => new Map(prev).set(collectionId, hadiths));
    await saveCachedData(collectionId, hadiths);

    return hadiths;
  };

  const searchHadiths = useCallback(
    async (query: string) => {
      if (query.trim().length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      setLoadingProgress('Recherche en cours...');

      try {
        const searchTerm = query.toLowerCase().trim();
        const collectionsToSearch =
          selectedFilter === 'all'
            ? COLLECTION_FILTERS.filter((c) => c.id !== 'all')
            : COLLECTION_FILTERS.filter((c) => c.id === selectedFilter);

        const allResults: SearchResult[] = [];

        for (const collection of collectionsToSearch) {
          try {
            const hadiths = await fetchCollection(collection.id);

            const filtered = hadiths
              .filter((hadith) => hadith.text && hadith.text.toLowerCase().includes(searchTerm))
              .slice(0, 20)
              .map((hadith) => ({
                ...hadith,
                collectionId: collection.id,
                collectionName: collection.fullName || collection.name,
              }));

            allResults.push(...filtered);

            if (allResults.length >= 50) break;
          } catch (err) {
            console.log(`Error loading ${collection.id}:`, err);
          }
        }

        setResults(allResults.slice(0, 50));
      } catch (err) {
        console.error('Search error:', err);
        setError('Erreur lors de la recherche. Veuillez réessayer.');
      } finally {
        setLoading(false);
        setLoadingProgress('');
      }
    },
    [selectedFilter, cachedCollections]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchHadiths(searchQuery);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchHadiths]);

  const handleCopy = async (hadith: SearchResult) => {
    let text = hadith.text;
    text += `\n\n[${hadith.collectionName} - Hadith nº${hadith.hadithnumber}]`;
    await Clipboard.setStringAsync(text);
  };

  const getCollectionColor = (collectionId: string): string => {
    const collection = COLLECTION_FILTERS.find((c) => c.id === collectionId);
    return collection?.color || colors.primary;
  };

  const getSelectedCollection = () => {
    return COLLECTION_FILTERS.find((c) => c.id === selectedFilter) || COLLECTION_FILTERS[0];
  };

  const handleSelectCollection = (collectionId: string) => {
    setSelectedFilter(collectionId);
    setShowDropdown(false);
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {loadingProgress || 'Recherche en cours...'}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      );
    }

    if (searchQuery.trim() && results.length === 0 && !loading) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={48} color={colors.textSecondary} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            Aucun résultat trouvé
          </Text>
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            Essayez d'autres mots-clés ou filtres
          </Text>
        </View>
      );
    }

    if (!searchQuery.trim()) {
      return (
        <View style={styles.centerContainer}>
          <FontAwesome5 name="search" size={48} color={colors.textSecondary} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            Recherchez des hadiths
          </Text>
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            Tapez au moins 3 caractères pour commencer
          </Text>
          <View style={styles.examplesContainer}>
            <Text style={[styles.exampleTitle, { color: colors.text }]}>Exemples de recherche:</Text>
            <Text style={[styles.exampleText, { color: colors.textSecondary }]}>• prière</Text>
            <Text style={[styles.exampleText, { color: colors.textSecondary }]}>• charité</Text>
            <Text style={[styles.exampleText, { color: colors.textSecondary }]}>• foi</Text>
            <Text style={[styles.exampleText, { color: colors.textSecondary }]}>• paradis</Text>
          </View>
        </View>
      );
    }

    return (
      <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
          </Text>

          {results.map((hadith, index) => {
            const collectionColor = getCollectionColor(hadith.collectionId);

            return (
              <View
                key={`${hadith.collectionId}-${hadith.hadithnumber}-${index}`}
                style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                  <View style={[styles.collectionBadge, { backgroundColor: `${collectionColor}20` }]}>
                    <Text style={[styles.collectionBadgeText, { color: collectionColor }]}>
                      {hadith.collectionName}
                    </Text>
                  </View>
                  <Text style={[styles.hadithNumber, { color: colors.primary }]}>#{hadith.hadithnumber}</Text>
                </View>

                <View style={styles.textSection}>
                  <Text style={[styles.hadithText, { color: colors.text }]}>
                    {hadith.text}
                  </Text>
                </View>

                {hadith.grades && hadith.grades.length > 0 && (
                  <View style={[styles.gradesSection, { backgroundColor: colors.background }]}>
                    <FontAwesome5 name="certificate" size={12} color={colors.textSecondary} />
                    <Text style={[styles.gradeText, { color: colors.textSecondary }]}>
                      {hadith.grades[0].name}: {hadith.grades[0].grade}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.copyButton, { borderTopColor: colors.border }]}
                  onPress={() => handleCopy(hadith)}
                >
                  <Ionicons name="copy-outline" size={18} color={colors.primary} />
                  <Text style={[styles.copyButtonText, { color: colors.primary }]}>Copier</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {results.length >= 50 && (
            <View style={[styles.limitNotice, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.limitText, { color: colors.textSecondary }]}>
                Affichage limité à 50 résultats. Affinez votre recherche pour plus de précision.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const selectedCollection = getSelectedCollection();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher des hadiths..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.dropdownContainer}>
          <Text style={[styles.dropdownLabel, { color: colors.textSecondary }]}>Collection:</Text>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            onPress={() => setShowDropdown(true)}
          >
            <View style={styles.dropdownContent}>
              <View style={[styles.dropdownColorDot, { backgroundColor: selectedCollection.color }]} />
              <Text style={[styles.dropdownText, { color: colors.text }]} numberOfLines={1}>
                {selectedCollection.name}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {renderSearchResults()}

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sélectionner une collection</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {COLLECTION_FILTERS.map((collection) => {
                const isSelected = selectedFilter === collection.id;
                return (
                  <TouchableOpacity
                    key={collection.id}
                    style={[
                      styles.collectionItem,
                      { borderBottomColor: colors.border },
                      isSelected && { backgroundColor: `${collection.color}10` }
                    ]}
                    onPress={() => handleSelectCollection(collection.id)}
                  >
                    <View style={styles.collectionItemLeft}>
                      <View style={[styles.collectionColorIndicator, { backgroundColor: collection.color }]} />
                      <View style={styles.collectionItemContent}>
                        <Text style={[styles.collectionItemName, { color: colors.text }]}>
                          {collection.name}
                        </Text>
                        {collection.author && (
                          <Text style={[styles.collectionItemAuthor, { color: colors.textSecondary }]}>
                            Compilé par {collection.author}
                          </Text>
                        )}
                        <Text style={[styles.collectionItemDescription, { color: colors.textSecondary }]}>
                          {collection.description}
                        </Text>
                        {collection.hadithCount > 0 && (
                          <View style={styles.collectionItemStats}>
                            <Ionicons name="book-outline" size={12} color={colors.textSecondary} />
                            <Text style={[styles.collectionItemCount, { color: colors.textSecondary }]}>
                              {collection.hadithCount.toLocaleString('fr-FR')} hadiths
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={collection.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  dropdownContainer: {
    gap: 6,
  },
  dropdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  dropdownColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalScroll: {
    maxHeight: 500,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  collectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  collectionColorIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    minHeight: 48,
  },
  collectionItemContent: {
    flex: 1,
    gap: 4,
  },
  collectionItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  collectionItemAuthor: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  collectionItemDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  collectionItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  collectionItemCount: {
    fontSize: 11,
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
  hintText: {
    fontSize: 14,
    textAlign: 'center',
  },
  examplesContainer: {
    marginTop: 16,
    padding: 16,
    gap: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 13,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  resultsScroll: {
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  gradesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  gradeText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderTopWidth: 1,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  limitNotice: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  limitText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
