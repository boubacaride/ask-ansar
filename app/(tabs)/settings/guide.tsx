import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';

export default function GuideScreen() {
  const { darkMode } = useSettings();

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            Welcome to Ask Ansar
          </Text>
          <Text style={[styles.paragraph, darkMode && styles.darkModeTextSecondary]}>
            Ask Ansar is your reliable guide to authentic Islamic teachings. This app empowers users to ask questions about Islam and explore trusted sources such as the Qur'an, Sunnah, Hadith collections, Duas, Islamic Q&A, and scholarly articles.
          </Text>
        </View>

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            Primary Features
          </Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Instant Chat Assistance
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Authentic Islamic Sources
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Beautiful and Modern Interface
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Quick Access to Tafsir and Hadith
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Dual Language Support (English & Arabic)
            </Text>
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            Navigation Overview
          </Text>
          <Text style={[styles.paragraph, darkMode && styles.darkModeTextSecondary]}>
            The app is organized into four primary sections accessible via the bottom navigation bar:
          </Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • 💬 Chat: Ask questions and receive responses
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • 📚 Sources: Explore Islamic texts and verified references
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • ⚙️ Settings: Customize your app experience
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • 📂 Topics: Browse categorized Islamic topics
            </Text>
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            Using the Chat Feature
          </Text>
          <Text style={[styles.paragraph, darkMode && styles.darkModeTextSecondary]}>
            Start a conversation by typing your question in the chat bar labeled "Ask about Islamic teachings..."
            Tap the paper airplane icon 📩 to send your question.
            Receive a response sourced from authentic Islamic resources.
            Reference links are often included to verify answers.
          </Text>
          <Text style={[styles.subheading, darkMode && styles.darkModeText]}>
            Example:
          </Text>
          <Text style={[styles.example, darkMode && styles.darkModeTextSecondary]}>
            "What is the importance of prayer in Islam?"
            ➔ The chatbot will reply with Qur'an verses, Hadith, and explanations.
          </Text>
        </View>

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            Exploring Sources
          </Text>
          <Text style={[styles.paragraph, darkMode && styles.darkModeTextSecondary]}>
            Under the Sources tab, you will find various categories:
          </Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Qur'an & Tafsir: Access the Qur'an and selected Tafsir explanations
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Sunnah: Study the sayings and traditions of Prophet Muhammad ﷺ
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Hadith Collections: Comprehensive Hadith references
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Islamic Q&A: Reliable answers to various Islamic questions
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Islamic Articles: In-depth educational articles
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Duas & Adhkar: Authentic daily supplications
            </Text>
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            Tips for Best Experience
          </Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Stay Connected: Ensure your device has internet access
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Switch Sources Quickly: Use the dropdown menus
            </Text>
            <Text style={[styles.featureItem, darkMode && styles.darkModeTextSecondary]}>
              • Use Full-Screen Scrolling: Explore rich Islamic content
            </Text>
          </View>
        </View>

        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkModeText]}>
            Support
          </Text>
          <Text style={[styles.paragraph, darkMode && styles.darkModeTextSecondary]}>
            For assistance, improvements, or feedback:
            📧 Contact: support@askansar.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionDark: {
    backgroundColor: '#1e293b',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter-Bold',
      default: 'Inter-Bold',
    }),
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 16,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 16,
    lineHeight: 28,
    color: '#475569',
    paddingLeft: 8,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
    marginTop: 16,
  },
  example: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    paddingLeft: 16,
    fontStyle: 'italic',
  },
  darkModeText: {
    color: '#f8fafc',
  },
  darkModeTextSecondary: {
    color: '#94a3b8',
  },
});