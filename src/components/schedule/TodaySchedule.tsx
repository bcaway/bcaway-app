import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BCAwayLoading } from '../common/BCAwayLoading';
import { PeriodCard } from './PeriodCard';
import { EmptyState } from '../ui/EmptyState';
import { PeriodWithStatus, SchedulePeriod } from '../../types';

interface TodayScheduleProps {
  periods: PeriodWithStatus[];
  isLoading: boolean;
  error?: Error | null;
  onPeriodPress?: (period: SchedulePeriod) => void;
}

export function TodaySchedule({ periods, isLoading, error, onPeriodPress }: TodayScheduleProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <BCAwayLoading />
      </View>
    );
  }

  if (error && periods.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <EmptyState
          icon="⚠️"
          title="Schedule Unavailable"
          subtitle="Could not load schedule data. Pull down to retry."
        />
      </View>
    );
  }

  if (periods.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <EmptyState
          icon="🎉"
          title="No School Today"
          subtitle="No periods scheduled for today. Enjoy your day off!"
        />
      </View>
    );
  }

  const handlePeriodPress = (period: SchedulePeriod) => {
    if (onPeriodPress) {
      onPeriodPress(period);
    } else {
      router.push(`/period/${encodeURIComponent(period.period)}`);
    }
  };

  return (
    <View style={styles.ledgerContainer}>
      {periods.map((item, index) => (
        <PeriodCard
          key={item.period.period}
          period={item.period}
          isCurrentPeriod={item.isCurrentPeriod}
          isPast={item.isPast}
          absentCount={item.absentCount ?? 0}
          onPress={() => handlePeriodPress(item.period)}
          showDivider={index < periods.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  ledgerContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
});
