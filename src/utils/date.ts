export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
