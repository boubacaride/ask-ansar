import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useEffect, useRef, memo } from 'react';
import { Copy, Share, Sparkles } from 'lucide-react-native';
import { FR } from '@/ui/strings.fr';
import FormattedText from './FormattedText';
import SourceBadges from './SourceBadges';
import type { SourceBadge } from '@/types/chat';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    arabicText?: string;
    sources?: SourceBadge[];
  };
  darkMode: boolean;
  copiedMessageId: string | null;
  onCopy: (text: string, messageId: string) => void;
  onShare: (text: string, messageId: string) => void;
  isStreaming?: boolean;
}

function MessageBubbleInner({
  message,
  darkMode,
  copiedMessageId,
  onCopy,
  onShare,
  isStreaming,
}: MessageBubbleProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageWrapper,
        message.isUser ? styles.userMessageWrapper : styles.botMessageWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {message.isUser ? (
        <View
          style={[
            styles.message,
            styles.userMessage,
            darkMode && styles.userMessageDark,
          ]}
        >
          <Text style={[styles.userMessageText, darkMode && styles.userMessageTextDark]}>
            {message.text}
          </Text>
        </View>
      ) : (
        <View style={[styles.message, styles.botMessage, darkMode && styles.botMessageDark]}>
          <View style={styles.botMessageHeader}>
            <Sparkles size={16} color={darkMode ? '#4A9EFF' : '#0053C1'} />
            <Text style={[styles.ansarLabel, darkMode && styles.ansarLabelDark]}>
              Ansar
            </Text>
          </View>

          {/* Rich formatted text instead of plain Text */}
          <FormattedText text={message.text} darkMode={darkMode} />

          {message.arabicText && (
            <View style={styles.arabicContainer}>
              <Text style={[styles.arabicText, darkMode && styles.arabicTextDark]}>
                {message.arabicText}
              </Text>
            </View>
          )}

          {message.sources && message.sources.length > 0 && !isStreaming && (
            <SourceBadges sources={message.sources} darkMode={darkMode} />
          )}

          {/* Hide action buttons while streaming */}
          {!isStreaming && (
            <View style={styles.messageActions}>
              <Pressable
                style={[styles.actionButton, darkMode && styles.actionButtonDark]}
                onPress={() => onCopy(message.text, message.id)}
              >
                <Copy size={14} color={darkMode ? '#4A9EFF' : '#0053C1'} />
                <Text style={[styles.actionButtonText, darkMode && styles.actionButtonTextDark]}>
                  {copiedMessageId === message.id ? FR.copied : FR.copy}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, darkMode && styles.actionButtonDark]}
                onPress={() => onShare(message.text, message.id)}
              >
                <Share size={14} color={darkMode ? '#4A9EFF' : '#0053C1'} />
                <Text style={[styles.actionButtonText, darkMode && styles.actionButtonTextDark]}>
                  {FR.share}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

export default memo(MessageBubbleInner, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.text === next.message.text &&
    prev.message.sources === next.message.sources &&
    prev.darkMode === next.darkMode &&
    prev.copiedMessageId === next.copiedMessageId &&
    prev.isStreaming === next.isStreaming
  );
});

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  botMessageWrapper: {
    alignItems: 'flex-start',
  },
  message: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userMessage: {
    backgroundColor: '#0053C1',
    borderBottomRightRadius: 4,
  },
  userMessageDark: {
    backgroundColor: '#003D8F',
  },
  botMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  botMessageDark: {
    backgroundColor: '#1F2937',
  },
  botMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  ansarLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0053C1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ansarLabelDark: {
    color: '#4A9EFF',
  },
  userMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  userMessageTextDark: {
    color: '#F3F4F6',
  },
  arabicContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  arabicText: {
    fontSize: 18,
    color: '#0053C1',
    textAlign: 'right',
    lineHeight: 32,
    fontFamily: 'NotoNaskhArabic-Regular',
    userSelect: 'text',
    WebkitUserSelect: 'text',
  },
  arabicTextDark: {
    color: '#4A9EFF',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  actionButtonDark: {
    backgroundColor: '#374151',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#0053C1',
    fontWeight: '600',
  },
  actionButtonTextDark: {
    color: '#4A9EFF',
  },
});
