import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { SchedulePeriod } from '../../types';
import { formatTimeRange } from '../../utils/time';

interface PeriodCardProps {
  period: SchedulePeriod;
  isCurrentPeriod: boolean;
  isPast: boolean;
  onPress?: () => void;
}

export function PeriodCard({ period, isCurrentPeriod, isPast, onPress }: PeriodCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.pressable,
        isPast && styles.pastPeriod,
        pressed && styles.pressed,
      ]}
    >
      <GlassCard
        variant={isCurrentPeriod ? 'elevated' : 'default'}
        style={[
          styles.card,
          isCurrentPeriod && styles.currentBg,
        ]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.periodBadge,
              isCurrentPeriod && styles.periodBadgeCurrent,
            ]}
          >
            <Text
              style={[
                styles.periodText,
                isCurrentPeriod && styles.periodTextCurrent,
              ]}
            >
              {period.period}
            </Text>
          </View>

          <View style={styles.middle}>
            <Text style={styles.timeText}>
              {formatTimeRange(period.start, period.end)}
            </Text>
          </View>

          {isCurrentPeriod && (
            <View style={styles.nowBadge}>
              <Text style={styles.nowText}>Now</Text>
            </View>
          )}
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginVertical: 4,
  },
  pastPeriod: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentBg: {
    backgroundColor: '#F0F4FF',
    borderColor: '#BFDBFE',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  periodBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  periodBadgeCurrent: {
    backgroundColor: '#2563EB',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  periodTextCurrent: {
    color: '#FFFFFF',
  },
  middle: {
    flex: 1,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  nowBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nowText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
});
