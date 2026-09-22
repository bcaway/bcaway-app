import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TeacherAbsence } from '../../types';
import { formatPeriodsImpacted } from '../../services/absenceService';

interface AbsenceListItemProps {
  teacher: TeacherAbsence;
  showDivider?: boolean;
}

export function AbsenceListItem({ teacher, showDivider = true }: AbsenceListItemProps) {
  const formattedPeriods = formatPeriodsImpacted(teacher.periodsImpacted);
  const isAllDay = formattedPeriods.toLowerCase() === 'all day';

  return (
    <View style={[styles.row, showDivider && styles.divider]}>
      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {teacher.teacher}
        </Text>
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
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  left: {
    flex: 1,
    paddingRight: 12,
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
