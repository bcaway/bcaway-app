import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'accent';
  children: React.ReactNode;
}

/**
 * Clean surface container with a crisp border and subtle background.
 * Replaces blur/glassmorphism with clean, utilitarian structure.
 */
export function GlassCard({ variant = 'default', children, style, ...props }: GlassCardProps) {
  const baseStyle: StyleProp<ViewStyle> = [
    styles.container,
    variant === 'elevated' && styles.elevated,
    variant === 'accent' && styles.accent,
    style,
  ];

  return (
    <View style={baseStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18072B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
  },
  elevated: {
    backgroundColor: '#200D3D',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  accent: {
    backgroundColor: '#220E3E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
});
