import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';

export default function PrivacyPolicyScreen() {
  const { darkMode } = useSettings();

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.content, darkMode && styles.contentDark]}>
          <Text style={[styles.title, darkMode && styles.titleDark]}>
            Privacy Policy
          </Text>
          
          <Text style={[styles.lastUpdated, darkMode && styles.textDarkSecondary]}>
            Last Updated: March 1, 2024
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              1. Introduction
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              Ask Ansar ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our mobile application and services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              2. Information We Collect
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              We collect information that you provide directly to us, including:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Account information (email, name)</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Chat history and interactions</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• App preferences and settings</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              3. How We Use Your Information
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              We use the collected information to:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Provide and improve our services</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Personalize your experience</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Communicate with you about updates</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Ensure security of our services</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              4. Data Storage and Security
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              Your data is stored securely using industry-standard encryption. We implement appropriate technical and organizational measures to protect your personal information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              5. Your Rights
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              You have the right to:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Access your personal data</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Request data deletion</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Opt-out of communications</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Update your information</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              6. Contact Us
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              If you have any questions about this Privacy Policy, please contact us at privacy@ansarvoyage.com
            </Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  contentDark: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  titleDark: {
    color: '#90CAF9',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoints: {
    marginTop: 8,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 8,
  },
  textDark: {
    color: '#fff',
  },
  textDarkSecondary: {
    color: '#aaa',
  },
});