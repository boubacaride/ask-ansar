import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { ExternalLink } from 'lucide-react-native';

interface ReferencesProps {
  urls: string[];
  darkMode?: boolean;
}

export default function References({ urls, darkMode }: ReferencesProps) {
  if (!urls || urls.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, darkMode && styles.titleDark]}>References</Text>
      {urls.map((url, index) => (
        <Pressable
          key={index}
          style={[styles.reference, darkMode && styles.referenceDark]}
          onPress={() => Linking.openURL(url)}
        >
          <Text
            style={[styles.referenceText, darkMode && styles.referenceTextDark]}
            numberOfLines={1}
          >
            {new URL(url).hostname}
          </Text>
          <ExternalLink size={16} color={darkMode ? '#90CAF9' : '#1976D2'} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  titleDark: {
    color: '#aaa',
  },
  reference: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 4,
  },
  referenceDark: {
    backgroundColor: '#333',
  },
  referenceText: {
    fontSize: 14,
    color: '#1976D2',
    flex: 1,
    marginRight: 8,
  },
  referenceTextDark: {
    color: '#90CAF9',
  },
});