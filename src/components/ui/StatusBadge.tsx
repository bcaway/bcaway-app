import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface StatusBadgeProps {
  status: 'away' | 'present' | 'free';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { colors } = useTheme();
  const isSm = size === 'sm';

  let bg = colors.primarySubtle;
  let border = colors.accentLight;
  let color = colors.primary;
  let text = 'Free Period';

  if (status === 'away') {
    bg = colors.absentBg;
    border = colors.absentBorder;
    color = colors.absentText;
    text = 'Away';
  } else if (status === 'present') {
    bg = colors.presentBg;
    border = colors.presentBorder;
    color = colors.presentText;
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
