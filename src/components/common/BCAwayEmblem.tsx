import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BCAwayEmblemProps {
  size?: number;
  showText?: boolean;
}

export function BCAwayEmblem({ size = 32, showText = false }: BCAwayEmblemProps) {
  const barHeight = size * 0.28;
  const barWidth = size * 0.9;

  return (
    <View style={styles.container}>
      <View style={[styles.emblemContainer, { width: size, height: size * 0.7 }]}>
        {/* Geometric minimalist emblem */}
        <View
          style={[
            styles.bar,
            styles.topBar,
            { width: barWidth * 0.65, height: barHeight, borderRadius: barHeight / 3 },
          ]}
        />
        <View
          style={[
            styles.bar,
            styles.midBar,
            { width: barWidth, height: barHeight, borderRadius: barHeight / 3 },
          ]}
        />
        <View
          style={[
            styles.bar,
            styles.bottomBar,
            { width: barWidth * 0.45, height: barHeight, borderRadius: barHeight / 3 },
          ]}
        />
      </View>
      {showText && <Text style={styles.brandText}>BCAway</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bar: {
    backgroundColor: '#2563EB',
  },
  topBar: {
    alignSelf: 'flex-start',
  },
  midBar: {
    alignSelf: 'center',
  },
  bottomBar: {
    alignSelf: 'flex-end',
  },
  brandText: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
});
