import { supabase } from './supabase';
import { TeacherAbsence } from '../types';

interface SupabaseTeacherAbsenceRow {
  id: string;
  date: string;
  synced_at: string;
  teacher: string;
  periods_impacted: string;
}

/**
 * Formats periods impacted for display in the UI.
 * e.g. "All Day" for full days, or "Periods: 1, 2, 3"
 */
export function formatPeriodsImpacted(periodsImpacted?: string): string {
  if (!periodsImpacted) return 'All Day';
  const trimmed = periodsImpacted.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'all day' || trimmed === 'igs, 1, 2, 3, 4, 5, 6, 7, 8, 9') {
    return 'All Day';
  }
  if (lower.startsWith('period')) {
    return trimmed;
  }
  return `Periods: ${trimmed}`;
}

/**
 * Checks whether a teacher's absence includes the specified period.
 * e.g. periodName = '1', 'IGS', '2', etc.
 */
export function isTeacherAbsentInPeriod(periodsImpacted: string, periodName: string): boolean {
  if (!periodsImpacted || !periodName) return false;
  const p = periodName.trim().toLowerCase();
  const lower = periodsImpacted.trim().toLowerCase();

  // "all" or "all day" covers every period
  if (lower === 'all' || lower === 'all day') {
    return true;
  }

  const tokens = lower.split(',').map(s => s.trim());
  return tokens.includes(p);
}

/**
 * Filters a list of absences to only those that impact the given period.
 */
export function getAbsentTeachersForPeriod(
  absences: TeacherAbsence[],
  periodName: string
): TeacherAbsence[] {
  return absences.filter(absence => isTeacherAbsentInPeriod(absence.periodsImpacted, periodName));
}

/**
 * Queries teacher absences directly from the Supabase `teacher_absences` table.
 * Rows in this table are guaranteed to be for today (maintained by backend sync).
 * Ordered by teacher ascending.
 */
export async function getTeacherAbsences(): Promise<TeacherAbsence[]> {
  const { data, error } = await supabase
    .from('teacher_absences')
    .select('id, date, synced_at, teacher, periods_impacted')
    .order('teacher', { ascending: true });

  if (error) {
    console.error('Error fetching teacher absences from Supabase:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  return (data as SupabaseTeacherAbsenceRow[]).map(row => ({
    id: row.id,
    date: row.date,
    syncedAt: row.synced_at,
    teacher: row.teacher,
    periodsImpacted: row.periods_impacted,
  }));
}
