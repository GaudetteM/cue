import React, { useMemo } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { Goal } from '../types';

import { colors, spacing } from '../theme/theme';

import { getWeekDays, toDateKey } from '../utils/date';
import { occursOnDate } from '../utils/recurrence';

function getGoalTypesForDate(goals: Goal[], date: Date) {
  const occurringGoals = goals.filter(goal => occursOnDate(goal, date));

  return {
    hasReminder: occurringGoals.some(goal => goal.category === 'Reminder'),
    hasTask: occurringGoals.some(goal => goal.category === 'Task'),
    hasGoal: occurringGoals.some(goal => goal.category === 'Goal'),
    hasOther: occurringGoals.some(
      goal =>
        goal.category !== 'Task' &&
        goal.category !== 'Goal' &&
        goal.category !== 'Reminder',
    ),
  };
}

interface Props {
  selectedDate: Date;
  goals: Goal[];
  onSelectDate: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function WeekStrip({
  selectedDate,
  goals,
  onSelectDate,
  onPreviousWeek,
  onNextWeek,
}: Props) {
  const week = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const weekLabel = `${week[0].toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} — ${week[6].toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;

  return (
    <View>
      {/* Week navigation */}
      <View style={styles.header}>
        <Pressable
          onPress={onPreviousWeek}
          style={styles.arrowButton}
          hitSlop={8}
        >
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>

        <Text style={styles.weekLabel}>{weekLabel}</Text>

        <Pressable onPress={onNextWeek} style={styles.arrowButton} hitSlop={8}>
          <ChevronRight size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Days */}
      <View style={styles.days}>
        {week.map(date => {
          const selected = toDateKey(date) === toDateKey(selectedDate);

          const goalTypes = getGoalTypesForDate(goals, date);

          const weekday = date.toLocaleDateString(undefined, {
            weekday: 'short',
          });

          return (
            <Pressable
              key={toDateKey(date)}
              onPress={() => onSelectDate(date)}
              style={styles.dayContainer}
            >
              <Text
                style={[styles.dayName, selected && styles.selectedDayName]}
              >
                {weekday.slice(0, 1)}
              </Text>

              <View
                style={[styles.dayCircle, selected && styles.selectedCircle]}
              >
                <Text
                  style={[styles.dayNumber, selected && styles.selectedDayText]}
                >
                  {date.getDate()}
                </Text>
              </View>

              <View style={styles.dots}>
                {goalTypes.hasReminder && (
                  <View style={[styles.dot, styles.reminderDot]} />
                )}
                {goalTypes.hasTask && (
                  <View style={[styles.dot, styles.taskDot]} />
                )}
                {goalTypes.hasGoal && (
                  <View style={[styles.dot, styles.goalDot]} />
                )}
                {goalTypes.hasOther && (
                  <View style={[styles.dot, styles.otherDot]} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  weekLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dayContainer: {
    alignItems: 'center',
    width: 38,
  },

  dayName: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
  },

  selectedDayName: {
    color: colors.accent,
  },

  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
  },

  dayNumber: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  selectedDayText: {
    color: colors.background,
  },

  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 8,
    marginTop: 4,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  reminderDot: {
    backgroundColor: colors.dotReminder, // Accent color for reminders
  },

  taskDot: {
    backgroundColor: colors.dotTask, // Blue
  },

  goalDot: {
    backgroundColor: colors.dotGoal, // Green
  },

  otherDot: {
    backgroundColor: colors.dotOther, // Reminders and other categories
  },
});
