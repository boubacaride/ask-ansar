import { View, Text, StyleSheet, TextInput, Platform, FlatList, Pressable, Share as RNShare, Modal, Linking, KeyboardAvoidingView, Keyboard } from 'react-native';
import { useState, useRef, useCallback } from 'react';
import { useSettings } from '@/store/settingsStore';
import { Loader as Loader2, Send, Copy, Mail, MessageCircle, X, Sparkles } from 'lucide-react-native';
import { useChatStore } from '@/store/chatStore';
import { generateResponseStream } from '@/utils/chatUtils';
import ChatTitle from '@/components/ChatTitle';
import MessageBubble from '@/components/MessageBubble';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { FR } from '@/ui/strings.fr';
import type { ChatMessage } from '@/types/chat';

export default function ChatScreen() {
  const { darkMode } = useSettings();
  const { messages, addMessage, updateMessage } = useChatStore();
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(48);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [messageToShare, setMessageToShare] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const trimmed = input.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmed,
      isUser: true,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput('');
    setInputHeight(48);
    Keyboard.dismiss();
    setIsLoading(true);

    // Create the bot message immediately (empty) for streaming
    const botId = (Date.now() + 1).toString();
    const botMessage: ChatMessage = {
      id: botId,
      text: '',
      isUser: false,
      timestamp: Date.now(),
    };
    addMessage(botMessage);
    setStreamingId(botId);
    scrollToEnd();

    const controller = new AbortController();
    abortRef.current = controller;

    // Accumulate tokens and batch-update the store
    let accumulated = '';
    let updateTimer: ReturnType<typeof setTimeout> | null = null;

    const flushUpdate = () => {
      if (accumulated) {
        updateMessage(botId, accumulated);
        scrollToEnd();
      }
    };

    const onToken = (token: string) => {
      accumulated += token;
      // Throttle store updates to ~60ms to avoid excessive re-renders
      if (!updateTimer) {
        updateTimer = setTimeout(() => {
          updateTimer = null;
          flushUpdate();
        }, 60);
      }
    };

    try {
      const response = await generateResponseStream(trimmed, onToken, controller.signal);

      // Final flush — ensure the complete text is stored
      if (updateTimer) {
        clearTimeout(updateTimer);
        updateTimer = null;
      }
      updateMessage(botId, response.text, response.arabicText, response.translation);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Keep whatever was streamed so far
        if (updateTimer) { clearTimeout(updateTimer); }
        flushUpdate();
        return;
      }

      updateMessage(botId, FR.errorGeneric);
    } finally {
      if (updateTimer) { clearTimeout(updateTimer); }
      abortRef.current = null;
      setStreamingId(null);
      setIsLoading(false);
      scrollToEnd();
    }
  }, [input, isLoading, addMessage, updateMessage, scrollToEnd]);

  const handleCopyMessage = useCallback(async (text: string, messageId: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);

      if (Platform.OS === 'web') {
        const toast = document.createElement('div');
        toast.textContent = FR.copied;
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #0053C1;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          z-index: 1000;
          font-size: 14px;
        `;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 2000);
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, []);

  const handleShareMessage = useCallback(async (text: string, _messageId: string) => {
    if (Platform.OS === 'web') {
      setMessageToShare(text);
      setShareModalVisible(true);
    } else {
      try {
        await RNShare.share({
          message: text,
          title: 'Ask Ansar',
        });
      } catch (error: any) {
        if (error.message !== 'User did not share') {
          console.error('Failed to share:', error);
        }
      }
    }
  }, []);

  const handleShareViaEmail = useCallback(() => {
    const subject = encodeURIComponent('Ask Ansar');
    const body = encodeURIComponent(messageToShare);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    if (Platform.OS === 'web') {
      window.open(mailtoUrl, '_blank');
    } else {
      Linking.openURL(mailtoUrl);
    }
    setShareModalVisible(false);
  }, [messageToShare]);

  const handleShareViaWhatsApp = useCallback(() => {
    const text = encodeURIComponent(messageToShare);
    const whatsappUrl = `https://wa.me/?text=${text}`;

    if (Platform.OS === 'web') {
      window.open(whatsappUrl, '_blank');
    } else {
      Linking.openURL(whatsappUrl);
    }
    setShareModalVisible(false);
  }, [messageToShare]);

  const handleCopyFromModal = useCallback(async () => {
    await Clipboard.setStringAsync(messageToShare);
    setShareModalVisible(false);

    if (Platform.OS === 'web') {
      const toast = document.createElement('div');
      toast.textContent = FR.copied;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #0053C1;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 1000;
        font-size: 14px;
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    }
  }, [messageToShare]);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        message={item}
        darkMode={darkMode}
        copiedMessageId={copiedMessageId}
        onCopy={handleCopyMessage}
        onShare={handleShareMessage}
        isStreaming={item.id === streamingId}
      />
    ),
    [darkMode, copiedMessageId, handleCopyMessage, handleShareMessage, streamingId]
  );

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <ChatTitle />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.keyboardInner}>
            <LinearGradient
              colors={darkMode ? ['#111827', '#1F2937'] : ['#F9FAFB', '#FFFFFF']}
              style={styles.gradientBackground}
            >
              {messages.length === 0 ? (
                <Pressable style={styles.emptyState} onPress={Keyboard.dismiss}>
                  <Sparkles size={48} color={darkMode ? '#4A9EFF' : '#0053C1'} />
                  <Text style={[styles.emptyStateTitle, darkMode && styles.emptyStateTitleDark]}>
                    {FR.emptyStateTitle}
                  </Text>
                  <Text style={[styles.emptyStateText, darkMode && styles.emptyStateTextDark]}>
                    {FR.emptyStateText}
                  </Text>
                </Pressable>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={keyExtractor}
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                  removeClippedSubviews={false}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                />
              )}
            </LinearGradient>

            <View style={[styles.inputContainer, darkMode && styles.inputContainerDark]}>
              {isLoading && !streamingId && (
                <View style={[styles.loadingContainer, darkMode && styles.loadingContainerDark]}>
                  <Loader2 size={20} color={darkMode ? '#4A9EFF' : '#0053C1'} />
                  <Text style={[styles.loadingText, darkMode && styles.loadingTextDark]}>
                    {FR.generating}
                  </Text>
                </View>
              )}
              <View style={styles.inputWrapper}>
                <View style={[styles.inputBox, darkMode && styles.inputBoxDark]}>
                  <TextInput
                    style={[
                      styles.input,
                      darkMode && styles.inputDark,
                      { height: inputHeight },
                      Platform.select({
                        ios: styles.inputIOS,
                        android: styles.inputAndroid,
                        default: {},
                      }),
                    ]}
                    value={input}
                    onChangeText={setInput}
                    placeholder={FR.placeholder}
                    placeholderTextColor={darkMode ? '#6B7280' : '#9CA3AF'}
                    multiline
                    maxLength={500}
                    onContentSizeChange={(e) => {
                      const height = Math.min(120, Math.max(48, e.nativeEvent.contentSize.height));
                      setInputHeight(height);
                    }}
                    textAlignVertical="center"
                    returnKeyType="send"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      if (input.trim() && !isLoading) {
                        handleSend();
                      }
                    }}
                  />
                  <Pressable
                    style={[
                      styles.sendButton,
                      (!input.trim() || isLoading) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!input.trim() || isLoading}
                  >
                    <LinearGradient
                      colors={
                        !input.trim() || isLoading
                          ? darkMode
                            ? ['#374151', '#374151']
                            : ['#E5E7EB', '#E5E7EB']
                          : darkMode
                            ? ['#0053C1', '#003D8F']
                            : ['#0053C1', '#003D8F']
                      }
                      style={styles.sendButtonGradient}
                    >
                      <Send
                        size={20}
                        color={
                          !input.trim() || isLoading
                            ? darkMode
                              ? '#6B7280'
                              : '#9CA3AF'
                            : '#FFFFFF'
                        }
                      />
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={shareModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShareModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, darkMode && styles.modalContentDark]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>
                {FR.shareTitle}
              </Text>
              <Pressable onPress={() => setShareModalVisible(false)}>
                <X size={24} color={darkMode ? '#fff' : '#333'} />
              </Pressable>
            </View>

            <View style={styles.shareOptions}>
              <Pressable
                style={[styles.shareOption, darkMode && styles.shareOptionDark]}
                onPress={handleShareViaEmail}
              >
                <Mail size={24} color={darkMode ? '#4A9EFF' : '#0053C1'} />
                <Text style={[styles.shareOptionText, darkMode && styles.shareOptionTextDark]}>
                  {FR.shareEmail}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.shareOption, darkMode && styles.shareOptionDark]}
                onPress={handleShareViaWhatsApp}
              >
                <MessageCircle size={24} color="#25D366" />
                <Text style={[styles.shareOptionText, darkMode && styles.shareOptionTextDark]}>
                  {FR.shareWhatsApp}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.shareOption, darkMode && styles.shareOptionDark]}
                onPress={handleCopyFromModal}
              >
                <Copy size={24} color={darkMode ? '#4A9EFF' : '#0053C1'} />
                <Text style={[styles.shareOptionText, darkMode && styles.shareOptionTextDark]}>
                  {FR.copyClipboard}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  containerDark: { backgroundColor: '#111827' },
  keyboardAvoid: { flex: 1 },
  keyboardInner: { flex: 1 },
  gradientBackground: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  emptyStateTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  emptyStateTitleDark: { color: '#F3F4F6' },
  emptyStateText: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
  emptyStateTextDark: { color: '#9CA3AF' },
  inputContainer: { borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingBottom: Platform.select({ ios: 34, android: 16, default: 20 }), shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4 },
  inputContainerDark: { borderTopColor: '#374151', backgroundColor: '#1F2937' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, marginHorizontal: 20, marginTop: 12, backgroundColor: '#F3F4F6', borderRadius: 20 },
  loadingContainerDark: { backgroundColor: '#374151' },
  loadingText: { marginLeft: 8, fontSize: 14, color: '#0053C1', fontWeight: '600' },
  loadingTextDark: { color: '#4A9EFF' },
  inputWrapper: { paddingHorizontal: 20, paddingTop: 16 },
  inputBox: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F3F4F6', borderRadius: 28, paddingLeft: 20, paddingRight: 4, paddingVertical: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  inputBoxDark: { backgroundColor: '#374151' },
  input: { flex: 1, fontSize: 16, color: '#1F2937', paddingVertical: 12, paddingRight: 12, lineHeight: 22 },
  inputDark: { color: '#F3F4F6' },
  inputIOS: { paddingTop: 12 },
  inputAndroid: { paddingTop: 10 },
  sendButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  sendButtonGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, width: '100%', maxWidth: 420, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  modalContentDark: { backgroundColor: '#1F2937' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  modalTitleDark: { color: '#F3F4F6' },
  shareOptions: { gap: 12 },
  shareOption: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: '#F3F4F6', borderRadius: 16, gap: 16 },
  shareOptionDark: { backgroundColor: '#374151' },
  shareOptionText: { fontSize: 16, color: '#1F2937', fontWeight: '600' },
  shareOptionTextDark: { color: '#F3F4F6' },
});
