import { GITHUB_RAW_BASE } from '../constants/schedule';
import { SchedulePeriod, DaySchedule } from '../types';
import { getCachedSchedules, setCachedSchedules } from './storage';
import { timeToSeconds } from '../utils/time';

export type ScheduleType = 'fullDays' | 'abbreviatedDays' | 'delayedOpeningDays';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh cache TTL

interface ScheduleCache {
  periods: Record<ScheduleType, SchedulePeriod[]>;
  csvs: Record<ScheduleType | 'specialDays', string>;
  lastUpdated: number;
}

/**
 * Normalizes period time strings like "9:56:00" or "9:56" to "09:56:00"
 */
function normalizePeriodTime(timeStr: string): string {
  if (!timeStr) return '00:00:00';
  const parts = timeStr.trim().split(':');
  const hh = parts[0].padStart(2, '0');
  const mm = (parts[1] || '00').padStart(2, '0');
  const ss = (parts[2] || '00').padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * Generates candidate URLs for GitHub raw data with CDN fallbacks and optional cache buster
 */
function getCandidateUrls(relPath: string, forceRefresh: boolean = false): string[] {
  const cacheBuster = forceRefresh ? `?_t=${Date.now()}` : '';
  return [
    `https://raw.githubusercontent.com/bcaway/school-schedules/main/data/${relPath}${cacheBuster}`,
    `https://raw.githubusercontent.com/bcaway/school-schedules/refs/heads/main/data/${relPath}${cacheBuster}`,
    `https://cdn.jsdelivr.net/gh/bcaway/school-schedules@main/data/${relPath}${cacheBuster}`,
  ];
}

async function fetchWithFallback(urls: string[]): Promise<Response | null> {
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) return response;
    } catch {
      // try next candidate url
    }
  }
  return null;
}

export async function fetchScheduleJSON(type: ScheduleType, forceRefresh: boolean = false): Promise<SchedulePeriod[]> {
  const candidateUrls = getCandidateUrls(`schedules/${type}.json`, forceRefresh);
  const response = await fetchWithFallback(candidateUrls);
  if (!response) {
    throw new Error(`Failed to fetch ${type}.json from GitHub`);
  }
  const rawData = await response.json();
  if (Array.isArray(rawData)) {
    return rawData.map(item => ({
      period: String(item.period),
      start: normalizePeriodTime(item.start),
      end: normalizePeriodTime(item.end),
    }));
  }
  throw new Error(`Invalid schedule array returned for ${type} from GitHub`);
}

export async function fetchCalendarCSV(type: string, forceRefresh: boolean = false): Promise<string> {
  const candidateUrls = getCandidateUrls(`csv/${type}.csv`, forceRefresh);
  const response = await fetchWithFallback(candidateUrls);
  if (!response) {
    throw new Error(`Failed to fetch ${type}.csv from GitHub`);
  }
  return await response.text();
}

export async function loadAllScheduleData(forceRefresh: boolean = false): Promise<ScheduleCache> {
  const cached = await getCachedSchedules();

  if (!forceRefresh && cached && cached.lastUpdated) {
    if (Date.now() - cached.lastUpdated < CACHE_TTL_MS) {
      return cached;
    }
  }

  try {
    const [fullP, abbrP, delayP, fullC, abbrC, delayC, specC] = await Promise.all([
      fetchScheduleJSON('fullDays', forceRefresh),
      fetchScheduleJSON('abbreviatedDays', forceRefresh),
      fetchScheduleJSON('delayedOpeningDays', forceRefresh),
      fetchCalendarCSV('fullDays', forceRefresh),
      fetchCalendarCSV('abbreviatedDays', forceRefresh),
      fetchCalendarCSV('delayedOpeningDays', forceRefresh),
      fetchCalendarCSV('specialDays', forceRefresh),
    ]);

    const periods: Record<ScheduleType, SchedulePeriod[]> = {
      fullDays: fullP,
      abbreviatedDays: abbrP,
      delayedOpeningDays: delayP,
    };

    const csvs: Record<ScheduleType | 'specialDays', string> = {
      fullDays: fullC,
      abbreviatedDays: abbrC,
      delayedOpeningDays: delayC,
      specialDays: specC,
    };

    const cacheData: ScheduleCache = { periods, csvs, lastUpdated: Date.now() };
    await setCachedSchedules(cacheData);
    return cacheData;
  } catch (error) {
    console.error('Error loading schedule data from GitHub:', error);
    // If previously saved GitHub cache exists, reuse it on network failure
    if (cached) return cached;
    throw error;
  }
}

/**
 * Parse BCA CSV format: each line is `month,"[day1, day2, ...]"` 
 * Returns a Map of month -> Set of days
 */
export function parseMonthDayCsv(csvText: string): Map<number, Set<number>> {
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
 * Normalizes date string variations to canonical lookup keys
 */
function normalizeDateKeys(rawStr: string): string[] {
  const cleaned = rawStr.trim();
  const mdy = cleaned.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (mdy) {
    const m = parseInt(mdy[1], 10);
    const d = parseInt(mdy[2], 10);
    const y = parseInt(mdy[3], 10);
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return [`${y}-${mm}-${dd}`, `${mm}-${dd}-${y}`, `${m}-${d}-${y}`];
  }
  const ymd = cleaned.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10);
    const d = parseInt(ymd[3], 10);
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return [`${y}-${mm}-${dd}`, `${mm}-${dd}-${y}`, `${m}-${d}-${y}`];
  }
  return [cleaned];
}

/**
 * Parse special days CSV: each line is `date,scheduleType`
 */
export function parseSpecialDaysCsv(csvText: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!csvText) return map;

  const lines = csvText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('date')) continue;

    const parts = trimmed.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      const dateStr = parts[0];
      const schedType = parts[1];
      const keys = normalizeDateKeys(dateStr);
      for (const k of keys) {
        map.set(k, schedType);
      }
    }
  }

  return map;
}

const NO_SCHOOL_VALUES = new Set(['noschool', 'no_school', 'none', 'closed', 'holiday', 'off', 'false']);

export async function getScheduleForDate(date: Date, forceRefresh: boolean = false): Promise<DaySchedule> {
  const cache = await loadAllScheduleData(forceRefresh);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const lookupKeys = [`${year}-${mm}-${dd}`, `${mm}-${dd}-${year}`, `${month}-${day}-${year}`];

  // 1. Check special days first
  const specialDays = parseSpecialDaysCsv(cache.csvs.specialDays);
  for (const key of lookupKeys) {
    if (specialDays.has(key)) {
      const schedType = specialDays.get(key)!;
      const lowerType = schedType.toLowerCase();

      if (NO_SCHOOL_VALUES.has(lowerType)) {
        return { hasSchool: false, scheduleType: null, periods: [] };
      }

      const typeKey = schedType as ScheduleType;
      if (cache.periods[typeKey]) {
        return { hasSchool: true, scheduleType: typeKey, periods: cache.periods[typeKey] };
      }
    }
  }

  // 2. Check abbreviated days
  const abbreviatedMap = parseMonthDayCsv(cache.csvs.abbreviatedDays);
  if (abbreviatedMap.get(month)?.has(day)) {
    return { hasSchool: true, scheduleType: 'abbreviatedDays', periods: cache.periods.abbreviatedDays || [] };
  }

  // 3. Check delayed opening days
  const delayedMap = parseMonthDayCsv(cache.csvs.delayedOpeningDays);
  if (delayedMap.get(month)?.has(day)) {
    return { hasSchool: true, scheduleType: 'delayedOpeningDays', periods: cache.periods.delayedOpeningDays || [] };
  }

  // 4. Check full days explicitly from fullDays.csv
  const fullDaysMap = parseMonthDayCsv(cache.csvs.fullDays);
  if (fullDaysMap.get(month)?.has(day)) {
    return { hasSchool: true, scheduleType: 'fullDays', periods: cache.periods.fullDays || [] };
  }

  // 5. If not listed in ANY GitHub calendar CSV, there is NO school
  return { hasSchool: false, scheduleType: null, periods: [] };
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
