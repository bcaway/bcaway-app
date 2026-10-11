import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'away' | 'present' | 'free';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const isSm = size === 'sm';

  let bg = 'rgba(234, 88, 12, 0.14)';
  let border = 'rgba(234, 88, 12, 0.25)';
  let color = '#F97316';
  let text = 'Free Period';

  if (status === 'away') {
    bg = 'rgba(239, 68, 68, 0.14)';
    border = 'rgba(239, 68, 68, 0.25)';
    color = '#FCA5A5';
    text = 'Away';
  } else if (status === 'present') {
    bg = 'rgba(34, 197, 94, 0.14)';
    border = 'rgba(34, 197, 94, 0.25)';
    color = '#86EFAC';
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
