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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  accent: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
});
