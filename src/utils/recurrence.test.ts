import { Goal } from '../types/Goal';
import { occursOnDate } from './recurrence';

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
