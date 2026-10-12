import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Goal } from '../types';
import { colors, radius, spacing } from '../theme/theme';
import {
  doesWeekStartOnSunday,
  getWeekdayLabels,
  isSameDay,
} from '../utils/date';
import { occursOnDate } from '../utils/recurrence';

interface Props {
  visible: boolean;
  selectedDate: Date;
  goals: Goal[];
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

const SHEET_HEIGHT = Dimensions.get('window').height;
const ANIMATION_DURATION = 220;

/**
 * Returns the number of days in a given month.
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns the number of leading empty cells needed
 * before the first day of a month.
 */
function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();

  if (doesWeekStartOnSunday()) {
    return day;
  }

  return day === 0 ? 6 : day - 1;
}

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

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = displayMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  /**
   * Builds the calendar cells for the current month,
   * including leading empty cells.
   */
  const cells = useMemo(() => {
    const result: (number | null)[] = [];

    for (let index = 0; index < firstDay; index++) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day);
    }

    return result;
  }, [firstDay, daysInMonth]);

  /**
   * Opens the sheet with the backdrop fading in
   * while the sheet slides upward.
   */
  useEffect(() => {
    if (!visible) {
      return;
    }

    setDisplayMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );

    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(SHEET_HEIGHT);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, selectedDate, backdropOpacity, sheetTranslateY]);

  /**
   * Closes the sheet after its exit animation completes.
   */
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const goPreviousMonth = () => {
    setDisplayMonth(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setDisplayMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const date = new Date(year, month, day);

    onSelectDate(date);
    handleClose();
  };

  const handleToday = () => {
    const today = new Date();

    setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1));

    onSelectDate(today);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        />

        <Pressable style={styles.backdropPressable} onPress={handleClose} />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: sheetTranslateY,
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>PLAN AHEAD</Text>

              <Text style={styles.title}>Calendar</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close calendar"
              onPress={handleClose}
              style={styles.closeButton}
            >
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Month navigation */}
          <View style={styles.monthHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={goPreviousMonth}
              style={styles.navButton}
            >
              <ChevronLeft size={20} color={colors.text} />
            </Pressable>

            <Text style={styles.monthTitle}>{monthName}</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={goNextMonth}
              style={styles.navButton}
            >
              <ChevronRight size={20} color={colors.text} />
            </Pressable>
          </View>

          {/* Weekday headings */}
          <View style={styles.weekdays}>
            {getWeekdayLabels().map((day, index) => (
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

              const goalTypes = getGoalTypesForDate(goals, date);

              return (
                <Pressable
                  key={day}
                  accessibilityRole="button"
                  accessibilityLabel={date.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  accessibilityState={{ selected }}
                  accessibilityHint="Colored dots indicate scheduled item categories."
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

                  <View style={styles.goalDots}>
                    {goalTypes.hasReminder && (
                      <View style={styles.reminderDot} />
                    )}
                    {goalTypes.hasTask && <View style={styles.taskDot} />}

                    {goalTypes.hasGoal && <View style={styles.goalDot} />}

                    {goalTypes.hasOther && <View style={styles.otherDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Footer */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to today"
            onPress={handleToday}
            style={styles.todayButton}
          >
            <Text style={styles.todayButtonText}>TODAY</Text>
          </Pressable>
        </Animated.View>
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

  backdropPressable: {
    ...StyleSheet.absoluteFill,
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

  reminderDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.dotReminder,
  },

  goalDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.dotGoal,
  },

  taskDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.dotTask,
  },

  otherDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.dotOther,
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
