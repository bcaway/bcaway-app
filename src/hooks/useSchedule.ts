import { useData } from '../context/DataContext';

export function useSchedule() {
  const {
    schedule,
    scheduleType,
    periods,
    currentPeriod,
    nextPeriod,
    scheduleLoading,
    scheduleError,
    refreshAll,
  } = useData();

  return {
    schedule,
    scheduleType,
    periods,
    currentPeriod,
    nextPeriod,
    isLoading: scheduleLoading,
    error: scheduleError,
    refresh: refreshAll,
  };
}
