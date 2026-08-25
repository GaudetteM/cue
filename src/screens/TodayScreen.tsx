import React, { useMemo, useState } from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';

import { AddGoalSheet } from '../components/AddGoalSheet';
import { GoalCard } from '../components/GoalCard';

import { useGoalStore } from '../store/goalStore';

import { Goal } from '../types/goal';

import { occursOnDate, toDateKey } from '../utils/recurrence';

import { colors, radius, spacing } from '../theme/theme';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showAddGoal, setShowAddGoal] = useState(false);

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const allGoals = useGoalStore(state => state.goals);

  const toggleGoalCompletion = useGoalStore(
    state => state.toggleGoalCompletion,
  );

  const deleteGoal = useGoalStore(state => state.deleteGoal);

  const dateKey = toDateKey(selectedDate);

  const goals = useMemo(
    () => allGoals.filter(goal => occursOnDate(goal, selectedDate)),
    [allGoals, selectedDate],
  );

  const completedCount = goals.filter(goal =>
    goal.completedDates.includes(dateKey),
  ).length;

  const changeDate = (amount: number) => {
    setSelectedDate(current => {
      const next = new Date(current);

      next.setDate(next.getDate() + amount);

      return next;
    });
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setShowAddGoal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowAddGoal(true);
  };

  const handleCloseEditor = () => {
    setShowAddGoal(false);
    setEditingGoal(null);
  };

  const handleGoalPress = (goal: Goal) => {
    toggleGoalCompletion(goal.id, dateKey);
  };

  const progress = goals.length > 0 ? completedCount / goals.length : 0;

  const isToday = toDateKey(new Date()) === dateKey;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>CUE</Text>

          <Text style={styles.subtitle}>KEEP MOVING.</Text>
        </View>

        <View style={styles.dateNavigation}>
          <Pressable onPress={() => changeDate(-1)} style={styles.dateButton}>
            <ChevronLeft size={22} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.dateCenter}>
            <Text style={styles.date}>{formatDate(selectedDate)}</Text>

            {isToday && <Text style={styles.todayLabel}>TODAY</Text>}
          </View>

          <Pressable onPress={() => changeDate(1)} style={styles.dateButton}>
            <ChevronRight size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {completedCount} OF {goals.length} COMPLETE
            </Text>

            {goals.length > 0 && (
              <Text style={styles.progressPercent}>
                {Math.round(progress * 100)}%
              </Text>
            )}
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.goalsSection}>
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nothing on the cue.</Text>

              <Text style={styles.emptyText}>
                Add something you want to get done.
              </Text>
            </View>
          ) : (
            goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                completed={goal.completedDates.includes(dateKey)}
                onPress={() => handleGoalPress(goal)}
                onEdit={() => handleEditGoal(goal)}
                onDelete={() => deleteGoal(goal.id)}
              />
            ))
          )}
        </View>

        <Pressable
          onPress={handleAddGoal}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Plus size={20} color={colors.background} strokeWidth={2.5} />

          <Text style={styles.addButtonText}>Add goal</Text>
        </Pressable>
      </ScrollView>

      <AddGoalSheet
        visible={showAddGoal}
        onClose={handleCloseEditor}
        date={dateKey}
        goal={editingGoal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  logo: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 4,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },

  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },

  dateButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateCenter: {
    alignItems: 'center',
  },

  date: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
  },

  todayLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  progressSection: {
    marginBottom: spacing.xl,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  progressText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  progressPercent: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },

  goalsSection: {
    flex: 1,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 16,
    marginTop: spacing.lg,
  },

  addButtonPressed: {
    opacity: 0.75,
  },

  addButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
});
