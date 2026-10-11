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
