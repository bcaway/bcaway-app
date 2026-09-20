import { useState, useEffect, useRef, useCallback } from 'react';
import { getScheduleForDate, getCurrentPeriodInfo } from '../services/scheduleService';
import { SchedulePeriod, DaySchedule } from '../types';
import { getCurrentTimeStr } from '../utils/time';

export function useSchedule() {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [scheduleType, setScheduleType] = useState<string | null>(null);
  const [periods, setPeriods] = useState<SchedulePeriod[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<SchedulePeriod | null>(null);
  const [nextPeriod, setNextPeriod] = useState<SchedulePeriod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isLoaded = useRef(false);

  const fetchSchedule = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      const today = new Date();
      const daySchedule = await getScheduleForDate(today, forceRefresh);
      setSchedule(daySchedule);
      setScheduleType(daySchedule.scheduleType);
      setPeriods(daySchedule.periods);

      // Determine current period
      const timeStr = getCurrentTimeStr();
      const periodInfo = getCurrentPeriodInfo(daySchedule.periods, timeStr);
      setCurrentPeriod(periodInfo.currentPeriod);
      setNextPeriod(periodInfo.nextPeriod);

      setError(null);
      isLoaded.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load schedule'));
      console.error('Error fetching schedule:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded.current) {
      fetchSchedule(false);
    }
  }, [fetchSchedule]);

  // Update current period every 30 seconds
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

  return {
    schedule,
    scheduleType,
    periods,
    currentPeriod,
    nextPeriod,
    isLoading,
    error,
    refresh: () => fetchSchedule(true),
  };
}
