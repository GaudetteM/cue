import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Goal } from '../types/goal';
import { GoalRecurrence } from '../types/goalRecurrence';

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

  toggleGoalCompletion: (id: string, date: string) => void;

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
              completedDates: [],
              createdAt: new Date().toISOString(),
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

      toggleGoalCompletion: (id, date) =>
        set(state => ({
          goals: state.goals.map(goal => {
            if (goal.id !== id) {
              return goal;
            }

            const completedDates = goal.completedDates ?? [];

            const completed = completedDates.includes(date);

            return {
              ...goal,
              completedDates: completed
                ? completedDates.filter(completedDate => completedDate !== date)
                : [...completedDates, date],
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
