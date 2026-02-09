import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  SeerahEventWithMeta,
  StackedMarker,
  SeerahCategory,
  CATEGORY_CONFIGS,
} from '@/types/seerahMap.d';
import { useSettings } from '@/store/settingsStore';

interface MarkerProps {
  event?: SeerahEventWithMeta;
  stackedMarker?: StackedMarker;
  isSelected: boolean;
  onPress: () => void;
}

const getCategoryIcon = (category: SeerahCategory): string => {
  const icons: Record<SeerahCategory, string> = {
    sacred: 'kaaba',
    battle: 'shield-alt',
    revelation: 'book-open',
    migration: 'route',
    life_event: 'baby',
  };
  return icons[category];
};

const getCategoryColors = (category: SeerahCategory, darkMode: boolean): string[] => {
  const config = CATEGORY_CONFIGS[category];
  const baseColor = config.color;

  if (darkMode) {
    return [baseColor, adjustColorBrightness(baseColor, -30)];
  }
  return [adjustColorBrightness(baseColor, 20), baseColor];
};

const adjustColorBrightness = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

const SeerahMapMarkerComponent: React.FC<MarkerProps> = ({
  event,
  stackedMarker,
  isSelected,
  onPress,
}) => {
  const { darkMode } = useSettings();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isStacked = stackedMarker && stackedMarker.count > 1;
  const displayEvent = event || (stackedMarker?.events[0]);
  const category = displayEvent?.category || 'life_event';
  const isVisited = displayEvent?.isVisited || false;

  // Pulse animation for selected marker
  useEffect(() => {
    if (isSelected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSelected, pulseAnim]);

  // Selection animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.3 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();

    Animated.timing(glowAnim, {
      toValue: isSelected ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSelected, scaleAnim, glowAnim]);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const colors = getCategoryColors(category, darkMode);
  const icon = getCategoryIcon(category);
  const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS['life_event'];

  const markerSize = isStacked ? 48 : (category === 'sacred' ? 44 : 38);
  const opacity = isVisited ? 1 : 0.65;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
          ],
          opacity,
        },
      ]}
    >
      {/* Glow effect for selected marker */}
      {isSelected && (
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: config.glowColor,
              opacity: glowAnim,
              width: markerSize + 24,
              height: markerSize + 24,
              borderRadius: (markerSize + 24) / 2,
            },
          ]}
        />
      )}

      {/* Main marker */}
      <View
        style={[
          styles.markerWrapper,
          { width: markerSize, height: markerSize },
        ]}
        onTouchEnd={handlePress}
      >
        <LinearGradient
          colors={colors}
          style={[
            styles.marker,
            {
              width: markerSize,
              height: markerSize,
              borderRadius: markerSize / 2,
              borderWidth: isSelected ? 3 : 2,
              borderColor: isSelected
                ? '#ffffff'
                : darkMode
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.6)',
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <FontAwesome5
            name={icon}
            size={isStacked ? 16 : 14}
            color="#ffffff"
          />
        </LinearGradient>

        {/* Stack count badge */}
        {isStacked && (
          <View style={[styles.countBadge, { backgroundColor: darkMode ? '#1a1a2e' : '#ffffff' }]}>
            <Text style={[styles.countText, { color: config.color }]}>
              {stackedMarker!.count}
            </Text>
          </View>
        )}

        {/* Visited checkmark */}
        {isVisited && !isStacked && (
          <View style={styles.visitedBadge}>
            <FontAwesome5 name="check" size={8} color="#ffffff" />
          </View>
        )}

        {/* Favorite heart */}
        {displayEvent?.isFavorite && (
          <View style={[styles.favoriteBadge, { backgroundColor: '#E91E63' }]}>
            <FontAwesome5 name="heart" size={8} color="#ffffff" solid />
          </View>
        )}
      </View>

      {/* Pointer triangle */}
      <View
        style={[
          styles.pointer,
          { borderTopColor: colors[1] },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -12,
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  countBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  visitedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  favoriteBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});

export const SeerahMapMarker = memo(SeerahMapMarkerComponent);
