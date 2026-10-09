import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface GhostEasterEggProps {
  trigger: number;
}

/**
 * Playful Easter egg ghost that pops out, wiggles excitedly, and floats away
 * when the user taps the BCAway logo.
 */
export function GhostEasterEgg({ trigger }: GhostEasterEggProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.4);

  useEffect(() => {
    if (trigger > 0) {
      // Fade & pop in
      opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(1, { duration: 1100 }),
        withTiming(0, { duration: 400 })
      );
      scale.value = withSequence(
        withTiming(1.15, { duration: 180, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 180 }),
        withTiming(0.9, { duration: 1100 })
      );
      translateY.value = withSequence(
        withTiming(-8, { duration: 250, easing: Easing.out(Easing.quad) }),
        withTiming(-22, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      );
      rotate.value = withSequence(
        withTiming(-18, { duration: 140 }),
        withTiming(18, { duration: 180 }),
        withTiming(-14, { duration: 180 }),
        withTiming(14, { duration: 180 }),
        withTiming(-6, { duration: 180 }),
        withTiming(0, { duration: 180 })
      );
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Text style={styles.ghostText}>👻</Text>
      <Animated.View style={styles.bubble}>
        <Text style={styles.bubbleText}>Boo!</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -44,
    top: -12,
    alignItems: 'center',
    zIndex: 15,
  },
  ghostText: {
    fontSize: 26,
  },
  bubble: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#F97316',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bubbleText: {
    color: '#FFF7ED',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
