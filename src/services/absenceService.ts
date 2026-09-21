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
 * Expands period strings into a Set of period tokens (e.g. '1-3, 5, igs' -> '1', '2', '3', '5', 'igs').
 */
export function expandPeriods(periodsImpacted?: string): Set<string> {
  const result = new Set<string>();
  if (!periodsImpacted) {
    ['igs', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(p => result.add(p));
    return result;
  }

  const lower = periodsImpacted.trim().toLowerCase();
  if (lower === 'all' || lower === 'all day') {
    ['igs', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(p => result.add(p));
    return result;
  }

  // Strip leading "periods:" or "period:"
  const cleaned = lower.replace(/^periods?:?\s*/i, '');
  const rawTokens = cleaned.split(',').map(s => s.trim()).filter(Boolean);

  for (const token of rawTokens) {
    if (token === 'all' || token === 'all day') {
      ['igs', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(p => result.add(p));
      return result;
    }
    if (token === 'igs') {
      result.add('igs');
      continue;
    }
    // Check range: e.g. "1-3" or "7 - 8"
    const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let i = min; i <= max; i++) {
          result.add(String(i));
        }
      }
      continue;
    }
    // Single numerical period
    if (/^\d+$/.test(token)) {
      result.add(token);
    }
  }

  return result;
}

/**
 * Formats periods impacted for display in the UI.
 * e.g. "All Day" for full days, or "Periods: 1, 2, 3"
 */
export function formatPeriodsImpacted(periodsImpacted?: string): string {
  if (!periodsImpacted) return 'All Day';
  const trimmed = periodsImpacted.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'all' || lower === 'all day') {
    return 'All Day';
  }
  const expanded = expandPeriods(periodsImpacted);
  if (expanded.size >= 10) {
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
  if (!periodName) return false;
  const p = periodName.trim().toLowerCase();
  const expanded = expandPeriods(periodsImpacted);
  return expanded.has(p);
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

let cachedAbsences: { data: TeacherAbsence[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Queries teacher absences directly from the Supabase `teacher_absences` table.
 * Rows in this table are guaranteed to be for today (maintained by backend sync).
 * Ordered by teacher ascending. Uses in-memory cache with 1-minute TTL.
 */
export async function getTeacherAbsences(forceRefresh: boolean = false): Promise<TeacherAbsence[]> {
  if (!forceRefresh && cachedAbsences && Date.now() - cachedAbsences.timestamp < CACHE_TTL_MS) {
    return cachedAbsences.data;
  }

  const { data, error } = await supabase
    .from('teacher_absences')
    .select('id, date, synced_at, teacher, periods_impacted')
    .order('teacher', { ascending: true });

  if (error) {
    console.error('Error fetching teacher absences from Supabase:', error);
    if (cachedAbsences) return cachedAbsences.data;
    throw error;
  }

  const absences = (!data || data.length === 0)
    ? []
    : (data as SupabaseTeacherAbsenceRow[]).map(row => ({
        id: row.id,
        date: row.date,
        syncedAt: row.synced_at,
        teacher: row.teacher,
        periodsImpacted: row.periods_impacted,
      }));

  cachedAbsences = { data: absences, timestamp: Date.now() };
  return absences;
}
