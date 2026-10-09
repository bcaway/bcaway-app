import React, { useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface AnimatedBatProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export function AnimatedBat({
  size = 32,
  color = '#1E293B',
  style,
  delay = 0,
}: AnimatedBatProps) {
  // Proportional height ~ 0.58 of width
  const height = size * 0.58;

  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scaleX = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Gentle floating/gliding motion
      translateY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
          withTiming(4, { duration: 1200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );

      // Subtle tilt/rotation during flight
      rotate.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(6, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      // Subtle wing flapping rhythm
      scaleX.value = withRepeat(
        withSequence(
          withTiming(0.92, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.04, { duration: 600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [translateY, rotate, scaleX, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scaleX: scaleX.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Svg width={size} height={height} viewBox="0 0 64 38" fill="none">
        <Path
          d="M 32 16 C 36 9 48 1 61 7 C 55 16 53 20 55 28 C 49 22 43 22 37 26 C 34 20 30 20 27 26 C 21 22 15 22 9 28 C 11 20 9 16 3 7 C 16 1 28 9 32 16 Z"
          fill={color}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
