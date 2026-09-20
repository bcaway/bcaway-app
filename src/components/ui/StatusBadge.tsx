import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'away' | 'present' | 'free';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const isSm = size === 'sm';
  
  let bg = '#EFF6FF';
  let color = '#2563EB';
  let text = 'Free Period';
  
  if (status === 'away') {
    bg = '#FEF2F2';
    color = '#DC2626';
    text = 'Away';
  } else if (status === 'present') {
    bg = '#F0FDF4';
    color = '#15803D';
    text = 'In Class';
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[
        styles.text, 
        { color }, 
        isSm ? styles.textSm : styles.textMd
      ]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 13,
  },
});
