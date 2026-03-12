import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { Mic, Volume2, Loader, MicOff } from 'lucide-react-native';

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceOrbProps {
  state: OrbState;
  darkMode: boolean;
}

/**
 * Animated circular visualization that reacts to voice conversation states.
 * Uses React Native Animated API (not reanimated).
 */
export function VoiceOrb({ state, darkMode }: VoiceOrbProps) {
  const outerScale = useRef(new Animated.Value(1)).current;
  const middleScale = useRef(new Animated.Value(1)).current;
  const innerScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stop all running animations
    outerScale.stopAnimation();
    middleScale.stopAnimation();
    innerScale.stopAnimation();
    glowOpacity.stopAnimation();
    spinValue.stopAnimation();

    let animations: Animated.CompositeAnimation[] = [];

    switch (state) {
      case 'idle': {
        // Slow breathing animation
        const breathe = Animated.loop(
          Animated.sequence([
            Animated.timing(outerScale, {
              toValue: 1.05,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(outerScale, {
              toValue: 1.0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        );

        const glowBreath = Animated.loop(
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.4,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.2,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        );

        // Reset scales
        middleScale.setValue(1);
        innerScale.setValue(1);
        spinValue.setValue(0);

        animations = [breathe, glowBreath];
        breathe.start();
        glowBreath.start();
        break;
      }

      case 'listening': {
        // Active pulse
        const outerPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(outerScale, {
              toValue: 1.15,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(outerScale, {
              toValue: 1.0,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        );

        const innerPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(innerScale, {
              toValue: 1.08,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(innerScale, {
              toValue: 0.95,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        );

        const glowPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.6,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        );

        middleScale.setValue(1);
        spinValue.setValue(0);

        animations = [outerPulse, innerPulse, glowPulse];
        outerPulse.start();
        innerPulse.start();
        glowPulse.start();
        break;
      }

      case 'processing': {
        // Faster pulse + rotation
        const fastPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(outerScale, {
              toValue: 1.1,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(outerScale, {
              toValue: 1.0,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        );

        const middlePulse = Animated.loop(
          Animated.sequence([
            Animated.timing(middleScale, {
              toValue: 1.08,
              duration: 400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(middleScale, {
              toValue: 0.95,
              duration: 400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        );

        // Subtle spin on inner orb
        const spin = Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        );

        const glowPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.5,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.25,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        );

        innerScale.setValue(1);

        animations = [fastPulse, middlePulse, spin, glowPulse];
        fastPulse.start();
        middlePulse.start();
        spin.start();
        glowPulse.start();
        break;
      }

      case 'speaking': {
        // Rhythmic pulse synced to speech
        const speakPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(outerScale, {
              toValue: 1.12,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(outerScale, {
              toValue: 1.0,
              duration: 400,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        );

        const innerBounce = Animated.loop(
          Animated.sequence([
            Animated.timing(innerScale, {
              toValue: 1.06,
              duration: 350,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(innerScale, {
              toValue: 0.97,
              duration: 450,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        );

        const glowPulse = Animated.loop(
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.5,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.2,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        );

        middleScale.setValue(1);
        spinValue.setValue(0);

        animations = [speakPulse, innerBounce, glowPulse];
        speakPulse.start();
        innerBounce.start();
        glowPulse.start();
        break;
      }
    }

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [state]);

  const spinInterpolation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Color scheme based on state
  const getGlowColor = () => {
    switch (state) {
      case 'idle':
        return 'rgba(21, 101, 192, 0.2)';
      case 'listening':
        return 'rgba(21, 101, 192, 0.35)';
      case 'processing':
        return 'rgba(21, 101, 192, 0.25)';
      case 'speaking':
        return 'rgba(201, 162, 39, 0.3)';
    }
  };

  const getMiddleBorderColor = () => {
    switch (state) {
      case 'idle':
        return 'rgba(21, 101, 192, 0.3)';
      case 'listening':
        return 'rgba(21, 101, 192, 0.5)';
      case 'processing':
        return 'rgba(201, 162, 39, 0.4)';
      case 'speaking':
        return 'rgba(201, 162, 39, 0.5)';
    }
  };

  const getInnerBorderColor = () => {
    switch (state) {
      case 'idle':
        return '#1565C0';
      case 'listening':
        return '#1E88E5';
      case 'processing':
        return '#C9A227';
      case 'speaking':
        return '#C9A227';
    }
  };

  const getIconColor = () => {
    switch (state) {
      case 'idle':
        return 'rgba(21, 101, 192, 0.5)';
      case 'listening':
        return '#1E88E5';
      case 'processing':
        return '#C9A227';
      case 'speaking':
        return '#C9A227';
    }
  };

  const renderIcon = () => {
    const iconColor = getIconColor();
    const iconSize = 32;

    switch (state) {
      case 'idle':
        return <MicOff size={iconSize} color={iconColor} />;
      case 'listening':
        return <Mic size={iconSize} color={iconColor} />;
      case 'processing':
        return <Loader size={iconSize} color={iconColor} />;
      case 'speaking':
        return <Volume2 size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={styles.orbContainer}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            backgroundColor: getGlowColor(),
            opacity: glowOpacity,
            transform: [{ scale: outerScale }],
          },
        ]}
      />

      {/* Processing overlay glow (blue-gold gradient feel) */}
      {state === 'processing' && (
        <Animated.View
          style={[
            styles.processingGlow,
            {
              opacity: glowOpacity,
              transform: [{ scale: outerScale }],
            },
          ]}
        />
      )}

      {/* Middle ring */}
      <Animated.View
        style={[
          styles.middleRing,
          {
            borderColor: getMiddleBorderColor(),
            transform: [{ scale: middleScale }],
          },
        ]}
      />

      {/* Inner orb */}
      <Animated.View
        style={[
          styles.innerOrb,
          {
            borderColor: getInnerBorderColor(),
            transform: [
              { scale: innerScale },
              ...(state === 'processing'
                ? [{ rotate: spinInterpolation }]
                : []),
            ],
          },
        ]}
      >
        {renderIcon()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  orbContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(21, 101, 192, 0.2)',
  },
  processingGlow: {
    position: 'absolute',
    width: 155,
    height: 155,
    borderRadius: 77.5,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
  },
  middleRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(21, 101, 192, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(21, 101, 192, 0.3)',
  },
  innerOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0D1B2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1565C0',
  },
});
