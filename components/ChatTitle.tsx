import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useSettings } from '@/store/settingsStore';

export default function ChatTitle() {
  const { darkMode } = useSettings();

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <View style={styles.content}>
        <View style={[styles.logoContainer, darkMode && styles.logoContainerDark]}>
          <Image
            source={{ uri: 'https://d6artovf3mfn.cloudfront.net/images/AV-LOGO-48x48.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    marginHorizontal: 'auto',
    width: '100%',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#0053C1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  logoContainerDark: {
    backgroundColor: '#1E3A5F',
  },
  logo: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: Platform.select({
      web: 26,
      default: 26,
    }),
    fontWeight: '800',
    color: '#0053C1',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  titleDark: {
    color: '#4A9EFF',
  },
});