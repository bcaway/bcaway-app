import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface BCAwayLogoProps {
  width?: number;
  color?: string;
  showText?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BCAwayLogo({
  width = 54,
  color = '#4A86E8',
  showText = false,
  style,
}: BCAwayLogoProps) {
  // Mockup geometry: 818 x 348
  const height = (width * 348) / 818;

  return (
    <View style={[styles.container, style]}>
      <Svg viewBox="0 0 818 348" width={width} height={height} fill="none">
        {/* Bottom rod */}
        <Rect x={0} y={229} width={409} height={119} rx={59.5} fill={color} />
        {/* Middle rod */}
        <Rect x={90} y={106} width={409} height={119} rx={59.5} fill={color} />
        {/* Tilted rod */}
        <Rect
          x={425}
          y={66}
          width={409}
          height={119}
          rx={59.5}
          fill={color}
          transform="rotate(27, 629.5, 125.3)"
        />
      </Svg>
      {showText && <Text style={[styles.brandText, { color }]}>BCAway</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
