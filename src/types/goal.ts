export type GoalRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type GoalStatus = 'todo' | 'doing' | 'done';

export interface Goal {
  id: string;
  title: string;
  category?: string;

  /**
   * Date the goal starts.
   * For a non-recurring goal, this is its date.
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
   * Per-day state.
   *
   * Example:
   *
   * {
   *   "2026-08-24": "done",
   *   "2026-08-25": "doing"
   * }
   */
  dailyStatus: Record<string, GoalStatus>;

  createdAt: string;
}
