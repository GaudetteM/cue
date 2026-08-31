import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Goal, GoalRecurrence, GoalStatus } from '../types';

interface GoalStore {
  goals: Goal[];

  addGoal: (
    title: string,
    date: string,
    category?: string,
    recurrence?: GoalRecurrence,
    recurrenceDays?: number[],
  ) => void;

  updateGoal: (id: string, updates: Partial<Goal>) => void;

  setGoalStatus: (id: string, date: string, status: GoalStatus) => void;

  deleteGoal: (id: string) => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    set => ({
      goals: [],

      addGoal: (title, date, category, recurrence = 'none', recurrenceDays) =>
        set(state => ({
          goals: [
            ...state.goals,
            {
              id: `${Date.now()}`,
              title,
              date,
              category,
              recurrence,
              recurrenceDays,
              dailyStatus: {},
              createdAt: new Date().toISOString(),
              reminderEnabled: false,
              reminderTime: '12:00',
            },
          ],
        })),

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
