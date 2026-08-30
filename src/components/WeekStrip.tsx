import React, { useMemo } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { Goal } from '../types';

import { colors, spacing } from '../theme/theme';

import { getWeekDays, toDateKey } from '../utils/date';
import { occursOnDate } from '../utils/recurrence';

/**
 * Determines whether any goal occurs on the given date.
 */
function getHasGoals(goals: Goal[], date: Date): boolean {
  return goals.some(goal => occursOnDate(goal, date));
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

          const hasGoals = getHasGoals(goals, date);

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

              {hasGoals && <View style={styles.goalDot} />}
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

  goalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
});
