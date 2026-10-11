import { Goal } from '../types/Goal';
import { getWeekday, toDateKey } from './date';

/**
 * Determines whether a goal occurs on a given date.
 */
export function occursOnDate(goal: Goal, date: Date): boolean {
  const targetKey = toDateKey(date);

  if (goal.recurrence === 'none') {
    return goal.date === targetKey;
  }

  // Recurring goals cannot occur before their start date.
  if (targetKey < goal.date) {
    return false;
  }

  switch (goal.recurrence) {
    case 'daily':
      return true;

    case 'weekly':
      return goal.recurrenceDays?.includes(getWeekday(date)) ?? false;

    case 'monthly':
      return goal.recurrenceDays?.includes(date.getDate()) ?? false;

    default:
      return false;
  }
}

/**
 * Returns the next reminder occurrence strictly after `after`.
 * Returns null for goals without a valid recurrence schedule.
 */
export function getNextReminderDate(goal: Goal, after: Date): Date | null {
  if (!goal.reminderEnabled || !goal.reminderTime) {
    return null;
  }

  const [hours, minutes] = goal.reminderTime.split(':').map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const candidate = new Date(after);
  candidate.setHours(hours, minutes, 0, 0);

  // Start checking from the next minute if today's reminder time has passed.
  if (candidate.getTime() <= after.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(hours, minutes, 0, 0);
  }

  // Bound the search to avoid infinite loops for invalid schedules.
  for (let i = 0; i < 366; i++) {
    const candidateKey = toDateKey(candidate);

    if (candidateKey >= goal.date && occursOnDate(goal, candidate)) {
      return candidate;
    }

    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(hours, minutes, 0, 0);
  }

  return null;
}
