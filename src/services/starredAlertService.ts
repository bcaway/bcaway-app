import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TeacherAbsence } from '../types';
import { formatPeriodsImpacted } from './absenceService';

const NOTIFIED_ABSENCES_KEY = '@bcaway_notified_starred_absences';

/**
 * Checks if any newly synced absences impact the user's starred teachers.
 * If so, triggers an immediate high-priority local push notification on the device.
 */
export async function checkAndNotifyStarredAbsences(
  starredAbsences: TeacherAbsence[],
  isInitialLaunch: boolean = false
): Promise<void> {
  if (Platform.OS === 'web' || starredAbsences.length === 0) {
    return;
  }

  try {
    const raw = await AsyncStorage.getItem(NOTIFIED_ABSENCES_KEY);
    let notifiedSet = new Set<string>();

    if (raw) {
      try {
        const parsed: string[] = JSON.parse(raw);
        notifiedSet = new Set(parsed);
      } catch {
        notifiedSet = new Set();
      }
    }

    // Clean up old keys from previous days
    const todayStr = new Date().toISOString().slice(0, 10);
    for (const key of Array.from(notifiedSet)) {
      if (!key.startsWith(todayStr)) {
        notifiedSet.delete(key);
      }
    }

    let newlyNotified = false;

    for (const absence of starredAbsences) {
      const absenceKey = `${absence.date || todayStr}_${absence.teacher}_${absence.periodsImpacted}`;

      if (!notifiedSet.has(absenceKey)) {
        notifiedSet.add(absenceKey);
        newlyNotified = true;

        // Skip sending push alerts on the very first fresh install launch to prevent notification spam
        if (!isInitialLaunch) {
          const periodsText = formatPeriodsImpacted(absence.periodsImpacted);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Teacher Absence: ${absence.teacher}`,
              body: `${absence.teacher} is absent (${periodsText}). You have a free period!`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
          }).catch(err => {
            console.warn('[StarredAlerts] Error scheduling notification:', err);
          });
        }
      }
    }

    if (newlyNotified) {
      await AsyncStorage.setItem(
        NOTIFIED_ABSENCES_KEY,
        JSON.stringify(Array.from(notifiedSet))
      );
    }
  } catch (err) {
    console.warn('[StarredAlerts] Error checking starred absence alerts:', err);
  }
}
