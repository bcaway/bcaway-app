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
  swoopTrigger?: number;
}

export function AnimatedBat({
  size = 32,
  color = '#1E293B',
  style,
  delay = 0,
  swoopTrigger,
}: AnimatedBatProps) {
  // Proportional height ~ 0.58 of width
  const height = size * 0.58;

  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scaleX = useSharedValue(1);

  // Easter egg swoop shared values
  const swoopX = useSharedValue(0);
  const swoopY = useSharedValue(0);
  const swoopRotate = useSharedValue(0);
  const swoopScale = useSharedValue(1);

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

  // Handle Easter egg swoop sequence
  useEffect(() => {
    if (swoopTrigger && swoopTrigger > 0) {
      swoopX.value = withSequence(
        withTiming(-36, { duration: 250, easing: Easing.out(Easing.quad) }),
        withTiming(16, { duration: 350, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 250, easing: Easing.inOut(Easing.quad) })
      );
      swoopY.value = withSequence(
        withTiming(20, { duration: 250, easing: Easing.out(Easing.quad) }),
        withTiming(-14, { duration: 350, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 250, easing: Easing.inOut(Easing.quad) })
      );
      swoopRotate.value = withSequence(
        withTiming(-25, { duration: 140 }),
        withTiming(360, { duration: 550, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 160 })
      );
      swoopScale.value = withSequence(
        withTiming(1.35, { duration: 250, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) })
      );
    }
  }, [swoopTrigger, swoopX, swoopY, swoopRotate, swoopScale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: swoopX.value },
        { translateY: translateY.value + swoopY.value },
        { rotate: `${rotate.value + swoopRotate.value}deg` },
        { scaleX: scaleX.value },
        { scale: swoopScale.value },
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
