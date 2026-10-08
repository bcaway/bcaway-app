import React from 'react';
import { View, Text, StyleSheet, Image, StyleProp, ViewStyle } from 'react-native';

export const BCAWAY_LOGO_ASSET = require('../../../assets/favicon.png');
export const BCAWAY_ICON_ASSET = require('../../../assets/icon.png');

interface BCAwayLogoProps {
  width?: number;
  color?: string;
  showText?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BCAwayLogo({
  width = 54,
  color,
  showText = false,
  style,
}: BCAwayLogoProps) {
  // Official geometry: 818 x 348
  const height = (width * 348) / 818;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={BCAWAY_LOGO_ASSET}
        style={[
          { width, height },
          color ? { tintColor: color } : null,
        ]}
        resizeMode="contain"
      />
      {showText && <Text style={[styles.brandText, color ? { color } : null]}>BCAway</Text>}
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
