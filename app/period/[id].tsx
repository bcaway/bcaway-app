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
import { getAbsentTeachersForPeriod } from '../../src/services/absenceService';
import { formatTimeRange } from '../../src/utils/time';
import { AbsenceListItem } from '../../src/components/common/AbsenceListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BCAwayLoading } from '../../src/components/common/BCAwayLoading';

export default function PeriodDetailScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.safeArea}>
      {/* Navigation Bar for non-iOS (on iOS sheet popouts, swipe down dismisses) */}
      {Platform.OS !== 'ios' && (
        <View style={styles.navBar}>
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
                  color="#2563EB"
                />
                <Text style={styles.backButtonText}>Today</Text>
              </TouchableOpacity>

              {isCurrentPeriod && (
                <Text style={styles.nowText}>In progress</Text>
              )}
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          Platform.OS === 'ios' && { paddingTop: 24 },
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
          {/* Period Header */}
          <View style={styles.heroHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{displayTitle}</Text>
              {Platform.OS === 'ios' && isCurrentPeriod && (
                <Text style={styles.nowText}>In progress</Text>
              )}
            </View>
            <View style={styles.metaRow}>
              {periodInfo && (
                <Text style={styles.timeText}>
                  {formatTimeRange(periodInfo.start, periodInfo.end)}
                </Text>
              )}
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.dateText}>{todayString}</Text>
            </View>
          </View>

          {/* Section: Absent Teachers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ABSENT THIS PERIOD</Text>
              {totalPeriodCount > 0 && (
                <Text style={styles.countText}>
                  {totalPeriodCount} {totalPeriodCount === 1 ? 'teacher' : 'teachers'}
                </Text>
              )}
            </View>

            {isLoading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <BCAwayLoading />
              </View>
            ) : error ? (
              <View style={styles.emptyBox}>
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
                    <Text style={styles.subSectionHeading}>STARRED FACULTY</Text>
                    <View style={styles.ledger}>
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
                      <Text style={styles.subSectionHeading}>OTHER FACULTY</Text>
                    )}
                    <View style={styles.ledger}>
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
              <View style={styles.emptyBox}>
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
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
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
    color: '#2563EB',
    fontWeight: '600',
  },
  nowText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heroHeader: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
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
    color: '#2563EB',
    fontVariant: ['tabular-nums'],
  },
  bullet: {
    color: '#94A3B8',
    fontSize: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
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
    color: '#64748B',
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
    color: '#64748B',
    letterSpacing: 0.6,
  },
  countText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  ledger: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    width: '100%',
  },
  emptyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 20,
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
