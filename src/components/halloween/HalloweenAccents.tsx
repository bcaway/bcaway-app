import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Left and right floating autumn leaf accents located along the screen gutters.
 */
export function MarginLeaves() {
  return (
    <>
      {/* Left side floating leaf */}
      <View style={styles.leftMarginLeaf} pointerEvents="none">
        <Text style={{ fontSize: 13, transform: [{ rotate: '-15deg' }] }}>🍂</Text>
      </View>

      {/* Right side floating leaves */}
      <View style={styles.rightMarginLeaves} pointerEvents="none">
        <Text style={{ fontSize: 13, transform: [{ rotate: '20deg' }] }}>🍁</Text>
        <Text style={{ fontSize: 10, marginTop: 4, transform: [{ rotate: '-25deg' }] }}>🍂</Text>
      </View>
    </>
  );
}

/**
 * Festive mini pumpkins and autumn leaves decoration positioned at the bottom corners.
 */
export function BottomCornerPumpkins() {
  return (
    <>
      <View style={styles.bottomLeftPumpkins} pointerEvents="none">
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 22, marginRight: -4 }}>🎃</Text>
          <Text style={{ fontSize: 16 }}>🎃</Text>
        </View>
        <Text style={{ fontSize: 9, marginLeft: 2, marginTop: -2 }}>🍂</Text>
      </View>

      <View style={styles.bottomRightLeaves} pointerEvents="none">
        <Text style={{ fontSize: 14, transform: [{ rotate: '35deg' }] }}>🍂</Text>
        <Text style={{ fontSize: 8, marginTop: 2 }}>✨</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  leftMarginLeaf: {
    position: 'absolute',
    left: -12,
    top: -24,
    opacity: 0.85,
  },
  rightMarginLeaves: {
    position: 'absolute',
    right: -12,
    top: -28,
    alignItems: 'center',
    opacity: 0.85,
  },
  bottomLeftPumpkins: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    zIndex: 20,
    opacity: 0.9,
  },
  bottomRightLeaves: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    zIndex: 20,
    alignItems: 'center',
    opacity: 0.85,
  },
});
