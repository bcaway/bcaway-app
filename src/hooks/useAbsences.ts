import { useState, useEffect, useCallback } from 'react';
import { getTeacherAbsences } from '../services/absenceService';
import { TeacherAbsence } from '../types';

export function useAbsences() {
  const [absentTeachers, setAbsentTeachers] = useState<TeacherAbsence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAbsences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const teachers = await getTeacherAbsences();
      setAbsentTeachers(teachers);
    } catch (err) {
      console.error('Failed to fetch absences from Supabase:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  return {
    absentTeachers,
    isLoading,
    error,
    refresh: fetchAbsences,
  };
}
