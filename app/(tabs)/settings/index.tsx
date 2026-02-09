import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, Volume2, VolumeX, Globe, Clock, Shield, CircleHelp, Scale } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/store/settingsStore';

const SECTIONS = [
  {
    title: 'Appearance',
    items: [
      {
        id: 'darkMode',
        title: 'Dark Mode',
        description: 'Enable dark theme for better night viewing',
        icon: (dark: boolean) => dark ? <Moon size={24} color="#90CAF9" /> : <Sun size={24} color="#1976D2" />,
        type: 'switch',
      },
    ],
  },
  {
    title: 'Accessibility',
    items: [
      {
        id: 'voiceEnabled',
        title: 'Voice Feedback',
        description: 'Enable voice responses and commands',
        icon: (enabled: boolean) => enabled ? <Volume2 size={24} color="#4CAF50" /> : <VolumeX size={24} color="#666" />,
        type: 'switch',
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        id: 'language',
        title: 'Language',
        description: 'Choose content language',
        icon: () => <Globe size={24} color="#1976D2" />,
        type: 'button',
        value: 'English',
        route: '/settings/language',
      },
      {
        id: 'history',
        title: 'Chat History',
        description: 'View and manage your chat history',
        icon: () => <Clock size={24} color="#1976D2" />,
        type: 'button',
        route: '/settings/history',
      },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      {
        id: 'privacy',
        title: 'Privacy Settings',
        description: 'Manage your data and privacy preferences',
        icon: () => <Shield size={24} color="#1976D2" />,
        type: 'button',
        route: '/settings/privacy',
      },
    ],
  },
  {
    title: 'Help & Support',
    items: [
      {
        id: 'help',
        title: 'Help Center',
        description: 'Get help and learn more about the app',
        icon: () => <CircleHelp size={24} color="#1976D2" />,
        type: 'button',
        route: '/settings/help',
      },
    ],
  },
  {
    title: 'Legal',
    items: [
      {
        id: 'privacy-policy',
        title: 'Privacy Policy',
        description: 'Read our privacy policy',
        icon: () => <Shield size={24} color="#1976D2" />,
        type: 'button',
        route: '/settings/privacy-policy',
      },
      {
        id: 'terms',
        title: 'Terms of Service',
        description: 'Read our terms of service',
        icon: () => <Scale size={24} color="#1976D2" />,
        type: 'button',
        route: '/settings/terms',
      },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const {
    darkMode,
    toggleDarkMode,
    voiceEnabled,
    toggleVoice,
  } = useSettings();

  const handleSettingPress = (id: string, type: string, route?: string) => {
    switch (type) {
      case 'switch':
        if (id === 'darkMode') {
          toggleDarkMode();
        } else if (id === 'voiceEnabled') {
          toggleVoice();
        }
        break;
      case 'button':
        if (route) {
          router.push(route);
        }
        break;
    }
  };

  const getValue = (id: string) => {
    switch (id) {
      case 'darkMode':
        return darkMode;
      case 'voiceEnabled':
        return voiceEnabled;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={[
      styles.container,
      darkMode && styles.containerDark,
    ]}>
      <View style={[
        styles.header,
        darkMode && styles.headerDark,
      ]}>
        <Text style={[
          styles.title,
          darkMode && styles.darkModeText,
        ]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {SECTIONS.map((section) => (
          <View
            key={section.title}
            style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              darkMode && styles.darkModeText,
            ]}>
              {section.title}
            </Text>
            <View style={[
              styles.sectionContent,
              darkMode && styles.sectionContentDark,
            ]}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.setting,
                    index < section.items.length - 1 && styles.settingBorder,
                    darkMode && styles.settingBorderDark,
                  ]}
                  onPress={() => handleSettingPress(item.id, item.type, item.route)}>
                  <View style={styles.settingInfo}>
                    {item.icon(getValue(item.id))}
                    <View style={styles.settingText}>
                      <Text style={[
                        styles.settingTitle,
                        darkMode && styles.darkModeText,
                      ]}>
                        {item.title}
                      </Text>
                      <Text style={[
                        styles.settingDescription,
                        darkMode && styles.darkModeTextSecondary,
                      ]}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                  {item.type === 'switch' ? (
                    <Switch
                      value={getValue(item.id)}
                      onValueChange={() => handleSettingPress(item.id, item.type)}
                      trackColor={{ false: '#767577', true: '#81b0ff' }}
                      thumbColor={getValue(item.id) ? '#1976D2' : '#f4f3f4'}
                    />
                  ) : (
                    <Text style={[
                      styles.settingValue,
                      darkMode && styles.darkModeTextSecondary,
                    ]}>
                      {item.value}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
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
    padding: 16,
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
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionContentDark: {
    backgroundColor: '#1E1E1E',
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingBorderDark: {
    borderBottomColor: '#333',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  darkModeText: {
    color: '#fff',
  },
  darkModeTextSecondary: {
    color: '#aaa',
  },
});