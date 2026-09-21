import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TeacherAbsence } from '../../types';
import { formatPeriodsImpacted } from '../../services/absenceService';

interface AbsenceListItemProps {
  teacher: TeacherAbsence;
}

export function AbsenceListItem({ teacher }: AbsenceListItemProps) {
  const formattedPeriods = formatPeriodsImpacted(teacher.periodsImpacted);

  return (
    <View style={styles.card}>
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {teacher.teacher}
      </Text>
      <View style={styles.durationBadge}>
        <Text style={styles.durationText} numberOfLines={1} ellipsizeMode="tail">
          {formattedPeriods}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginVertical: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.2,
    flexShrink: 1,
    marginRight: 12,
  },
  durationBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
    maxWidth: '60%',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
});
