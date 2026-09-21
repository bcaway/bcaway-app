import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AbsentTeacher } from '../../types';

interface AbsenceListItemProps {
  teacher: AbsentTeacher;
}

export function AbsenceListItem({ teacher }: AbsenceListItemProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{teacher.name}</Text>
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{teacher.duration || 'All Day'}</Text>
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
  },
  durationBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
});
