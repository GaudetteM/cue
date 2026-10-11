import { Goal } from '../types/Goal';
import { getNextReminderDate, occursOnDate } from './recurrence';

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    title: 'Test goal',
    date: '2026-10-05',
    recurrence: 'none',
    dailyStatus: {},
    createdAt: '2026-10-05T12:00:00.000Z',
    reminderEnabled: false,
    ...overrides,
  };
}

const baseGoal: Goal = {
  id: 'test-goal',
  title: 'Test goal',
  date: '2026-10-10',
  recurrence: 'none',
  dailyStatus: {},
  createdAt: '2026-10-10T12:00:00.000Z',
  reminderEnabled: true,
  reminderTime: '21:00',
};

describe('occursOnDate', () => {
  it('matches a non-recurring goal to its exact date', () => {
    const goal = makeGoal();

    expect(occursOnDate(goal, new Date(2026, 9, 5))).toBe(true);
    expect(occursOnDate(goal, new Date(2026, 9, 6))).toBe(false);
  });

  it('includes a daily goal on its start date', () => {
    const goal = makeGoal({ recurrence: 'daily' });

    expect(occursOnDate(goal, new Date(2026, 9, 5))).toBe(true);
  });

  it('does not include a recurring goal before its start date', () => {
    const goal = makeGoal({ recurrence: 'daily' });

    expect(occursOnDate(goal, new Date(2026, 9, 4))).toBe(false);
  });

  it('matches weekly recurrence using Monday=1 through Sunday=7', () => {
    const goal = makeGoal({
      recurrence: 'weekly',
      recurrenceDays: [1],
    });

    expect(occursOnDate(goal, new Date(2026, 9, 5))).toBe(true);
    expect(occursOnDate(goal, new Date(2026, 9, 6))).toBe(false);
  });

  it('matches monthly recurrence by day of month', () => {
    const goal = makeGoal({
      recurrence: 'monthly',
      recurrenceDays: [5],
    });

    expect(occursOnDate(goal, new Date(2026, 10, 5))).toBe(true);
    expect(occursOnDate(goal, new Date(2026, 10, 6))).toBe(false);
  });

  it('does not match a monthly goal when the configured day does not exist', () => {
    const goal = makeGoal({
      recurrence: 'monthly',
      recurrenceDays: [31],
    });

    expect(occursOnDate(goal, new Date(2026, 1, 28))).toBe(false);
  });
});

describe('getNextReminderDate', () => {
  it('returns the next daily occurrence', () => {
    const goal: Goal = {
      ...baseGoal,
      recurrence: 'daily',
      date: '2026-10-10',
      reminderEnabled: true,
      reminderTime: '21:00',
    };

    const after = new Date(2026, 9, 10, 20, 0);

    expect(getNextReminderDate(goal, after)).toEqual(
      new Date(2026, 9, 10, 21, 0),
    );
  });

  it('moves to tomorrow when today’s reminder has passed', () => {
    const goal: Goal = {
      ...baseGoal,
      recurrence: 'daily',
      date: '2026-10-10',
      reminderEnabled: true,
      reminderTime: '21:00',
    };

    const after = new Date(2026, 9, 10, 22, 0);

    expect(getNextReminderDate(goal, after)).toEqual(
      new Date(2026, 9, 11, 21, 0),
    );
  });

  it('returns the next selected weekly occurrence', () => {
    const goal: Goal = {
      ...baseGoal,
      recurrence: 'weekly',
      date: '2026-10-10',
      recurrenceDays: [1], // Monday
      reminderEnabled: true,
      reminderTime: '09:00',
    };

    const after = new Date(2026, 9, 10, 10, 0); // Saturday

    expect(getNextReminderDate(goal, after)).toEqual(
      new Date(2026, 9, 12, 9, 0), // Monday
    );
  });

  it('skips to the following week when the selected weekday is today but the time has passed', () => {
    const goal: Goal = {
      ...baseGoal,
      recurrence: 'weekly',
      date: '2026-10-12',
      recurrenceDays: [1], // Monday
      reminderEnabled: true,
      reminderTime: '09:00',
    };

    const after = new Date(2026, 9, 12, 10, 0); // Monday

    expect(getNextReminderDate(goal, after)).toEqual(
      new Date(2026, 9, 19, 9, 0),
    );
  });

  it('returns the next selected monthly occurrence', () => {
    const goal: Goal = {
      ...baseGoal,
      recurrence: 'monthly',
      date: '2026-10-01',
      recurrenceDays: [15],
      reminderEnabled: true,
      reminderTime: '18:00',
    };

    const after = new Date(2026, 9, 10, 12, 0);

    expect(getNextReminderDate(goal, after)).toEqual(
      new Date(2026, 9, 15, 18, 0),
    );
  });

  it('skips a monthly day that does not exist', () => {
    const goal: Goal = {
      ...baseGoal,
      recurrence: 'monthly',
      date: '2026-01-01',
      recurrenceDays: [31],
      reminderEnabled: true,
      reminderTime: '18:00',
    };

    const after = new Date(2026, 1, 1, 12, 0); // February

    expect(getNextReminderDate(goal, after)).toEqual(
      new Date(2026, 2, 31, 18, 0),
    );
  });

  it('does not return an occurrence before the goal start date', () => {
    const goal: Goal = {
      ...baseGoal,
      recurrence: 'daily',
      date: '2026-10-15',
      reminderEnabled: true,
      reminderTime: '09:00',
    };

    const after = new Date(2026, 9, 10, 12, 0);

    expect(getNextReminderDate(goal, after)).toEqual(
      new Date(2026, 9, 15, 9, 0),
    );
  });

  it('returns null when reminders are disabled', () => {
    const goal: Goal = {
      ...baseGoal,
      recurrence: 'daily',
      date: '2026-10-10',
      reminderEnabled: false,
      reminderTime: '21:00',
    };

    expect(getNextReminderDate(goal, new Date(2026, 9, 10, 20, 0))).toBeNull();
  });

  it('returns null when no reminder time is configured', () => {
    const goal: Goal = {
      ...baseGoal,
      recurrence: 'daily',
      date: '2026-10-10',
      reminderEnabled: true,
      reminderTime: undefined,
    };

    expect(getNextReminderDate(goal, new Date(2026, 9, 10, 20, 0))).toBeNull();
  });
});
