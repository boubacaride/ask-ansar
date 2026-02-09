import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Achievement, AchievementId } from '@/types/seerahMap.d';
import { useSettings } from '@/store/settingsStore';
import { useSeerahMapStore } from '@/store/seerahMapStore';

interface ProgressTrackerProps {
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  onAchievementUnlocked,
}) => {
  const { darkMode, language } = useSettings();
  const { progress, visitedEventIds, events, activeExplorers } = useSeerahMapStore();
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;

  const colors = {
    background: darkMode ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    card: darkMode ? '#252540' : '#ffffff',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#0D5C63',
    secondary: '#C4A35A',
    accent: '#2E7D32',
    progressBg: darkMode ? '#3a3a55' : '#e5e5e5',
  };

  const percentage = progress.percentage;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Animate progress
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Milestone celebrations
    if ([25, 50, 75, 100].includes(percentage)) {
      triggerCelebration();
    }
  }, [percentage]);

  const triggerCelebration = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setShowCelebration(true);

    Animated.sequence([
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(celebrationScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCelebration(false));
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    setShowAchievements(true);
  };

  const unlockedCount = progress.achievements.filter(a => a.isUnlocked).length;

  const renderAchievementItem = (achievement: Achievement) => {
    const title = language === 'ar' ? achievement.titleAr : language === 'en' ? achievement.title : achievement.titleFr;
    const description = language === 'ar' ? achievement.descriptionAr : language === 'en' ? achievement.description : achievement.descriptionFr;

    return (
      <View
        key={achievement.id}
        style={[
          styles.achievementItem,
          {
            backgroundColor: achievement.isUnlocked ? `${colors.secondary}15` : colors.card,
            borderColor: achievement.isUnlocked ? colors.secondary : colors.progressBg,
            opacity: achievement.isUnlocked ? 1 : 0.5,
          },
        ]}
      >
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
          {achievement.isUnlocked && achievement.unlockedAt && (
            <Text style={[styles.unlockedDate, { color: colors.secondary }]}>
              <FontAwesome5 name="check-circle" size={10} solid /> Débloqué le{' '}
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        {!achievement.isUnlocked && (
          <FontAwesome5 name="lock" size={16} color={colors.textSecondary} />
        )}
      </View>
    );
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <View style={styles.content}>
            {/* Progress ring */}
            <View style={styles.progressRing}>
              <Svg width={80} height={80} style={styles.svg}>
                {/* Background circle */}
                <Circle
                  cx={40}
                  cy={40}
                  r={36}
                  stroke={colors.progressBg}
                  strokeWidth={6}
                  fill="transparent"
                />
                {/* Progress circle */}
                <Circle
                  cx={40}
                  cy={40}
                  r={36}
                  stroke={colors.secondary}
                  strokeWidth={6}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
              </Svg>
              <View style={styles.progressCenter}>
                <Text style={[styles.percentageText, { color: colors.text }]}>
                  {percentage}%
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.stats}>
              <Text style={[styles.statsTitle, { color: colors.text }]}>
                Votre Voyage
              </Text>
              <Text style={[styles.statsCount, { color: colors.textSecondary }]}>
                {visitedEventIds.length}/{events.length} événements découverts
              </Text>

              {/* Streak */}
              {progress.currentStreak > 0 && (
                <View style={[styles.streakBadge, { backgroundColor: `${colors.accent}20` }]}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={[styles.streakText, { color: colors.accent }]}>
                    {progress.currentStreak} jour{progress.currentStreak > 1 ? 's' : ''} consécutif{progress.currentStreak > 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {/* Achievements preview */}
              <View style={styles.achievementsPreview}>
                <Text style={[styles.achievementsLabel, { color: colors.textSecondary }]}>
                  <FontAwesome5 name="trophy" size={12} color={colors.secondary} />{' '}
                  {unlockedCount}/{progress.achievements.length} trophées
                </Text>
                <View style={styles.achievementIcons}>
                  {progress.achievements.slice(0, 5).map(a => (
                    <Text
                      key={a.id}
                      style={[
                        styles.achievementIconSmall,
                        { opacity: a.isUnlocked ? 1 : 0.3 },
                      ]}
                    >
                      {a.icon}
                    </Text>
                  ))}
                  {progress.achievements.length > 5 && (
                    <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                      +{progress.achievements.length - 5}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Active explorers */}
            <View style={[styles.explorersBox, { backgroundColor: colors.card }]}>
              <FontAwesome5 name="users" size={12} color={colors.primary} />
              <Text style={[styles.explorersText, { color: colors.textSecondary }]}>
                {activeExplorers} explorateurs actifs
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Celebration overlay */}
        {showCelebration && (
          <Animated.View
            style={[
              styles.celebration,
              {
                transform: [{ scale: celebrationScale }],
              },
            ]}
          >
            <LinearGradient
              colors={[colors.secondary, '#E65100']}
              style={styles.celebrationGradient}
            >
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.celebrationText}>
                {percentage === 100 ? 'Félicitations!' : `${percentage}% complété!`}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </Animated.View>

      {/* Achievements Modal */}
      <Modal
        visible={showAchievements}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAchievements(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                <FontAwesome5 name="trophy" size={18} color={colors.secondary} /> Vos Trophées
              </Text>
              <TouchableOpacity
                onPress={() => setShowAchievements(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Événements visités
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {visitedEventIds.length}/{events.length}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Trophées débloqués
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {unlockedCount}/{progress.achievements.length}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Série actuelle
                </Text>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  🔥 {progress.currentStreak} jour{progress.currentStreak !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.achievementsList}>
              {progress.achievements.map(renderAchievementItem)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRing: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  progressCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
  },
  stats: {
    flex: 1,
    marginLeft: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsCount: {
    fontSize: 13,
    marginBottom: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '600',
  },
  achievementsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementsLabel: {
    fontSize: 12,
  },
  achievementIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  achievementIconSmall: {
    fontSize: 14,
  },
  moreText: {
    fontSize: 10,
    marginLeft: 4,
  },
  explorersBox: {
    position: 'absolute',
    top: -8,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  explorersText: {
    fontSize: 10,
  },
  celebration: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -75,
    marginTop: -30,
  },
  celebrationGradient: {
    width: 150,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  celebrationEmoji: {
    fontSize: 20,
  },
  celebrationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsList: {
    flex: 1,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 13,
  },
  unlockedDate: {
    fontSize: 11,
    marginTop: 6,
  },
});
