import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SchedulePeriod, DaySchedule, TeacherAbsence } from '../types';
import { getScheduleForDate, getCurrentPeriodInfo } from '../services/scheduleService';
import { getTeacherAbsences, clearAbsenceCache } from '../services/absenceService';
import { getCurrentTimeStr } from '../utils/time';
import { useAuth } from './AuthContext';

export interface DataContextValue {
  // Schedule state
  schedule: DaySchedule | null;
  scheduleType: string | null;
  periods: SchedulePeriod[];
  currentPeriod: SchedulePeriod | null;
  nextPeriod: SchedulePeriod | null;
  scheduleLoading: boolean;
  scheduleError: Error | null;

  // Absences state
  absentTeachers: TeacherAbsence[];
  absencesLoading: boolean;
  absencesError: Error | null;

  // Readiness for initial app display
  isReady: boolean;

  // Global refetch: refetches all data across the app without toggling global loading spinners
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [scheduleType, setScheduleType] = useState<string | null>(null);
  const [periods, setPeriods] = useState<SchedulePeriod[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<SchedulePeriod | null>(null);
  const [nextPeriod, setNextPeriod] = useState<SchedulePeriod | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<Error | null>(null);

  const [absentTeachers, setAbsentTeachers] = useState<TeacherAbsence[]>([]);
  const [absencesLoading, setAbsencesLoading] = useState(true);
  const [absencesError, setAbsencesError] = useState<Error | null>(null);

  const [isReady, setIsReady] = useState(false);
  const inFlightRefresh = useRef<Promise<void> | null>(null);
  const lastFetchedDate = useRef<string>(new Date().toDateString());
  const lastFetchedTimestamp = useRef<number>(Date.now());

  // Global refetch that fetches schedule + absences with forceRefresh = true
  const refreshAll = useCallback(async (): Promise<void> => {
    if (inFlightRefresh.current) {
      return inFlightRefresh.current;
    }

    const task = (async () => {
      try {
        const today = new Date();
        const [schedResult, absResult] = await Promise.allSettled([
          getScheduleForDate(today, true),
          getTeacherAbsences(true),
        ]);

        if (schedResult.status === 'fulfilled') {
          const daySchedule = schedResult.value;
          setSchedule(daySchedule);
          setScheduleType(daySchedule.scheduleType);
          setPeriods(daySchedule.periods);

          const timeStr = getCurrentTimeStr();
          const periodInfo = getCurrentPeriodInfo(daySchedule.periods, timeStr);
          setCurrentPeriod(periodInfo.currentPeriod);
          setNextPeriod(periodInfo.nextPeriod);
          setScheduleError(null);
        } else {
          console.error('Error refreshing schedule:', schedResult.reason);
          setScheduleError(schedResult.reason instanceof Error ? schedResult.reason : new Error(String(schedResult.reason)));
        }

        if (absResult.status === 'fulfilled') {
          setAbsentTeachers(absResult.value);
          setAbsencesError(null);
        } else {
          console.error('Error refreshing absences:', absResult.reason);
          setAbsencesError(absResult.reason instanceof Error ? absResult.reason : new Error(String(absResult.reason)));
        }
        lastFetchedDate.current = new Date().toDateString();
        lastFetchedTimestamp.current = Date.now();
      } catch (err) {
        console.error('Unexpected error during refreshAll:', err);
      } finally {
        inFlightRefresh.current = null;
      }
    })();

    inFlightRefresh.current = task;
    return task;
  }, []);

  // Initial load on first app open
  useEffect(() => {
    async function initialLoad() {
      try {
        const today = new Date();
        await Promise.race([
          Promise.allSettled([
            getScheduleForDate(today, false).then(daySchedule => {
              setSchedule(daySchedule);
              setScheduleType(daySchedule.scheduleType);
              setPeriods(daySchedule.periods);

              const timeStr = getCurrentTimeStr();
              const periodInfo = getCurrentPeriodInfo(daySchedule.periods, timeStr);
              setCurrentPeriod(periodInfo.currentPeriod);
              setNextPeriod(periodInfo.nextPeriod);
              setScheduleError(null);
            }),
            getTeacherAbsences(false).then(teachers => {
              setAbsentTeachers(teachers);
              setAbsencesError(null);
            }),
          ]),
          new Promise(resolve => setTimeout(resolve, 3500)),
        ]);
      } catch (e) {
        console.warn('Initial data load error:', e);
      } finally {
        setScheduleLoading(false);
        setAbsencesLoading(false);
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    initialLoad().then(() => {
      // Silently revalidate against GitHub in background to ensure latest commits are synced
      refreshAll().catch(() => {});
    });
  }, [refreshAll]);

  // React to auth session changes: fetch absences when authenticated, clear cache when logged out
  useEffect(() => {
    if (session) {
      refreshAll().catch(() => {});
    } else {
      clearAbsenceCache();
      setAbsentTeachers([]);
      setAbsencesError(null);
    }
  }, [session, refreshAll]);

  // Update current period every 30 seconds centrally
  useEffect(() => {
    const interval = setInterval(() => {
      if (periods.length > 0) {
        const timeStr = getCurrentTimeStr();
        const periodInfo = getCurrentPeriodInfo(periods, timeStr);
        setCurrentPeriod(periodInfo.currentPeriod);
        setNextPeriod(periodInfo.nextPeriod);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [periods]);

  // Refetch when returning from background if the day rolled over or data is stale
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const currentDateStr = new Date().toDateString();
        const isStale = Date.now() - lastFetchedTimestamp.current > 15 * 60 * 1000;
        const dateChanged = currentDateStr !== lastFetchedDate.current;
        if (dateChanged || isStale) {
          lastFetchedDate.current = currentDateStr;
          lastFetchedTimestamp.current = Date.now();
          refreshAll();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [refreshAll]);

  return (
    <DataContext.Provider
      value={{
        schedule,
        scheduleType,
        periods,
        currentPeriod,
        nextPeriod,
        scheduleLoading,
        scheduleError,
        absentTeachers,
        absencesLoading,
        absencesError,
        isReady,
        refreshAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
