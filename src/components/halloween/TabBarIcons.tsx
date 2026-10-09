import React from 'react';
import Svg, { Path, Ellipse, Circle, Rect, G } from 'react-native-svg';

interface TabIconProps {
  color: any;
  size?: number;
  focused?: boolean;
}

/**
 * Halloween Jack-o'-Lantern icon for the Today tab.
 */
export function TodayTabIcon({ color, size = 24, focused = false }: TabIconProps) {
  const iconColor = focused ? '#EA580C' : color;
  const secondaryColor = focused ? '#FB923C' : color;
  const faceColor = focused ? '#431407' : '#FFFFFF';

  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Stem */}
      <Path
        d="M 14 6 C 14 3 16 2 18 1 C 17 4 16 5 15 6 Z"
        fill={focused ? '#15803D' : iconColor}
      />
      {/* Outer Pumpkin Lobes */}
      <Ellipse cx={14} cy={16} rx={12} ry={10} fill={iconColor} />
      {/* Inner Ridges */}
      <Ellipse cx={14} cy={16} rx={8} ry={10} fill={secondaryColor} />
      <Ellipse cx={14} cy={16} rx={3.5} ry={10} fill={iconColor} />
      {/* Carved Eyes */}
      <Path d="M 9.5 13.5 L 12 16 L 8 16 Z" fill={faceColor} />
      <Path d="M 18.5 13.5 L 20 16 L 16 16 Z" fill={faceColor} />
      {/* Carved Smile */}
      <Path
        d="M 9.5 19 Q 14 23 18.5 19 Q 16.5 21.5 14 21.5 Q 11.5 21.5 9.5 19 Z"
        fill={faceColor}
      />
    </Svg>
  );
}

/**
 * Friendly floating ghost icon for the Absences tab.
 */
export function AbsencesTabIcon({ color, size = 24, focused = false }: TabIconProps) {
  const ghostFill = focused ? '#FFFFFF' : '#F1F5F9';
  const strokeColor = focused ? '#EA580C' : color;
  const eyeColor = focused ? '#1E293B' : color;

  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Ghost Sheet Body */}
      <Path
        d="M 14 3 C 8 3 5 10 5 18 C 5 23 7 25 9.5 22 C 12 25 14 25 16 22 C 18 25 20.5 25 22.5 22 C 23.5 24 24 23 24 18 C 24 10 20 3 14 3 Z"
        fill={ghostFill}
        stroke={strokeColor}
        strokeWidth={focused ? 2 : 1.6}
      />
      {/* Cute Eyes */}
      <Ellipse cx={11.5} cy={12} rx={1.5} ry={2.2} fill={eyeColor} />
      <Ellipse cx={16.5} cy={12} rx={1.5} ry={2.2} fill={eyeColor} />
      {/* Blush */}
      {focused && (
        <>
          <Circle cx={8.5} cy={14.5} r={1.3} fill="#FDA4AF" opacity={0.8} />
          <Circle cx={19.5} cy={14.5} r={1.3} fill="#FDA4AF" opacity={0.8} />
        </>
      )}
      {/* Smile */}
      <Path
        d="M 12.8 15.5 Q 14 17.5 15.2 15.5"
        stroke={eyeColor}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/**
 * Witch's hat icon for the Settings tab.
 */
export function SettingsTabIcon({ color, size = 24, focused = false }: TabIconProps) {
  const hatFill = focused ? '#1E1B4B' : color;
  const bandColor = focused ? '#EA580C' : '#FFFFFF';
  const buckleColor = focused ? '#FBBF24' : color;

  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* Brim */}
      <Ellipse cx={14} cy={22} rx={12} ry={3.5} fill={hatFill} />
      {/* Cone */}
      <Path
        d="M 6 21 C 10 14 11 7 17 2 C 18 6 19 14 22 21 Z"
        fill={hatFill}
      />
      {/* Orange/white sash band */}
      <Path
        d="M 6.5 20 Q 14 22.5 21.5 20 L 21.8 21.8 Q 14 24 6.2 21.8 Z"
        fill={bandColor}
      />
      {/* Golden buckle */}
      <Rect
        x={12}
        y={19.5}
        width={4}
        height={3}
        rx={0.6}
        fill={buckleColor}
      />
    </Svg>
  );
}
