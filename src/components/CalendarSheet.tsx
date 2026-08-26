import React, { useMemo, useState } from 'react';

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';

import { Goal } from '../types/goal';

import { colors, radius, spacing } from '../theme/theme';
import { getWeekday, isSameDay } from '../utils/date';

interface Props {
  visible: boolean;
  selectedDate: Date;
  goals: Goal[];
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

/**
 * Calculates the number of days in a given month and year.
 * @param year The year of the month.
 * @param month The month (0-11).
 * @returns The number of days in the month.
 */
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Gets the first day of the week for a given month and year.
 * @param year The year of the month.
 * @param month The month (0-11).
 * @returns The first day of the week for the given month, with Sunday as 0.
 */
function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

/**
 * Determines if a goal occurs on a given date, taking into account its recurrence pattern.
 * @param goal The goal to check.
 * @param date The date to check against.
 * @returns True if the goal occurs on the given date, false otherwise.
 */
function occursOnDate(goal: Goal, date: Date) {
  const goalDate = new Date(`${goal.date}T12:00:00`);

  if (
    date <
    new Date(goalDate.getFullYear(), goalDate.getMonth(), goalDate.getDate())
  ) {
    return false;
  }

  if (goal.recurrence === 'none') {
    return isSameDay(goalDate, date);
  }

  if (goal.recurrence === 'daily') {
    return true;
  }

  if (goal.recurrence === 'weekly') {
    const day = getWeekday(date);

    return goal.recurrenceDays?.includes(day) ?? false;
  }

  if (goal.recurrence === 'monthly') {
    return goal.recurrenceDays?.includes(date.getDate()) ?? false;
  }

  return false;
}

export function CalendarSheet({
  visible,
  selectedDate,
  goals,
  onSelectDate,
  onClose,
}: Props) {
  const [displayMonth, setDisplayMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const year = displayMonth.getFullYear();

  const month = displayMonth.getMonth();

  const daysInMonth = getDaysInMonth(year, month);

  const firstDay = getFirstDayOfMonth(year, month);

  const monthName = displayMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const cells = useMemo(() => {
    const result: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day);
    }

    return result;
  }, [firstDay, daysInMonth]);

  const goPreviousMonth = () => {
    setDisplayMonth(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setDisplayMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const date = new Date(year, month, day);

    onSelectDate(date);
    onClose();
  };

  const handleToday = () => {
    const today = new Date();

    setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1));

    onSelectDate(today);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>PLAN AHEAD</Text>

              <Text style={styles.title}>Calendar</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Month navigation */}
          <View style={styles.monthHeader}>
            <Pressable onPress={goPreviousMonth} style={styles.navButton}>
              <ChevronLeft size={20} color={colors.text} />
            </Pressable>

            <Text style={styles.monthTitle}>{monthName}</Text>

            <Pressable onPress={goNextMonth} style={styles.navButton}>
              <ChevronRight size={20} color={colors.text} />
            </Pressable>
          </View>

          {/* Weekday headings */}
          <View style={styles.weekdays}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekday}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar */}
          <View style={styles.calendar}>
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const date = new Date(year, month, day);

              const selected = isSameDay(date, selectedDate);

              const today = isSameDay(date, new Date());

              const goalCount = goals.filter(goal =>
                occursOnDate(goal, date),
              ).length;

              return (
                <Pressable
                  key={day}
                  onPress={() => handleSelectDay(day)}
                  style={styles.dayCell}
                >
                  <View
                    style={[
                      styles.day,
                      selected && styles.selectedDay,
                      today && !selected && styles.todayDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.selectedDayText,
                        today && !selected && styles.todayDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>

                  {goalCount > 0 && (
                    <View style={styles.goalDots}>
                      {Array.from({
                        length: Math.min(goalCount, 3),
                      }).map((_, dotIndex) => (
                        <View key={dotIndex} style={styles.goalDot} />
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Footer */}
          <Pressable onPress={handleToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>TODAY</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 3,
  },

  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  monthTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },

  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekdays: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  weekday: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },

  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayCell: {
    width: '14.2857%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },

  day: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedDay: {
    backgroundColor: colors.accent,
  },

  todayDay: {
    borderWidth: 1,
    borderColor: colors.accent,
  },

  dayText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  selectedDayText: {
    color: colors.background,
    fontWeight: '800',
  },

  todayDayText: {
    color: colors.accent,
  },

  goalDots: {
    flexDirection: 'row',
    gap: 2,
    height: 4,
    marginTop: 1,
  },

  goalDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.accent,
  },

  todayButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: 11,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
  },

  todayButtonText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
