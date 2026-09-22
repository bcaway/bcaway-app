import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { useSchedule } from '../../src/hooks/useSchedule';
import { useAbsences } from '../../src/hooks/useAbsences';
import { getAbsentTeachersForPeriod } from '../../src/services/absenceService';
import { formatTimeRange } from '../../src/utils/time';
import { AbsenceListItem } from '../../src/components/common/AbsenceListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BCAwayLoading } from '../../src/components/common/BCAwayLoading';

export default function PeriodDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const periodId = Array.isArray(id) ? id[0] : id || '';

  const { periods, currentPeriod, refresh: refreshSchedule } = useSchedule();
  const { absentTeachers, isLoading, error, refresh: refreshAbsences } = useAbsences();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await Promise.all([refreshSchedule(), refreshAbsences()]);
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

  const periodAbsences = useMemo(() => {
    return getAbsentTeachersForPeriod(absentTeachers, periodId);
  }, [absentTeachers, periodId]);

  const displayTitle = periodId.toUpperCase() === 'IGS' ? 'Period IGS' : `Period ${periodId}`;
  const todayString = format(new Date(), 'EEEE, MMMM d');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <View style={styles.wrapper}>
          <View style={styles.navBarInner}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#2563EB" />
              <Text style={styles.backButtonText}>Today</Text>
            </TouchableOpacity>

            {isCurrentPeriod && (
              <Text style={styles.nowText}>In progress</Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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
            <Text style={styles.title}>{displayTitle}</Text>
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
              {periodAbsences.length > 0 && (
                <Text style={styles.countText}>
                  {periodAbsences.length} {periodAbsences.length === 1 ? 'teacher' : 'teachers'}
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
                  title="Unable to load absences"
                  subtitle="Could not retrieve database records. Pull down to retry."
                />
              </View>
            ) : periodAbsences.length > 0 ? (
              <View style={styles.ledger}>
                {periodAbsences.map((teacher, index) => (
                  <AbsenceListItem
                    key={teacher.id}
                    teacher={teacher}
                    showDivider={index < periodAbsences.length - 1}
                  />
                ))}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 60,
  },
  heroHeader: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
