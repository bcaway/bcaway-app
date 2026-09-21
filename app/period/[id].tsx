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
import { format } from 'date-fns';
import { useSchedule } from '../../src/hooks/useSchedule';
import { useAbsences } from '../../src/hooks/useAbsences';
import { getAbsentTeachersForPeriod } from '../../src/services/absenceService';
import { formatTimeRange } from '../../src/utils/time';
import { AbsenceListItem } from '../../src/components/common/AbsenceListItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { GlassCard } from '../../src/components/ui/GlassCard';

export default function PeriodDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const periodId = Array.isArray(id) ? id[0] : id || '';

  const { periods, currentPeriod, refresh: refreshSchedule } = useSchedule();
  const { absentTeachers, isLoading, error, refresh: refreshAbsences } = useAbsences();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSchedule(), refreshAbsences()]);
    setRefreshing(false);
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
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
          <Text style={styles.backButtonText}>Today</Text>
        </TouchableOpacity>

        {isCurrentPeriod && (
          <View style={styles.nowBadge}>
            <Text style={styles.nowText}>In Progress</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        {/* Period Hero Header */}
        <View style={styles.heroHeader}>
          <Text style={styles.title}>{displayTitle}</Text>
          {periodInfo && (
            <Text style={styles.timeText}>
              {formatTimeRange(periodInfo.start, periodInfo.end)}
            </Text>
          )}
          <Text style={styles.dateText}>{todayString}</Text>
        </View>

        {/* Summary Card */}
        <GlassCard variant="elevated" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View
              style={[
                styles.summaryIconBox,
                periodAbsences.length > 0 ? styles.summaryIconBoxActive : styles.summaryIconBoxMuted,
              ]}
            >
              <Ionicons
                name={periodAbsences.length > 0 ? 'alert-circle' : 'checkmark-circle'}
                size={22}
                color={periodAbsences.length > 0 ? '#DC2626' : '#16A34A'}
              />
            </View>
            <View style={styles.summaryTextGroup}>
              <Text style={styles.summaryTitle}>
                {periodAbsences.length === 0
                  ? 'All Teachers Present'
                  : periodAbsences.length === 1
                  ? '1 Teacher Absent'
                  : `${periodAbsences.length} Teachers Absent`}
              </Text>
              <Text style={styles.summarySubtitle}>
                {periodAbsences.length === 0
                  ? 'No classes affected during this period'
                  : `Classes impacted during ${displayTitle}`}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Teachers List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Absent Teachers</Text>
          {periodAbsences.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{periodAbsences.length}</Text>
            </View>
          )}
        </View>

        {error ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="⚠️"
              title="Unable to load absences"
              subtitle="Could not retrieve database records. Pull down to retry."
            />
          </View>
        ) : periodAbsences.length > 0 ? (
          periodAbsences.map(teacher => (
            <AbsenceListItem key={teacher.id} teacher={teacher} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="🎉"
              title="No Absences"
              subtitle={`Every teacher is present for ${displayTitle} today.`}
            />
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    marginLeft: 2,
  },
  nowBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heroHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryIconBoxActive: {
    backgroundColor: '#FEF2F2',
  },
  summaryIconBoxMuted: {
    backgroundColor: '#F0FDF4',
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  summarySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: -0.2,
  },
  countPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyContainer: {
    paddingTop: 40,
  },
});
