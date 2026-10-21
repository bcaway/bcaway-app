import React from 'react';
import { View, StyleSheet, Platform, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'accent';
  children: React.ReactNode;
}

/**
 * Clean surface container with a crisp border and subtle background.
 * Automatically adapts to iOS native liquid glass in both light and dark themes.
 */
export function GlassCard({ variant = 'default', children, style, ...props }: GlassCardProps) {
  const { colors, isDark } = useTheme();

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

  let liquidGlassSupported = false;
  if (Platform.OS === 'ios') {
    try {
      liquidGlassSupported = isLiquidGlassAvailable();
    } catch {
      liquidGlassSupported = false;
    }
  }

  if (liquidGlassSupported) {
    return (
      <View style={[baseStyle, { overflow: 'hidden' }]} {...props}>
        <GlassView
          style={StyleSheet.absoluteFill}
          colorScheme={isDark ? 'dark' : 'light'}
          glassEffectStyle="regular"
        />
        {children}
      </View>
    );
  }

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
