import React from 'react';
import { View, StyleSheet, Platform, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'accent';
  children: React.ReactNode;
}

export function GlassCard({ variant = 'default', children, style, ...props }: GlassCardProps) {
  const baseStyle: StyleProp<ViewStyle> = [
    styles.container,
    variant === 'elevated' && styles.elevated,
    variant === 'accent' && styles.accent,
    style,
  ];

  if (Platform.OS === 'ios') {
    return (
      <View style={baseStyle} {...props}>
        <View style={[StyleSheet.absoluteFill, styles.iosBg]}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.iosOverlay]} />
        </View>
        {children}
      </View>
    );
  }

  return (
    <View style={[baseStyle, styles.androidContainer]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 3,
  },
  accent: {
    borderColor: '#EFF6FF',
    borderWidth: 1,
  },
  iosBg: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  iosOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  androidContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
});
