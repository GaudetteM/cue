import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Goal, GoalRecurrence, GoalStatus } from '../types';
import { scheduleGoalReminder } from '../services/NotificationScheduler';

interface GoalStore {
  goals: Goal[];

  addGoal: (
    title: string,
    date: string,
    category?: string,
    recurrence?: GoalRecurrence,
    recurrenceDays?: number[],
    reminderEnabled?: boolean,
    reminderTime?: string,
  ) => void;

  updateGoal: (id: string, updates: Partial<Goal>) => void;

  setGoalStatus: (id: string, date: string, status: GoalStatus) => void;

  deleteGoal: (id: string) => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    set => ({
      goals: [],

      addGoal: (
        title,
        date,
        category,
        recurrence = 'none',
        recurrenceDays,
        reminderEnabled = false,
        reminderTime = '12:00',
      ) => {
        const goal: Goal = {
          id: `${Date.now()}`,
          title,
          date,
          category,
          recurrence,
          recurrenceDays,
          dailyStatus: {},
          createdAt: new Date().toISOString(),
          reminderEnabled,
          reminderTime,
        };

        set(state => ({
          goals: [...state.goals, goal],
        }));

        scheduleGoalReminder(goal);
      },

      updateGoal: (id, updates) =>
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === id
              ? {
                  ...goal,
                  ...updates,
                }
              : goal,
          ),
        })),

      setGoalStatus: (id, date, status) =>
        set(state => ({
          goals: state.goals.map(goal => {
            if (goal.id !== id) {
              return goal;
            }

            return {
              ...goal,

              dailyStatus: {
                ...goal.dailyStatus,
                [date]: status,
              },
            };
          }),
        })),

      deleteGoal: id =>
        set(state => ({
          goals: state.goals.filter(goal => goal.id !== id),
        })),
    }),

    {
      name: 'cue-goals',

      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
