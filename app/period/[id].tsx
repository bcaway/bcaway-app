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
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A86E8" />}
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


        {/* Teachers List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Absent Teachers</Text>
          {periodAbsences.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{periodAbsences.length}</Text>
            </View>
          )}
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <BCAwayLoading />
          </View>
        ) : error ? (
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
    color: '#4A86E8',
    fontWeight: '600',
    marginLeft: 2,
  },
  nowBadge: {
    backgroundColor: '#EEF4FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A86E8',
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
    color: '#4A86E8',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
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
    backgroundColor: '#EEF4FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A86E8',
  },
  emptyContainer: {
    paddingTop: 40,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
