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
  name: string;     // e.g. "Bian", "Gallo", "Majeski"
  duration: string; // e.g. "All Day", "Periods 1-4", "Periods 5-9"
}

export interface PeriodWithStatus {
  period: SchedulePeriod;
  isCurrentPeriod: boolean;
  isPast: boolean;
  absentTeacher: AbsentTeacher | null;
}
