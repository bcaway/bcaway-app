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
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Calculates the exact number of calendar days from today until Halloween (October 31).
 * Accurately normalizes dates to local midnight so it updates precisely day-by-day.
 * Returns 0 on October 31 (Halloween day).
 */
export function getDaysUntilHalloween(referenceDate: Date = new Date()): number {
  const currentYear = referenceDate.getFullYear();
  // Local midnight of today
  const todayMidnight = new Date(
    currentYear,
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0, 0, 0, 0
  );
  // Local midnight of October 31 of this year
  let halloween = new Date(currentYear, 9, 31, 0, 0, 0, 0);

  // If today is past October 31 of the current year, target next year's Halloween
  if (todayMidnight.getTime() > halloween.getTime()) {
    halloween = new Date(currentYear + 1, 9, 31, 0, 0, 0, 0);
  }

  const diffMs = halloween.getTime() - todayMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
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
