import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { X, Trash2, SquareCheck as CheckSquare, Square } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ChatMessage } from '@/types/chat';

interface DeleteHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: (messageIds: string[]) => void;
  messages: ChatMessage[];
  darkMode?: boolean;
}

export default function DeleteHistoryModal({
  visible,
  onClose,
  onDelete,
  messages,
  darkMode,
}: DeleteHistoryModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleToggleMessage = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map(m => m.id)));
    }
    setSelectAll(!selectAll);
  }, [messages, selectAll]);

  const handleDelete = useCallback(() => {
    onDelete(Array.from(selectedIds));
    onClose();
  }, [selectedIds, onDelete, onClose]);

  if (!visible) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
    >
      <BlurView intensity={Platform.OS === 'ios' ? 25 : 100} style={styles.blur}>
        <View style={[styles.modal, darkMode && styles.modalDark]}>
          <View style={[styles.header, darkMode && styles.headerDark]}>
            <Text style={[styles.title, darkMode && styles.titleDark]}>
              Clear Chat History
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={darkMode ? '#fff' : '#000'} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.selectAllButton, darkMode && styles.selectAllButtonDark]}
            onPress={handleToggleAll}
          >
            {selectAll ? (
              <CheckSquare size={20} color={darkMode ? '#90CAF9' : '#1976D2'} />
            ) : (
              <Square size={20} color={darkMode ? '#666' : '#999'} />
            )}
            <Text style={[styles.selectAllText, darkMode && styles.selectAllTextDark]}>
              Select All Messages
            </Text>
          </Pressable>

          <ScrollView style={styles.content}>
            {messages.map((message) => (
              <Pressable
                key={message.id}
                style={[
                  styles.messageItem,
                  darkMode && styles.messageItemDark,
                  selectedIds.has(message.id) && styles.messageItemSelected,
                  selectedIds.has(message.id) && darkMode && styles.messageItemSelectedDark,
                ]}
                onPress={() => handleToggleMessage(message.id)}
              >
                {selectedIds.has(message.id) ? (
                  <CheckSquare size={20} color={darkMode ? '#90CAF9' : '#1976D2'} />
                ) : (
                  <Square size={20} color={darkMode ? '#666' : '#999'} />
                )}
                <View style={styles.messageContent}>
                  <Text 
                    style={[styles.messageText, darkMode && styles.messageTextDark]}
                    numberOfLines={2}
                  >
                    {message.text}
                  </Text>
                  <Text style={[styles.messageTime, darkMode && styles.messageTimeDark]}>
                    {new Date(message.timestamp).toLocaleString()}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.footer, darkMode && styles.footerDark]}>
            <Pressable
              style={[
                styles.deleteButton,
                selectedIds.size === 0 && styles.deleteButtonDisabled,
              ]}
              onPress={handleDelete}
              disabled={selectedIds.size === 0}
            >
              <Trash2 size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>
                Delete Selected ({selectedIds.size})
              </Text>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: Platform.OS === 'web' ? '90%' : '95%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalDark: {
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerDark: {
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  titleDark: {
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  selectAllButtonDark: {
    borderBottomColor: '#333',
  },
  selectAllText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectAllTextDark: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    gap: 12,
  },
  messageItemDark: {
    backgroundColor: '#2D2D2D',
  },
  messageItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  messageItemSelectedDark: {
    backgroundColor: '#1a365d',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  messageTextDark: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messageTimeDark: {
    color: '#999',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerDark: {
    borderTopColor: '#333',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});