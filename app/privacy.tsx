import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { Stack } from 'expo-router';

export default function PrivacyPolicyPage() {
  const { darkMode } = useSettings();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Privacy Policy',
          headerStyle: {
            backgroundColor: darkMode ? '#1E1E1E' : '#fff',
          },
          headerTintColor: darkMode ? '#fff' : '#333',
        }}
      />
      <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <Text style={[styles.mainTitle, darkMode && styles.mainTitleDark]}>
              Privacy Policy
            </Text>

            <Text style={[styles.lastUpdated, darkMode && styles.textDarkSecondary]}>
              Effective Date: January 20, 2026
            </Text>

            <Text style={[styles.lastUpdated, darkMode && styles.textDarkSecondary]}>
              Last Updated: January 20, 2026
            </Text>

            <View style={styles.section}>
              <Text style={[styles.intro, darkMode && styles.textDarkSecondary]}>
                Welcome to Ansar Voyage ("Ask Ansar," "we," "us," or "our"). We are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your information. This Privacy Policy explains our practices regarding the data we collect through our mobile application and related services.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                1. Information We Collect
              </Text>

              <Text style={[styles.subsectionTitle, darkMode && styles.textDark]}>
                1.1 Information You Provide
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                When you use Ask Ansar, we collect the following information that you provide directly to us:
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Account Information:</Text> Email address, name, and password when you create an account
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Questions and Queries:</Text> All questions and messages you submit to the app about Islamic teachings, jurisprudence, and religious guidance
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Conversation History:</Text> Your chat history and interactions with the AI assistant
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Preferences and Settings:</Text> Language preferences, display settings, and notification preferences
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Feedback:</Text> Ratings, feedback, and responses you provide about the answers you receive
                </Text>
              </View>

              <Text style={[styles.subsectionTitle, darkMode && styles.textDark]}>
                1.2 Automatically Collected Information
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                We may automatically collect certain information about your device and usage:
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • Device information (device type, operating system, unique device identifiers)
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • Usage data (features used, time spent, frequency of use)
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • Error logs and diagnostic data
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                2. How We Use Your Information
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                We use the collected information for the following purposes:
              </Text>

              <Text style={[styles.subsectionTitle, darkMode && styles.textDark]}>
                2.1 Providing Services
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Processing Questions:</Text> Your questions are processed through our AI system to provide accurate answers about Islamic teachings, drawing from authentic sources including the Quran, Hadith, and scholarly interpretations
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Personalization:</Text> Customizing your experience based on your preferences and previous interactions
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Account Management:</Text> Creating and maintaining your account, authenticating your identity, and managing your preferences
                </Text>
              </View>

              <Text style={[styles.subsectionTitle, darkMode && styles.textDark]}>
                2.2 Service Improvement
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Quality Enhancement:</Text> Questions and user interactions may be analyzed to improve the accuracy and relevance of our responses
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Feature Development:</Text> Understanding user needs to develop new features and improve existing functionality
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Bug Fixes:</Text> Identifying and resolving technical issues and errors
                </Text>
              </View>

              <Text style={[styles.subsectionTitle, darkMode && styles.textDark]}>
                2.3 Communication
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • Sending important updates about the app and our services
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • Responding to your inquiries and support requests
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • Notifying you about changes to our Privacy Policy or Terms of Service
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                3. Data Storage and Retention
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                <Text style={styles.bold}>Storage Location:</Text> Your data is stored securely on servers provided by Supabase, a trusted cloud infrastructure provider. All data is encrypted both in transit and at rest using industry-standard encryption protocols.
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                <Text style={styles.bold}>Retention Period:</Text> We retain your questions and conversation history for as long as your account is active or as needed to provide you with our services. You can delete your conversation history at any time from the app settings. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it by law.
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                <Text style={styles.bold}>Security Measures:</Text> We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure authentication, access controls, and regular security assessments.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                4. Third-Party Services
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                To provide our services, we use the following third-party services:
              </Text>

              <Text style={[styles.subsectionTitle, darkMode && styles.textDark]}>
                4.1 AI Processing Services
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                <Text style={styles.bold}>OpenAI:</Text> Your questions are processed using OpenAI's language models to generate responses. OpenAI's use of your data is governed by their own privacy policy and data usage policies. OpenAI may use the data to improve their services unless you opt out. We encourage you to review OpenAI's privacy policy at https://openai.com/privacy.
              </Text>

              <Text style={[styles.subsectionTitle, darkMode && styles.textDark]}>
                4.2 Infrastructure Services
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                <Text style={styles.bold}>Supabase:</Text> We use Supabase for database hosting, authentication, and backend infrastructure. Supabase processes your account information and stores your data securely. Their privacy practices are governed by their privacy policy, available at https://supabase.com/privacy.
              </Text>

              <Text style={[styles.subsectionTitle, darkMode && styles.textDark]}>
                4.3 Content Sources
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                We reference authenticated Islamic sources including Quran.com and Sunnah.com to provide accurate religious references. No personal data is shared with these services; they are used solely for retrieving Islamic texts and references.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                5. Data Sharing and Disclosure
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                We do not sell, rent, or trade your personal information to third parties for their marketing purposes. We may share your information only in the following circumstances:
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Service Providers:</Text> With third-party service providers (like OpenAI and Supabase) who assist in operating our app and providing services, under strict confidentiality agreements
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Legal Requirements:</Text> When required by law, court order, or legal process, or to protect our rights, property, or safety
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Business Transfers:</Text> In connection with a merger, acquisition, or sale of assets, with notice to you
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>With Your Consent:</Text> When you explicitly authorize us to share your information
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                6. Your Rights and Choices
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                You have the following rights regarding your personal information:
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Access:</Text> Request access to the personal information we hold about you
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Correction:</Text> Request correction of inaccurate or incomplete information
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Deletion:</Text> Request deletion of your personal information and conversation history
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Export:</Text> Request a copy of your data in a portable format
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Opt-Out:</Text> Opt out of certain data collection or communications
                </Text>
                <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>
                  • <Text style={styles.bold}>Account Deletion:</Text> Delete your account at any time from the app settings
                </Text>
              </View>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                7. Children's Privacy
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                Our app is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information promptly. If you believe we have collected information from a child under 13, please contact us immediately.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                8. International Data Transfers
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from those in your country. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                9. Changes to This Privacy Policy
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the new Privacy Policy in the app and updating the "Last Updated" date. Your continued use of the app after such changes constitutes your acceptance of the updated Privacy Policy.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                10. Contact Us
              </Text>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </Text>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactText, darkMode && styles.textDarkSecondary]}>
                  <Text style={styles.bold}>Email:</Text> privacy@ansarvoyage.com
                </Text>
                <Text style={[styles.contactText, darkMode && styles.textDarkSecondary]}>
                  <Text style={styles.bold}>Support:</Text> support@ansarvoyage.com
                </Text>
                <Text style={[styles.contactText, darkMode && styles.textDarkSecondary]}>
                  <Text style={styles.bold}>App Name:</Text> Ansar Voyage (Ask Ansar)
                </Text>
              </View>
              <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
                We are committed to resolving any privacy concerns you may have and will respond to your inquiry within 30 days.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.acknowledgment, darkMode && styles.textDarkSecondary]}>
                By using Ansar Voyage, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.
              </Text>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, darkMode && styles.textDarkSecondary]}>
                Thank you for trusting Ansar Voyage with your Islamic learning journey.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
    marginHorizontal: 'auto',
    width: '100%',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainTitleDark: {
    color: '#90CAF9',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  intro: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoints: {
    marginTop: 8,
    marginBottom: 12,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '600',
  },
  contactInfo: {
    backgroundColor: '#f0f4f8',
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 8,
  },
  acknowledgment: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    fontStyle: 'italic',
    padding: 16,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  textDark: {
    color: '#fff',
  },
  textDarkSecondary: {
    color: '#aaa',
  },
});
