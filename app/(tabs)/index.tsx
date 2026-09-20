import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { useSchedule } from '../../src/hooks/useSchedule';
import { useAbsences } from '../../src/hooks/useAbsences';
import { getGreeting, getCurrentTimeStr, timeToSeconds } from '../../src/utils/time';
import { format } from 'date-fns';
import { TodaySchedule } from '../../src/components/schedule/TodaySchedule';
import { PeriodWithStatus } from '../../src/types';

export default function TodayScreen() {
  const { schedule, scheduleType, periods, currentPeriod, isLoading: scheduleLoading, refresh: refreshSchedule } = useSchedule();
  const { absentTeachers, isLoading: absencesLoading, refresh: refreshAbsences } = useAbsences();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSchedule(), refreshAbsences()]);
    setRefreshing(false);
  };

  const periodsWithStatus: PeriodWithStatus[] = useMemo(() => {
    const nowStr = getCurrentTimeStr();
    const nowSec = timeToSeconds(nowStr);

    return periods.map(period => {
      const endSec = timeToSeconds(period.end);
      const startSec = timeToSeconds(period.start);
      const isCurrent = currentPeriod?.period === period.period;
      const isPast = nowSec > endSec;

      // Pick a random absent teacher for this period (mock behavior)
      // In reality this would come from the student's personal schedule
      const periodIndex = periods.indexOf(period);
      const absentTeacher = periodIndex < absentTeachers.length ? absentTeachers[periodIndex] : null;

      return {
        period,
        isCurrentPeriod: isCurrent,
        isPast,
        absentTeacher,
      };
    });
  }, [periods, currentPeriod, absentTeachers]);

  const freeCount = periodsWithStatus.filter(p => p.absentTeacher !== null).length;

  const today = new Date();
  const greeting = getGreeting();
  const dateString = format(today, 'EEEE, MMMM d');
  const typeDisplay = scheduleType === 'fullDays' ? 'Full Day' 
    : scheduleType === 'abbreviatedDays' ? 'Abbreviated' 
    : scheduleType === 'delayedOpeningDays' ? 'Delayed Opening'
    : 'No School';

  const isLoading = scheduleLoading || absencesLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.date}>{dateString}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{typeDisplay}</Text>
            </View>
            {freeCount > 0 && (
              <View style={[styles.badge, styles.freeBadge]}>
                <Text style={styles.freeBadgeText}>{freeCount} free {freeCount === 1 ? 'period' : 'periods'}</Text>
              </View>
            )}
          </View>
        </View>

        {freeCount > 0 ? (
          <View style={styles.banner}>
            <Text style={styles.bannerEmoji}>🎉</Text>
            <Text style={styles.bannerText}>
              {freeCount} {freeCount === 1 ? 'teacher is' : 'teachers are'} absent today
            </Text>
          </View>
        ) : !isLoading && schedule?.hasSchool ? (
          <View style={[styles.banner, styles.bannerFull]}>
            <Text style={styles.bannerText}>All teachers present today</Text>
          </View>
        ) : null}

        <TodaySchedule 
          periods={periodsWithStatus} 
          isLoading={isLoading} 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  freeBadge: {
    backgroundColor: '#FEF2F2',
  },
  freeBadgeText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bannerFull: {
    backgroundColor: '#F0FDF4',
  },
  bannerEmoji: {
    fontSize: 18,
  },
  bannerText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
});
