import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { SEERAH_QUIZ_DATA } from '@/constants/seerahQuizData';

const TOTAL_EVENTS = 35;

export default function QuizHomeScreen() {
  const { darkMode } = useSettings();
  const {
    _hasHydrated,
    eventResults,
    totalCorrect,
    totalAnswered,
    isQuizComplete,
    session,
    getOverallPercentage,
    getCompletedCount,
    resetAllProgress,
    clearSession,
  } = useQuizStore();

  const colors = {
    background: darkMode ? '#1a1a2e' : '#f8f9fa',
    card: darkMode ? '#252540' : '#ffffff',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    primary: '#00897b',
    secondary: '#C4A35A',
    success: '#28a745',
  };

  const completedCount = getCompletedCount();
  const overallPercentage = totalAnswered > 0 ? getOverallPercentage() : 0;
  const progressPercent = (completedCount / TOTAL_EVENTS) * 100;

  const hasStarted = totalAnswered > 0 || session !== null;

  const haptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleStart = () => {
    haptic();
    // If there's an in-progress session, resume it
    if (session) {
      router.push(`/quiz/play?eventId=${session.eventId}`);
    } else {
      // Find the next event that hasn't been completed, or start from 1
      const nextIncomplete = SEERAH_QUIZ_DATA.find(
        (e) => !eventResults[e.eventId]?.passed
      );
      router.push(`/quiz/play?eventId=${nextIncomplete?.eventId ?? 1}`);
    }
  };

  const handleRestart = () => {
    haptic();
    resetAllProgress();
    router.push('/quiz/play?eventId=1');
  };

  const handleEventPress = (eventId: number) => {
    haptic();
    // If there's a session in progress for a DIFFERENT event, warn the user
    if (session && session.eventId !== eventId) {
      const sessionEvent = SEERAH_QUIZ_DATA.find((e) => e.eventId === session.eventId);
      const sessionName = sessionEvent?.eventTitle ?? `Evenement ${session.eventId}`;
      const progress = `${session.currentIndex + 1}/3`;

      if (Platform.OS === 'web') {
        const confirmed = window.confirm(
          `Vous avez un quiz en cours sur "${sessionName}" (question ${progress}).\n\nSi vous continuez, votre progression sera perdue.\n\nVoulez-vous abandonner et commencer cet evenement ?`
        );
        if (confirmed) {
          clearSession();
          router.push(`/quiz/play?eventId=${eventId}`);
        }
      } else {
        Alert.alert(
          'Quiz en cours',
          `Vous avez un quiz en cours sur "${sessionName}" (question ${progress}).\n\nSi vous continuez, votre progression sera perdue.`,
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Reprendre mon quiz',
              onPress: () => router.push(`/quiz/play?eventId=${session.eventId}`),
            },
            {
              text: 'Abandonner et continuer',
              style: 'destructive',
              onPress: () => {
                clearSession();
                router.push(`/quiz/play?eventId=${eventId}`);
              },
            },
          ]
        );
      }
    } else {
      router.push(`/quiz/play?eventId=${eventId}`);
    }
  };

  const getEventStatus = (eventId: number) => {
    const result = eventResults[eventId];
    if (result?.passed) return 'completed';
    if (session?.eventId === eventId) return 'in_progress';
    return 'available';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FontAwesome5 name="check-circle" size={18} color={colors.success} />;
      case 'in_progress':
        return <FontAwesome5 name="pause-circle" size={18} color={colors.secondary} />;
      default:
        return <FontAwesome5 name="play-circle" size={18} color={colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Quiz de la Sira</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={darkMode ? ['#1a3a3a', '#0D5C63', '#1a3a3a'] : ['#00897b', '#00695c', '#004d40']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroEmoji}>🕌</Text>
          <Text style={styles.heroTitle}>Quiz de la Sira</Text>
          <Text style={styles.heroSubtitle}>
            Testez vos connaissances sur la vie{'\n'}du Prophete Muhammad (ﷺ)
          </Text>

          {/* Progress Ring */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>
                {completedCount}/{TOTAL_EVENTS}
              </Text>
              <Text style={styles.progressLabel}>evenements</Text>
            </View>
            {hasStarted && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{overallPercentage}%</Text>
                  <Text style={styles.statLabel}>Score</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalCorrect}</Text>
                  <Text style={styles.statLabel}>Correct</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalAnswered}</Text>
                  <Text style={styles.statLabel}>Repondu</Text>
                </View>
              </View>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <View
                style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={styles.progressBarText}>
              Progression : {completedCount}/{TOTAL_EVENTS} evenements
            </Text>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleStart}
          >
            <FontAwesome5
              name={hasStarted ? 'play' : 'rocket'}
              size={18}
              color="#fff"
            />
            <Text style={styles.primaryButtonText}>
              {isQuizComplete
                ? 'Revoir les evenements'
                : session
                ? 'Reprendre le Quiz'
                : hasStarted
                ? 'Continuer'
                : 'Commencer le Quiz'}
            </Text>
          </TouchableOpacity>

          {hasStarted && !isQuizComplete && (
            <TouchableOpacity
              style={[styles.saveButton, { borderColor: colors.secondary, backgroundColor: colors.card }]}
              onPress={() => {
                haptic();
                router.back();
              }}
            >
              <FontAwesome5 name="bookmark" size={16} color={colors.secondary} />
              <Text style={[styles.saveButtonText, { color: colors.secondary }]}>
                Sauvegarder pour plus tard
              </Text>
            </TouchableOpacity>
          )}

          {isQuizComplete && (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={handleRestart}
            >
              <FontAwesome5 name="redo" size={16} color={colors.textSecondary} />
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                Recommencer
              </Text>
            </TouchableOpacity>
          )}

          {isQuizComplete && (
            <TouchableOpacity
              style={[styles.medalButton, { backgroundColor: colors.secondary }]}
              onPress={() => {
                haptic();
                router.push('/quiz/final-result');
              }}
            >
              <Text style={styles.medalButtonText}>🏆 Voir mon resultat final</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Event List */}
        <View style={styles.eventListHeader}>
          <Text style={[styles.eventListTitle, { color: colors.text }]}>
            Les 35 evenements
          </Text>
          <Text style={[styles.eventListSubtitle, { color: colors.textSecondary }]}>
            Choisissez un evenement pour tester vos connaissances
          </Text>
        </View>

        {SEERAH_QUIZ_DATA.map((eventData) => {
          const status = getEventStatus(eventData.eventId);
          const result = eventResults[eventData.eventId];

          return (
            <TouchableOpacity
              key={eventData.eventId}
              style={[
                styles.eventCard,
                {
                  backgroundColor: colors.card,
                  borderColor: status === 'completed' ? colors.success + '40' :
                               status === 'in_progress' ? colors.secondary + '40' : colors.border,
                },
              ]}
              onPress={() => handleEventPress(eventData.eventId)}
              activeOpacity={0.7}
            >
              <View style={styles.eventCardLeft}>
                <View
                  style={[
                    styles.eventNumber,
                    {
                      backgroundColor:
                        status === 'completed'
                          ? colors.success + '20'
                          : status === 'in_progress'
                          ? colors.secondary + '20'
                          : colors.primary + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.eventNumberText,
                      {
                        color:
                          status === 'completed'
                            ? colors.success
                            : status === 'in_progress'
                            ? colors.secondary
                            : colors.primary,
                      },
                    ]}
                  >
                    {eventData.eventId}
                  </Text>
                </View>
              </View>

              <View style={styles.eventCardContent}>
                <Text
                  style={[styles.eventCardTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {eventData.eventTitle}
                </Text>
                <Text style={[styles.eventCardYear, { color: colors.textSecondary }]}>
                  {eventData.eventYear}
                </Text>
                {result && (
                  <Text style={[styles.eventCardScore, { color: result.passed ? colors.success : colors.secondary }]}>
                    Meilleur score : {result.score}/3
                  </Text>
                )}
              </View>

              <View style={styles.eventCardRight}>
                {getStatusIcon(status)}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  progressLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#C4A35A',
  },
  progressBarText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  medalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  medalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  eventListHeader: {
    marginBottom: 16,
  },
  eventListTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventListSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  eventCardLeft: {
    marginRight: 12,
  },
  eventNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  eventCardContent: {
    flex: 1,
  },
  eventCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  eventCardYear: {
    fontSize: 12,
    marginTop: 2,
  },
  eventCardScore: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  eventCardRight: {
    marginLeft: 8,
  },
});
