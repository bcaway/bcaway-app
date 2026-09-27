import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Teacher, TeacherAbsence } from '../types';

const TEACHERS_CACHE_KEY = '@bcaway_teachers_cache';
const USER_STARRED_CACHE_PREFIX = '@bcaway_user_starred_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedTeachersData {
  data: Teacher[];
  timestamp: number;
}

let inMemoryTeachers: CachedTeachersData | null = null;
let inMemoryStarred: Map<string, string[]> = new Map();

/**
 * Fetches all teachers from the Supabase `teachers` table.
 * Caches in memory and AsyncStorage for snappy offline performance.
 */
export async function getAllTeachers(forceRefresh: boolean = false): Promise<Teacher[]> {
  // Check memory cache
  if (!forceRefresh && inMemoryTeachers && Date.now() - inMemoryTeachers.timestamp < CACHE_TTL_MS) {
    return inMemoryTeachers.data;
  }

  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, name, aliases, created_at, updated_at')
      .order('name', { ascending: true });

    if (error) {
      console.warn('[TeacherService] Error fetching teachers from Supabase:', error.message);
      return await getCachedTeachersFallback();
    }

    const teachers: Teacher[] = (data || []).map(row => ({
      id: row.id,
      name: row.name,
      aliases: Array.isArray(row.aliases) ? row.aliases : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    inMemoryTeachers = { data: teachers, timestamp: Date.now() };

    // Persist to AsyncStorage asynchronously
    AsyncStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify(inMemoryTeachers)).catch(err => {
      console.warn('[TeacherService] Failed to cache teachers to AsyncStorage:', err);
    });

    return teachers;
  } catch (err) {
    console.warn('[TeacherService] Network error fetching teachers:', err);
    return await getCachedTeachersFallback();
  }
}

/**
 * Fallback to AsyncStorage cache if network / Supabase fails.
 */
async function getCachedTeachersFallback(): Promise<Teacher[]> {
  if (inMemoryTeachers) {
    return inMemoryTeachers.data;
  }

  try {
    const cachedStr = await AsyncStorage.getItem(TEACHERS_CACHE_KEY);
    if (cachedStr) {
      const parsed: CachedTeachersData = JSON.parse(cachedStr);
      inMemoryTeachers = parsed;
      return parsed.data;
    }
  } catch (err) {
    console.warn('[TeacherService] Error reading cached teachers:', err);
  }

  return [];
}

/**
 * Resolves a raw teacher string from the cancellation doc/sheet against known teachers & aliases.
 * If a match is found, returns the canonical `teacher.name`. Otherwise returns `rawName`.
 *
 * Example: "Smith (ms.)" -> "Ms. Smith"
 */
export function resolveCanonicalTeacherName(rawName: string, teachers: Teacher[]): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  for (const teacher of teachers) {
    // Check canonical name
    if (teacher.name.trim().toLowerCase() === lower) {
      return teacher.name;
    }

    // Check all known aliases
    if (Array.isArray(teacher.aliases)) {
      for (const alias of teacher.aliases) {
        if (alias.trim().toLowerCase() === lower) {
          return teacher.name;
        }
      }
    }
  }

  return trimmed;
}

/**
 * Maps an array of TeacherAbsence records, replacing any alias with the canonical teacher name.
 */
export function normalizeAbsencesWithTeachers(
  absences: TeacherAbsence[],
  teachers: Teacher[]
): TeacherAbsence[] {
  if (!teachers || teachers.length === 0) return absences;

  return absences.map(absence => {
    const canonicalName = resolveCanonicalTeacherName(absence.teacher, teachers);
    if (canonicalName !== absence.teacher) {
      return {
        ...absence,
        teacher: canonicalName,
      };
    }
    return absence;
  });
}

/**
 * Fetches the list of teacher IDs starred by the authenticated user from Supabase.
 */
export async function getUserStarredTeacherIds(
  userId: string,
  forceRefresh: boolean = false
): Promise<string[]> {
  if (!userId) return [];

  if (!forceRefresh && inMemoryStarred.has(userId)) {
    return inMemoryStarred.get(userId)!;
  }

  // Check AsyncStorage first for instant loading
  const cacheKey = `${USER_STARRED_CACHE_PREFIX}${userId}`;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached && !forceRefresh) {
      const parsed: string[] = JSON.parse(cached);
      inMemoryStarred.set(userId, parsed);
    }
  } catch (e) {
    // Ignore cache read error
  }

  try {
    const { data, error } = await supabase
      .from('user_starred_teachers')
      .select('teacher_id')
      .eq('user_id', userId);

    if (error) {
      console.warn('[TeacherService] Error fetching user starred teachers:', error.message);
      return inMemoryStarred.get(userId) || [];
    }

    const starredIds: string[] = (data || []).map(row => row.teacher_id);
    inMemoryStarred.set(userId, starredIds);

    // Save to AsyncStorage
    AsyncStorage.setItem(cacheKey, JSON.stringify(starredIds)).catch(() => {});

    return starredIds;
  } catch (err) {
    console.warn('[TeacherService] Network error fetching starred teachers:', err);
    return inMemoryStarred.get(userId) || [];
  }
}

/**
 * Stars a teacher in Supabase for the current user and updates local cache.
 */
export async function starTeacher(userId: string, teacherId: string): Promise<boolean> {
  if (!userId || !teacherId) return false;

  const currentStarred = inMemoryStarred.get(userId) || [];
  if (!currentStarred.includes(teacherId)) {
    const updated = [...currentStarred, teacherId];
    inMemoryStarred.set(userId, updated);
    AsyncStorage.setItem(`${USER_STARRED_CACHE_PREFIX}${userId}`, JSON.stringify(updated)).catch(() => {});
  }

  try {
    const { error } = await supabase
      .from('user_starred_teachers')
      .upsert({ user_id: userId, teacher_id: teacherId }, { onConflict: 'user_id, teacher_id' });

    if (error) {
      console.error('[TeacherService] Error starring teacher in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[TeacherService] Exception starring teacher:', err);
    return false;
  }
}

/**
 * Unstars a teacher in Supabase for the current user and updates local cache.
 */
export async function unstarTeacher(userId: string, teacherId: string): Promise<boolean> {
  if (!userId || !teacherId) return false;

  const currentStarred = inMemoryStarred.get(userId) || [];
  const updated = currentStarred.filter(id => id !== teacherId);
  inMemoryStarred.set(userId, updated);
  AsyncStorage.setItem(`${USER_STARRED_CACHE_PREFIX}${userId}`, JSON.stringify(updated)).catch(() => {});

  try {
    const { error } = await supabase
      .from('user_starred_teachers')
      .delete()
      .match({ user_id: userId, teacher_id: teacherId });

    if (error) {
      console.error('[TeacherService] Error unstarring teacher in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[TeacherService] Exception unstarring teacher:', err);
    return false;
  }
}
