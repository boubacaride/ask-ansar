import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useSettings } from '@/store/settingsStore';
import { useRouter } from 'expo-router';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'Français', nativeName: 'Français' },
  { code: 'ar', name: 'العربية', nativeName: 'العربية' }
];

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage, darkMode } = useSettings();

  const handleLanguageSelect = (code: string) => {
    setLanguage(code);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Text style={[styles.title, darkMode && styles.darkModeText]}>
          Select Language
        </Text>
        <Text style={[styles.subtitle, darkMode && styles.darkModeTextSecondary]}>
          Choose your preferred language for the app interface
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.code}
            style={[
              styles.languageItem,
              darkMode && styles.languageItemDark,
              language === lang.code && styles.selectedLanguage,
              language === lang.code && darkMode && styles.selectedLanguageDark,
            ]}
            onPress={() => handleLanguageSelect(lang.code)}
          >
            <View style={styles.languageInfo}>
              <Text style={[
                styles.languageName,
                darkMode && styles.darkModeText,
                lang.code === 'ar' && styles.arabicText
              ]}>
                {lang.nativeName}
              </Text>
              <Text style={[
                styles.languageNameEnglish,
                darkMode && styles.darkModeTextSecondary
              ]}>
                {lang.name}
              </Text>
            </View>
            {language === lang.code && (
              <Check
                size={24}
                color={darkMode ? '#90CAF9' : '#1976D2'}
                strokeWidth={2.5}
              />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 1,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  languageItemDark: {
    backgroundColor: '#1E1E1E',
  },
  selectedLanguage: {
    borderLeftColor: '#1976D2',
    backgroundColor: '#e3f2fd',
  },
  selectedLanguageDark: {
    borderLeftColor: '#90CAF9',
    backgroundColor: '#1a365d',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  languageNameEnglish: {
    fontSize: 14,
    color: '#666',
  },
  darkModeText: {
    color: '#fff',
  },
  darkModeTextSecondary: {
    color: '#aaa',
  },
  arabicText: {
    fontFamily: 'NotoNaskhArabic-Regular',
    fontSize: 20,
  },
});