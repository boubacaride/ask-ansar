import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface SoundWaveAnimationProps {
  isActive: boolean;
  color?: string;
  size?: number;
}

const BAR_COUNT = 4;
const BAR_WIDTH = 3;

export function SoundWaveAnimation({
  isActive,
  color = '#1565C0',
  size = 16,
}: SoundWaveAnimationProps) {
  const animations = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (isActive) {
      const barAnimations = animations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 120),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ),
      );
      Animated.parallel(barAnimations).start();

      return () => {
        barAnimations.forEach((a) => a.stop());
      };
    } else {
      animations.forEach((anim) => {
        anim.stopAnimation();
        Animated.timing(anim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isActive, animations]);

  const minHeight = size * 0.25;
  const maxHeight = size;

  return (
    <View style={[styles.container, { height: maxHeight }]}>
      {animations.map((anim, index) => {
        const scaleY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [minHeight / maxHeight, 1],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: color,
                width: BAR_WIDTH,
                height: maxHeight,
                borderRadius: BAR_WIDTH / 2,
                transform: [{ scaleY }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bar: {
    // Base styles applied inline
  },
});
