import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { PeriodCard } from './PeriodCard';
import { EmptyState } from '../ui/EmptyState';
import { PeriodWithStatus } from '../../types';

interface TodayScheduleProps {
  periods: PeriodWithStatus[];
  isLoading: boolean;
}

export function TodaySchedule({ periods, isLoading }: TodayScheduleProps) {
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

  return (
    <View style={styles.list}>
      {periods.map((item) => (
        <PeriodCard
          key={item.period.period}
          period={item.period}
          isCurrentPeriod={item.isCurrentPeriod}
          isPast={item.isPast}
          absentTeacher={item.absentTeacher}
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
