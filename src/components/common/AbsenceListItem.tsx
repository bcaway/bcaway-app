import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AbsentTeacher } from '../../types';

interface AbsenceListItemProps {
  teacher: AbsentTeacher;
}

export function AbsenceListItem({ teacher }: AbsenceListItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.leftBorder} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👤</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{teacher.name}</Text>
          {teacher.department && (
            <View style={styles.deptBadge}>
              <Text style={styles.deptText}>{teacher.department}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  leftBorder: {
    width: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  deptBadge: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deptText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
