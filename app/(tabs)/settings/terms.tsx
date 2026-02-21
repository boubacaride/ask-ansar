import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';

export default function TermsScreen() {
  const { darkMode } = useSettings();

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.content, darkMode && styles.contentDark]}>
          <Text style={[styles.title, darkMode && styles.titleDark]}>
            Terms of Service
          </Text>
          
          <Text style={[styles.lastUpdated, darkMode && styles.textDarkSecondary]}>
            Last Updated: March 1, 2024
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              1. Acceptance of Terms
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              By accessing or using Ask Ansar, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              2. Use License
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              We grant you a limited, non-exclusive, non-transferable, revocable license to use Ask Ansar for personal, non-commercial purposes, subject to these Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              3. User Responsibilities
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              You agree to:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Use the service lawfully</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Maintain account security</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Provide accurate information</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Not misuse the service</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              4. Content Guidelines
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              Users must not submit content that:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Is unlawful or harmful</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Infringes on others' rights</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Is inappropriate or offensive</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Contains malware or viruses</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              5. Intellectual Property
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              All content and materials available through Ask Ansar are protected by intellectual property rights. You may not use, reproduce, or distribute any content without our permission.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              6. Termination
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any violation of these Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              7. Contact Information
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              For any questions about these Terms, please contact us at legal@ansarvoyage.com
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