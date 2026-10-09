import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Ellipse } from 'react-native-svg';

interface JackOLanternFavoriteProps {
  isStarred: boolean;
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
}

export function JackOLanternFavorite({
  isStarred,
  size = 24,
  onPress,
  disabled = false,
}: JackOLanternFavoriteProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Gentle bounce pop when star state changes
    scale.value = withSequence(
      withTiming(1.28, { duration: 140 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
  }, [isStarred, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = isStarred ? '#EA580C' : '#94A3B8';
  const innerRidge = isStarred ? '#FB923C' : '#CBD5E1';
  const faceColor = isStarred ? '#431407' : '#FFFFFF';
  const stemColor = isStarred ? '#15803D' : '#94A3B8';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.pressable}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
          {/* Stem */}
          <Path
            d="M 14 6 C 14 3 16 2 18 1 C 17 4 16 5 15 6 Z"
            fill={stemColor}
          />
          {/* Outer Pumpkin */}
          <Ellipse cx={14} cy={16} rx={12} ry={10} fill={iconColor} />
          {/* Ridges */}
          <Ellipse cx={14} cy={16} rx={8} ry={10} fill={innerRidge} />
          <Ellipse cx={14} cy={16} rx={3.5} ry={10} fill={iconColor} />

          {/* Carved Eyes & Smile */}
          <Path d="M 9.5 13.5 L 12 16 L 8 16 Z" fill={faceColor} />
          <Path d="M 18.5 13.5 L 20 16 L 16 16 Z" fill={faceColor} />
          <Path
            d="M 9.5 19 Q 14 23 18.5 19 Q 16.5 21.5 14 21.5 Q 11.5 21.5 9.5 19 Z"
            fill={faceColor}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
