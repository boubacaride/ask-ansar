import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/store/settingsStore';

export default function TopicsScreen() {
  const router = useRouter();
  const { darkMode } = useSettings();

  const handleTopicPress = (topic: string) => {
    router.push(`/topics/${encodeURIComponent(topic)}`);
  };

  return (
    <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
      <View style={styles.content}>
        <Text style={[styles.title, darkMode && styles.titleDark]}>
          Islamic Topics
        </Text>
        <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>
          Explore various aspects of Islamic knowledge
        </Text>

        <View style={styles.topicsGrid}>
          <Pressable
            style={[styles.topicCard, darkMode && styles.topicCardDark]}
            onPress={() => handleTopicPress('undefined')}
          >
            <Text style={[styles.topicTitle, darkMode && styles.topicTitleDark]}>
              Undefined
            </Text>
            <Text style={[styles.topicDescription, darkMode && styles.topicDescriptionDark]}>
              Understanding matters that are not explicitly detailed in Islamic texts
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  titleDark: {
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  subtitleDark: {
    color: '#94a3b8',
  },
  topicsGrid: {
    gap: 16,
  },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicCardDark: {
    backgroundColor: '#1e293b',
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  topicTitleDark: {
    color: '#f8fafc',
  },
  topicDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  topicDescriptionDark: {
    color: '#94a3b8',
  },
});