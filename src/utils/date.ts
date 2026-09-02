import { Weekday } from '../types';

/**
 * Converts a Date into Cue's local YYYY-MM-DD date key.
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Compares two dates to see if they fall on the same day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

/**
 * Returns whether the current locale uses Sunday
 * as the first day of the week.
 */
export function doesWeekStartOnSunday(): boolean {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();

  return locale === 'en-us';
}

/**
 * Returns the first day of the week containing the given date.
 *
 * US locales use Sunday-first; other locales use Monday-first.
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const jsDay = result.getDay();

  if (doesWeekStartOnSunday()) {
    result.setDate(result.getDate() - jsDay);
  } else {
    const daysFromMonday = jsDay === 0 ? 6 : jsDay - 1;

    result.setDate(result.getDate() - daysFromMonday);
  }

  result.setHours(0, 0, 0, 0);

  return result;
}

/**
 * Returns all seven days in the week containing the given date.
 */
export function getWeekDays(date: Date): Date[] {
  const start = getWeekStart(date);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);

    day.setDate(start.getDate() + index);

    return day;
  });
}

/**
 * Converts JavaScript's Sunday=0...Saturday=6
 * into Cue's Monday=1...Sunday=7 representation.
 */
export function getWeekday(date: Date): Weekday {
  const jsDay = date.getDay();

  return (jsDay === 0 ? 7 : jsDay) as Weekday;
}

/**
 * Returns the weekday labels in the user's local week order.
 */
export function getWeekdayLabels(): string[] {
  return doesWeekStartOnSunday()
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
}

/**
 * Formats a 24-hour time value for display.
 * @param time The time in HH:mm format.
 * @returns A localized 12-hour time string.
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Converts a Date into a 24-hour HH:mm time value.
 * @param date The date containing the time.
 * @returns The time formatted as HH:mm.
 */
export function toTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

/**
 * Creates a Date using the stored HH:mm time.
 * @param time The time in HH:mm format.
 * @returns A Date containing the specified time.
 */
export function timeToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date;
}

export function dateToTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}
