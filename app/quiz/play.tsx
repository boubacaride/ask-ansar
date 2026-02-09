import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { SEERAH_QUIZ_DATA } from '@/constants/seerahQuizData';
import {
  selectQuestionsForEvent,
  shuffleChoices,
  getAnswerLabel,
} from '@/utils/quizUtils';
import type { QuizQuestion, ShuffledChoice } from '@/types/seerahQuiz';

export default function QuizPlayScreen() {
  const { eventId: eventIdParam } = useLocalSearchParams<{ eventId: string }>();
  const eventId = parseInt(eventIdParam ?? '1', 10);
  const { darkMode } = useSettings();
  const {
    session,
    _hasHydrated,
    startEventQuiz,
    answerQuestion,
    nextQuestion,
    completeEventQuiz,
  } = useQuizStore();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const colors = {
    background: darkMode ? '#1a1a2e' : '#f8f9fa',
    card: darkMode ? '#252540' : '#ffffff',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    border: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    primary: '#00897b',
    secondary: '#C4A35A',
    success: '#28a745',
    error: '#dc3545',
    optionBg: darkMode ? '#2a2a45' : '#ffffff',
    optionSelected: darkMode ? '#1a3a3a' : '#e8f5e9',
    correctBg: darkMode ? '#1a3a2a' : '#d4edda',
    incorrectBg: darkMode ? '#3a1a1a' : '#f8d7da',
  };

  // Find event data
  const eventData = SEERAH_QUIZ_DATA.find((e) => e.eventId === eventId);

  // Initialize quiz session or resume existing one — MUST wait for hydration
  useEffect(() => {
    if (!_hasHydrated) return; // Wait until persisted state is loaded from AsyncStorage
    if (!eventData) return;
    // If there's already a saved session for this event, resume it (user left mid-quiz)
    if (session?.eventId === eventId) return;
    // Otherwise start a fresh quiz for this event
    const selected = selectQuestionsForEvent(eventData.questions, 3);
    const questionIds = selected.map((q) => q.id);
    const shuffled: Record<string, ShuffledChoice> = {};
    for (const q of selected) {
      shuffled[q.id] = shuffleChoices(q);
    }
    startEventQuiz(eventId, questionIds, shuffled);
  }, [eventId, eventData, _hasHydrated]);

  // Reset or restore selection state when question changes or session resumes
  useEffect(() => {
    if (!session) return;
    const qId = session.questionIds[session.currentIndex];
    const previousAnswer = session.answers[qId];
    if (previousAnswer !== undefined) {
      // This question was already answered (user left before pressing "Next")
      // Restore the validated state so they can just press "Next"
      const shuffled = session.shuffledChoices[qId];
      setSelectedIndex(previousAnswer);
      setIsValidated(true);
      setIsCorrect(previousAnswer === shuffled?.correctIndex);
      feedbackAnim.setValue(1);
    } else {
      setSelectedIndex(null);
      setIsValidated(false);
      setIsCorrect(false);
      feedbackAnim.setValue(0);
    }
  }, [session?.currentIndex, session?.eventId]);

  const haptic = (type: 'success' | 'error' | 'light') => {
    if (Platform.OS === 'web') return;
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  if (!_hasHydrated || !eventData || !session) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement du quiz...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestionId = session.questionIds[session.currentIndex];
  const currentQuestion = eventData.questions.find((q) => q.id === currentQuestionId);
  const shuffledData = session.shuffledChoices[currentQuestionId];

  if (!currentQuestion || !shuffledData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Erreur de chargement...
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSelectAnswer = (index: number) => {
    if (isValidated) return;
    haptic('light');
    setSelectedIndex(index);
  };

  const handleValidate = () => {
    if (selectedIndex === null) return;

    const correct = selectedIndex === shuffledData.correctIndex;
    setIsCorrect(correct);
    setIsValidated(true);
    answerQuestion(currentQuestionId, selectedIndex, correct);

    haptic(correct ? 'success' : 'error');

    // Animate feedback
    Animated.spring(feedbackAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleNext = () => {
    haptic('light');
    const isLastQuestion = session.currentIndex >= 2;

    if (isLastQuestion) {
      // Complete the event quiz
      completeEventQuiz();
      const finalScore = session.correctCount + (isCorrect ? 0 : 0); // already counted in answerQuestion
      const storeState = useQuizStore.getState();
      const result = storeState.eventResults[eventId];

      router.replace(
        `/quiz/event-result?eventId=${eventId}&score=${result?.score ?? 0}&passed=${result?.passed ? '1' : '0'}`
      );
    } else {
      nextQuestion();
    }
  };

  const getOptionStyle = (index: number) => {
    if (!isValidated) {
      if (selectedIndex === index) {
        return {
          backgroundColor: colors.optionSelected,
          borderColor: colors.primary,
          borderWidth: 2,
        };
      }
      return {
        backgroundColor: colors.optionBg,
        borderColor: colors.border,
        borderWidth: 1,
      };
    }

    // After validation
    if (index === shuffledData.correctIndex) {
      return {
        backgroundColor: colors.correctBg,
        borderColor: colors.success,
        borderWidth: 2,
      };
    }
    if (selectedIndex === index && !isCorrect) {
      return {
        backgroundColor: colors.incorrectBg,
        borderColor: colors.error,
        borderWidth: 2,
      };
    }
    return {
      backgroundColor: colors.optionBg,
      borderColor: colors.border,
      borderWidth: 1,
      opacity: 0.5,
    };
  };

  const getOptionTextColor = (index: number) => {
    if (!isValidated) {
      return selectedIndex === index ? colors.primary : colors.text;
    }
    if (index === shuffledData.correctIndex) return colors.success;
    if (selectedIndex === index && !isCorrect) return colors.error;
    return colors.textSecondary;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            haptic('light');
            router.back();
          }}
          style={styles.headerBack}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerEvent, { color: colors.textSecondary }]}>
            Evenement {eventId}/35
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            haptic('light');
            // Session is already auto-saved — just navigate out
            router.replace('/(tabs)/seerah-map');
          }}
          style={styles.headerSave}
        >
          <FontAwesome5 name="bookmark" size={16} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info Card */}
        <LinearGradient
          colors={darkMode ? ['#252540', '#1a2a3a'] : ['#f0f7f7', '#e8f5e9']}
          style={styles.eventCard}
        >
          <Text style={[styles.eventTitle, { color: colors.text }]}>
            📍 {eventData.eventTitle}
          </Text>
          <Text style={[styles.eventYear, { color: colors.textSecondary }]}>
            {eventData.eventYear}
          </Text>
        </LinearGradient>

        {/* Question Progress */}
        <View style={styles.questionProgress}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    i < session.currentIndex
                      ? colors.success
                      : i === session.currentIndex
                      ? colors.primary
                      : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.questionCount, { color: colors.textSecondary }]}>
          Question {session.currentIndex + 1}/3
        </Text>

        {/* Question */}
        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {shuffledData.choices.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, getOptionStyle(index)]}
              onPress={() => handleSelectAnswer(index)}
              activeOpacity={isValidated ? 1 : 0.7}
              disabled={isValidated}
            >
              <View
                style={[
                  styles.optionLabel,
                  {
                    backgroundColor: isValidated
                      ? index === shuffledData.correctIndex
                        ? colors.success + '30'
                        : selectedIndex === index && !isCorrect
                        ? colors.error + '30'
                        : colors.border
                      : selectedIndex === index
                      ? colors.primary + '30'
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionLabelText,
                    { color: getOptionTextColor(index) },
                  ]}
                >
                  {getAnswerLabel(index)}
                </Text>
              </View>
              <Text
                style={[styles.optionText, { color: getOptionTextColor(index) }]}
              >
                {choice}
              </Text>
              {isValidated && index === shuffledData.correctIndex && (
                <FontAwesome5
                  name="check-circle"
                  size={18}
                  color={colors.success}
                  style={styles.optionIcon}
                />
              )}
              {isValidated && selectedIndex === index && !isCorrect && (
                <FontAwesome5
                  name="times-circle"
                  size={18}
                  color={colors.error}
                  style={styles.optionIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback */}
        {isValidated && (
          <Animated.View
            style={[
              styles.feedbackCard,
              {
                backgroundColor: isCorrect ? colors.correctBg : colors.incorrectBg,
                borderColor: isCorrect ? colors.success : colors.error,
                transform: [
                  {
                    scale: feedbackAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
                opacity: feedbackAnim,
              },
            ]}
          >
            <Text style={[styles.feedbackTitle, { color: isCorrect ? colors.success : colors.error }]}>
              {isCorrect ? '✓ Bonne reponse !' : '✗ Mauvaise reponse'}
            </Text>
            <Text style={[styles.feedbackExplanation, { color: colors.text }]}>
              {currentQuestion.explanation}
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {!isValidated ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: selectedIndex !== null ? colors.primary : colors.border,
              },
            ]}
            onPress={handleValidate}
            disabled={selectedIndex === null}
          >
            <Text
              style={[
                styles.actionButtonText,
                { color: selectedIndex !== null ? '#ffffff' : colors.textSecondary },
              ]}
            >
              Valider
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.actionButtonText}>
              {session.currentIndex >= 2 ? 'Voir le resultat' : 'Question suivante'}
            </Text>
            <FontAwesome5 name="arrow-right" size={14} color="#ffffff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.saveForLaterButton, { borderColor: colors.secondary }]}
          onPress={() => {
            haptic('light');
            // Session is already auto-saved in the store — just leave
            router.replace('/(tabs)/seerah-map');
          }}
        >
          <FontAwesome5 name="bookmark" size={14} color={colors.secondary} />
          <Text style={[styles.saveForLaterText, { color: colors.secondary }]}>
            Sauvegarder pour plus tard
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSave: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerEvent: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  eventCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventYear: {
    fontSize: 13,
    fontWeight: '500',
  },
  questionProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  questionCount: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  questionCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLabelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  optionIcon: {
    marginLeft: 8,
  },
  feedbackCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  feedbackExplanation: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  saveForLaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 8,
  },
  saveForLaterText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
