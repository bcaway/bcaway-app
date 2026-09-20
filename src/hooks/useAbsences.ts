import { useState, useEffect, useCallback } from 'react';
import { getAbsentTeachers, isTeacherAbsent as checkTeacherAbsent } from '../services/absenceService';
import { AbsentTeacher } from '../types';
import { format } from 'date-fns';

export function useAbsences() {
  const [absentTeachers, setAbsentTeachers] = useState<AbsentTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAbsences = useCallback(async () => {
    try {
      setIsLoading(true);
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const teachers = getAbsentTeachers(dateStr);
      setAbsentTeachers(teachers);
    } catch (error) {
      console.error('Failed to fetch absences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  const isTeacherAbsent = useCallback((teacherId: string) => {
    return absentTeachers.some(t => t.id === teacherId);
  }, [absentTeachers]);

  return {
    absentTeachers,
    isLoading,
    isTeacherAbsent,
    refresh: fetchAbsences,
  };
}
