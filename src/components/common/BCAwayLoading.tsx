import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, StyleProp, ViewStyle, Platform } from 'react-native';
import { BCAwayLogo } from './BCAwayLogo';

interface BCAwayLoadingProps {
  fullScreen?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function BCAwayLoading({ fullScreen = false, size, style }: BCAwayLoadingProps) {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 850,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.03,
            duration: 850,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 850,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.96,
            duration: 850,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim, scaleAnim]);

  const logoSize = size ?? (fullScreen ? 84 : 64);

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <Animated.View
        style={{
          opacity: pulseAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <BCAwayLogo width={logoSize} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});
