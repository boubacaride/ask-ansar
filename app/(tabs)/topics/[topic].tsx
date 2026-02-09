import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSettings } from '@/store/settingsStore';

export default function TopicScreen() {
  const { topic } = useLocalSearchParams();
  const { darkMode } = useSettings();

  return (
    <ScrollView style={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.content, darkMode && styles.contentDark]}>
        <Text style={[styles.title, darkMode && styles.darkModeText]}>
          {decodeURIComponent(topic as string)}
        </Text>
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
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentDark: {
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  darkModeText: {
    color: '#f8fafc',
  },
});