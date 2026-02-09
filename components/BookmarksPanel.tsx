import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { seerahUtils, SeerahBookmark } from '@/utils/seerahUtils';
import { useAuth } from '@/hooks/useAuth';

interface BookmarksPanelProps {
  visible: boolean;
  onClose: () => void;
  onSelectBookmark: (pageNumber: number) => void;
  darkMode: boolean;
}

export function BookmarksPanel({
  visible,
  onClose,
  onSelectBookmark,
  darkMode,
}: BookmarksPanelProps) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<SeerahBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageNumber, setNewPageNumber] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    danger: '#e74c3c',
  };

  useEffect(() => {
    if (visible && user) {
      loadBookmarks();
    }
  }, [visible, user]);

  const loadBookmarks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await seerahUtils.getBookmarks(user.id);
      setBookmarks(data);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    Alert.alert(
      'Supprimer le signet',
      'Êtes-vous sûr de vouloir supprimer ce signet ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await seerahUtils.deleteBookmark(bookmarkId);
            if (success) {
              setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAddBookmark = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour ajouter des signets');
      return;
    }

    if (!newPageNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de page');
      return;
    }

    const pageNum = parseInt(newPageNumber, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 748) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de page valide (1-748)');
      return;
    }

    const existingBookmark = bookmarks.find(b => b.page_number === pageNum);
    if (existingBookmark) {
      Alert.alert('Signet existant', 'Cette page est déjà dans vos signets');
      return;
    }

    setIsAdding(true);
    try {
      const bookmark = await seerahUtils.addBookmark(
        pageNum,
        user.id,
        newTitle.trim() || `Page ${pageNum}`,
        undefined
      );

      if (bookmark) {
        setBookmarks([bookmark, ...bookmarks]);
        setNewPageNumber('');
        setNewTitle('');
        setShowAddForm(false);
        Alert.alert('Succès', 'Signet ajouté avec succès');
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le signet');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewPageNumber('');
    setNewTitle('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.headerLeft}>
              <FontAwesome5 name="bookmark" size={20} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Mes Signets
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!showAddForm && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddForm(true)}
              activeOpacity={0.8}
            >
              <FontAwesome5 name="plus" size={16} color="#ffffff" />
              <Text style={styles.addButtonText}>Ajouter un signet</Text>
            </TouchableOpacity>
          )}

          {showAddForm && (
            <View style={[styles.addForm, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                Nouveau signet
              </Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="Numéro de page (1-748)"
                placeholderTextColor={colors.textSecondary}
                value={newPageNumber}
                onChangeText={setNewPageNumber}
                keyboardType="number-pad"
                maxLength={3}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="Titre/Description (optionnel)"
                placeholderTextColor={colors.textSecondary}
                value={newTitle}
                onChangeText={setNewTitle}
                maxLength={100}
              />

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.cardBorder }]}
                  onPress={handleCancelAdd}
                  disabled={isAdding}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    Annuler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    isAdding && styles.disabledButton,
                  ]}
                  onPress={handleAddBookmark}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <FontAwesome5 name="check" size={14} color="#ffffff" />
                      <Text style={styles.submitButtonText}>Ajouter</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Chargement des signets...
              </Text>
            </View>
          ) : bookmarks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="bookmark" size={60} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Aucun signet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Ajoutez des signets pour marquer vos pages favorites
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.bookmarksList}
              showsVerticalScrollIndicator={false}
            >
              {bookmarks.map((bookmark) => (
                <TouchableOpacity
                  key={bookmark.id}
                  style={[
                    styles.bookmarkCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  onPress={() => {
                    onSelectBookmark(bookmark.page_number);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.bookmarkContent}>
                    <View style={styles.bookmarkHeader}>
                      <View
                        style={[
                          styles.pageIndicator,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text style={styles.pageNumber}>
                          {bookmark.page_number}
                        </Text>
                      </View>
                      <View style={styles.bookmarkInfo}>
                        {bookmark.page_title && (
                          <Text
                            style={[styles.bookmarkTitle, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {bookmark.page_title}
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.bookmarkDate,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {formatDate(bookmark.created_at)}
                        </Text>
                      </View>
                    </View>

                    {bookmark.note && (
                      <Text
                        style={[styles.bookmarkNote, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {bookmark.note}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteBookmark(bookmark.id)}
                    style={styles.deleteButton}
                  >
                    <FontAwesome5 name="trash" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bookmarksList: {
    flex: 1,
    padding: 20,
  },
  bookmarkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bookmarkContent: {
    flex: 1,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  pageIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookmarkDate: {
    fontSize: 12,
  },
  bookmarkNote: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  deleteButton: {
    padding: 12,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  addForm: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
