import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TeacherAbsence } from '../../types';
import { formatPeriodsImpacted } from '../../services/absenceService';

interface AbsenceListItemProps {
  teacher: TeacherAbsence;
  showDivider?: boolean;
  isStarred?: boolean;
}

export function AbsenceListItem({
  teacher,
  showDivider = true,
  isStarred = false,
}: AbsenceListItemProps) {
  const formattedPeriods = formatPeriodsImpacted(teacher.periodsImpacted);
  const isAllDay = formattedPeriods.toLowerCase() === 'all day';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.nameRow}>
            {isStarred && (
              <Ionicons name="star" size={14} color="#F59E0B" style={styles.starIcon} />
            )}
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {teacher.teacher}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text
            style={[styles.periodsText, isAllDay ? styles.periodsAllDay : styles.periodsPartial]}
            numberOfLines={1}
          >
            {formattedPeriods}
          </Text>
        </View>
      </View>
      {showDivider && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 14 : 12,
    paddingHorizontal: 16,
    minHeight: Platform.OS === 'android' ? 48 : 44,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starIcon: {
    marginRight: -1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  right: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  periodsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  periodsAllDay: {
    color: '#DC2626',
  },
  periodsPartial: {
    color: '#64748B',
  },
});

