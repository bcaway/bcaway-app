export interface SchedulePeriod {
  period: string;
  start: string; // HH:MM:SS
  end: string;   // HH:MM:SS
}

export interface DaySchedule {
  hasSchool: boolean;
  scheduleType: 'fullDays' | 'abbreviatedDays' | 'delayedOpeningDays' | null;
  periods: SchedulePeriod[];
}

export interface TeacherAbsence {
  id: string;
  date: string;
  syncedAt: string;
  teacher: string;
  periodsImpacted: string;
}

export type AbsentTeacher = TeacherAbsence;

export interface PeriodWithStatus {
  period: SchedulePeriod;
  isCurrentPeriod: boolean;
  isPast: boolean;
  absentCount?: number;
}

