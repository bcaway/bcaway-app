import { GITHUB_RAW_BASE, FALLBACK_FULL_DAY, FALLBACK_ABBREVIATED_DAY, FALLBACK_DELAYED_OPENING } from '../constants/schedule';
import { SchedulePeriod, DaySchedule } from '../types';
import { getCachedSchedules, setCachedSchedules } from './storage';
import { timeToSeconds } from '../utils/time';

export type ScheduleType = 'fullDays' | 'abbreviatedDays' | 'delayedOpeningDays';

interface ScheduleCache {
  periods: Record<ScheduleType, SchedulePeriod[]>;
  csvs: Record<ScheduleType | 'specialDays', string>;
  lastUpdated: number;
}

async function fetchWithFallback(urls: string[]): Promise<Response | null> {
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // try next candidate url
    }
  }
  return null;
}

export async function fetchScheduleJSON(type: ScheduleType): Promise<SchedulePeriod[]> {
  try {
    const candidateUrls = [
      `${GITHUB_RAW_BASE}/schedules/${type}.json`,
      `https://raw.githubusercontent.com/bcaway/school-schedules/refs/heads/main/src/data/schedules/${type}.json`,
    ];
    const response = await fetchWithFallback(candidateUrls);
    if (!response) throw new Error(`Failed to fetch ${type}.json from GitHub`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type}.json:`, error);
    if (type === 'fullDays') return FALLBACK_FULL_DAY;
    if (type === 'abbreviatedDays') return FALLBACK_ABBREVIATED_DAY;
    return FALLBACK_DELAYED_OPENING;
  }
}

export async function fetchCalendarCSV(type: string): Promise<string> {
  try {
    const candidateUrls = [
      `${GITHUB_RAW_BASE}/csv/${type}.csv`,
      `https://raw.githubusercontent.com/bcaway/school-schedules/refs/heads/main/src/data/csv/${type}.csv`,
    ];
    const response = await fetchWithFallback(candidateUrls);
    if (!response) throw new Error(`Failed to fetch ${type}.csv from GitHub`);
    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${type}.csv:`, error);
    return '';
  }
}

export async function loadAllScheduleData(forceRefresh: boolean = false): Promise<ScheduleCache> {
  if (!forceRefresh) {
    const cached = await getCachedSchedules();
    if (cached && Date.now() - cached.lastUpdated < 6 * 60 * 60 * 1000) {
      return cached;
    }
  }

  const periods: Record<ScheduleType, SchedulePeriod[]> = {
    fullDays: FALLBACK_FULL_DAY,
    abbreviatedDays: FALLBACK_ABBREVIATED_DAY,
    delayedOpeningDays: FALLBACK_DELAYED_OPENING,
  };

  const csvs: Record<ScheduleType | 'specialDays', string> = {
    fullDays: '',
    abbreviatedDays: '',
    delayedOpeningDays: '',
    specialDays: '',
  };

  try {
    const [fullP, abbrP, delayP, fullC, abbrC, delayC, specC] = await Promise.all([
      fetchScheduleJSON('fullDays'),
      fetchScheduleJSON('abbreviatedDays'),
      fetchScheduleJSON('delayedOpeningDays'),
      fetchCalendarCSV('fullDays'),
      fetchCalendarCSV('abbreviatedDays'),
      fetchCalendarCSV('delayedOpeningDays'),
      fetchCalendarCSV('specialDays'),
    ]);

    periods.fullDays = fullP;
    periods.abbreviatedDays = abbrP;
    periods.delayedOpeningDays = delayP;
    csvs.fullDays = fullC;
    csvs.abbreviatedDays = abbrC;
    csvs.delayedOpeningDays = delayC;
    csvs.specialDays = specC;

    const cacheData: ScheduleCache = { periods, csvs, lastUpdated: Date.now() };
    await setCachedSchedules(cacheData);
    return cacheData;
  } catch (error) {
    console.error('Error loading schedule data, using fallbacks:', error);
    return { periods, csvs, lastUpdated: Date.now() };
  }
}

/**
 * Parse BCA CSV format: each line is `month,"[day1, day2, ...]"` 
 * Returns a Map of month -> Set of days
 */
function parseMonthDayCsv(csvText: string): Map<number, Set<number>> {
  const map = new Map<number, Set<number>>();
  if (!csvText) return map;

  const lines = csvText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('month') || trimmed.startsWith('date')) continue;

    const commaIndex = trimmed.indexOf(',');
    if (commaIndex === -1) continue;

    const monthStr = trimmed.substring(0, commaIndex).trim();
    const month = parseInt(monthStr, 10);
    if (isNaN(month)) continue;

    let dayStr = trimmed.substring(commaIndex + 1).trim();
    // Remove surrounding quotes and brackets
    if (dayStr.startsWith('"') && dayStr.endsWith('"')) {
      dayStr = dayStr.slice(1, -1).trim();
    }
    if (dayStr.startsWith('[') && dayStr.endsWith(']')) {
      dayStr = dayStr.slice(1, -1).trim();
    }

    const days = dayStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (!map.has(month)) {
      map.set(month, new Set<number>());
    }
    const set = map.get(month)!;
    days.forEach(d => set.add(d));
  }

  return map;
}

/**
 * Parse special days CSV: each line is `date,scheduleType`
 * where date is in MM-DD-YYYY format
 */
function parseSpecialDaysCsv(csvText: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!csvText) return map;

  const lines = csvText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('date')) continue;

    const parts = trimmed.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      map.set(parts[0], parts[1]);
    }
  }

  return map;
}

export async function getScheduleForDate(date: Date, forceRefresh: boolean = false): Promise<DaySchedule> {
  const cache = await loadAllScheduleData(forceRefresh);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 1. Check special days first
  const specialDays = parseSpecialDaysCsv(cache.csvs.specialDays);
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${mm}-${dd}-${year}`;
  
  if (specialDays.has(formattedDate)) {
    const schedType = specialDays.get(formattedDate)!;
    if (schedType === 'noSchool') {
      return { hasSchool: false, scheduleType: null, periods: [] };
    }
    const typeKey = schedType as ScheduleType;
    if (cache.periods[typeKey]) {
      return { hasSchool: true, scheduleType: typeKey, periods: cache.periods[typeKey] };
    }
  }

  // 2. Check abbreviated days
  const abbreviatedMap = parseMonthDayCsv(cache.csvs.abbreviatedDays);
  if (abbreviatedMap.get(month)?.has(day)) {
    return { hasSchool: true, scheduleType: 'abbreviatedDays', periods: cache.periods.abbreviatedDays };
  }

  // 3. Check delayed opening days
  const delayedMap = parseMonthDayCsv(cache.csvs.delayedOpeningDays);
  if (delayedMap.get(month)?.has(day)) {
    return { hasSchool: true, scheduleType: 'delayedOpeningDays', periods: cache.periods.delayedOpeningDays };
  }

  // 4. Check full days explicitly from fullDays.csv
  const fullDaysMap = parseMonthDayCsv(cache.csvs.fullDays);
  if (fullDaysMap.get(month)?.has(day)) {
    return { hasSchool: true, scheduleType: 'fullDays', periods: cache.periods.fullDays };
  }

  // 5. If not listed in ANY of the schedule CSVs:
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  if (isWeekend) {
    return { hasSchool: false, scheduleType: null, periods: [] };
  }

  // 6. Default fallback for standard school weekdays
  return { hasSchool: true, scheduleType: 'fullDays', periods: cache.periods.fullDays };
}

export function getCurrentPeriodInfo(schedule: SchedulePeriod[], currentTimeStr: string) {
  if (!schedule || schedule.length === 0) return { currentPeriod: null, nextPeriod: null };

  const currentSec = timeToSeconds(currentTimeStr);
  let currentPeriod: SchedulePeriod | null = null;
  let nextPeriod: SchedulePeriod | null = null;

  for (let i = 0; i < schedule.length; i++) {
    const period = schedule[i];
    const startSec = timeToSeconds(period.start);
    const endSec = timeToSeconds(period.end);

    if (currentSec >= startSec && currentSec <= endSec) {
      currentPeriod = period;
      nextPeriod = i + 1 < schedule.length ? schedule[i + 1] : null;
      break;
    } else if (currentSec < startSec) {
      nextPeriod = period;
      break;
    }
  }

  return { currentPeriod, nextPeriod };
}
