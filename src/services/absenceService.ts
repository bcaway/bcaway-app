import { MOCK_TEACHERS } from '../constants/teachers';
import { AbsentTeacher } from '../types';

function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export const getAbsentTeachers = (dateStr: string): AbsentTeacher[] => {
  const seed = stringToSeed(dateStr);
  
  // Decide how many absent teachers (2 to 4)
  const numAbsences = Math.floor(seededRandom(seed) * 3) + 2;
  
  const absences: AbsentTeacher[] = [];
  const teachersCopy = [...MOCK_TEACHERS];
  
  for (let i = 0; i < numAbsences; i++) {
    if (teachersCopy.length === 0) break;
    const index = Math.floor(seededRandom(seed + i + 1) * teachersCopy.length);
    absences.push(teachersCopy[index]);
    teachersCopy.splice(index, 1);
  }
  
  return absences;
};

export const isTeacherAbsent = (teacherId: string, dateStr: string): boolean => {
  const absences = getAbsentTeachers(dateStr);
  return absences.some(teacher => teacher.id === teacherId);
};
