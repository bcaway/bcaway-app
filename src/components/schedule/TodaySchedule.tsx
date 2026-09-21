import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PeriodCard } from './PeriodCard';
import { EmptyState } from '../ui/EmptyState';
import { PeriodWithStatus, SchedulePeriod } from '../../types';

interface TodayScheduleProps {
  periods: PeriodWithStatus[];
  isLoading: boolean;
  onPeriodPress?: (period: SchedulePeriod) => void;
}

export function TodaySchedule({ periods, isLoading, onPeriodPress }: TodayScheduleProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (periods.length === 0) {
    return <EmptyState icon="🎉" title="No School Today" subtitle="Enjoy your day off!" />;
  }

  const handlePeriodPress = (period: SchedulePeriod) => {
    if (onPeriodPress) {
      onPeriodPress(period);
    } else {
      router.push(`/period/${encodeURIComponent(period.period)}`);
    }
  };

  return (
    <View style={styles.list}>
      {periods.map((item) => (
        <PeriodCard
          key={item.period.period}
          period={item.period}
          isCurrentPeriod={item.isCurrentPeriod}
          isPast={item.isPast}
          absentCount={item.absentCount ?? 0}
          onPress={() => handlePeriodPress(item.period)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  list: {
    gap: 0,
  },
});
