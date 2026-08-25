import React, { useMemo } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Check } from 'lucide-react-native';

import { Goal } from '../types/goal';
import { occursOnDate, toDateKey } from '../utils/recurrence';

import { colors, radius, spacing } from '../theme/theme';

interface Props {
  selectedDate: Date;
  goals: Goal[];
  onSelectDate: (date: Date) => void;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  // Monday = first day of week
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(12, 0, 0, 0);

  return result;
}

function isSameDay(first: Date, second: Date) {
  return toDateKey(first) === toDateKey(second);
}

export function WeekStrip({ selectedDate, goals, onSelectDate }: Props) {
  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => {
    const start = startOfWeek(selectedDate);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);

      date.setDate(start.getDate() + index);

      return date;
    });
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.month}>
        {selectedDate
          .toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })
          .toUpperCase()}
      </Text>

      <View style={styles.days}>
        {days.map(day => {
          const dateKey = toDateKey(day);

          const selected = isSameDay(day, selectedDate);

          const todaySelected = isSameDay(day, today);

          const dayGoals = goals.filter(goal => occursOnDate(goal, day));

          const completed = dayGoals.filter(
            goal => goal.dailyStatus[dateKey] === 'done',
          ).length;

          const hasGoals = dayGoals.length > 0;

          const allComplete = hasGoals && completed === dayGoals.length;

          return (
            <Pressable
              key={dateKey}
              onPress={() => onSelectDate(new Date(day))}
              style={[styles.day, selected && styles.daySelected]}
            >
              <Text style={[styles.weekday, selected && styles.selectedText]}>
                {day
                  .toLocaleDateString('en-US', {
                    weekday: 'short',
                  })
                  .slice(0, 1)}
              </Text>

              <Text style={[styles.number, selected && styles.selectedText]}>
                {day.getDate()}
              </Text>

              <View style={styles.indicator}>
                {allComplete ? (
                  <View style={styles.completeIndicator}>
                    <Check size={9} color={colors.background} strokeWidth={4} />
                  </View>
                ) : hasGoals ? (
                  <View
                    style={[
                      styles.goalIndicator,
                      completed > 0 && styles.goalIndicatorProgress,
                    ]}
                  />
                ) : (
                  <View style={styles.emptyIndicator} />
                )}
              </View>

              {todaySelected && (
                <View
                  style={[styles.todayDot, selected && styles.todayDotSelected]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  month: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },

  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  day: {
    width: 40,
    height: 68,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  daySelected: {
    backgroundColor: colors.accent,
  },

  weekday: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },

  number: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },

  selectedText: {
    color: colors.background,
  },

  indicator: {
    height: 12,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  goalIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },

  goalIndicatorProgress: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },

  completeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },

  todayDot: {
    position: 'absolute',
    bottom: 3,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },

  todayDotSelected: {
    backgroundColor: colors.background,
  },
});
