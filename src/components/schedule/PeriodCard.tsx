import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SchedulePeriod } from '../../types';
import { formatTimeRange } from '../../utils/time';

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
  const hasAbsences = absentCount > 0;

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
      style={({ pressed }) => [
        styles.row,
        isCurrentPeriod && styles.rowCurrent,
        isPast && styles.rowPast,
        pressed && styles.rowPressed,
        showDivider && styles.divider,
      ]}
    >
      {/* Active period left indicator bar */}
      {isCurrentPeriod && <View style={styles.activeIndicatorBar} />}

      {/* Period Identifier Column */}
      <View style={styles.periodCol}>
        <Text style={[styles.periodText, isCurrentPeriod && styles.periodTextCurrent]}>
          {periodLabel}
        </Text>
      </View>

      {/* Bell Time Range Column */}
      <View style={styles.timeCol}>
        <Text style={[styles.timeText, isCurrentPeriod && styles.timeTextCurrent]}>
          {formatTimeRange(period.start, period.end)}
        </Text>
      </View>

      {/* Status & Absences Column */}
      <View style={styles.statusCol}>
        {isCurrentPeriod && (
          <Text style={styles.nowText}>Now</Text>
        )}

        {hasAbsences ? (
          <Text style={styles.absenceCountText}>
            {absentCount} absent
          </Text>
        ) : null}

        <Ionicons name="chevron-forward" size={14} color="#CBD5E1" style={styles.chevron} />
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
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  rowCurrent: {
    backgroundColor: '#F8FAFC',
  },
  rowPast: {
    opacity: 0.5,
  },
  rowPressed: {
    backgroundColor: '#F1F5F9',
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  activeIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#2563EB',
  },
  periodCol: {
    width: 34,
    marginRight: 8,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    fontVariant: ['tabular-nums'],
  },
  periodTextCurrent: {
    color: '#2563EB',
    fontWeight: '700',
  },
  timeCol: {
    flex: 1,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  timeTextCurrent: {
    fontWeight: '600',
    color: '#0F172A',
  },
  statusCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  absenceCountText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#DC2626',
  },
  chevron: {
    marginLeft: 2,
  },
});
