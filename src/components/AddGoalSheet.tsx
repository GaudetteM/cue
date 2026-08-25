import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { X } from 'lucide-react-native';

import { colors, radius, spacing } from '../theme/theme';
import { useGoalStore } from '../store/goalStore';
import { Goal } from '../types/goal';
import { GoalRecurrence } from '../types/goalRecurrence';

interface Props {
  visible: boolean;
  onClose: () => void;
  date: string;
  goal: Goal | null;
}

const categories = ['Contract', 'Personal', 'Other'];

const weekdays = [
  { value: 1, label: 'M' },
  { value: 2, label: 'T' },
  { value: 3, label: 'W' },
  { value: 4, label: 'T' },
  { value: 5, label: 'F' },
  { value: 6, label: 'S' },
  { value: 7, label: 'S' },
];

const monthDays = Array.from({ length: 31 }, (_, index) => index + 1);

export function AddGoalSheet({ visible, onClose, date, goal }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>();

  const [recurrence, setRecurrence] = useState<GoalRecurrence>('none');

  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);

  const inputRef = useRef<TextInput>(null);

  const addGoal = useGoalStore(state => state.addGoal);

  const updateGoal = useGoalStore(state => state.updateGoal);

  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const sheetTranslateY = useRef(new Animated.Value(500)).current;

  const isEditing = goal !== null;

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(goal?.title ?? '');
    setCategory(goal?.category);
    setRecurrence(goal?.recurrence ?? 'none');
    setRecurrenceDays(goal?.recurrenceDays ?? []);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
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

    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [visible, goal, backdropOpacity, sheetTranslateY]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(sheetTranslateY, {
        toValue: 500,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleRecurrenceChange = (value: GoalRecurrence) => {
    setRecurrence(value);

    if (value === 'none') {
      setRecurrenceDays([]);
      return;
    }

    if (value === 'daily') {
      setRecurrenceDays([]);
      return;
    }

    if (value === 'weekly' && recurrenceDays.length === 0) {
      const currentDay = new Date(date).getDay();

      const mondayBased = currentDay === 0 ? 7 : currentDay;

      setRecurrenceDays([mondayBased]);

      return;
    }

    if (value === 'monthly' && recurrenceDays.length === 0) {
      const day = new Date(`${date}T12:00:00`).getDate();

      setRecurrenceDays([day]);
    }
  };

  const toggleRecurrenceDay = (day: number) => {
    setRecurrenceDays(current =>
      current.includes(day)
        ? current.filter(item => item !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    if (recurrence === 'weekly' && recurrenceDays.length === 0) {
      return;
    }

    if (recurrence === 'monthly' && recurrenceDays.length === 0) {
      return;
    }

    if (isEditing) {
      updateGoal(goal.id, {
        title: trimmedTitle,
        category,
        recurrence,
        recurrenceDays,
      });
    } else {
      addGoal(trimmedTitle, date, category, recurrence, recurrenceDays);
    }

    handleClose();
  };

  const recurrenceOptions: {
    value: GoalRecurrence;
    label: string;
  }[] = [
    {
      value: 'none',
      label: 'Never',
    },
    {
      value: 'daily',
      label: 'Daily',
    },
    {
      value: 'weekly',
      label: 'Weekly',
    },
    {
      value: 'monthly',
      label: 'Monthly',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.backdropContainer,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable style={styles.backdrop} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheetWrapper,
            {
              transform: [
                {
                  translateY: sheetTranslateY,
                },
              ],
            },
          ]}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.heading}>
                {isEditing ? 'Edit goal' : 'New goal'}
              </Text>

              <Pressable onPress={handleClose} style={styles.closeButton}>
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.label}>WHAT DO YOU WANT TO GET DONE?</Text>

            <TextInput
              ref={inputRef}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Send 3 outreach emails"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            <Text style={styles.label}>CATEGORY</Text>

            <View style={styles.categories}>
              {categories.map(item => {
                const selected = category === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(selected ? undefined : item)}
                    style={[
                      styles.category,
                      selected && styles.categorySelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>REPEAT</Text>

            <View style={styles.recurrenceOptions}>
              {recurrenceOptions.map(option => {
                const selected = recurrence === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleRecurrenceChange(option.value)}
                    style={[
                      styles.recurrenceOption,
                      selected && styles.recurrenceOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.recurrenceText,
                        selected && styles.recurrenceTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {recurrence === 'weekly' && (
              <View style={styles.repeatSection}>
                <Text style={styles.repeatHint}>REPEAT ON</Text>

                <View style={styles.dayRow}>
                  {weekdays.map(day => {
                    const selected = recurrenceDays.includes(day.value);

                    return (
                      <Pressable
                        key={day.value}
                        onPress={() => toggleRecurrenceDay(day.value)}
                        style={[
                          styles.dayButton,
                          selected && styles.dayButtonSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            selected && styles.dayTextSelected,
                          ]}
                        >
                          {day.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {recurrence === 'monthly' && (
              <View style={styles.repeatSection}>
                <Text style={styles.repeatHint}>REPEAT ON</Text>

                <View style={styles.monthGrid}>
                  {monthDays.map(day => {
                    const selected = recurrenceDays.includes(day);

                    return (
                      <Pressable
                        key={day}
                        onPress={() => toggleRecurrenceDay(day)}
                        style={[
                          styles.monthDay,
                          selected && styles.monthDaySelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.monthDayText,
                            selected && styles.monthDayTextSelected,
                          ]}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <Pressable
              onPress={handleSave}
              disabled={
                !title.trim() ||
                (recurrence === 'weekly' && recurrenceDays.length === 0) ||
                (recurrence === 'monthly' && recurrenceDays.length === 0)
              }
              style={[
                styles.saveButton,
                (!title.trim() ||
                  (recurrence === 'weekly' && recurrenceDays.length === 0) ||
                  (recurrence === 'monthly' && recurrenceDays.length === 0)) &&
                  styles.saveButtonDisabled,
              ]}
            >
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Save changes' : 'Add goal'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdropContainer: {
    ...StyleSheet.absoluteFill,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  sheetWrapper: {
    maxHeight: '92%',
  },

  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },

  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },

  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
    marginBottom: spacing.xl,
  },

  categories: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  category: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },

  categorySelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  categoryText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  categoryTextSelected: {
    color: colors.background,
  },

  recurrenceOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },

  recurrenceOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 10,
  },

  recurrenceOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  recurrenceText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  recurrenceTextSelected: {
    color: colors.background,
  },

  repeatSection: {
    marginBottom: spacing.lg,
  },

  repeatHint: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },

  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dayButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  dayText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },

  dayTextSelected: {
    color: colors.background,
  },

  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  monthDay: {
    width: 36,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthDaySelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  monthDayText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },

  monthDayTextSelected: {
    color: colors.background,
  },

  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 16,
  },

  saveButtonDisabled: {
    opacity: 0.35,
  },

  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
});
