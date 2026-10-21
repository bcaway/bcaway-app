import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { useData } from '../../src/context/DataContext';
import { useTheme } from '../../src/context/ThemeContext';
import { getAbsentTeachersForPeriod } from '../../src/services/absenceService';
import { formatTimeRange } from '../../src/utils/time';
import { AbsenceListItem } from '../../src/components/common/AbsenceListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BCAwayLoading } from '../../src/components/common/BCAwayLoading';

export default function PeriodDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const periodId = Array.isArray(id) ? id[0] : id || '';

  const {
    periods,
    currentPeriod,
    absentTeachers,
    absencesLoading: isLoading,
    absencesError: error,
    starredAbsences,
    refreshAll,
  } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const periodInfo = useMemo(() => {
    return periods.find(p => p.period.toLowerCase() === periodId.toLowerCase());
  }, [periods, periodId]);

  const isCurrentPeriod = useMemo(() => {
    return currentPeriod?.period.toLowerCase() === periodId.toLowerCase();
  }, [currentPeriod, periodId]);

  const starredTeacherNames = useMemo(() => {
    return new Set(starredAbsences.map(a => a.teacher.trim().toLowerCase()));
  }, [starredAbsences]);

  const { starredPeriodAbsences, otherPeriodAbsences, totalPeriodCount } = useMemo(() => {
    const list = getAbsentTeachersForPeriod(absentTeachers, periodId);
    const starred: typeof list = [];
    const other: typeof list = [];

    for (const item of list) {
      if (starredTeacherNames.has(item.teacher.trim().toLowerCase())) {
        starred.push(item);
      } else {
        other.push(item);
      }
    }

    return {
      starredPeriodAbsences: starred,
      otherPeriodAbsences: other,
      totalPeriodCount: list.length,
    };
  }, [absentTeachers, periodId, starredTeacherNames]);

  const displayTitle = periodId.toUpperCase() === 'IGS' ? 'Period IGS' : `Period ${periodId}`;
  const todayString = format(new Date(), 'EEEE, MMMM d');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Navigation Bar for non-iOS (on iOS sheet popouts, swipe down dismisses) */}
      {Platform.OS !== 'ios' && (
        <View style={[styles.navBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={styles.wrapper}>
            <View style={styles.navBarInner}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={colors.primary}
                />
                <Text style={[styles.backButtonText, { color: colors.primary }]}>Today</Text>
              </TouchableOpacity>

              {isCurrentPeriod && (
                <Text style={[styles.nowText, { color: colors.primary }]}>In progress</Text>
              )}
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          Platform.OS === 'ios' && { paddingTop: 24 },
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
          {/* Period Header */}
          <View style={[styles.heroHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{displayTitle}</Text>
              {Platform.OS === 'ios' && isCurrentPeriod && (
                <Text style={[styles.nowText, { color: colors.primary }]}>In progress</Text>
              )}
            </View>
            <View style={styles.metaRow}>
              {periodInfo && (
                <Text style={[styles.timeText, { color: colors.primary }]}>
                  {formatTimeRange(periodInfo.start, periodInfo.end)}
                </Text>
              )}
              <Text style={[styles.bullet, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>{todayString}</Text>
            </View>
          </View>

          {/* Section: Absent Teachers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABSENT THIS PERIOD</Text>
              {totalPeriodCount > 0 && (
                <Text style={[styles.countText, { color: colors.textSecondary }]}>
                  {totalPeriodCount} {totalPeriodCount === 1 ? 'teacher' : 'teachers'}
                </Text>
              )}
            </View>

            {isLoading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <BCAwayLoading />
              </View>
            ) : error ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <EmptyState
                  icon="⚠️"
                  title="Could not load absences"
                  subtitle="Please check your connection and pull down to refresh."
                />
              </View>
            ) : totalPeriodCount > 0 ? (
              <View>
                {/* Starred Absences for this period */}
                {starredPeriodAbsences.length > 0 && (
                  <View style={styles.subSection}>
                    <Text style={[styles.subSectionHeading, { color: colors.textSecondary }]}>STARRED FACULTY</Text>
                    <View style={[styles.ledger, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {starredPeriodAbsences.map((item, index) => (
                        <AbsenceListItem
                          key={`period-starred-${item.teacher}-${index}`}
                          teacher={item}
                          isStarred={true}
                          showDivider={index < starredPeriodAbsences.length - 1}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* Other Absences for this period */}
                {otherPeriodAbsences.length > 0 && (
                  <View style={styles.subSectionOther}>
                    {starredPeriodAbsences.length > 0 && (
                      <Text style={[styles.subSectionHeading, { color: colors.textSecondary }]}>OTHER FACULTY</Text>
                    )}
                    <View style={[styles.ledger, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {otherPeriodAbsences.map((item, index) => (
                        <AbsenceListItem
                          key={`period-other-${item.teacher}-${index}`}
                          teacher={item}
                          isStarred={false}
                          showDivider={index < otherPeriodAbsences.length - 1}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <EmptyState
                  icon="🎉"
                  title="No teachers absent"
                  subtitle={`All teachers are present for ${displayTitle} today.`}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  wrapper: {
    width: '100%',
  },
  navBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nowText: {
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heroHeader: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  bullet: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  subSection: {
    marginBottom: 16,
  },
  subSectionOther: {
    marginBottom: 0,
  },
  subSectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ledger: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  emptyBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 20,
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
