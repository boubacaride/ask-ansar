import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';

export default function ChatTitle() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 12 : insets.top + 10;

  return (
    <View style={[styles.container, darkMode && styles.containerDark, { paddingTop: topPadding }]}>
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
    // paddingTop is set dynamically via useSafeAreaInsets
    paddingBottom: Platform.OS === 'web' ? 12 : 20,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 20,
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
    width: Platform.OS === 'web' ? 44 : 60,
    height: Platform.OS === 'web' ? 44 : 60,
    borderRadius: Platform.OS === 'web' ? 22 : 30,
    marginRight: Platform.OS === 'web' ? 12 : 16,
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
    width: Platform.OS === 'web' ? 36 : 48,
    height: Platform.OS === 'web' ? 36 : 48,
  },
  title: {
    fontSize: Platform.select({
      web: 22,
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