import NativeNotifications from '../native/NativeNotifications';

export async function requestNotificationPermission(): Promise<boolean> {
  return NativeNotifications.requestPermission();
}

export function scheduleNotification(
  id: string,
  title: string,
  body: string,
  timestamp: number,
): void {
  NativeNotifications.scheduleNotification(id, title, body, timestamp);
}

export function cancelNotification(id: string): void {
  NativeNotifications.cancelNotification(id);
}

export function cancelAllNotifications(): void {
  NativeNotifications.cancelAllNotifications();
}
