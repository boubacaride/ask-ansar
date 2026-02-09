import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { useState } from 'react';

interface ResponseFeedbackProps {
  messageId: string;
  onFeedback: (messageId: string, helpful: boolean) => void;
  darkMode?: boolean;
}

export default function ResponseFeedback({ messageId, onFeedback, darkMode }: ResponseFeedbackProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);

  const handleFeedback = (helpful: boolean) => {
    setFeedback(helpful ? 'helpful' : 'unhelpful');
    onFeedback(messageId, helpful);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, darkMode && styles.labelDark]}>
        Was this response helpful?
      </Text>
      <View style={styles.buttons}>
        <Pressable
          style={[
            styles.button,
            feedback === 'helpful' && styles.buttonActive,
            darkMode && styles.buttonDark,
          ]}
          onPress={() => handleFeedback(true)}
        >
          <ThumbsUp
            size={18}
            color={feedback === 'helpful' ? '#4CAF50' : darkMode ? '#666' : '#999'}
          />
          <Text
            style={[
              styles.buttonText,
              feedback === 'helpful' && styles.buttonTextActive,
              darkMode && styles.buttonTextDark,
            ]}
          >
            Yes
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            feedback === 'unhelpful' && styles.buttonActive,
            darkMode && styles.buttonDark,
          ]}
          onPress={() => handleFeedback(false)}
        >
          <ThumbsDown
            size={18}
            color={feedback === 'unhelpful' ? '#f44336' : darkMode ? '#666' : '#999'}
          />
          <Text
            style={[
              styles.buttonText,
              feedback === 'unhelpful' && styles.buttonTextActive,
              darkMode && styles.buttonTextDark,
            ]}
          >
            No
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  labelDark: {
    color: '#aaa',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },
  buttonDark: {
    backgroundColor: '#333',
  },
  buttonActive: {
    backgroundColor: '#e3f2fd',
  },
  buttonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  buttonTextDark: {
    color: '#aaa',
  },
  buttonTextActive: {
    color: '#1976D2',
    fontWeight: '600',
  },
});