import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';

export default function FinalResultScreen() {
  const { darkMode } = useSettings();
  const {
    totalCorrect,
    totalAnswered,
    getOverallPercentage,
    getMedalType,
    getCompletedCount,
    resetAllProgress,
  } = useQuizStore();

  const percentage = getOverallPercentage();
  const medal = getMedalType();
  const completedCount = getCompletedCount();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const colors = {
    background: darkMode ? '#1a1a2e' : '#f8f9fa',
    card: darkMode ? '#252540' : '#ffffff',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    primary: '#00897b',
    secondary: '#C4A35A',
    gold: '#FFD700',
    bronze: '#CD7F32',
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (medal === 'gold') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (medal === 'bronze') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 5,
        delay: 300,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const haptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRestart = () => {
    haptic();
    resetAllProgress();
    router.replace('/quiz/play?eventId=1');
  };

  const handleHome = () => {
    haptic();
    router.replace('/quiz');
  };

  const handleBackToMap = () => {
    haptic();
    router.replace('/(tabs)/seerah-map');
  };

  const renderGoldMedal = () => (
    <LinearGradient
      colors={darkMode ? ['#2a2a10', '#3a3a15', '#2a2a10'] : ['#fff9e6', '#fff3cc', '#ffe680']}
      style={styles.medalGradient}
    >
      <Animated.View
        style={[
          styles.medalContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.medalEmoji}>🥇</Text>
        <Text style={[styles.medalTitle, { color: colors.gold }]}>MEDAILLE D'OR</Text>
        <Text style={[styles.medalSubtitle, { color: colors.text }]}>Excellent !</Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={[styles.medalMessage, { color: colors.text }]}>
          Vous maitrisez parfaitement la Sira{'\n'}du Prophete Muhammad (ﷺ)
        </Text>
        <View style={[styles.scoreDisplay, { backgroundColor: colors.card, borderColor: colors.gold + '40' }]}>
          <Text style={[styles.scoreBig, { color: colors.gold }]}>{percentage}%</Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Score final</Text>
          <Text style={[styles.scoreDetail, { color: colors.textSecondary }]}>
            {totalCorrect}/{totalAnswered} reponses correctes
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderBronzeMedal = () => (
    <LinearGradient
      colors={darkMode ? ['#2a2015', '#3a2a1a', '#2a2015'] : ['#fef3e8', '#fde4cc', '#f9c89b']}
      style={styles.medalGradient}
    >
      <Animated.View
        style={[
          styles.medalContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.medalEmoji}>🥉</Text>
        <Text style={[styles.medalTitle, { color: colors.bronze }]}>MEDAILLE DE BRONZE</Text>
        <Text style={[styles.medalSubtitle, { color: colors.text }]}>Tres bien !</Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={[styles.medalMessage, { color: colors.text }]}>
          Vous avez une bonne connaissance{'\n'}de la Sira.
        </Text>
        <View style={[styles.scoreDisplay, { backgroundColor: colors.card, borderColor: colors.bronze + '40' }]}>
          <Text style={[styles.scoreBig, { color: colors.bronze }]}>{percentage}%</Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Score final</Text>
          <Text style={[styles.scoreDetail, { color: colors.textSecondary }]}>
            {totalCorrect}/{totalAnswered} reponses correctes
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderRetryMessage = () => (
    <View style={styles.retryContainer}>
      <Animated.View
        style={[
          styles.retryIconContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.retryEmoji}>📖</Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', paddingHorizontal: 16 }}>
        <Text style={[styles.retryTitle, { color: colors.text }]}>
          Veuillez retourner etudier la{'\n'}Biographie du Prophete{'\n'}Muhammad (ﷺ)
        </Text>

        <Text style={[styles.retryEncouragement, { color: colors.textSecondary }]}>
          Ne vous decouragez pas ! La connaissance s'acquiert avec patience et perseverance.
        </Text>

        <View style={[styles.scoreDisplay, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.scoreBig, { color: colors.secondary }]}>{percentage}%</Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Score final</Text>
          <Text style={[styles.scoreDetail, { color: colors.textSecondary }]}>
            {totalCorrect}/{totalAnswered} reponses correctes
          </Text>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {medal === 'gold' && renderGoldMedal()}
        {medal === 'bronze' && renderBronzeMedal()}
        {medal === 'none' && renderRetryMessage()}

        {/* Stats Summary */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <FontAwesome5 name="calendar-check" size={20} color={colors.primary} />
            <Text style={[styles.statBoxValue, { color: colors.text }]}>{completedCount}/35</Text>
            <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Evenements</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <FontAwesome5 name="check-double" size={20} color={colors.primary} />
            <Text style={[styles.statBoxValue, { color: colors.text }]}>{totalCorrect}</Text>
            <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Correctes</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <FontAwesome5 name="question-circle" size={20} color={colors.primary} />
            <Text style={[styles.statBoxValue, { color: colors.text }]}>{totalAnswered}</Text>
            <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>Questions</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleRestart}
          >
            <FontAwesome5 name="redo" size={16} color="#ffffff" />
            <Text style={styles.primaryBtnText}>Recommencer le Quiz</Text>
          </TouchableOpacity>

          {medal === 'none' && (
            <TouchableOpacity
              style={[styles.studyBtn, { backgroundColor: colors.secondary }]}
              onPress={handleBackToMap}
            >
              <FontAwesome5 name="map-marked-alt" size={16} color="#ffffff" />
              <Text style={styles.primaryBtnText}>Etudier la Sira</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleHome}
          >
            <FontAwesome5 name="home" size={16} color={colors.textSecondary} />
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
              Retour au menu
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  medalGradient: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  medalContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  medalEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  medalTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  medalSubtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  medalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  scoreDisplay: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  scoreDetail: {
    fontSize: 13,
    marginTop: 4,
  },
  retryContainer: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  retryIconContainer: {
    marginBottom: 24,
  },
  retryEmoji: {
    fontSize: 80,
  },
  retryTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 20,
  },
  retryEncouragement: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statBoxValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  buttons: {
    paddingHorizontal: 16,
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
  studyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
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
