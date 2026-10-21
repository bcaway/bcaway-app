import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SchedulePeriod } from '../../types';
import { formatTimeRange, getTimeRemainingInPeriod } from '../../utils/time';
import { useTheme } from '../../context/ThemeContext';

interface PeriodCardProps {
  period: SchedulePeriod;
  isCurrentPeriod: boolean;
  isPast: boolean;
  absentCount?: number;
  onPress?: () => void;
  showDivider?: boolean;
}

export function PeriodCard({
  period,
  isCurrentPeriod,
  isPast,
  absentCount = 0,
  onPress,
  showDivider = true,
}: PeriodCardProps) {
  const { colors } = useTheme();
  const hasAbsences = absentCount > 0;

  const [remainingText, setRemainingText] = useState<string | null>(() =>
    isCurrentPeriod ? getTimeRemainingInPeriod(period.end) : null
  );

  useEffect(() => {
    if (!isCurrentPeriod) return;
    setRemainingText(getTimeRemainingInPeriod(period.end));
    const timer = setInterval(() => {
      setRemainingText(getTimeRemainingInPeriod(period.end));
    }, 15000);
    return () => clearInterval(timer);
  }, [isCurrentPeriod, period.end]);

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const periodLabel = period.period.toUpperCase() === 'IGS' ? 'IGS' : period.period;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      android_ripple={{ color: colors.surfaceSubtle }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card },
        isCurrentPeriod && { backgroundColor: colors.surfaceSubtle },
        isPast && styles.rowPast,
        pressed && { backgroundColor: colors.surfaceSubtle },
        showDivider && [styles.divider, { borderBottomColor: colors.border }],
      ]}
    >
      {/* Active period left indicator bar */}
      {isCurrentPeriod && (
        <View style={[styles.activeIndicatorBar, { backgroundColor: colors.primary }]} />
      )}

      {/* Period Identifier Column */}
      <View style={styles.periodCol}>
        <Text
          style={[
            styles.periodText,
            { color: colors.textSecondary },
            isCurrentPeriod && [styles.periodTextCurrent, { color: colors.primary }],
          ]}
        >
          {periodLabel}
        </Text>
      </View>

      {/* Bell Time Range Column */}
      <View style={styles.timeCol}>
        <Text
          style={[
            styles.timeText,
            { color: colors.textPrimary },
            isCurrentPeriod && [styles.timeTextCurrent, { color: colors.textPrimary }],
          ]}
        >
          {formatTimeRange(period.start, period.end)}
        </Text>
      </View>

      {/* Status & Absences Column */}
      <View style={styles.statusCol}>
        {isCurrentPeriod && (
          <View style={styles.nowBadge}>
            <Text style={[styles.nowText, { color: colors.primary }]}>Now</Text>
            {remainingText ? (
              <Text style={[styles.remainingText, { color: colors.textSecondary }]}>• {remainingText}</Text>
            ) : null}
          </View>
        )}

        {hasAbsences ? (
          <Text style={[styles.absenceCountText, { color: colors.absent }]}>
            {absentCount} absent
          </Text>
        ) : null}

        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.chevron} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  rowPast: {
    opacity: 0.5,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activeIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  periodCol: {
    width: 34,
    marginRight: 8,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  periodTextCurrent: {
    fontWeight: '700',
  },
  timeCol: {
    flex: 1,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  timeTextCurrent: {
    fontWeight: '600',
  },
  statusCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nowText: {
    fontSize: 12,
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '500',
  },
  absenceCountText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 2,
  },
});
