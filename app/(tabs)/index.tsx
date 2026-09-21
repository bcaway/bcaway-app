import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSchedule } from '../../src/hooks/useSchedule';
import { useAbsences } from '../../src/hooks/useAbsences';
import { getGreeting, getCurrentTimeStr, timeToSeconds } from '../../src/utils/time';
import { formatPeriodsImpacted, getAbsentTeachersForPeriod } from '../../src/services/absenceService';
import { TodaySchedule } from '../../src/components/schedule/TodaySchedule';
import { PeriodWithStatus } from '../../src/types';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { BCAwayLogo } from '../../src/components/common/BCAwayLogo';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TodayScreen() {
  const router = useRouter();
  const { schedule, periods, currentPeriod, isLoading: scheduleLoading, refresh: refreshSchedule } = useSchedule();
  const { absentTeachers, isLoading: absencesLoading, error: absencesError, refresh: refreshAbsences } = useAbsences();
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
      const absentCount = getAbsentTeachersForPeriod(absentTeachers, period.period).length;

      return {
        period,
        isCurrentPeriod: isCurrent,
        isPast,
        absentCount,
      };
    });
  }, [periods, currentPeriod, absentTeachers]);

  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const isLoading = scheduleLoading || absencesLoading;
  const firstAbsent = absentTeachers.length > 0 ? absentTeachers[0] : null;
  const otherAbsentTeachers = absentTeachers.slice(1);

  if (isLoading && !refreshing) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 16) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A86E8" />}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <BCAwayLogo width={54} />
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
            <Ionicons name="arrow-forward" size={13} color="#4A86E8" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <GlassCard variant="elevated" style={styles.heroCard}>
          {absencesError ? (
            <View style={styles.heroEmpty}>
              <Text style={styles.heroTitle}>Absences Unavailable</Text>
              <Text style={styles.heroSubtitle}>Could not load today's absence data</Text>
            </View>
          ) : firstAbsent ? (
            <View>
              <View style={styles.heroMain}>
                <View style={styles.heroTextGroup}>
                  <Text style={styles.heroTitle}>{firstAbsent.teacher}</Text>
                  <Text style={styles.heroSubtitle}>{formatPeriodsImpacted(firstAbsent.periodsImpacted)}</Text>
                </View>
              </View>

              {otherAbsentTeachers.length > 0 && (
                <View style={styles.heroSecondaryList}>
                  <View style={styles.heroDivider} />
                  {otherAbsentTeachers.slice(0, 2).map(t => (
                    <View key={t.id} style={styles.heroSecondaryRow}>
                      <Text style={styles.heroSecondaryName}>{t.teacher}</Text>
                      <Text style={styles.heroSecondaryDuration}>{formatPeriodsImpacted(t.periodsImpacted)}</Text>
                    </View>
                  ))}
                  {otherAbsentTeachers.length > 2 && (
                    <TouchableOpacity onPress={() => router.push('/(tabs)/absences')} activeOpacity={0.7}>
                      <Text style={styles.heroMoreText}>
                        +{otherAbsentTeachers.length - 2} more absent today
                      </Text>
                    </TouchableOpacity>
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
    </View>
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
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 34,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginTop: 14,
    letterSpacing: -0.6,
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
    backgroundColor: '#EEF4FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A86E8',
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
    color: '#4A86E8',
    marginTop: 6,
    fontWeight: '600',
  },
  heroEmpty: {
    paddingVertical: 8,
  },
});
