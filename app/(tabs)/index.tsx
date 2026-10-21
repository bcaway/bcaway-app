import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../src/context/DataContext';
import { useTheme } from '../../src/context/ThemeContext';
import { getGreeting, getCurrentTimeStr, timeToSeconds, getPassingTimeStatus } from '../../src/utils/time';
import { formatPeriodsImpacted, getAbsentTeachersForPeriod } from '../../src/services/absenceService';
import { TodaySchedule } from '../../src/components/schedule/TodaySchedule';
import { PeriodWithStatus } from '../../src/types';
import { BCAwayLogo } from '../../src/components/common/BCAwayLogo';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const {
    schedule,
    periods,
    currentPeriod,
    scheduleLoading,
    scheduleError,
    absentTeachers,
    absencesLoading,
    absencesError,
    starredTeacherIds,
    starredAbsences,
    refreshAll,
  } = useData();

  const [refreshing, setRefreshing] = useState(false);
  const [passingTimeStatus, setPassingTimeStatus] = useState<string | null>(() =>
    getPassingTimeStatus(periods, currentPeriod)
  );

  useEffect(() => {
    setPassingTimeStatus(getPassingTimeStatus(periods, currentPeriod));
    const timer = setInterval(() => {
      setPassingTimeStatus(getPassingTimeStatus(periods, currentPeriod));
    }, 15000);
    return () => clearInterval(timer);
  }, [periods, currentPeriod]);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refreshAll();
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
  const firstAbsent = starredAbsences.length > 0 ? starredAbsences[0] : null;
  const otherAbsentTeachers = starredAbsences.slice(1);

  if (isLoading && !refreshing) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
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
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.wrapper}>
          {/* Centered Brand Header + Greeting */}
          <View style={styles.header}>
            <BCAwayLogo width={54} color={colors.primary} />
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>{greeting}</Text>
          </View>

          {/* Section: Teacher Absences */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Teacher Absences</Text>
            </View>
            <TouchableOpacity
              style={styles.allAbsencesButton}
              onPress={() => router.push('/(tabs)/absences')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Text style={[styles.allAbsencesText, { color: colors.primary }]}>All Absences</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Teacher Absences Hero Card */}
          <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {absencesError ? (
              <View style={styles.heroEmpty}>
                <Text style={styles.heroEmoji}>⚠️</Text>
                <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Absences Unavailable</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Could not load today's absence data</Text>
              </View>
            ) : starredTeacherIds.length === 0 ? (
              <TouchableOpacity
                style={styles.starPromptContainer}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/starred-teachers' as any);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.starPromptIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                  <Ionicons name="star" size={26} color={colors.textMuted} />
                </View>
                <Text style={[styles.starPromptTitle, { color: colors.textPrimary }]}>Track Your Teachers</Text>
                <View style={[styles.starPromptButton, { backgroundColor: colors.primarySubtle }]}>
                  <Text style={[styles.starPromptButtonText, { color: colors.primary }]}>Choose Starred Teachers</Text>
                  <Ionicons name="arrow-forward" size={13} color={colors.primary} style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            ) : firstAbsent ? (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/absences');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.heroMain}>
                  <View style={styles.heroTextGroup}>
                    <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{firstAbsent.teacher}</Text>
                    <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{formatPeriodsImpacted(firstAbsent.periodsImpacted)}</Text>
                  </View>
                </View>

                {otherAbsentTeachers.length > 0 && (
                  <View style={styles.heroSecondaryList}>
                    <View style={[styles.heroDivider, { backgroundColor: colors.divider }]} />
                    {otherAbsentTeachers.slice(0, 2).map(t => (
                      <View key={t.id} style={styles.heroSecondaryRow}>
                        <Text style={[styles.heroSecondaryName, { color: colors.textPrimary }]}>{t.teacher}</Text>
                        <Text style={[styles.heroSecondaryDuration, { color: colors.textSecondary }]}>{formatPeriodsImpacted(t.periodsImpacted)}</Text>
                      </View>
                    ))}
                    {otherAbsentTeachers.length > 2 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={[styles.heroMoreText, { color: colors.primary }]}>
                          +{otherAbsentTeachers.length - 2} more absent today
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ) : schedule && !schedule.hasSchool ? (
              <View style={styles.heroEmpty}>
                <Text style={styles.heroEmoji}>🎉</Text>
                <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>No School Today</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Enjoy your day off!</Text>
              </View>
            ) : absentTeachers.length === 0 ? (
              <View style={styles.heroEmpty}>
                <Text style={styles.heroEmoji}>🎉</Text>
                <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>No Absences Today</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>No faculty absences reported today</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.heroEmpty}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/absences');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.heroEmoji}>🎉</Text>
                <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Your Teachers are Present</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                  {`None of your starred teachers are absent today (${absentTeachers.length} other ${absentTeachers.length === 1 ? 'teacher' : 'teachers'} absent)`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section: Today's Schedule */}
          <View style={[styles.sectionHeaderRow, { marginTop: 28 }]}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Today's Schedule</Text>
            </View>
            {currentPeriod ? (
              <Text style={[styles.currentPeriodIndicator, { color: colors.primary }]}>
                {currentPeriod.period.toUpperCase() === 'IGS'
                  ? 'In IGS'
                  : `In Period ${currentPeriod.period}`}
              </Text>
            ) : passingTimeStatus ? (
              <Text style={[styles.currentPeriodIndicator, { color: colors.primary }]}>
                {passingTimeStatus}
              </Text>
            ) : null}
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
  },
  allAbsencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allAbsencesText: {
    fontSize: 13,
    fontWeight: '600',
  },
  currentPeriodIndicator: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  starPromptContainer: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starPromptIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starPromptTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  starPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  starPromptButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 3,
    fontWeight: '500',
    textAlign: 'center',
  },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
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
  },
  heroSecondaryDuration: {
    fontSize: 13,
    fontWeight: '500',
  },
  heroMoreText: {
    fontSize: 13,
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
