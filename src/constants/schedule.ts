import { SchedulePeriod } from '../types';

export const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/bcaway/school-schedules/refs/heads/main/data';

export const FALLBACK_FULL_DAY: SchedulePeriod[] = [
  { period: '1', start: '08:00:00', end: '08:43:00' },
  { period: 'IGS', start: '08:47:00', end: '09:30:00' },
  { period: '2', start: '09:34:00', end: '10:17:00' },
  { period: '3', start: '10:21:00', end: '11:04:00' },
  { period: '4', start: '11:08:00', end: '11:51:00' },
  { period: '5', start: '11:55:00', end: '12:38:00' },
  { period: '6', start: '12:42:00', end: '13:25:00' },
  { period: '7', start: '13:29:00', end: '14:12:00' },
  { period: '8', start: '14:16:00', end: '14:59:00' },
  { period: '9', start: '15:03:00', end: '15:46:00' }
];

export const FALLBACK_ABBREVIATED_DAY: SchedulePeriod[] = [
  { period: '1', start: '08:00:00', end: '08:26:00' },
  { period: 'IGS', start: '08:30:00', end: '08:56:00' },
  { period: '2', start: '09:00:00', end: '09:26:00' },
  { period: '3', start: '09:30:00', end: '09:56:00' },
  { period: '4', start: '10:00:00', end: '10:26:00' },
  { period: '5', start: '10:30:00', end: '10:56:00' },
  { period: '6', start: '11:00:00', end: '11:26:00' },
  { period: '7', start: '11:30:00', end: '11:56:00' },
  { period: '8', start: '12:00:00', end: '12:26:00' },
  { period: '9', start: '12:30:00', end: '12:56:00' }
];

export const FALLBACK_DELAYED_OPENING: SchedulePeriod[] = [
  { period: '1', start: '10:00:00', end: '10:29:00' },
  { period: 'IGS', start: '10:33:00', end: '11:02:00' },
  { period: '2', start: '11:06:00', end: '11:35:00' },
  { period: '3', start: '11:39:00', end: '12:08:00' },
  { period: '4', start: '12:12:00', end: '12:41:00' },
  { period: '5', start: '12:45:00', end: '13:14:00' },
  { period: '6', start: '13:18:00', end: '13:47:00' },
  { period: '7', start: '13:51:00', end: '14:20:00' },
  { period: '8', start: '14:24:00', end: '14:53:00' },
  { period: '9', start: '14:57:00', end: '15:26:00' }
];
