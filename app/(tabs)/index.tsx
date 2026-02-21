import { View, Text, StyleSheet, TextInput, Platform, ScrollView, Pressable, Animated } from 'react-native';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useSettings } from '@/store/settingsStore';
import { translate } from '@/utils/i18n';
import { Loader as Loader2, Send, Mic, Square } from 'lucide-react-native';
import { useChatStore } from '@/store/chatStore';
import { generateResponse } from '@/utils/chatUtils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import ChatTitle from '@/components/ChatTitle';

export default function ChatScreen() {
  const { language, darkMode } = useSettings();
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(48);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleVoiceResult = useCallback((text: string) => {
    setInput((prev) => (prev ? prev + ' ' + text : text));
  }, []);

  const { isRecording, startRecording, stopRecording, error: voiceError } =
    useVoiceInput(handleVoiceResult, language);

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    const queryText = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateResponse(queryText);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: Date.now(),
        arabicText: response.arabicText,
        translation: response.translation,
      };

      addMessage(botMessage);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: Date.now(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Show mic button when input is empty, send button when there's text
  const showMic = !input.trim() && !isLoading;

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <ChatTitle />

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.message,
              message.isUser ? styles.userMessage : styles.botMessage,
              darkMode && (message.isUser ? styles.userMessageDark : styles.botMessageDark),
            ]}
          >
            <Text
              style={[
                styles.messageText,
                darkMode && styles.messageTextDark,
              ]}
            >
              {message.text}
            </Text>
            {message.arabicText && (
              <Text style={[styles.arabicText, darkMode && styles.arabicTextDark]}>
                {message.arabicText}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, darkMode && styles.inputContainerDark]}>
        {/* Voice error banner */}
        {voiceError && (
          <View style={[styles.voiceErrorContainer, darkMode && styles.voiceErrorContainerDark]}>
            <Text style={[styles.voiceErrorText, darkMode && styles.voiceErrorTextDark]}>
              {voiceError}
            </Text>
          </View>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <View style={[styles.recordingBanner, darkMode && styles.recordingBannerDark]}>
            <Animated.View
              style={[
                styles.recordingDot,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={[styles.recordingText, darkMode && styles.recordingTextDark]}>
              {translate('listening', language) || 'Listening...'}
            </Text>
          </View>
        )}

        <View style={styles.inputWrapper}>
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
            placeholder={
              isRecording
                ? (translate('listening', language) || 'Listening...')
                : translate('askQuestion', language)
            }
            placeholderTextColor={darkMode ? '#666' : '#999'}
            multiline
            maxLength={500}
            onContentSizeChange={(e) => {
              const height = Math.min(120, Math.max(48, e.nativeEvent.contentSize.height));
              setInputHeight(height);
            }}
            textAlignVertical="center"
          />

          {showMic ? (
            <Pressable
              style={[
                styles.micButton,
                isRecording && styles.micButtonRecording,
                darkMode && styles.micButtonDark,
                isRecording && darkMode && styles.micButtonRecordingDark,
              ]}
              onPress={handleMicPress}
            >
              {isRecording ? (
                <Square size={18} color="#fff" fill="#fff" />
              ) : (
                <Mic
                  size={20}
                  color={darkMode ? '#90CAF9' : '#fff'}
                />
              )}
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.sendButton,
                isLoading && styles.sendButtonDisabled,
                darkMode && styles.sendButtonDark,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send
                size={20}
                color={
                  isLoading
                    ? darkMode ? '#666' : '#999'
                    : darkMode ? '#90CAF9' : '#fff'
                }
              />
            </Pressable>
          )}
        </View>

        {isLoading && (
          <View style={[styles.loadingContainer, darkMode && styles.loadingContainerDark]}>
            <Loader2 size={24} color={darkMode ? '#90CAF9' : '#1976D2'} />
            <Text style={[styles.loadingText, darkMode && styles.loadingTextDark]}>
              {translate('searching', language)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  message: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e3f2fd',
    borderBottomRightRadius: 4,
  },
  userMessageDark: {
    backgroundColor: '#1a365d',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
  },
  botMessageDark: {
    backgroundColor: '#333',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  messageTextDark: {
    color: '#fff',
  },
  arabicText: {
    fontSize: 18,
    color: '#1976D2',
    marginTop: 12,
    textAlign: 'right',
    fontFamily: 'NotoNaskhArabic-Regular',
  },
  arabicTextDark: {
    color: '#90CAF9',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: Platform.select({
      ios: 30,
      android: 10,
      default: 16,
    }),
  },
  inputContainerDark: {
    borderTopColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 24,
    marginRight: 8,
  },
  inputDark: {
    backgroundColor: '#333',
    color: '#fff',
  },
  inputIOS: {
    paddingTop: 12,
  },
  inputAndroid: {
    paddingTop: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  sendButtonDark: {
    backgroundColor: '#1565C0',
  },
  sendButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  micButtonDark: {
    backgroundColor: '#1565C0',
  },
  micButtonRecording: {
    backgroundColor: '#D32F2F',
  },
  micButtonRecordingDark: {
    backgroundColor: '#C62828',
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  recordingBannerDark: {},
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D32F2F',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '600',
  },
  recordingTextDark: {
    color: '#EF5350',
  },
  voiceErrorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  voiceErrorContainerDark: {},
  voiceErrorText: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
  },
  voiceErrorTextDark: {
    color: '#EF5350',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  loadingContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  loadingTextDark: {
    color: '#aaa',
  },
});
