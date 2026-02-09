import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { SEERAH_QUIZ_DATA } from '@/constants/seerahQuizData';

const TOTAL_EVENTS = 35;

export default function EventResultScreen() {
  const params = useLocalSearchParams<{
    eventId: string;
    score: string;
    passed: string;
  }>();
  const eventId = parseInt(params.eventId ?? '1', 10);
  const score = parseInt(params.score ?? '0', 10);
  const passed = params.passed === '1';
  const { darkMode } = useSettings();
  const { getCompletedCount, isQuizComplete, eventResults } = useQuizStore();

  const colors = {
    background: darkMode ? '#1a1a2e' : '#f8f9fa',
    card: darkMode ? '#252540' : '#ffffff',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    secondary: '#C4A35A',
    success: '#28a745',
    error: '#dc3545',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  };

  const eventData = SEERAH_QUIZ_DATA.find((e) => e.eventId === eventId);
  const nextEventId = eventId < TOTAL_EVENTS ? eventId + 1 : null;
  const isLastEvent = eventId >= TOTAL_EVENTS;
  const completedCount = getCompletedCount();
  const bestScore = eventResults[eventId]?.score ?? score;

  const haptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleRetry = () => {
    haptic();
    router.replace(`/quiz/play?eventId=${eventId}`);
  };

  const handleNextEvent = () => {
    haptic();
    if (nextEventId) {
      router.replace(`/quiz/play?eventId=${nextEventId}`);
    } else {
      // Last event — go to final result or home
      if (isQuizComplete) {
        router.replace('/quiz/final-result');
      } else {
        router.replace('/quiz');
      }
    }
  };

  const handleFinalResult = () => {
    haptic();
    router.replace('/quiz/final-result');
  };

  const handleHome = () => {
    haptic();
    router.replace('/quiz');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Result Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: passed ? colors.success + '15' : colors.secondary + '15' },
          ]}
        >
          <Text style={styles.iconEmoji}>{passed ? '🎉' : '📚'}</Text>
        </View>

        {/* Result Title */}
        <Text style={[styles.title, { color: passed ? colors.success : colors.secondary }]}>
          {passed ? 'Felicitations !' : "Continuez d'apprendre"}
        </Text>

        {/* Event Name */}
        <Text style={[styles.eventName, { color: colors.text }]}>
          {eventData?.eventTitle ?? `Evenement ${eventId}`}
        </Text>

        {/* Score Display */}
        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.scoreRow}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.scoreDot,
                  {
                    backgroundColor: i < score ? colors.success : colors.error + '40',
                  },
                ]}
              >
                <FontAwesome5
                  name={i < score ? 'check' : 'times'}
                  size={14}
                  color={i < score ? '#ffffff' : colors.error}
                />
              </View>
            ))}
          </View>
          <Text style={[styles.scoreText, { color: colors.text }]}>
            {score}/3 reponses correctes
          </Text>
          {bestScore > score && (
            <Text style={[styles.scoreHint, { color: colors.textSecondary }]}>
              Meilleur score : {bestScore}/3
            </Text>
          )}
          {!passed && (
            <Text style={[styles.scoreHint, { color: colors.textSecondary }]}>
              Il faut au moins 2/3 pour valider cet evenement
            </Text>
          )}
        </View>

        {/* Progress */}
        {passed && (
          <View style={styles.progressInfo}>
            <LinearGradient
              colors={[colors.primary + '20', colors.primary + '05']}
              style={styles.progressCard}
            >
              <FontAwesome5 name="chart-line" size={16} color={colors.primary} />
              <Text style={[styles.progressText, { color: colors.text }]}>
                {completedCount}/{TOTAL_EVENTS} evenements completes
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <View style={styles.buttons}>
          {/* Primary action: next event if passed, retry if failed */}
          {passed ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={isQuizComplete && isLastEvent ? handleFinalResult : handleNextEvent}
            >
              <Text style={styles.primaryBtnText}>
                {isQuizComplete && isLastEvent
                  ? 'Voir le resultat final'
                  : nextEventId
                  ? 'Evenement suivant'
                  : 'Retour au menu'}
              </Text>
              <FontAwesome5 name="arrow-right" size={16} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.secondary }]}
              onPress={handleRetry}
            >
              <Text style={styles.primaryBtnText}>Reessayer cet evenement</Text>
              <FontAwesome5 name="redo" size={16} color="#ffffff" />
            </TouchableOpacity>
          )}

          {/* Retry & final result — only visible after completing all 35 events */}
          {isQuizComplete && passed && (
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={handleRetry}
            >
              <FontAwesome5 name="redo" size={16} color={colors.textSecondary} />
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                Refaire pour ameliorer le score
              </Text>
            </TouchableOpacity>
          )}

          {isQuizComplete && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.secondary }]}
              onPress={handleFinalResult}
            >
              <Text style={styles.primaryBtnText}>🏆 Voir mon resultat final</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleHome}
          >
            <FontAwesome5 name="home" size={16} color={colors.textSecondary} />
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
              Retour au menu du quiz
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: Platform.OS === 'ios' ? 30 : 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  scoreCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  scoreDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreHint: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  progressInfo: {
    width: '100%',
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
