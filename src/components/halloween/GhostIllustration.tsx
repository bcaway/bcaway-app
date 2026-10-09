import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Ellipse, Circle } from 'react-native-svg';

interface GhostIllustrationProps {
  size?: number;
}

export function GhostIllustration({ size = 32 }: GhostIllustrationProps) {
  const height = size * 1.1;

  return (
    <View style={styles.container}>
      <Svg width={size} height={height} viewBox="0 0 40 44" fill="none">
        {/* Soft ghost body */}
        <Path
          d="M 20 4 C 10 4 6 15 6 27 C 6 36 9 39 12 35 C 15 39 18 39 20 35 C 22 39 25 39 28 35 C 31 39 34 36 34 27 C 34 15 30 4 20 4 Z"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth={1.5}
        />
        {/* Ghost eyes */}
        <Ellipse cx="16" cy="18" rx="1.8" ry="2.6" fill="#1E293B" />
        <Ellipse cx="24" cy="18" rx="1.8" ry="2.6" fill="#1E293B" />
        {/* Cute blush */}
        <Circle cx="12" cy="22" r="1.8" fill="#FDA4AF" opacity={0.6} />
        <Circle cx="28" cy="22" r="1.8" fill="#FDA4AF" opacity={0.6} />
        {/* Happy mouth */}
        <Path d="M 18 24 Q 20 27 22 24" stroke="#1E293B" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
