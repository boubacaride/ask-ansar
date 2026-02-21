import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';

export default function UndefinedTopicScreen() {
  const { darkMode } = useSettings();

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.content, darkMode && styles.contentDark]}>
          <Text style={[styles.title, darkMode && styles.titleDark]}>
            Undefined in Islamic Texts
          </Text>
          
          <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>
            Understanding matters that are not explicitly detailed in the Qur'an or Hadith
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              What Is Considered "Undefined"?
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              In Islamic scholarship, when we ask "what is undefined in the Qur'an or Hadith?", it usually refers to things that are:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Not explicitly detailed</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Left general</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Open to interpretation</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Intentionally unspecified for flexibility or wisdom</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              1. Matters Left General (Unspecified)
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              Sometimes Allah ﷻ or the Prophet ﷺ mention a command, but without specifying the exact details — leaving room for flexibility based on time, place, or situation.
            </Text>
            <Text style={[styles.subheading, darkMode && styles.textDark]}>Examples:</Text>
            <View style={styles.example}>
              <Text style={[styles.exampleTitle, darkMode && styles.textDark]}>Types of foods allowed:</Text>
              <Text style={[styles.exampleText, darkMode && styles.textDarkSecondary]}>
                The Qur'an says all good (ṭayyib) foods are halal (Qur'an 2:168), but doesn't list every type. It's left to common sense and general principles.
              </Text>
            </View>
            <View style={styles.example}>
              <Text style={[styles.exampleTitle, darkMode && styles.textDark]}>The form of prayer invocation (du'a):</Text>
              <Text style={[styles.exampleText, darkMode && styles.textDarkSecondary]}>
                The Prophet ﷺ taught many duas, but people are encouraged to make du'a in their own words too.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              2. Purposeful Silence (Tawaqquf / Sukūt Shar'i)
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              Some matters were left intentionally undefined — as a mercy — so the religion does not become too hard.
            </Text>
            <View style={styles.hadithBox}>
              <Text style={[styles.arabicText, darkMode && styles.arabicTextDark]}>
                ما تركتكم ذروني ما تركتكم، إنما أهلك من كان قبلكم كثرة سؤالهم واختلافهم على أنبيائهم
              </Text>
              <Text style={[styles.hadithText, darkMode && styles.textDarkSecondary]}>
                "What I have left you with, leave it, for those who were before you were destroyed because of their excessive questioning and differing with their prophets."
              </Text>
              <Text style={[styles.hadithReference, darkMode && styles.textDarkSecondary]}>
                (Reported by Muslim, no. 1337)
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              3. Terms Without Precise Technical Definitions
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              Some words are mentioned without strict definitions and scholars interpret based on Arabic language or context.
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• "Maysir" (gambling) — Qur'an forbids it, but details were clarified later through Hadith</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• "Riba" (usury/interest) — Qur'an forbids it generally; Hadith and scholarly work explain its types</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• "Zakatable wealth" — Qur'an orders Zakat but the amounts and categories are fully detailed in the Sunnah</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              4. Open-ended Matters
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              Some rulings have multiple valid ways to perform them because the Prophet ﷺ himself practiced them differently.
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Raising hands during prayer (raf' al-yadayn) — multiple correct ways according to authentic narrations</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Adhan wording — slight variations among Bilal and other companions, all accepted</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              Summary
            </Text>
            <Text style={[styles.paragraph, darkMode && styles.textDarkSecondary]}>
              In Islam:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• What Allah and His Messenger left undefined is a mercy and flexibility, not a flaw</Text>
              <Text style={[styles.bulletPoint, darkMode && styles.textDarkSecondary]}>• Scholars (Fuqaha, Ulema) use principles like Ijma' (consensus) and Qiyas (analogy) to interpret undefined matters</Text>
            </View>
          </View>
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
  content: {
    padding: 20,
  },
  contentDark: {
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter-Bold',
      default: 'Inter-Bold',
    }),
  },
  titleDark: {
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 24,
  },
  subtitleDark: {
    color: '#94a3b8',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
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
    color: '#475569',
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 12,
    paddingLeft: 16,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  example: {
    marginBottom: 16,
    paddingLeft: 16,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  hadithBox: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  arabicText: {
    fontSize: 20,
    color: '#1e293b',
    textAlign: 'right',
    marginBottom: 12,
    fontFamily: 'NotoNaskhArabic-Regular',
  },
  arabicTextDark: {
    color: '#f8fafc',
  },
  hadithText: {
    fontSize: 16,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 24,
  },
  hadithReference: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'right',
  },
  textDark: {
    color: '#f8fafc',
  },
  textDarkSecondary: {
    color: '#94a3b8',
  },
});