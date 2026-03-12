import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useSettings } from '@/store/settingsStore';

interface LanguageBadgeProps {
  darkMode: boolean;
}

const LANGUAGE_CYCLE: Array<'fr' | 'ar' | 'en'> = ['fr', 'ar', 'en'];

const DISPLAY_LABELS: Record<string, string> = {
  fr: 'FR',
  ar: 'AR',
  en: 'EN',
};

export function LanguageBadge({ darkMode }: LanguageBadgeProps) {
  const { sttLanguage, setSttLanguage } = useSettings();

  const handlePress = useCallback(async () => {
    // Haptic feedback on native platforms
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics not available
      }
    }

    const currentIndex = LANGUAGE_CYCLE.indexOf(sttLanguage);
    const nextIndex = (currentIndex + 1) % LANGUAGE_CYCLE.length;
    setSttLanguage(LANGUAGE_CYCLE[nextIndex]);
  }, [sttLanguage, setSttLanguage]);

  return (
    <Pressable
      style={[
        styles.badge,
        darkMode ? styles.badgeDark : styles.badgeLight,
      ]}
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
    >
      <Text
        style={[
          styles.label,
          darkMode ? styles.labelDark : styles.labelLight,
        ]}
      >
        {DISPLAY_LABELS[sttLanguage] || 'FR'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 28,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  badgeLight: {
    backgroundColor: '#E3F2FD',
  },
  badgeDark: {
    backgroundColor: '#1E3A5F',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
  },
  labelLight: {
    color: '#1565C0',
  },
  labelDark: {
    color: '#4A9EFF',
  },
});
