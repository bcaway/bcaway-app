import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SchedulePeriod, DaySchedule, TeacherAbsence, Teacher } from '../types';
import { getScheduleForDate, getCurrentPeriodInfo } from '../services/scheduleService';
import { getTeacherAbsences, clearAbsenceCache } from '../services/absenceService';
import {
  getAllTeachers,
  getUserStarredTeacherIds,
  starTeacher,
  unstarTeacher,
} from '../services/teacherService';
import { syncStarredTeachersWithBackend } from '../services/notificationService';
import { supabase } from '../services/supabase';
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

  // Teachers & Stars state
  teachers: Teacher[];
  starredTeacherIds: string[];
  starredTeachers: Teacher[];
  starredAbsences: TeacherAbsence[];
  teachersLoading: boolean;
  isTeacherStarred: (teacherId: string) => boolean;
  toggleStarTeacher: (teacherId: string) => Promise<boolean>;
  refreshTeachersAndStars: () => Promise<void>;

  // Readiness for initial app display
  isReady: boolean;

  // Global refetch: refetches all data across the app without toggling global loading spinners
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id;

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

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [starredTeacherIds, setStarredTeacherIds] = useState<string[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);

  const [isReady, setIsReady] = useState(false);
  const inFlightRefresh = useRef<Promise<void> | null>(null);
  const lastFetchedDate = useRef<string>(new Date().toDateString());
  const lastFetchedTimestamp = useRef<number>(Date.now());

  // Derived: Teachers that the user has starred
  const starredTeachers = useMemo(() => {
    if (starredTeacherIds.length === 0 || teachers.length === 0) return [];
    const starredSet = new Set(starredTeacherIds);
    return teachers.filter(t => starredSet.has(t.id));
  }, [teachers, starredTeacherIds]);

  // Derived: Today's absences that match any of the user's starred teachers
  const starredAbsences = useMemo(() => {
    if (starredTeachers.length === 0 || absentTeachers.length === 0) return [];

    const normalizedStarredNames = new Set(
      starredTeachers.flatMap(t => [
        t.name.trim().toLowerCase(),
        ...(Array.isArray(t.aliases) ? t.aliases.map(a => a.trim().toLowerCase()) : []),
      ])
    );

    return absentTeachers.filter(absence =>
      normalizedStarredNames.has(absence.teacher.trim().toLowerCase())
    );
  }, [absentTeachers, starredTeachers]);

  // Helper: check if a teacher is starred
  const isTeacherStarred = useCallback(
    (teacherId: string) => {
      return starredTeacherIds.includes(teacherId);
    },
    [starredTeacherIds]
  );

  // Helper: toggle star for a teacher
  const toggleStarTeacher = useCallback(
    async (teacherId: string): Promise<boolean> => {
      if (!userId) return false;

      const currentlyStarred = starredTeacherIds.includes(teacherId);
      // Optimistic update
      if (currentlyStarred) {
        setStarredTeacherIds(prev => prev.filter(id => id !== teacherId));
        const ok = await unstarTeacher(userId, teacherId);
        if (!ok) {
          // Revert on failure
          setStarredTeacherIds(prev => [...prev, teacherId]);
          return false;
        }
        return true;
      } else {
        setStarredTeacherIds(prev => [...prev, teacherId]);
        const ok = await starTeacher(userId, teacherId);
        if (!ok) {
          // Revert on failure
          setStarredTeacherIds(prev => prev.filter(id => id !== teacherId));
          return false;
        }
        return true;
      }
    },
    [userId, starredTeacherIds]
  );

  // Refresh teachers and stars specifically
  const refreshTeachersAndStars = useCallback(async (): Promise<void> => {
    try {
      const [tList, sIds] = await Promise.all([
        getAllTeachers(true),
        userId ? getUserStarredTeacherIds(userId, true) : Promise.resolve([]),
      ]);
      setTeachers(tList);
      if (userId) setStarredTeacherIds(sIds);
    } catch (e) {
      console.warn('[DataContext] Error refreshing teachers/stars:', e);
    }
  }, [userId]);

  // Global refetch that fetches schedule + absences + teachers + stars
  const refreshAll = useCallback(async (): Promise<void> => {
    if (inFlightRefresh.current) {
      return inFlightRefresh.current;
    }

    const task = (async () => {
      try {
        const today = new Date();
        const [schedResult, absResult, teachersResult, starsResult] = await Promise.allSettled([
          getScheduleForDate(today, true),
          getTeacherAbsences(true),
          getAllTeachers(true),
          userId ? getUserStarredTeacherIds(userId, true) : Promise.resolve([]),
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
          setScheduleError(
            schedResult.reason instanceof Error ? schedResult.reason : new Error(String(schedResult.reason))
          );
        }

        if (teachersResult.status === 'fulfilled') {
          setTeachers(teachersResult.value);
        }

        if (starsResult.status === 'fulfilled' && userId) {
          setStarredTeacherIds(starsResult.value);
        }

        if (absResult.status === 'fulfilled') {
          setAbsentTeachers(absResult.value);
          setAbsencesError(null);
        } else {
          console.error('Error refreshing absences:', absResult.reason);
          setAbsencesError(
            absResult.reason instanceof Error ? absResult.reason : new Error(String(absResult.reason))
          );
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
  }, [userId]);

  // Keep starred teachers synchronized with remote push notification backend
  useEffect(() => {
    if (!isReady || teachersLoading) return;

    const starredNames = teachers
      .filter(t => starredTeacherIds.includes(t.id))
      .map(t => t.name);

    syncStarredTeachersWithBackend(starredNames).catch(err => {
      console.warn('[DataContext] Failed to sync starred teachers with push backend:', err);
    });
  }, [isReady, teachersLoading, starredTeacherIds, teachers]);

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
            getAllTeachers(false).then(loadedTeachers => {
              setTeachers(loadedTeachers);
            }),
            userId
              ? getUserStarredTeacherIds(userId, false).then(loadedStars => {
                  setStarredTeacherIds(loadedStars);
                })
              : Promise.resolve(),
            getTeacherAbsences(false).then(loadedAbsences => {
              setAbsentTeachers(loadedAbsences);
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
        setTeachersLoading(false);
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    initialLoad().then(() => {
      // Revalidate in background to ensure latest sync is loaded
      refreshAll().catch(() => {});
    });
  }, [userId, refreshAll]);

  // React to auth session changes
  useEffect(() => {
    if (session) {
      refreshAll().catch(() => {});
    } else {
      clearAbsenceCache();
      setAbsentTeachers([]);
      setStarredTeacherIds([]);
      setAbsencesError(null);
    }
  }, [session, refreshAll]);

  // Listen to Supabase Realtime changes on teacher_absences & teachers
  useEffect(() => {
    const channel = supabase
      .channel('schema_changes_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teacher_absences' },
        payload => {
          console.log('[Realtime] teacher_absences changed:', payload.eventType);
          refreshAll().catch(() => {});
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teachers' },
        payload => {
          console.log('[Realtime] teachers changed:', payload.eventType);
          getAllTeachers(true)
            .then(updated => setTeachers(updated))
            .catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshAll]);

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
        teachers,
        starredTeacherIds,
        starredTeachers,
        starredAbsences,
        teachersLoading,
        isTeacherStarred,
        toggleStarTeacher,
        refreshTeachersAndStars,
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
