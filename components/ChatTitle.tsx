import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useSettings } from '@/store/settingsStore';

export default function ChatTitle() {
  const { darkMode } = useSettings();

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <View style={styles.content}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
          style={styles.logo}
        />
        <Text style={[styles.title, darkMode && styles.titleDark]}>
          Ask Ansar
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'web' ? 16 : 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    marginHorizontal: 'auto',
    width: '100%',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  title: {
    fontSize: Platform.select({
      web: 24,
      default: 24,
    }),
    fontWeight: 'bold',
    color: '#1976D2',
    lineHeight: Platform.select({
      web: 1.3,
      default: 30,
    }),
  },
  titleDark: {
    color: '#90CAF9',
  },
});