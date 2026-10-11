import {
  dateToTime,
  doesWeekStartOnSunday,
  formatTime,
  getWeekDays,
  getWeekStart,
  getWeekday,
  getWeekdayLabels,
  isSameDay,
  timeToDate,
  toDateKey,
  toTimeString,
} from './date';

describe('toDateKey', () => {
  it('formats a date as YYYY-MM-DD using local date components', () => {
    expect(toDateKey(new Date(2026, 9, 5))).toBe('2026-10-05');
  });

  it('pads single-digit months and days', () => {
    expect(toDateKey(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});

describe('isSameDay', () => {
  it('returns true for dates on the same calendar day', () => {
    expect(isSameDay(new Date(2026, 9, 5, 8), new Date(2026, 9, 5, 22))).toBe(
      true,
    );
  });

  it('returns false for different calendar days', () => {
    expect(isSameDay(new Date(2026, 9, 5), new Date(2026, 9, 6))).toBe(false);
  });
});

describe('doesWeekStartOnSunday', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true for the en-US locale', () => {
    jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({
        locale: 'en-US',
        calendar: 'gregory',
        numberingSystem: 'latn',
        timeZone: 'America/Chicago',
      } as Intl.ResolvedDateTimeFormatOptions);

    expect(doesWeekStartOnSunday()).toBe(true);
  });

  it('returns false for a Monday-first locale', () => {
    jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({
        locale: 'en-GB',
        calendar: 'gregory',
        numberingSystem: 'latn',
        timeZone: 'Europe/London',
      } as Intl.ResolvedDateTimeFormatOptions);

    expect(doesWeekStartOnSunday()).toBe(false);
  });
});

describe('getWeekStart', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns Sunday at midnight for a Sunday-first locale', () => {
    jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({
        locale: 'en-US',
        calendar: 'gregory',
        numberingSystem: 'latn',
        timeZone: 'America/Chicago',
      } as Intl.ResolvedDateTimeFormatOptions);

    const result = getWeekStart(new Date(2026, 9, 7, 15, 30));

    expect(result).toEqual(new Date(2026, 9, 4, 0, 0, 0, 0));
  });

  it('returns Monday at midnight for a Monday-first locale', () => {
    jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({
        locale: 'en-GB',
        calendar: 'gregory',
        numberingSystem: 'latn',
        timeZone: 'Europe/London',
      } as Intl.ResolvedDateTimeFormatOptions);

    const result = getWeekStart(new Date(2026, 9, 7, 15, 30));

    expect(result).toEqual(new Date(2026, 9, 5, 0, 0, 0, 0));
  });
});

describe('getWeekDays', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns seven consecutive days starting with Sunday for en-US', () => {
    jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({
        locale: 'en-US',
        calendar: 'gregory',
        numberingSystem: 'latn',
        timeZone: 'America/Chicago',
      } as Intl.ResolvedDateTimeFormatOptions);

    const days = getWeekDays(new Date(2026, 9, 7));

    expect(days).toHaveLength(7);
    expect(days.map(toDateKey)).toEqual([
      '2026-10-04',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
    ]);
  });
});

describe('getWeekday', () => {
  it('uses Monday=1 through Sunday=7', () => {
    expect(getWeekday(new Date(2026, 9, 5))).toBe(1); // Monday
    expect(getWeekday(new Date(2026, 9, 10))).toBe(6); // Saturday
    expect(getWeekday(new Date(2026, 9, 11))).toBe(7); // Sunday
  });
});

describe('getWeekdayLabels', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns Sunday-first labels for en-US', () => {
    jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({
        locale: 'en-US',
        calendar: 'gregory',
        numberingSystem: 'latn',
        timeZone: 'America/Chicago',
      } as Intl.ResolvedDateTimeFormatOptions);

    expect(getWeekdayLabels()).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });

  it('returns Monday-first labels for en-GB', () => {
    jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({
        locale: 'en-GB',
        calendar: 'gregory',
        numberingSystem: 'latn',
        timeZone: 'Europe/London',
      } as Intl.ResolvedDateTimeFormatOptions);

    expect(getWeekdayLabels()).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });
});

describe('time conversion', () => {
  it('converts a Date to HH:mm', () => {
    expect(toTimeString(new Date(2026, 9, 5, 9, 7))).toBe('09:07');
    expect(dateToTime(new Date(2026, 9, 5, 18, 45))).toBe('18:45');
  });

  it('converts HH:mm to a Date with the expected local time', () => {
    const result = timeToDate('18:45');

    expect(result.getHours()).toBe(18);
    expect(result.getMinutes()).toBe(45);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('formats a time for display', () => {
    expect(formatTime('18:05')).toBe(
      new Date(2000, 0, 1, 18, 5).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    );
  });
});
