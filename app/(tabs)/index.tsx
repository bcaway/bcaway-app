import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSchedule } from '../../src/hooks/useSchedule';
import { useAbsences } from '../../src/hooks/useAbsences';
import { getGreeting, getCurrentTimeStr, timeToSeconds } from '../../src/utils/time';
import { formatPeriodsImpacted, getAbsentTeachersForPeriod } from '../../src/services/absenceService';
import { TodaySchedule } from '../../src/components/schedule/TodaySchedule';
import { PeriodWithStatus } from '../../src/types';
import { BCAwayLogo } from '../../src/components/common/BCAwayLogo';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    schedule,
    periods,
    currentPeriod,
    isLoading: scheduleLoading,
    error: scheduleError,
    refresh: refreshSchedule,
  } = useSchedule();
  const {
    absentTeachers,
    isLoading: absencesLoading,
    error: absencesError,
    refresh: refreshAbsences,
  } = useAbsences();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const greeting = getGreeting();
  const isLoading = scheduleLoading || absencesLoading;
  const firstAbsent = absentTeachers.length > 0 ? absentTeachers[0] : null;
  const otherAbsentTeachers = absentTeachers.slice(1);

  if (isLoading && !refreshing) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 16) + 16,
            paddingLeft: Math.max(insets.left, 20),
            paddingRight: Math.max(insets.right, 20),
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        <View style={styles.wrapper}>
          {/* Centered Brand Header + Greeting */}
          <View style={styles.header}>
            <BCAwayLogo width={54} color="#2563EB" />
            <Text style={styles.greeting}>{greeting}</Text>
          </View>

          {/* Section: Teacher Absences */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons name="people-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Teacher Absences</Text>
            </View>
            <TouchableOpacity
              style={styles.allAbsencesButton}
              onPress={() => router.push('/(tabs)/absences')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Text style={styles.allAbsencesText}>All Absences</Text>
              <Ionicons name="arrow-forward" size={13} color="#2563EB" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Teacher Absences Hero Card */}
          <View style={styles.heroCard}>
            {absencesError ? (
              <View style={styles.heroEmpty}>
                <Text style={styles.heroEmoji}>⚠️</Text>
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
                      <TouchableOpacity
                        onPress={() => router.push('/(tabs)/absences')}
                        activeOpacity={0.7}
                        style={{ marginTop: 8 }}
                      >
                        <Text style={styles.heroMoreText}>
                          +{otherAbsentTeachers.length - 2} more absent today
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ) : schedule && !schedule.hasSchool ? (
              <View style={styles.heroEmpty}>
                <Text style={styles.heroEmoji}>🎉</Text>
                <Text style={styles.heroTitle}>No School Today</Text>
                <Text style={styles.heroSubtitle}>Enjoy your day off!</Text>
              </View>
            ) : (
              <View style={styles.heroEmpty}>
                <Text style={styles.heroEmoji}>🎉</Text>
                <Text style={styles.heroTitle}>All Teachers Present</Text>
                <Text style={styles.heroSubtitle}>No absences reported for today</Text>
              </View>
            )}
          </View>

          {/* Section: Today's Schedule */}
          <View style={[styles.sectionHeaderRow, { marginTop: 28 }]}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons name="time-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
            </View>
            {currentPeriod && (
              <Text style={styles.currentPeriodIndicator}>
                In Mod {currentPeriod.period}
              </Text>
            )}
          </View>

          <TodaySchedule
            periods={periodsWithStatus}
            isLoading={isLoading}
            error={scheduleError}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  wrapper: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
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
    color: '#475569',
  },
  allAbsencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allAbsencesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  currentPeriodIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  heroCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
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
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  heroSecondaryList: {
    marginTop: 2,
  },
  heroSecondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  heroSecondaryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  heroSecondaryDuration: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  heroMoreText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  heroEmpty: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
});
