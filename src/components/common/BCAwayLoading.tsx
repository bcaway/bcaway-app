import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { BCAwayLogo } from './BCAwayLogo';
import { useTheme } from '../../context/ThemeContext';

interface BCAwayLoadingProps {
  fullScreen?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function BCAwayLoading({ fullScreen = false, size, style }: BCAwayLoadingProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();

  // Proportions matching myBCA loading screen: mark width is ~34% of screen width
  const defaultSize = Math.min(150, Math.max(110, Math.round(screenWidth * 0.34)));
  const logoSize = size ?? defaultSize;

  return (
    <View
      style={[
        styles.container,
        fullScreen && [styles.fullScreen, { backgroundColor: colors.background }],
        style,
      ]}
    >
      <BCAwayLogo width={logoSize} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: undefined,
  },
});
