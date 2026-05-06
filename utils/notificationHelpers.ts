import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } catch (e) {
      // Might fail in simulator or if not configured
      return null;
    }
  }

  return token;
}

export async function scheduleSubscriptionReminder(id: string, name: string, expiryDate: string) {
  const triggerDate = new Date(expiryDate);
  // Remind 1 day before
  triggerDate.setDate(triggerDate.getDate() - 1);
  triggerDate.setHours(10, 0, 0, 0); // 10 AM

  if (triggerDate.getTime() <= Date.now()) {
    // If 1 day before is already in the past, don't schedule or schedule for now if appropriate
    // For now, just skip if it's too late
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Subscription Renewal',
      body: `Your ${name} subscription expires tomorrow!`,
      data: { type: 'subscription', id },
    },
    trigger: triggerDate as any,
  });

  return notificationId;
}

export async function scheduleDebtReminder(id: string, personName: string, dueDate: string) {
  const triggerDate = new Date(dueDate);
  // Remind on the due date morning
  triggerDate.setHours(9, 0, 0, 0); // 9 AM

  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Debt Due Today',
      body: `You have a debt to pay back to ${personName} today.`,
      data: { type: 'debt', id },
    },
    trigger: triggerDate as any,
  });

  return notificationId;
}

export async function cancelNotification(notificationId: string) {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
