import NativeNotifications from '../native/NativeNotifications';
import { Goal } from '../types';

/**
 * Builds a local Date from Cue's YYYY-MM-DD date key
 * and a HH:mm reminder time.
 */
function createReminderDate(dateKey: string, reminderTime: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours, minutes] = reminderTime.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Returns the native notification ID for a goal reminder.
 */
function getReminderNotificationId(goalId: string): string {
  return `goal-reminder-${goalId}`;
}

/**
 * Schedules the next reminder for a non-recurring goal.
 */
export function scheduleGoalReminder(goal: Goal): void {
  if (!goal.reminderEnabled || !goal.reminderTime) {
    return;
  }

  if (goal.recurrence !== 'none') {
    return;
  }

  const reminderDate = createReminderDate(goal.date, goal.reminderTime);

  if (reminderDate.getTime() <= Date.now()) {
    return;
  }

  NativeNotifications.scheduleNotification(
    getReminderNotificationId(goal.id),
    goal.title,
    'You have a reminder from Cue.',
    reminderDate.getTime(),
  );
}

/**
 * Cancels the scheduled reminder for a goal.
 */
export function cancelGoalReminder(goalId: string): void {
  NativeNotifications.cancelNotification(getReminderNotificationId(goalId));
}
