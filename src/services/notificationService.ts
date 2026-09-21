import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Register the notification handler so normal notifications can be displayed while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registers the device for push notifications, requests permissions if needed,
 * and fetches the Expo Push Token.
 *
 * @returns {Promise<string | null>} The Expo Push Token string, or null if registration failed/unavailable.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Push notifications cannot be received on web or simulators/emulators
    if (Platform.OS === 'web') {
      console.log('[Push Notification] Push notifications are not supported on web.');
      return null;
    }

    if (!Device.isDevice) {
      console.log('[Push Notification] Physical device required for push notifications (not supported in simulator/emulator).');
      return null;
    }

    // Android 8.0+ requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A86E8',
      });
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Return cleanly without crashing if permission was denied
    if (finalStatus !== 'granted') {
      console.log(`[Push Notification] Permission was not granted (status: ${finalStatus}).`);
      return null;
    }

    // Retrieve Expo project ID from configuration
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.warn(
        '[Push Notification] Warning: No EAS projectId found in Expo configuration. ' +
        'Please configure extra.eas.projectId in app.json or link your project with `eas init`.'
      );
    }

    // Get the Expo Push Token
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenResponse.data;

    // Development logging
    console.log('====================================================');
    console.log('[Push Notification] Expo Push Token obtained:');
    console.log(token);
    console.log('====================================================');

    return token;
  } catch (error) {
    console.error('[Push Notification] Error registering for push notifications:', error);
    return null;
  }
}

export const notificationService = {
  registerForPushNotificationsAsync,
};
