import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Ellipse, Path, Line, G } from 'react-native-svg';

interface PumpkinIllustrationProps {
  size?: number;
  showSparkles?: boolean;
}

export function PumpkinIllustration({ size = 36, showSparkles = true }: PumpkinIllustrationProps) {
  return (
    <View style={styles.container}>
      {showSparkles && (
        <Svg width={size * 1.8} height={size * 1.1} viewBox="0 0 72 44" fill="none">
          {/* Left sparkle rays */}
          <Line x1="4" y1="18" x2="11" y2="19" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          <Line x1="7" y1="11" x2="13" y2="15" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          <Line x1="8" y1="26" x2="14" y2="23" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />

          {/* Right sparkle rays */}
          <Line x1="68" y1="18" x2="61" y2="19" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          <Line x1="65" y1="11" x2="59" y2="15" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          <Line x1="64" y1="26" x2="58" y2="23" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />

          {/* Center Pumpkin */}
          <G transform="translate(18, 4)">
            {/* Stem */}
            <Path d="M 18 10 C 18 4 22 2 24 1 C 23 5 21 8 20 10 Z" fill="#15803D" />
            {/* Outer pumpkin lobes */}
            <Ellipse cx="18" cy="22" rx="17" ry="14" fill="#F97316" />
            {/* Inner pumpkin ridges */}
            <Ellipse cx="18" cy="22" rx="11" ry="14" fill="#EA580C" />
            <Ellipse cx="18" cy="22" rx="5" ry="14" fill="#FB923C" />
            {/* Cute jack-o-lantern eyes & smile */}
            <Path d="M 12 17 L 15 21 L 9 21 Z" fill="#431407" />
            <Path d="M 24 17 L 27 21 L 21 21 Z" fill="#431407" />
            <Path d="M 12 26 Q 18 31 24 26 Q 21 30 18 30 Q 15 30 12 26 Z" fill="#431407" />
          </G>
        </Svg>
      )}
      {!showSparkles && (
        <Text style={{ fontSize: size * 0.8 }}>🎃</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
