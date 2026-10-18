import { SchedulePeriod } from '../types';

export function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatTime(time24: string): string {
  const [hoursStr, minutes] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 👋';
  if (hour < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

export function getCurrentTimeStr(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function isTimeBetween(current: string, start: string, end: string): boolean {
  const currentSec = timeToSeconds(current);
  const startSec = timeToSeconds(start);
  const endSec = timeToSeconds(end);
  return currentSec >= startSec && currentSec <= endSec;
}

export function getTimeRemainingInPeriod(endPeriodTime: string): string | null {
  if (!endPeriodTime) return null;
  const currentSec = timeToSeconds(getCurrentTimeStr());
  const endSec = timeToSeconds(endPeriodTime);
  const diffSec = endSec - currentSec;
  if (diffSec <= 0) return null;
  const mins = Math.ceil(diffSec / 60);
  if (mins <= 1) return '<1m left';
  return `${mins}m left`;
}

/**
 * Resolves the passing time / between-periods status message.
 * Returns e.g. "Period 2 starts in 4m", "IGS starts in 2m", or null if not in a passing/upcoming window.
 *
 * Rules:
 * - When in between periods (meaning there was a period before and there is a period next)
 * - Or within 10 minutes of the first period
 */
export function getPassingTimeStatus(
  periods: SchedulePeriod[],
  currentPeriod: SchedulePeriod | null,
  currentTimeStr?: string
): string | null {
  if (!periods || periods.length === 0 || currentPeriod) {
    return null;
  }

  const nowSec = timeToSeconds(currentTimeStr || getCurrentTimeStr());

  // Find the next upcoming period that hasn't started yet
  const nextPeriodIndex = periods.findIndex(p => nowSec < timeToSeconds(p.start));
  if (nextPeriodIndex === -1) {
    return null;
  }

  const nextP = periods[nextPeriodIndex];
  const nextStartSec = timeToSeconds(nextP.start);
  const diffSec = nextStartSec - nowSec;
  if (diffSec <= 0) {
    return null;
  }

  const isBeforeFirstPeriod = nextPeriodIndex === 0;
  const isBetweenPeriods = nextPeriodIndex > 0;

  // If before the first period, only show if within 10 minutes (600 seconds)
  if (isBeforeFirstPeriod && diffSec > 600) {
    return null;
  }

  if (!isBeforeFirstPeriod && !isBetweenPeriods) {
    return null;
  }

  // If between periods, verify previous period has actually finished
  if (isBetweenPeriods) {
    const prevP = periods[nextPeriodIndex - 1];
    const prevEndSec = timeToSeconds(prevP.end);
    if (nowSec < prevEndSec) {
      return null;
    }
  }

  const mins = Math.ceil(diffSec / 60);
  const timeStr = mins <= 1 ? '<1m' : `${mins}m`;
  const cleanPeriod = nextP.period.replace(/_+$/, '');
  const isIGS = cleanPeriod.toUpperCase() === 'IGS';
  const periodLabel = isIGS ? 'IGS' : `Period ${cleanPeriod}`;

  return `${periodLabel} starts in ${timeStr}`;
}
