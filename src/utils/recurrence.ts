import { Goal } from '../types/goal';
import { getWeekday, toDateKey } from './date';

/**
 * Determines whether a goal occurs on a given date.
 */
export function occursOnDate(goal: Goal, date: Date): boolean {
  const goalDate = new Date(`${goal.date}T12:00:00`);

  const targetKey = toDateKey(date);
  const goalKey = toDateKey(goalDate);

  if (goal.recurrence === 'none') {
    return goalKey === targetKey;
  }

  // Recurring goals do not begin until their original date.
  if (date < goalDate) {
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
