import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Share,
  Alert,
  Linking,
  TextInput,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome5 } from '@expo/vector-icons';
import { seerahUtils, SeerahNote } from '@/utils/seerahUtils';
import { useAuth } from '@/hooks/useAuth';
import { BookmarksPanel } from './BookmarksPanel';
import SeerahAtlasScreen from './SeerahAtlasScreen';

interface SeerahReaderProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export function SeerahReader({ visible, onClose, darkMode }: SeerahReaderProps) {
  const { user } = useAuth();
  const [nightMode, setNightMode] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [lastPage, setLastPage] = useState(13);
  const [notes, setNotes] = useState<SeerahNote[]>([]);
  const [editingNote, setEditingNote] = useState<SeerahNote | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNotePageNumber, setNewNotePageNumber] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  const [currentPage, setCurrentPage] = useState(13);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showInAppAtlas, setShowInAppAtlas] = useState(false);
  const notesScrollViewRef = useRef<ScrollView>(null);

  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

  const colors = {
    background: nightMode ? '#0a0a0a' : '#f8f9fa',
    card: nightMode ? '#1e1e2d' : '#ffffff',
    cardSecondary: nightMode ? '#2a2a3d' : '#f0f0f5',
    text: nightMode ? '#ffffff' : '#1a1a2e',
    textSecondary: nightMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    accent: '#c9a227',
    border: nightMode ? '#3a3a4d' : '#e0e0e8',
  };


  useEffect(() => {
    if (visible && user) {
      loadLastPage();
      loadNightModePreference();
      loadNotes();
    }
  }, [visible, user]);

  const loadLastPage = async () => {
    const page = await seerahUtils.getLastPage(user?.id);
    setLastPage(page);
  };

  const loadNightModePreference = async () => {
    const prefs = await seerahUtils.getPreferences(user?.id);
    if (prefs.night_mode !== undefined) {
      setNightMode(prefs.night_mode);
    }
  };

  const loadNotes = async () => {
    if (user) {
      const userNotes = await seerahUtils.getNotes(user.id);
      setNotes(userNotes);
    }
  };

  const handleToggleNightMode = async () => {
    const newNightMode = !nightMode;
    setNightMode(newNightMode);

    if (user) {
      await seerahUtils.savePreferences({ night_mode: newNightMode }, user.id);
    }
  };

  const handleOpenBook = async (pageNumber?: number) => {
    const targetPage = pageNumber || lastPage;
    const url = seerahUtils.getArchiveUrl(targetPage);

    if (isNative) {
      setCurrentPage(targetPage);
      setShowWebView(true);
      setWebViewLoading(true);
      if (user) {
        await seerahUtils.saveLastPage(targetPage, user.id);
      }
    } else {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        if (user) {
          await seerahUtils.saveLastPage(targetPage, user.id);
        }
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
      }
    }
  };

  const handleCloseWebView = () => {
    setShowWebView(false);
    setWebViewLoading(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Le Nectar Cacheté - La biographie complète du Prophète Muhammad ﷺ\n${seerahUtils.getArchiveUrl(lastPage)}`,
        title: 'Le Nectar Cacheté',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddNote = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour ajouter des notes');
      return;
    }

    if (!newNoteText.trim() || !newNotePageNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le numéro de page et la note');
      return;
    }

    const pageNum = parseInt(newNotePageNumber, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de page valide');
      return;
    }

    Keyboard.dismiss();
    const note = await seerahUtils.addNote(pageNum, newNoteText.trim(), user.id);
    if (note) {
      setNotes([note, ...notes]);
      setNewNoteText('');
      setNewNotePageNumber('');
      Alert.alert('Succès', 'Note ajoutée avec succès');
      notesScrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    Keyboard.dismiss();
    const success = await seerahUtils.updateNote(editingNote.id, newNoteText.trim());
    if (success) {
      setNotes(notes.map(n => n.id === editingNote.id ? { ...n, note_text: newNoteText.trim() } : n));
      setEditingNote(null);
      setNewNoteText('');
      Alert.alert('Succès', 'Note mise à jour');
      notesScrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert(
      'Supprimer la note',
      'Êtes-vous sûr de vouloir supprimer cette note?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await seerahUtils.deleteNote(noteId);
            if (success) {
              setNotes(notes.filter(n => n.id !== noteId));
            }
          },
        },
      ]
    );
  };

  const handleEditNote = (note: SeerahNote) => {
    setEditingNote(note);
    setNewNoteText(note.note_text);
  };

  const tableOfContents = seerahUtils.getTableOfContents();

  if (showWebView && isNative) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => {
          handleCloseWebView();
          onClose();
        }}
        statusBarTranslucent
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleCloseWebView} style={styles.headerButton}>
              <FontAwesome5 name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: colors.text }]}>Le Nectar Cacheté</Text>

            <TouchableOpacity onPress={() => setShowBookmarks(true)} style={styles.headerButton}>
              <FontAwesome5 name="bookmark" size={18} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {webViewLoading && (
            <View style={styles.webViewLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.webViewLoadingText, { color: colors.textSecondary }]}>
                Chargement de la page {currentPage}...
              </Text>
            </View>
          )}

          <WebView
            source={{ uri: seerahUtils.getArchiveUrl(currentPage) }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error: ', nativeEvent);
              Alert.alert('Erreur', 'Impossible de charger la page');
            }}
          />
        </View>

        <BookmarksPanel
          visible={showBookmarks}
          onClose={() => setShowBookmarks(false)}
          onSelectBookmark={(page) => {
            setCurrentPage(page);
            setShowBookmarks(false);
          }}
          darkMode={nightMode}
        />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <FontAwesome5 name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>Le Nectar Cacheté</Text>

          <TouchableOpacity onPress={handleToggleNightMode} style={styles.headerButton}>
            <FontAwesome5 name={nightMode ? 'sun' : 'moon'} size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.bookCard, { backgroundColor: colors.card }]}>
            <View style={[styles.bookIcon, { backgroundColor: colors.primary }]}>
              <FontAwesome5 name="book-open" size={48} color="#ffffff" />
            </View>

            <Text style={[styles.bookTitle, { color: colors.text }]}>Le Nectar Cacheté</Text>
            <Text style={[styles.bookSubtitle, { color: colors.accent }]}>الرحيق المختوم</Text>

            <Text style={[styles.bookDescription, { color: colors.textSecondary }]}>
              La biographie complète du Prophète Muhammad ﷺ{'\n'}
              par Safi-ur-Rahman Al-Mubarakpuri
            </Text>

            <View style={styles.bookDetails}>
              <View style={styles.detailItem}>
                <FontAwesome5 name="file-alt" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>748 pages</Text>
              </View>
              <View style={styles.detailItem}>
                <FontAwesome5 name="language" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>Français</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.readButton, { backgroundColor: colors.primary }]}
              onPress={() => handleOpenBook()}
            >
              <FontAwesome5 name="book-reader" size={20} color="#ffffff" />
              <Text style={styles.readButtonText}>Lire le livre</Text>
            </TouchableOpacity>

            {lastPage > 13 && (
              <Text style={[styles.continueText, { color: colors.textSecondary }]}>
                Reprendre à la page {lastPage}
              </Text>
            )}
          </View>

          <View style={styles.featuresGrid}>
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: colors.card }]}
              onPress={() => setShowTOC(true)}
            >
              <FontAwesome5 name="list" size={28} color={colors.primary} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>Table des matières</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {tableOfContents.length} chapitres
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: colors.card }]}
              onPress={() => {
                if (!user) {
                  Alert.alert('Connexion requise', 'Veuillez vous connecter pour accéder aux signets');
                  return;
                }
                setShowBookmarks(true);
              }}
            >
              <FontAwesome5 name="bookmark" size={28} color={colors.accent} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>Mes Signets</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Pages sauvegardées
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: colors.card }]}
              onPress={() => {
                if (!user) {
                  Alert.alert('Connexion requise', 'Veuillez vous connecter pour accéder aux notes');
                  return;
                }
                setShowNotes(true);
              }}
            >
              <FontAwesome5 name="sticky-note" size={28} color={colors.primary} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>Mes Notes</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: colors.card }]}
              onPress={() => setShowLanguageModal(true)}
            >
              <FontAwesome5 name="map-marked-alt" size={28} color={colors.accent} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>Seerah Atlas</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Carte interactive
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={showTOC}
        animationType="slide"
        onRequestClose={() => setShowTOC(false)}
        statusBarTranslucent
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowTOC(false)} style={styles.headerButton}>
              <FontAwesome5 name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Table des matières</Text>
            <View style={styles.headerButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            {tableOfContents.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tocItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                onPress={() => {
                  setShowTOC(false);
                  handleOpenBook(item.page);
                }}
              >
                <View style={styles.tocItemLeft}>
                  <View style={[styles.tocNumber, { backgroundColor: colors.cardSecondary }]}>
                    <Text style={[styles.tocNumberText, { color: colors.primary }]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.tocTitle, { color: colors.text }]}>{item.title}</Text>
                </View>
                <Text style={[styles.tocPage, { color: colors.textSecondary }]}>p. {item.page}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showNotes}
        animationType="slide"
        onRequestClose={() => {
          setShowNotes(false);
          setEditingNote(null);
          setNewNoteText('');
          setNewNotePageNumber('');
          Keyboard.dismiss();
        }}
        statusBarTranslucent
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => {
                setShowNotes(false);
                setEditingNote(null);
                setNewNoteText('');
                setNewNotePageNumber('');
                Keyboard.dismiss();
              }}
              style={styles.headerButton}
            >
              <FontAwesome5 name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Mes Notes</Text>
            <View style={styles.headerButton} />
          </View>

          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                ref={notesScrollViewRef}
                style={styles.modalContent}
                contentContainerStyle={styles.modalContentContainer}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                <View style={[styles.addNoteCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.addNoteTitle, { color: colors.text }]}>
                    {editingNote ? 'Modifier la note' : 'Ajouter une note'}
                  </Text>

                  {!editingNote && (
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border }]}
                      placeholder="Numéro de page"
                      placeholderTextColor={colors.textSecondary}
                      value={newNotePageNumber}
                      onChangeText={setNewNotePageNumber}
                      keyboardType="number-pad"
                      returnKeyType="next"
                      onFocus={() => {
                        setTimeout(() => {
                          notesScrollViewRef.current?.scrollTo({ y: 0, animated: true });
                        }, 100);
                      }}
                    />
                  )}

                  <TextInput
                    style={[styles.textArea, { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border }]}
                    placeholder="Votre note..."
                    placeholderTextColor={colors.textSecondary}
                    value={newNoteText}
                    onChangeText={setNewNoteText}
                    multiline
                    numberOfLines={4}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onFocus={() => {
                      setTimeout(() => {
                        notesScrollViewRef.current?.scrollTo({ y: editingNote ? 0 : 80, animated: true });
                      }, 300);
                    }}
                  />

                  <View style={styles.noteButtons}>
                    {editingNote && (
                      <TouchableOpacity
                        style={[styles.cancelButton, { borderColor: colors.border }]}
                        onPress={() => {
                          setEditingNote(null);
                          setNewNoteText('');
                          Keyboard.dismiss();
                        }}
                      >
                        <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Annuler</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.saveButton, { backgroundColor: colors.primary }]}
                      onPress={editingNote ? handleUpdateNote : handleAddNote}
                    >
                      <Text style={styles.saveButtonText}>
                        {editingNote ? 'Mettre à jour' : 'Ajouter'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {notes.length === 0 ? (
                  <View style={styles.emptyState}>
                    <FontAwesome5 name="sticky-note" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      Aucune note pour le moment
                    </Text>
                  </View>
                ) : (
                  notes.map((note) => (
                    <View key={note.id} style={[styles.noteCard, { backgroundColor: colors.card }]}>
                      <View style={styles.noteHeader}>
                        <View style={[styles.notePageBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.notePageText}>Page {note.page_number}</Text>
                        </View>
                        <View style={styles.noteActions}>
                          <TouchableOpacity
                            onPress={() => handleEditNote(note)}
                            style={styles.noteActionButton}
                          >
                            <FontAwesome5 name="edit" size={16} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteNote(note.id)}
                            style={styles.noteActionButton}
                          >
                            <FontAwesome5 name="trash" size={16} color="#e74c3c" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={[styles.noteText, { color: colors.text }]}>{note.note_text}</Text>
                      <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                        {new Date(note.updated_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <BookmarksPanel
        visible={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        onSelectBookmark={handleOpenBook}
        darkMode={nightMode}
      />

      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLanguageModal(false)}>
          <View style={styles.languageModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.languageModalContent, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                  onPress={() => setShowLanguageModal(false)}
                  style={styles.languageModalCloseButton}
                >
                  <FontAwesome5 name="times" size={22} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={styles.languageModalHeader}>
                  <FontAwesome5 name="map-marked-alt" size={32} color={colors.accent} />
                  <Text style={[styles.languageModalTitle, { color: colors.text }]}>
                    Seerah Atlas
                  </Text>
                  <Text style={[styles.languageModalSubtitle, { color: colors.textSecondary }]}>
                    Interactive timeline of Prophet Muhammad's life
                  </Text>
                </View>

                <ScrollView
                  style={styles.languageScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  <TouchableOpacity
                    style={[styles.inAppAtlasButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowLanguageModal(false);
                      setShowInAppAtlas(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.inAppAtlasContent}>
                      <View style={styles.inAppAtlasIconContainer}>
                        <FontAwesome5 name="mobile-alt" size={24} color="#ffffff" />
                      </View>
                      <View style={styles.inAppAtlasTextContainer}>
                        <Text style={styles.inAppAtlasTitle}>
                          View In-App Atlas
                        </Text>
                        <Text style={styles.inAppAtlasDescription}>
                          Interactive timeline with events & locations
                        </Text>
                      </View>
                      <FontAwesome5 name="chevron-right" size={20} color="#ffffff" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.inAppAtlasButton, { backgroundColor: colors.accent }]}
                    onPress={() => {
                      setShowLanguageModal(false);
                      setShowInAppAtlas(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.inAppAtlasContent}>
                      <View style={styles.inAppAtlasIconContainer}>
                        <FontAwesome5 name="map-marked-alt" size={24} color="#ffffff" />
                      </View>
                      <View style={styles.inAppAtlasTextContainer}>
                        <Text style={styles.inAppAtlasTitle}>
                          Sîra
                        </Text>
                        <Text style={styles.inAppAtlasDescription}>
                          Chronologie géolocalisée des événements majeurs
                        </Text>
                      </View>
                      <FontAwesome5 name="chevron-right" size={20} color="#ffffff" />
                    </View>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <SeerahAtlasScreen
        visible={showInAppAtlas}
        onClose={() => setShowInAppAtlas(false)}
        darkMode={nightMode}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  bookCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bookIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  bookSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  bookDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  bookDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
  },
  readButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueText: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  tocItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  tocNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tocNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tocTitle: {
    fontSize: 14,
    flex: 1,
  },
  tocPage: {
    fontSize: 13,
    fontWeight: '500',
  },
  addNoteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  addNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  noteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notePageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notePageText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  noteActionButton: {
    padding: 8,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
  },
  webView: {
    flex: 1,
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 1,
  },
  webViewLoadingText: {
    fontSize: 14,
  },
  languageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  languageModalContent: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    padding: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  languageModalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  languageModalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  languageModalTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  languageModalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  languageScrollView: {
    maxHeight: 480,
  },
  inAppAtlasButton: {
    marginBottom: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inAppAtlasContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  inAppAtlasIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inAppAtlasTextContainer: {
    flex: 1,
  },
  inAppAtlasTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  inAppAtlasDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
