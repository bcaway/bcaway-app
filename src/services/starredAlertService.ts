import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TeacherAbsence } from '../types';
import { formatPeriodsImpacted } from './absenceService';

const ABSENCES_SNAPSHOT_KEY = '@bcaway_starred_absences_snapshot';

interface StoredSnapshot {
  date: string;
  absences: Record<string, string>; // teacher (lowercase) -> { teacher: string, periods: string }
}

/**
 * Checks if any newly synced absences impact the user's starred teachers.
 * Detects:
 * - Inserted: Teacher absent for the first time that day -> "_ is absent today: {Absence Data}."
 * - Updated: Teacher periods changed -> "_'s absences updated: {Absence Data}"
 * - Removed: Teacher is no longer absent -> "_ is no longer absent today"
 *
 * Title is always: "Teacher Absence: {Teacher}"
 */
export async function checkAndNotifyStarredAbsences(
  starredAbsences: TeacherAbsence[],
  isInitialLaunch: boolean = false
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const raw = await AsyncStorage.getItem(ABSENCES_SNAPSHOT_KEY);
    let previousSnapshot: StoredSnapshot = { date: todayStr, absences: {} };

    if (raw) {
      try {
        const parsed: StoredSnapshot = JSON.parse(raw);
        if (parsed.date === todayStr && typeof parsed.absences === 'object') {
          previousSnapshot = parsed;
        }
      } catch {
        previousSnapshot = { date: todayStr, absences: {} };
      }
    }

    const prevMap = previousSnapshot.absences;
    const currentMap: Record<string, { teacher: string; periods: string }> = {};

    for (const item of starredAbsences) {
      const key = item.teacher.trim().toLowerCase();
      currentMap[key] = {
        teacher: item.teacher.trim(),
        periods: item.periodsImpacted || '',
      };
    }

    // Skip notifications on initial app cold start
    if (isInitialLaunch) {
      const initialSnapshot: StoredSnapshot = {
        date: todayStr,
        absences: Object.fromEntries(
          Object.entries(currentMap).map(([k, v]) => [k, v.periods])
        ),
      };
      await AsyncStorage.setItem(ABSENCES_SNAPSHOT_KEY, JSON.stringify(initialSnapshot));
      return;
    }

    const notificationsToSend: Array<{ title: string; body: string }> = [];

    // 1. Check for newly inserted or updated teachers
    for (const [key, current] of Object.entries(currentMap)) {
      const prevPeriods = prevMap[key];
      const absenceData = formatPeriodsImpacted(current.periods);

      if (prevPeriods === undefined) {
        // Inserted for the first time today
        notificationsToSend.push({
          title: `Teacher Absence: ${current.teacher}`,
          body: `${current.teacher} is absent today: ${absenceData}.`,
        });
      } else if (prevPeriods !== current.periods) {
        // Periods updated
        notificationsToSend.push({
          title: `Teacher Absence: ${current.teacher}`,
          body: `${current.teacher}'s absences updated: ${absenceData}`,
        });
      }
    }

    // 2. Check for removed teachers (was absent earlier today, now removed)
    for (const [prevKey, prevPeriods] of Object.entries(prevMap)) {
      if (!(prevKey in currentMap)) {
        // Find teacher display name
        const teacherName = prevKey.charAt(0).toUpperCase() + prevKey.slice(1);
        notificationsToSend.push({
          title: `Teacher Absence: ${teacherName}`,
          body: `${teacherName} is no longer absent today`,
        });
      }
    }

    // Schedule notifications on device
    for (const notif of notificationsToSend) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notif.title,
          body: notif.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      }).catch(err => {
        console.warn('[StarredAlerts] Error scheduling notification:', err);
      });
    }

    // Save current state
    const newSnapshot: StoredSnapshot = {
      date: todayStr,
      absences: Object.fromEntries(
        Object.entries(currentMap).map(([k, v]) => [k, v.periods])
      ),
    };
    await AsyncStorage.setItem(ABSENCES_SNAPSHOT_KEY, JSON.stringify(newSnapshot));
  } catch (err) {
    console.warn('[StarredAlerts] Error checking starred absence alerts:', err);
  }
}
