import { useData } from '../context/DataContext';

export function useAbsences() {
  const {
    absentTeachers,
    absencesLoading,
    absencesError,
    refreshAll,
  } = useData();

  return {
    absentTeachers,
    isLoading: absencesLoading,
    error: absencesError,
    refresh: refreshAll,
  };
}
