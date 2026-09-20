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

export interface AbsentTeacher {
  id: string;
  name: string;
  department?: string;
}

export interface PeriodWithStatus {
  period: SchedulePeriod;
  isCurrentPeriod: boolean;
  isPast: boolean;
  absentTeacher: AbsentTeacher | null;
}
