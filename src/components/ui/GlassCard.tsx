import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'accent';
  children: React.ReactNode;
}

/**
 * Clean surface container with a crisp border and subtle background.
 * Replaces blur/glassmorphism with clean, utilitarian structure.
 */
export function GlassCard({ variant = 'default', children, style, ...props }: GlassCardProps) {
  const { colors } = useTheme();

  const variantStyle =
    variant === 'elevated'
      ? { backgroundColor: colors.card, borderColor: colors.borderStrong }
      : variant === 'accent'
      ? { backgroundColor: colors.surfaceSubtle, borderColor: colors.accentLight }
      : { backgroundColor: colors.card, borderColor: colors.border };

  const baseStyle: StyleProp<ViewStyle> = [
    styles.container,
    variantStyle,
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
    borderWidth: 1,
    borderRadius: 8,
  },
});
