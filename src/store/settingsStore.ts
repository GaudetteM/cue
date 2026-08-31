import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AppSettings } from '../types';

interface SettingsStore {
  settings: AppSettings;

  setDailyReminderEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
}

const defaultSettings: AppSettings = {
  dailyReminderEnabled: true,
  dailyReminderTime: '18:00',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      settings: defaultSettings,

      setDailyReminderEnabled: enabled =>
        set(state => ({
          settings: {
            ...state.settings,
            dailyReminderEnabled: enabled,
          },
        })),

      setDailyReminderTime: time =>
        set(state => ({
          settings: {
            ...state.settings,
            dailyReminderTime: time,
          },
        })),
    }),
    {
      name: 'cue-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
