import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Line, Ellipse, Circle, G } from 'react-native-svg';

interface CornerSpiderWebsProps {
  topOffset?: number;
}

export function CornerSpiderWebs({ topOffset = 0 }: CornerSpiderWebsProps) {
  return (
    <View style={[styles.container, { top: topOffset }]} pointerEvents="none">
      {/* Top Left Spider Web */}
      <View style={styles.topLeft}>
        <Svg width={90} height={105} viewBox="0 0 90 105" fill="none">
          {/* Radial Spokes */}
          <Path
            d="M 0 0 L 85 0 M 0 0 L 75 32 M 0 0 L 52 52 M 0 0 L 32 75 M 0 0 L 0 85"
            stroke="#94A3B8"
            strokeWidth={1}
            strokeOpacity={0.45}
          />
          {/* Concentric Arcs */}
          <Path
            d="M 0 30 Q 18 18 30 0 M 0 55 Q 35 35 55 0 M 0 80 Q 52 52 80 0"
            stroke="#94A3B8"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          {/* Silk Drop Thread */}
          <Line
            x1={36}
            y1={36}
            x2={36}
            y2={84}
            stroke="#94A3B8"
            strokeWidth={1}
            strokeDasharray="2,2"
            strokeOpacity={0.65}
          />
          {/* Spider */}
          <G transform="translate(36, 88)">
            {/* Legs */}
            <Path
              d="M -2 -2 Q -7 -6 -9 -2 M -2 0 Q -8 0 -10 3 M -2 2 Q -7 5 -8 8 M 2 -2 Q 7 -6 9 -2 M 2 0 Q 8 0 10 3 M 2 2 Q 7 5 8 8"
              stroke="#334155"
              strokeWidth={1}
              strokeLinecap="round"
            />
            {/* Body */}
            <Ellipse cx={0} cy={1} rx={3.5} ry={2.8} fill="#1E293B" />
            {/* Head */}
            <Circle cx={0} cy={-2} r={2} fill="#1E293B" />
          </G>
        </Svg>
      </View>

      {/* Top Right Spider Web */}
      <View style={styles.topRight}>
        <Svg width={90} height={105} viewBox="0 0 90 105" fill="none">
          {/* Radial Spokes */}
          <Path
            d="M 90 0 L 5 0 M 90 0 L 15 32 M 90 0 L 38 52 M 90 0 L 58 75 M 90 0 L 90 85"
            stroke="#94A3B8"
            strokeWidth={1}
            strokeOpacity={0.45}
          />
          {/* Concentric Arcs */}
          <Path
            d="M 90 30 Q 72 18 60 0 M 90 55 Q 55 35 35 0 M 90 80 Q 38 52 10 0"
            stroke="#94A3B8"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          {/* Silk Drop Thread */}
          <Line
            x1={54}
            y1={36}
            x2={54}
            y2={80}
            stroke="#94A3B8"
            strokeWidth={1}
            strokeDasharray="2,2"
            strokeOpacity={0.65}
          />
          {/* Spider */}
          <G transform="translate(54, 84)">
            {/* Legs */}
            <Path
              d="M -2 -2 Q -7 -6 -9 -2 M -2 0 Q -8 0 -10 3 M -2 2 Q -7 5 -8 8 M 2 -2 Q 7 -6 9 -2 M 2 0 Q 8 0 10 3 M 2 2 Q 7 5 8 8"
              stroke="#334155"
              strokeWidth={1}
              strokeLinecap="round"
            />
            {/* Body */}
            <Ellipse cx={0} cy={1} rx={3.5} ry={2.8} fill="#1E293B" />
            {/* Head */}
            <Circle cx={0} cy={-2} r={2} fill="#1E293B" />
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  topLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topRight: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
