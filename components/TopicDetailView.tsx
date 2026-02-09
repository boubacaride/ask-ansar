import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';

interface QuestionCategory {
  title: string;
  questions: string[];
}

interface TopicDetailViewProps {
  categoryIndex: number;
  questionsData: QuestionCategory[];
}

export default function TopicDetailView({ categoryIndex, questionsData }: TopicDetailViewProps) {
  const { darkMode } = useSettings();

  if (categoryIndex < 0 || categoryIndex >= questionsData.length) {
    return (
      <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, darkMode && styles.errorTextDark]}>
            Catégorie non trouvée
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const category = questionsData[categoryIndex];

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.mainTitle, darkMode && styles.mainTitleDark]}>
            {category.title}
          </Text>
          <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>
            Explorez ces questions pour approfondir votre compréhension
          </Text>
        </View>

        <View style={[styles.categoryContainer, darkMode && styles.categoryContainerDark]}>
          {category.questions.map((question, questionIndex) => (
            <View
              key={questionIndex}
              style={[styles.questionItem, darkMode && styles.questionItemDark]}
            >
              <View style={[styles.questionNumber, darkMode && styles.questionNumberDark]}>
                <Text style={[styles.questionNumberText, darkMode && styles.questionNumberTextDark]}>
                  {questionIndex + 1}
                </Text>
              </View>
              <Text style={[styles.questionText, darkMode && styles.questionTextDark]}>
                {question}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, darkMode && styles.footerTextDark]}>
            Vous pouvez poser n'importe laquelle de ces questions dans le chat pour obtenir des réponses détaillées.
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 34,
  },
  mainTitleDark: {
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  subtitleDark: {
    color: '#94a3b8',
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryContainerDark: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0.2,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  questionItemDark: {
    backgroundColor: '#334155',
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  questionNumberDark: {
    backgroundColor: '#14b8a6',
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  questionNumberTextDark: {
    color: '#0f172a',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    paddingTop: 4,
  },
  questionTextDark: {
    color: '#e2e8f0',
  },
  footer: {
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#0c4a6e',
    textAlign: 'center',
    lineHeight: 21,
  },
  footerTextDark: {
    color: '#bae6fd',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#64748b',
  },
  errorTextDark: {
    color: '#94a3b8',
  },
});
