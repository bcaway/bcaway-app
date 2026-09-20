import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import { SchedulePeriod, AbsentTeacher } from '../../types';
import { formatTimeRange } from '../../utils/time';

interface PeriodCardProps {
  period: SchedulePeriod;
  isCurrentPeriod: boolean;
  isPast: boolean;
  absentTeacher: AbsentTeacher | null;
  onPress?: () => void;
}

export function PeriodCard({ period, isCurrentPeriod, isPast, absentTeacher, onPress }: PeriodCardProps) {
  const isAbsent = absentTeacher !== null;

  return (
    <Pressable 
      onPress={onPress} 
      disabled={!onPress}
      style={({ pressed }) => [
        styles.pressable,
        isPast && styles.pastPeriod,
        pressed && styles.pressed,
      ]}
    >
      <GlassCard 
        variant={isCurrentPeriod ? 'elevated' : 'default'} 
        style={[
          styles.card,
          isCurrentPeriod && styles.currentBg,
          isAbsent && styles.absentBg,
        ]}
      >
        <View style={[
          styles.leftBorder,
          isCurrentPeriod && styles.borderCurrent,
          isAbsent && !isCurrentPeriod && styles.borderAbsent,
        ]} />
        
        <View style={styles.content}>
          <View style={[
            styles.periodBadge,
            isCurrentPeriod && styles.periodBadgeCurrent,
            isAbsent && !isCurrentPeriod && styles.periodBadgeAbsent,
          ]}>
            <Text style={[
              styles.periodText,
              isCurrentPeriod && styles.periodTextCurrent,
            ]}>{period.period}</Text>
          </View>
          
          <View style={styles.middle}>
            <Text style={styles.timeText}>
              {formatTimeRange(period.start, period.end)}
            </Text>
            {isAbsent && (
              <Text style={styles.teacherText}>{absentTeacher.name}</Text>
            )}
          </View>
          
          <View style={styles.right}>
            {isAbsent && <StatusBadge status="away" size="sm" />}
            {isCurrentPeriod && !isAbsent && (
              <View style={styles.nowBadge}>
                <Text style={styles.nowText}>Now</Text>
              </View>
            )}
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginVertical: 5,
  },
  pastPeriod: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    flexDirection: 'row',
  },
  currentBg: {
    backgroundColor: '#F0F4FF',
  },
  absentBg: {
    backgroundColor: '#FFFBFB',
  },
  leftBorder: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  borderCurrent: {
    backgroundColor: '#2563EB',
  },
  borderAbsent: {
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  periodBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  periodBadgeCurrent: {
    backgroundColor: '#2563EB',
  },
  periodBadgeAbsent: {
    backgroundColor: '#FEF2F2',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  periodTextCurrent: {
    color: '#FFFFFF',
  },
  middle: {
    flex: 1,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  teacherText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 2,
    fontWeight: '500',
  },
  right: {
    marginLeft: 8,
  },
  nowBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nowText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
});
