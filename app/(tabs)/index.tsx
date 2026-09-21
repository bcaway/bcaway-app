import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSchedule } from '../../src/hooks/useSchedule';
import { useAbsences } from '../../src/hooks/useAbsences';
import { getGreeting, getCurrentTimeStr, timeToSeconds } from '../../src/utils/time';
import { TodaySchedule } from '../../src/components/schedule/TodaySchedule';
import { PeriodWithStatus } from '../../src/types';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { BCAwayEmblem } from '../../src/components/common/BCAwayEmblem';

export default function TodayScreen() {
  const router = useRouter();
  const { schedule, periods, currentPeriod, isLoading: scheduleLoading, refresh: refreshSchedule } = useSchedule();
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
      const isCurrent = currentPeriod?.period === period.period;
      const isPast = nowSec > endSec;

      // Associate absent teachers with periods
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

  const greeting = getGreeting();
  const isLoading = scheduleLoading || absencesLoading;
  const firstAbsent = absentTeachers.length > 0 ? absentTeachers[0] : null;
  const otherAbsentTeachers = absentTeachers.slice(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <BCAwayEmblem size={24} />
          <Text style={styles.greeting}>{greeting}</Text>
        </View>

        {/* Hero Section: Teacher Absences */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Ionicons name="people-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Teacher Absences</Text>
          </View>
          <TouchableOpacity
            style={styles.pillButton}
            onPress={() => router.push('/(tabs)/absences')}
            activeOpacity={0.7}
          >
            <Text style={styles.pillButtonText}>All Absences</Text>
            <Ionicons name="arrow-forward" size={13} color="#2563EB" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <GlassCard variant="elevated" style={styles.heroCard}>
          {firstAbsent ? (
            <View>
              <View style={styles.heroMain}>
                <View style={styles.heroTextGroup}>
                  <Text style={styles.heroTitle}>{firstAbsent.name}</Text>
                  <Text style={styles.heroSubtitle}>Away · {firstAbsent.duration || 'All Day'}</Text>
                </View>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>Away</Text>
                </View>
              </View>

              {otherAbsentTeachers.length > 0 && (
                <View style={styles.heroSecondaryList}>
                  <View style={styles.heroDivider} />
                  {otherAbsentTeachers.slice(0, 2).map(t => (
                    <View key={t.id} style={styles.heroSecondaryRow}>
                      <Text style={styles.heroSecondaryName}>{t.name}</Text>
                      <Text style={styles.heroSecondaryDuration}>{t.duration || 'All Day'}</Text>
                    </View>
                  ))}
                  {otherAbsentTeachers.length > 2 && (
                    <Text style={styles.heroMoreText}>
                      +{otherAbsentTeachers.length - 2} more absent today
                    </Text>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.heroEmpty}>
              <Text style={styles.heroTitle}>All Teachers Present</Text>
              <Text style={styles.heroSubtitle}>No absences reported for today</Text>
            </View>
          )}
        </GlassCard>

        {/* Schedule Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <View style={styles.sectionTitleGroup}>
            <Ionicons name="time-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
          </View>
        </View>

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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 6,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  heroCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextGroup: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  heroBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  heroSecondaryList: {
    marginTop: 2,
  },
  heroSecondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  heroSecondaryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  heroSecondaryDuration: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  heroMoreText: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 6,
    fontWeight: '600',
  },
  heroEmpty: {
    paddingVertical: 8,
  },
});
