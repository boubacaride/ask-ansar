import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { useState } from 'react';

export default function PrivacyScreen() {
  const { darkMode } = useSettings();
  const [settings, setSettings] = useState({
    saveHistory: true,
    shareAnalytics: false,
    personalization: true,
    notifications: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView>
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            Data Collection
          </Text>
          
          <View style={[styles.setting, darkMode && styles.settingDark]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, darkMode && styles.darkModeText]}>
                Save Chat History
              </Text>
              <Text style={[styles.settingDescription, darkMode && styles.darkModeTextSecondary]}>
                Store your conversation history locally
              </Text>
            </View>
            <Switch
              value={settings.saveHistory}
              onValueChange={() => toggleSetting('saveHistory')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.saveHistory ? '#1976D2' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.setting, darkMode && styles.settingDark]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, darkMode && styles.darkModeText]}>
                Share Analytics
              </Text>
              <Text style={[styles.settingDescription, darkMode && styles.darkModeTextSecondary]}>
                Help improve the app by sharing usage data
              </Text>
            </View>
            <Switch
              value={settings.shareAnalytics}
              onValueChange={() => toggleSetting('shareAnalytics')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.shareAnalytics ? '#1976D2' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            Personalization
          </Text>
          
          <View style={[styles.setting, darkMode && styles.settingDark]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, darkMode && styles.darkModeText]}>
                Personalized Content
              </Text>
              <Text style={[styles.settingDescription, darkMode && styles.darkModeTextSecondary]}>
                Receive content based on your interests
              </Text>
            </View>
            <Switch
              value={settings.personalization}
              onValueChange={() => toggleSetting('personalization')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.personalization ? '#1976D2' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.setting, darkMode && styles.settingDark]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, darkMode && styles.darkModeText]}>
                Push Notifications
              </Text>
              <Text style={[styles.settingDescription, darkMode && styles.darkModeTextSecondary]}>
                Receive important updates and reminders
              </Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.notifications ? '#1976D2' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            About Your Data
          </Text>
          <Text style={[styles.privacyText, darkMode && styles.darkModeTextSecondary]}>
            We take your privacy seriously. Your data is stored securely and never shared with third parties without your explicit consent. You can request a copy of your data or delete your account at any time.
          </Text>
        </View>
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
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  sectionDark: {
    backgroundColor: '#1E1E1E',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingDark: {
    borderBottomColor: '#333',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
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
  privacyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    padding: 16,
  },
  darkModeText: {
    color: '#fff',
  },
  darkModeTextSecondary: {
    color: '#aaa',
  },
});