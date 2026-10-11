import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SchedulePeriod } from '../../types';
import { formatTimeRange, getTimeRemainingInPeriod } from '../../utils/time';

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
      <View style={[styles.periodCol, isCurrentPeriod && styles.periodColCurrent]}>
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
          <View style={styles.nowBadge}>
            <Text style={styles.candleIcon}>🕯️</Text>
            <Text style={styles.nowText}>Now</Text>
            {remainingText ? (
              <Text style={styles.remainingText}>• {remainingText}</Text>
            ) : null}
          </View>
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
    backgroundColor: '#1C0B35',
    position: 'relative',
  },
  rowCurrent: {
    backgroundColor: '#230E3E',
  },
  rowPast: {
    opacity: 0.45,
  },
  rowPressed: {
    backgroundColor: '#271047',
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: '#EA580C',
  },
  periodCol: {
    minWidth: 32,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    backgroundColor: '#271147',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  periodColCurrent: {
    backgroundColor: '#EA580C',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    fontVariant: ['tabular-nums'],
  },
  periodTextCurrent: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  timeCol: {
    flex: 1,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
  },
  timeTextCurrent: {
    fontWeight: '600',
    color: '#FEF08A',
  },
  statusCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1248',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  candleIcon: {
    fontSize: 10,
  },
  nowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F97316',
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FDBA74',
  },
  absenceCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F87171',
  },
  chevron: {
    marginLeft: 2,
  },
});
