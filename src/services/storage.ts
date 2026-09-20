import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  NOTIFICATION_PREFS: 'notification_preferences',
  CACHED_SCHEDULE_DATA: 'cached_schedule_data',
};

export const getOnboardingComplete = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

export const setOnboardingComplete = async (value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, value.toString());
  } catch (error) {
    console.error('Error setting onboarding complete', error);
  }
};

export const getNotificationPrefs = async (): Promise<any> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.NOTIFICATION_PREFS);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

export const setNotificationPrefs = async (prefs: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.NOTIFICATION_PREFS, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error setting notification prefs', error);
  }
};

export const getCachedSchedules = async (): Promise<any> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.CACHED_SCHEDULE_DATA);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

export const setCachedSchedules = async (data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.CACHED_SCHEDULE_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting cached schedules', error);
  }
};

// Object-style export for consumers that import as `storageService`
export const storageService = {
  getHasOnboarded: getOnboardingComplete,
  setHasOnboarded: setOnboardingComplete,
  getNotificationPrefs,
  setNotificationPrefs,
  getCachedSchedules,
  setCachedSchedules,
};
