import { GoalRecurrence } from './goalRecurrence';

export interface Goal {
  id: string;
  title: string;
  category?: string;

  /**
   * The date the goal was created/started.
   *
   * For non-recurring goals, this is the date
   * the goal belongs to.
   *
   * For recurring goals, this is the date
   * recurrence begins.
   */
  date: string;

  recurrence: GoalRecurrence;

  /**
   * Weekly:
   * 1 = Monday
   * 2 = Tuesday
   * ...
   *
   * Monthly:
   * 1-31 = day of month
   */
  recurrenceDays?: number[];

  /**
   * Dates on which this goal was completed.
   *
   * Example:
   * ['2026-08-24', '2026-08-26']
   */
  completedDates: string[];

  createdAt: string;
}
