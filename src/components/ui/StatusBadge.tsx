import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'away' | 'present' | 'free';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const isSm = size === 'sm';

  let bg = '#EFF6FF';
  let border = '#BFDBFE';
  let color = '#1D4ED8';
  let text = 'Free Period';

  if (status === 'away') {
    bg = '#FEF2F2';
    border = '#FECACA';
    color = '#B91C1C';
    text = 'Away';
  } else if (status === 'present') {
    bg = '#F0FDF4';
    border = '#BBF7D0';
    color = '#15803D';
    text = 'In Class';
  }

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: border }]}>
      <Text
        style={[
          styles.text,
          { color },
          isSm ? styles.textSm : styles.textMd,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 12,
  },
});
