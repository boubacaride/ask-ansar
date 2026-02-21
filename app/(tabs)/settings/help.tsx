import { View, Text, StyleSheet, Switch, Pressable, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Mail, MessageCircle, Book, FileQuestion } from 'lucide-react-native';
import { useSettings } from '@/store/settingsStore';
import { useRouter } from 'expo-router';

const HELP_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      {
        id: 'guide',
        title: 'User Guide',
        description: 'Learn the basics of using Ask Ansar',
        icon: () => <Book size={24} color="#1976D2" />,
        type: 'button',
        route: '/settings/guide',
      },
      {
        id: 'faq',
        title: 'FAQ',
        description: 'Frequently asked questions',
        icon: () => <FileQuestion size={24} color="#1976D2" />,
        type: 'link',
        url: 'https://askansar.com/faq',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'chat',
        title: 'Chat Support',
        description: 'Chat with our support team',
        icon: () => <MessageCircle size={24} color="#1976D2" />,
        type: 'link',
        url: 'https://askansar.com/?chat=open',
      },
      {
        id: 'email',
        title: 'Email Support',
        description: 'Send us an email',
        icon: () => <Mail size={24} color="#1976D2" />,
        type: 'link',
        url: 'https://askansar.com/contact',
      },
    ],
  },
];

export default function HelpScreen() {
  const { darkMode } = useSettings();
  const router = useRouter();

  const handlePress = async (item: any) => {
    try {
      if (item.type === 'button') {
        router.push(item.route);
      } else if (item.type === 'link') {
        await Linking.openURL(item.url);
      }
    } catch (error) {
      console.error('Error handling action:', error);
      Alert.alert(
        'Error',
        'Unable to open the link. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView>
        {HELP_SECTIONS.map((section) => (
          <View 
            key={section.title}
            style={[styles.section, darkMode && styles.sectionDark]}
          >
            <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
              {section.title}
            </Text>
            
            {section.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.title}
                  style={[
                    styles.helpItem,
                    index < section.items.length - 1 && styles.helpItemBorder,
                    darkMode && styles.helpItemBorderDark,
                  ]}
                  onPress={() => handlePress(item)}
                >
                  <View style={styles.helpItemContent}>
                    <View style={[styles.iconContainer, darkMode && styles.iconContainerDark]}>
                      <Icon />
                    </View>
                    <View style={styles.helpItemText}>
                      <Text style={[styles.helpItemTitle, darkMode && styles.darkModeText]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.helpItemDescription, darkMode && styles.darkModeTextSecondary]}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={darkMode ? '#666' : '#999'} />
                </Pressable>
              );
            })}
          </View>
        ))}

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            About
          </Text>
          <View style={styles.aboutContent}>
            <Text style={[styles.appVersion, darkMode && styles.darkModeTextSecondary]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.copyright, darkMode && styles.darkModeTextSecondary]}>
              © 2024 Ask Ansar. All rights reserved.
            </Text>
            <Pressable
              style={styles.termsButton}
              onPress={() => Linking.openURL('https://askansar.com/terms')}
            >
              <Text style={[styles.termsText, darkMode && styles.darkModeTextSecondary]}>
                Terms of Service & Privacy Policy
              </Text>
            </Pressable>
          </View>
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  helpItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  helpItemBorderDark: {
    borderBottomColor: '#333',
  },
  helpItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerDark: {
    backgroundColor: '#1a365d',
  },
  helpItemText: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  aboutContent: {
    padding: 16,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  termsButton: {
    padding: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
  darkModeText: {
    color: '#fff',
  },
  darkModeTextSecondary: {
    color: '#aaa',
  },
});