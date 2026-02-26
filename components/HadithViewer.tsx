import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Platform,
  FlatList,
  Linking,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSettings } from '@/store/settingsStore';
import {
  getCollectionMetadata,
  getCollectionBooks,
  getBookHadiths,
  TranslatedHadith,
  HadithBook,
  CollectionMetadata,
} from '@/utils/hadithUtils';

interface HadithViewerProps {
  visible: boolean;
  url: string;
  collectionName: string;
  onClose: () => void;
}

type ViewMode = 'books' | 'hadiths';

export function HadithViewer({ visible, url, collectionName, onClose }: HadithViewerProps) {
  const { darkMode } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('books');
  const [collectionId, setCollectionId] = useState<string>('');
  const [metadata, setMetadata] = useState<CollectionMetadata | null>(null);
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [hadiths, setHadiths] = useState<TranslatedHadith[]>([]);
  const [showArabic, setShowArabic] = useState(true);
  const [showFrench, setShowFrench] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState<TranslatedHadith | null>(null);

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
    if (visible && url) {
      console.log('[HadithViewer] Modal opened with URL:', url);
      const extractedCollectionId = extractCollectionIdFromUrl(url);
      console.log('[HadithViewer] Extracted collection ID:', extractedCollectionId);
      setCollectionId(extractedCollectionId);
      setViewMode('books');
      setSelectedBook(null);
      setHadiths([]);
      setBooks([]);
      loadMetadata(extractedCollectionId);
    }
  }, [visible, url]);

  const extractCollectionIdFromUrl = (url: string): string => {
    const match = url.match(/sunnah\.com\/([^/]+)/);
    return match ? match[1] : 'bukhari';
  };

  const loadMetadata = async (collectionId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading metadata for collection:', collectionId);

      // Load metadata and book list in parallel
      const [data, bookList] = await Promise.all([
        getCollectionMetadata(collectionId),
        getCollectionBooks(collectionId),
      ]);

      console.log('Metadata loaded:', data, 'Books:', bookList.length);

      if (!data) {
        console.error('No metadata found for collection:', collectionId);
        setError(`Collection "${collectionId}" non trouvée. Veuillez réessayer.`);
        return;
      }

      setMetadata(data);
      setBooks(bookList);
    } catch (err) {
      console.error('Error loading metadata:', err);
      setError('Erreur lors du chargement des métadonnées');
    } finally {
      setLoading(false);
    }
  };

  const loadBookHadiths = async (bookNumber: number) => {
    setLoading(true);
    setError(null);
    setSelectedBook(bookNumber);
    setViewMode('hadiths');

    try {
      const data = await getBookHadiths(collectionId, bookNumber);

      if (!data || data.length === 0) {
        setError('Aucun hadith trouvé pour ce livre. Veuillez réessayer.');
        return;
      }

      setHadiths(data);
    } catch (err) {
      console.error('Error loading book hadiths:', err);
      const errorMessage = err instanceof Error ? err.message : 'Échec du chargement des hadiths';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goBackToBooks = () => {
    setViewMode('books');
    setSelectedBook(null);
    setHadiths([]);
    setError(null);
  };

  const getHadithText = (hadith: TranslatedHadith): string => {
    let text = '';
    if (showArabic && hadith.arabicText) {
      text += hadith.arabicText + '\n\n';
    }
    if (showFrench && hadith.frenchText) {
      text += hadith.frenchText + '\n\n';
    }
    if (showEnglish && hadith.englishText) {
      text += hadith.englishText + '\n\n';
    }
    text += `[${collectionName} - Hadith ${hadith.hadithNumber}]`;
    return text.trim();
  };

  const handleCopyHadith = async (hadith: TranslatedHadith) => {
    const text = getHadithText(hadith);
    await Clipboard.setStringAsync(text);
  };

  const handleSharePress = (hadith: TranslatedHadith) => {
    setSelectedHadith(hadith);
    setShareModalVisible(true);
  };

  const handleShareViaEmail = () => {
    if (!selectedHadith) return;
    const text = getHadithText(selectedHadith);
    const subject = encodeURIComponent(`${collectionName} - Hadith ${selectedHadith.hadithNumber}`);
    const body = encodeURIComponent(text);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
    setShareModalVisible(false);
  };

  const handleShareViaWhatsApp = () => {
    if (!selectedHadith) return;
    const text = getHadithText(selectedHadith);
    const encodedText = encodeURIComponent(text);
    Linking.openURL(`whatsapp://send?text=${encodedText}`);
    setShareModalVisible(false);
  };

  const handleCopyFromModal = async () => {
    if (!selectedHadith) return;
    await handleCopyHadith(selectedHadith);
    setShareModalVisible(false);
  };

  const renderBooksView = () => {
    if (!metadata) return null;

    const displayBooks = books.length > 0
      ? books
      : Array.from({ length: metadata.totalBooks }, (_, i) => ({
          bookNumber: i + 1,
          bookTitle: `Book ${i + 1}`,
          hadithCount: 0,
        }));

    return (
      <View style={styles.booksContainer}>
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <FontAwesome5 name="book" size={20} color={colors.accent} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{displayBooks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Livres</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <FontAwesome5 name="file-alt" size={20} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{metadata.totalHadiths}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hadiths</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sélectionner un livre</Text>

        <FlatList
          data={displayBooks}
          keyExtractor={(item) => `book-${item.bookNumber}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.bookCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => loadBookHadiths(item.bookNumber)}
              activeOpacity={0.7}
            >
              <View style={[styles.bookIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <FontAwesome5 name="book-open" size={20} color={colors.primary} />
              </View>
              <View style={styles.bookTextContainer}>
                <Text style={[styles.bookNumber, { color: colors.accent }]}>Livre {item.bookNumber}</Text>
                {item.bookTitle !== `Book ${item.bookNumber}` && (
                  <Text style={[styles.bookTitle, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.bookTitle}
                  </Text>
                )}
                {item.hadithCount > 0 && (
                  <Text style={[styles.bookHadithCount, { color: colors.textSecondary }]}>
                    {item.hadithCount} hadiths
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.booksListContent}
        />
      </View>
    );
  };

  const renderHadithsView = () => (
    <>
      <View style={[styles.languageToggle, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.toggleButton, showArabic && { backgroundColor: colors.accent }]}
          onPress={() => setShowArabic(!showArabic)}
        >
          <Text style={[styles.toggleText, { color: showArabic ? '#fff' : colors.text }]}>Arabe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showFrench && { backgroundColor: colors.primary }]}
          onPress={() => setShowFrench(!showFrench)}
        >
          <Text style={[styles.toggleText, { color: showFrench ? '#fff' : colors.text }]}>Français</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showEnglish && { backgroundColor: colors.primary }]}
          onPress={() => setShowEnglish(!showEnglish)}
        >
          <Text style={[styles.toggleText, { color: showEnglish ? '#fff' : colors.text }]}>English</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hadiths.map((hadith, index) => (
          <View
            key={`${hadith.hadithNumber}-${index}`}
            style={[styles.hadithCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.hadithHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.hadithNumber, { color: colors.accent }]}>Hadith {hadith.hadithNumber}</Text>
              {hadith.reference && (
                <Text style={[styles.reference, { color: colors.textSecondary }]}>{hadith.reference}</Text>
              )}
            </View>

            {showArabic && hadith.arabicText && (
              <View style={styles.textSection}>
                <Text style={[styles.arabicText, { color: colors.text }]}>{hadith.arabicText}</Text>
              </View>
            )}

            {showFrench && hadith.frenchText && (
              <View style={styles.textSection}>
                <Text style={[styles.label, { color: colors.primary }]}>Traduction française</Text>
                <Text style={[styles.translationText, { color: colors.text }]}>{hadith.frenchText}</Text>
              </View>
            )}

            {showEnglish && hadith.englishText && (
              <View style={styles.textSection}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>English</Text>
                <Text style={[styles.translationText, { color: colors.textSecondary }]}>{hadith.englishText}</Text>
              </View>
            )}

            {(hadith.book || hadith.chapter) && (
              <View style={[styles.metadata, { backgroundColor: colors.background }]}>
                {hadith.book && (
                  <Text style={[styles.metadataText, { color: colors.textSecondary }]}>Livre: {hadith.book}</Text>
                )}
                {hadith.chapter && (
                  <Text style={[styles.metadataText, { color: colors.textSecondary }]}>Chapitre: {hadith.chapter}</Text>
                )}
              </View>
            )}

            <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCopyHadith(hadith)}
              >
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Copier</Text>
              </TouchableOpacity>
              <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSharePress(hadith)}
              >
                <Ionicons name="share-outline" size={20} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );

  console.log('[HadithViewer] Render - viewMode:', viewMode, 'loading:', loading, 'error:', error, 'metadata:', metadata);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={viewMode === 'hadiths' ? goBackToBooks : onClose}
            style={styles.closeButton}
          >
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {viewMode === 'hadiths' ? `${collectionName} - Livre ${selectedBook}` : collectionName}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {viewMode === 'books' ? 'Chargement...' : 'Chargement et traduction des hadiths...'}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={viewMode === 'hadiths' && selectedBook ? () => loadBookHadiths(selectedBook) : () => loadMetadata(collectionId)}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && viewMode === 'books' && renderBooksView()}
        {!loading && !error && viewMode === 'hadiths' && hadiths.length > 0 && renderHadithsView()}

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
              <Text style={[styles.shareModalTitle, { color: colors.text }]}>Partager le hadith</Text>

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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  booksContainer: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  booksListContent: {
    paddingBottom: 24,
  },
  bookRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  bookIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTextContainer: {
    flex: 1,
  },
  bookNumber: {
    fontSize: 15,
    fontWeight: '600',
  },
  bookTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  bookHadithCount: {
    fontSize: 12,
    marginTop: 2,
  },
  languageToggle: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  hadithCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  hadithHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  hadithNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  reference: {
    fontSize: 13,
  },
  textSection: {
    padding: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  arabicText: {
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  metadata: {
    padding: 12,
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionDivider: {
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
});
