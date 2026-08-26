import React, { useMemo, useState } from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Plus } from 'lucide-react-native';

import { GoalCard } from '../components/GoalCard';
import { WeekStrip } from '../components/WeekStrip';
import { AddGoalSheet } from '../components/AddGoalSheet';

import { ViewMode, ViewToggle } from '../components/ViewToggle';
import { GoalBoard } from '../components/GoalBoard';

import { useGoalStore } from '../store/goalStore';
import { Goal } from '../types/goal';

import { colors, radius, spacing } from '../theme/theme';

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function occursOnDate(goal: Goal, date: Date) {
  const goalDate = new Date(`${goal.date}T12:00:00`);

  const targetKey = toDateKey(date);
  const goalKey = toDateKey(goalDate);

  if (goal.recurrence === 'none') {
    return goalKey === targetKey;
  }

  if (date < goalDate) {
    return false;
  }

  if (goal.recurrence === 'daily') {
    return true;
  }

  if (goal.recurrence === 'weekly') {
    const day = date.getDay() === 0 ? 7 : date.getDay();

    return goal.recurrenceDays?.includes(day) ?? false;
  }

  if (goal.recurrence === 'monthly') {
    return goal.recurrenceDays?.includes(date.getDate()) ?? false;
  }

  return false;
}

export function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [sheetVisible, setSheetVisible] = useState(false);

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const goals = useGoalStore(state => state.goals);

  const setGoalStatus = useGoalStore(state => state.setGoalStatus);

  const deleteGoal = useGoalStore(state => state.deleteGoal);

  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const todaysGoals = useMemo(
    () => goals.filter(goal => occursOnDate(goal, selectedDate)),
    [goals, selectedDate],
  );

  const completedCount = todaysGoals.filter(
    goal => goal.dailyStatus[dateKey] === 'done',
  ).length;

  const doingCount = todaysGoals.filter(
    goal => goal.dailyStatus[dateKey] === 'doing',
  ).length;

  const progress =
    todaysGoals.length === 0 ? 0 : completedCount / todaysGoals.length;

  const handleGoalPress = (goal: Goal) => {
    const currentStatus = goal.dailyStatus[dateKey] ?? 'todo';

    const nextStatus =
      currentStatus === 'todo'
        ? 'doing'
        : currentStatus === 'doing'
        ? 'done'
        : 'todo';

    setGoalStatus(goal.id, dateKey, nextStatus);
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setSheetVisible(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setSheetVisible(true);
  };

  const handleCloseSheet = () => {
    setSheetVisible(false);
    setEditingGoal(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>CUE</Text>

            <Text style={styles.subtitle}>KEEP MOVING.</Text>
          </View>

          <Pressable onPress={handleAddGoal} style={styles.addButton}>
            <Plus size={22} color={colors.background} strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* Week selector */}
        <WeekStrip
          selectedDate={selectedDate}
          goals={goals}
          onSelectDate={setSelectedDate}
        />

        <ViewToggle value={viewMode} onChange={setViewMode} />

        {/* Selected date */}
        <Text style={styles.selectedDate}>{formatDate(selectedDate)}</Text>

        {/* Progress */}
        {todaysGoals.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>TODAY</Text>

                <Text style={styles.progressCount}>
                  {completedCount} OF {todaysGoals.length} COMPLETE
                </Text>
              </View>

              <Text style={styles.progressPercent}>
                {Math.round(progress * 100)}%
              </Text>
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

            {doingCount > 0 && (
              <Text style={styles.doingCount}>
                {doingCount} {doingCount === 1 ? 'goal' : 'goals'} in progress
              </Text>
            )}
          </View>
        )}

        {viewMode === 'board' ? (
          <GoalBoard
            goals={todaysGoals}
            dateKey={dateKey}
            onGoalPressed={handleGoalPress}
          />
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {todaysGoals.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Plus size={24} color={colors.accent} />
                </View>

                <Text style={styles.emptyTitle}>Nothing on your cue</Text>

                <Text style={styles.emptyText}>
                  Add something you want to get done today.
                </Text>

                <Pressable onPress={handleAddGoal} style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Add a goal</Text>
                </Pressable>
              </View>
            ) : (
              todaysGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  status={goal.dailyStatus[dateKey] ?? 'todo'}
                  onPress={() => handleGoalPress(goal)}
                  onEdit={() => handleEditGoal(goal)}
                  onDelete={() => deleteGoal(goal.id)}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>

      <AddGoalSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
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

  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },

  logo: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 1,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedDate: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  progressTitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 3,
  },

  progressCount: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  progressPercent: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '800',
  },

  progressTrack: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },

  doingCount: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 120,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  emptyButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },

  emptyButtonText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});
