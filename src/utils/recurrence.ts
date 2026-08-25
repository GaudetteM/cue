import { Goal } from '../types/goal';

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getMondayBasedDay(date: Date): number {
  const day = date.getDay();

  return day === 0 ? 7 : day;
}

export function occursOnDate(goal: Goal, date: Date): boolean {
  const dateKey = toDateKey(date);

  // Normal one-off goal.
  if (goal.recurrence === 'none') {
    return goal.date === dateKey;
  }

  // Don't show recurring goals before
  // their starting date.
  if (dateKey < goal.date) {
    return false;
  }

  if (goal.recurrence === 'daily') {
    return true;
  }

  if (goal.recurrence === 'weekly') {
    const weekday = getMondayBasedDay(date);

    return goal.recurrenceDays?.includes(weekday) ?? false;
  }

  if (goal.recurrence === 'monthly') {
    const dayOfMonth = date.getDate();

    return goal.recurrenceDays?.includes(dayOfMonth) ?? false;
  }

  return false;
}
