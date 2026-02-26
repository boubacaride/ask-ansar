import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useCallback } from 'react';
import { useSettings } from '@/store/settingsStore';
import { ChevronDown, ChevronRight, RefreshCw, Copy, Share, BookOpen } from 'lucide-react-native';
import { generateChatResponseStream } from '@/llm';
import FormattedText from './FormattedText';
import ShareModal from './ShareModal';

interface QuestionCategory {
  title: string;
  questions: string[];
}

interface TopicDetailViewProps {
  categoryIndex: number;
  questionsData: QuestionCategory[];
}

interface AnswerState {
  text: string;
  loading: boolean;
  error?: string;
  detailed?: boolean;
  detailText?: string;
  detailLoading?: boolean;
}

export default function TopicDetailView({ categoryIndex, questionsData }: TopicDetailViewProps) {
  const { darkMode } = useSettings();
  const [answers, setAnswers] = useState<Map<number, AnswerState>>(new Map());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<number | null>(null);
  const [shareText, setShareText] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleCopy = useCallback(async (text: string, key: number) => {
    await Clipboard.setStringAsync(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const handleQuestionPress = useCallback((index: number, question: string) => {
    // If already expanded, collapse
    if (expandedIndex === index) {
      setExpandedIndex(null);
      return;
    }

    setExpandedIndex(index);

    // If answer already fetched, just expand
    const existing = answers.get(index);
    if (existing?.text && !existing.error) {
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Start loading
    setAnswers(prev => {
      const next = new Map(prev);
      next.set(index, { text: '', loading: true });
      return next;
    });

    // Brief answer first
    generateChatResponseStream(
      question,
      (token) => {
        if (controller.signal.aborted) return;
        setAnswers(prev => {
          const next = new Map(prev);
          const current = next.get(index);
          next.set(index, {
            ...current,
            text: (current?.text ?? '') + token,
            loading: true,
          });
          return next;
        });
      },
      controller.signal,
    )
      .then(() => {
        if (controller.signal.aborted) return;
        setAnswers(prev => {
          const next = new Map(prev);
          const current = next.get(index);
          next.set(index, { ...current, text: current?.text ?? '', loading: false });
          return next;
        });
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setAnswers(prev => {
          const next = new Map(prev);
          next.set(index, {
            text: '',
            loading: false,
            error: 'Impossible de charger la réponse. Vérifiez votre connexion.',
          });
          return next;
        });
      });
  }, [expandedIndex, answers]);

  const handleVoirPlus = useCallback((index: number, question: string) => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Mark detail as loading
    setAnswers(prev => {
      const next = new Map(prev);
      const current = next.get(index);
      if (current) {
        next.set(index, { ...current, detailed: true, detailText: '', detailLoading: true });
      }
      return next;
    });

    const detailedPrompt = `${question}\n\nDonne une reponse detaillee et approfondie. Inclus obligatoirement:\n1. Une definition claire et complete du sujet\n2. Les preuves du Coran (cite le verset complet en arabe avec la traduction et la reference sourate:verset)\n3. Les preuves des Hadiths authentiques (cite le texte, la source, le numero et le grade)\n4. L'explication des savants reconnus si pertinent\nSois pedagogique, structure ta reponse clairement.`;

    generateChatResponseStream(
      detailedPrompt,
      (token) => {
        if (controller.signal.aborted) return;
        setAnswers(prev => {
          const next = new Map(prev);
          const current = next.get(index);
          if (current) {
            next.set(index, {
              ...current,
              detailText: (current.detailText ?? '') + token,
              detailLoading: true,
            });
          }
          return next;
        });
      },
      controller.signal,
      'topic-detail',
    )
      .then(() => {
        if (controller.signal.aborted) return;
        setAnswers(prev => {
          const next = new Map(prev);
          const current = next.get(index);
          if (current) {
            next.set(index, { ...current, detailLoading: false });
          }
          return next;
        });
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setAnswers(prev => {
          const next = new Map(prev);
          const current = next.get(index);
          if (current) {
            next.set(index, { ...current, detailLoading: false, detailText: '' });
          }
          return next;
        });
      });
  }, []);

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
            Appuyez sur une question pour obtenir la réponse
          </Text>
        </View>

        <View style={[styles.categoryContainer, darkMode && styles.categoryContainerDark]}>
          {category.questions.map((question, questionIndex) => {
            const isExpanded = expandedIndex === questionIndex;
            const answer = answers.get(questionIndex);

            return (
              <View key={questionIndex}>
                <Pressable
                  style={({ pressed }) => [
                    styles.questionItem,
                    darkMode && styles.questionItemDark,
                    isExpanded && styles.questionItemExpanded,
                    isExpanded && darkMode && styles.questionItemExpandedDark,
                    pressed && styles.questionItemPressed,
                  ]}
                  onPress={() => handleQuestionPress(questionIndex, question)}
                >
                  <View style={[styles.questionNumber, darkMode && styles.questionNumberDark]}>
                    <Text style={[styles.questionNumberText, darkMode && styles.questionNumberTextDark]}>
                      {questionIndex + 1}
                    </Text>
                  </View>
                  <Text style={[styles.questionText, darkMode && styles.questionTextDark]}>
                    {question}
                  </Text>
                  {isExpanded ? (
                    <ChevronDown size={18} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
                  ) : (
                    <ChevronRight size={18} color={darkMode ? '#64748b' : '#94a3b8'} strokeWidth={2} />
                  )}
                </Pressable>

                {isExpanded && (
                  <View style={[styles.answerContainer, darkMode && styles.answerContainerDark]}>
                    {answer?.loading && !answer.text && (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={darkMode ? '#14b8a6' : '#0f766e'} />
                        <Text style={[styles.loadingText, darkMode && styles.loadingTextDark]}>
                          Génération de la réponse...
                        </Text>
                      </View>
                    )}

                    {answer?.text ? (
                      <View>
                        <FormattedText text={answer.text} darkMode={darkMode} />
                        {answer.loading && (
                          <Text style={[styles.streamingDots, darkMode && styles.streamingDotsDark]}>...</Text>
                        )}
                        {!answer.loading && !answer.detailed && (
                          <Pressable
                            style={[styles.voirPlusButton, darkMode && styles.voirPlusButtonDark]}
                            onPress={() => handleVoirPlus(questionIndex, question)}
                          >
                            <BookOpen size={15} color="#ffffff" />
                            <Text style={styles.voirPlusText}>Voir plus</Text>
                          </Pressable>
                        )}

                        {answer.detailed && (
                          <View style={[styles.detailSection, darkMode && styles.detailSectionDark]}>
                            {answer.detailLoading && !answer.detailText && (
                              <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={darkMode ? '#14b8a6' : '#0f766e'} />
                                <Text style={[styles.loadingText, darkMode && styles.loadingTextDark]}>
                                  Chargement des details...
                                </Text>
                              </View>
                            )}
                            {answer.detailText ? (
                              <View>
                                <FormattedText text={answer.detailText} darkMode={darkMode} />
                                {answer.detailLoading && (
                                  <Text style={[styles.streamingDots, darkMode && styles.streamingDotsDark]}>...</Text>
                                )}
                              </View>
                            ) : null}
                          </View>
                        )}

                        {!answer.loading && !(answer.detailLoading) && (
                          <View style={styles.answerActions}>
                            <Pressable
                              style={[styles.actionButton, darkMode && styles.actionButtonDark]}
                              onPress={() => handleCopy(
                                answer.detailText ? answer.text + '\n\n' + answer.detailText : answer.text,
                                questionIndex
                              )}
                            >
                              <Copy size={14} color={darkMode ? '#14b8a6' : '#0f766e'} />
                              <Text style={[styles.actionButtonText, darkMode && styles.actionButtonTextDark]}>
                                {copiedKey === questionIndex ? 'Copié !' : 'Copier'}
                              </Text>
                            </Pressable>
                            <Pressable
                              style={[styles.actionButton, darkMode && styles.actionButtonDark]}
                              onPress={() => setShareText(
                                answer.detailText ? answer.text + '\n\n' + answer.detailText : answer.text
                              )}
                            >
                              <Share size={14} color={darkMode ? '#14b8a6' : '#0f766e'} />
                              <Text style={[styles.actionButtonText, darkMode && styles.actionButtonTextDark]}>
                                Partager
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    ) : null}

                    {answer?.error && (
                      <Pressable
                        style={styles.errorRow}
                        onPress={() => handleQuestionPress(-1, '')}
                      >
                        <Text style={[styles.answerError, darkMode && styles.answerErrorDark]}>
                          {answer.error}
                        </Text>
                        <Pressable
                          style={[styles.retryButton, darkMode && styles.retryButtonDark]}
                          onPress={() => {
                            setExpandedIndex(null);
                            // Small delay to reset, then re-trigger
                            setTimeout(() => handleQuestionPress(questionIndex, question), 50);
                          }}
                        >
                          <RefreshCw size={14} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
                          <Text style={[styles.retryText, darkMode && styles.retryTextDark]}>
                            Réessayer
                          </Text>
                        </Pressable>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <ShareModal
        visible={shareText !== null}
        onClose={() => setShareText(null)}
        text={shareText ?? ''}
        darkMode={darkMode}
      />
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
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  questionItemDark: {
    backgroundColor: '#334155',
  },
  questionItemExpanded: {
    backgroundColor: '#e0f2fe',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  questionItemExpandedDark: {
    backgroundColor: '#0f766e33',
  },
  questionItemPressed: {
    opacity: 0.7,
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
  },
  questionTextDark: {
    color: '#e2e8f0',
  },
  answerContainer: {
    backgroundColor: '#f0f9ff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  answerContainerDark: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingTextDark: {
    color: '#94a3b8',
  },
  streamingDots: {
    fontSize: 16,
    color: '#0f766e',
    fontWeight: '700',
    marginTop: 4,
  },
  streamingDotsDark: {
    color: '#14b8a6',
  },
  errorRow: {
    gap: 8,
  },
  answerError: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 8,
  },
  answerErrorDark: {
    color: '#f87171',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0fdfa',
  },
  retryButtonDark: {
    backgroundColor: '#0f766e33',
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f766e',
  },
  retryTextDark: {
    color: '#14b8a6',
  },
  answerActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    gap: 6,
  },
  actionButtonDark: {
    backgroundColor: '#0f766e33',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#0f766e',
    fontWeight: '600',
  },
  actionButtonTextDark: {
    color: '#14b8a6',
  },
  voirPlusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#0f766e',
  },
  voirPlusButtonDark: {
    backgroundColor: '#14b8a6',
  },
  voirPlusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  detailSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  detailSectionDark: {
    borderTopColor: '#334155',
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
