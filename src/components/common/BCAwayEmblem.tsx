import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { BCAwayLogo } from './BCAwayLogo';

interface BCAwayEmblemProps {
  size?: number;
  showText?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BCAwayEmblem({ size = 48, showText = false, style }: BCAwayEmblemProps) {
  return <BCAwayLogo width={size} showText={showText} style={style} />;
}
