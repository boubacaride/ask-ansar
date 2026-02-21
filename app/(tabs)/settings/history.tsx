import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2 } from 'lucide-react-native';
import { useSettings } from '@/store/settingsStore';
import { useChatStore } from '@/store/chatStore';
import { useState } from 'react';
import DeleteHistoryModal from '@/components/DeleteHistoryModal';

export default function HistoryScreen() {
  const { darkMode } = useSettings();
  const { messages, clearMessages } = useChatStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeleteMessages = (messageIds: string[]) => {
    // Filter out the selected messages
    const remainingMessages = messages.filter(msg => !messageIds.includes(msg.id));
    
    // Update the chat store with remaining messages
    clearMessages();
    remainingMessages.forEach(msg => {
      useChatStore.getState().addMessage(msg);
    });
  };

  const formatMessagePreview = (text: string) => {
    return text.length > 100 ? `${text.substring(0, 100)}...` : text;
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Pressable
          style={[styles.clearButton, darkMode && styles.clearButtonDark]}
          onPress={() => setIsModalVisible(true)}
        >
          <Trash2 size={20} color={darkMode ? '#ff6b6b' : '#dc3545'} />
          <Text style={[styles.clearButtonText, darkMode && styles.clearButtonTextDark]}>
            Clear History
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        {messages.length <= 1 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, darkMode && styles.darkModeText]}>
              No chat history yet
            </Text>
          </View>
        ) : (
          messages.slice(1).map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageItem,
                darkMode && styles.messageItemDark,
                message.isUser ? styles.userMessage : styles.botMessage,
                message.isUser && darkMode && styles.userMessageDark,
              ]}
            >
              <Text style={[styles.messageText, darkMode && styles.darkModeText]}>
                {formatMessagePreview(message.text)}
              </Text>
              <View style={styles.messageFooter}>
                <Text style={[styles.messageTime, darkMode && styles.darkModeTextSecondary]}>
                  {new Date(message.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <DeleteHistoryModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onDelete={handleDeleteMessages}
        messages={messages.slice(1)}
        darkMode={darkMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  clearButtonDark: {
    backgroundColor: '#380000',
  },
  clearButtonText: {
    marginLeft: 8,
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 16,
  },
  clearButtonTextDark: {
    color: '#ff6b6b',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  messageItem: {
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  messageItemDark: {
    backgroundColor: '#1E1E1E',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e3f2fd',
    maxWidth: '80%',
  },
  userMessageDark: {
    backgroundColor: '#1a365d',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  darkModeText: {
    color: '#fff',
  },
  darkModeTextSecondary: {
    color: '#aaa',
  },
});