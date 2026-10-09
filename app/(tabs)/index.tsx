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
import { useData } from '../../src/context/DataContext';
import { getGreeting, getCurrentTimeStr, timeToSeconds, getDaysUntilHalloween } from '../../src/utils/time';
import { formatPeriodsImpacted, getAbsentTeachersForPeriod } from '../../src/services/absenceService';
import { TodaySchedule } from '../../src/components/schedule/TodaySchedule';
import { PeriodWithStatus } from '../../src/types';
import { BCAwayLogo } from '../../src/components/common/BCAwayLogo';
import { LoadingScreen } from '../../src/components/common/LoadingScreen';
import { CornerSpiderWebs } from '../../src/components/halloween/CornerSpiderWebs';
import { AnimatedBat } from '../../src/components/halloween/AnimatedBat';
import { GhostEasterEgg } from '../../src/components/halloween/GhostEasterEgg';
import { PumpkinIllustration } from '../../src/components/halloween/PumpkinIllustration';
import { MarginLeaves, BottomCornerPumpkins } from '../../src/components/halloween/HalloweenAccents';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
  const [logoTapTrigger, setLogoTapTrigger] = useState(0);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogoTapTrigger(prev => prev + 1);
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
  const daysUntilHalloween = getDaysUntilHalloween();
  const isLoading = scheduleLoading || absencesLoading;
  const firstAbsent = starredAbsences.length > 0 ? starredAbsences[0] : null;
  const otherAbsentTeachers = starredAbsences.slice(1);

  if (isLoading && !refreshing) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.screen}>
      <CornerSpiderWebs topOffset={insets.top} />
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
            tintColor="#EA580C"
            title="Summoning today's schedule... 🎃"
            titleColor="#EA580C"
          />
        }
      >
        <View style={styles.wrapper}>
          {refreshing && (
            <View style={styles.cauldronBanner}>
              <Text style={styles.cauldronBannerText}>
                🔮 Stirring the cauldron & checking absences... 🎃
              </Text>
            </View>
          )}

          {/* Centered Brand Header + Greeting */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <GhostEasterEgg trigger={logoTapTrigger} />
              <TouchableOpacity
                onPress={handleLogoPress}
                activeOpacity={0.8}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <BCAwayLogo width={64} color="#EA580C" />
              </TouchableOpacity>
              <AnimatedBat size={32} style={styles.headerBat} swoopTrigger={logoTapTrigger} />
            </View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.countdownSubtext}>
              {daysUntilHalloween === 0
                ? '🎃 Happy Halloween! 👻'
                : `✨ ${daysUntilHalloween} ${daysUntilHalloween === 1 ? 'day' : 'days'} 'til Halloween 🕸️`}
            </Text>
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
              <Ionicons name="arrow-forward" size={13} color="#EA580C" style={{ marginLeft: 4 }} />
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
            ) : starredTeacherIds.length === 0 ? (
              <TouchableOpacity
                style={styles.starPromptContainer}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/starred-teachers' as any);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.starPromptIconCircle}>
                  <Text style={{ fontSize: 24 }}>🎃</Text>
                </View>
                <Text style={styles.starPromptTitle}>Track Your Teachers</Text>
                <View style={styles.starPromptButton}>
                  <Text style={styles.starPromptButtonText}>Pick Favorite Faculty 🎃</Text>
                  <Ionicons name="arrow-forward" size={13} color="#EA580C" style={{ marginLeft: 4 }} />
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
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.heroMoreText}>
                          +{otherAbsentTeachers.length - 2} more haunting elsewhere 👻
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ) : schedule && !schedule.hasSchool ? (
              <View style={styles.heroEmpty}>
                <PumpkinIllustration size={36} showSparkles={true} />
                <Text style={styles.heroTitle}>No School Today 🎃</Text>
                <Text style={styles.heroSubtitle}>Enjoy your spooky day off!</Text>
              </View>
            ) : absentTeachers.length === 0 ? (
              <View style={styles.heroEmpty}>
                <PumpkinIllustration size={36} showSparkles={true} />
                <Text style={styles.heroTitle}>No Ghosts in Sight! 🎃</Text>
                <Text style={styles.heroSubtitle}>All faculty accounted for today</Text>
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
                <PumpkinIllustration size={36} showSparkles={true} />
                <Text style={styles.heroTitle}>All Your Faculty Present 🎃</Text>
                <Text style={styles.heroSubtitle}>
                  {`None of your tracked teachers are ghosting today (${absentTeachers.length} other ${absentTeachers.length === 1 ? 'faculty away in the mist' : 'faculty away in the mist'})`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section: Today's Schedule */}
          <View style={[styles.sectionHeaderRow, { marginTop: 28 }]}>
            <MarginLeaves />
            <View style={styles.sectionTitleGroup}>
              <Ionicons name="time-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
            </View>
            {currentPeriod && (
              <Text style={styles.currentPeriodIndicator}>
                {currentPeriod.period.toUpperCase() === 'IGS'
                  ? 'In IGS'
                  : `In Period ${currentPeriod.period}`}
              </Text>
            )}
          </View>

          <View style={styles.scheduleWrapper}>
            <TodaySchedule
              periods={periodsWithStatus}
              isLoading={isLoading}
              error={scheduleError}
            />
            {/* Flying bat decoration near bottom right of schedule */}
            <AnimatedBat size={26} style={styles.scheduleBat} delay={500} />
          </View>
        </View>
      </ScrollView>
      <BottomCornerPumpkins />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF7F2',
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
  logoRow: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBat: {
    position: 'absolute',
    top: -12,
    right: -32,
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
    position: 'relative',
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
    color: '#EA580C',
  },
  currentPeriodIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EA580C',
  },
  countdownSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA580C',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  cauldronBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
    alignSelf: 'center',
  },
  cauldronBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EA580C',
  },
  heroCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 88, 12, 0.22)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starPromptTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  starPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  starPromptButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA580C',
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
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E2D9',
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
    color: '#EA580C',
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
  scheduleWrapper: {
    position: 'relative',
  },
  scheduleBat: {
    position: 'absolute',
    bottom: -10,
    right: -4,
    zIndex: 5,
  },
});
