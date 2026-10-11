import React from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Goal, GoalStatus } from '../types';

import { colors, radius, spacing } from '../theme/theme';

interface Props {
  goals: Goal[];
  dateKey: string;
  onGoalPressed: (goal: Goal) => void;
}

const columns: {
  status: GoalStatus;
  label: string;
}[] = [
  {
    status: 'todo',
    label: 'TODO',
  },
  {
    status: 'doing',
    label: 'DOING',
  },
  {
    status: 'done',
    label: 'DONE',
  },
];

export function GoalBoard({ goals, dateKey, onGoalPressed }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {columns.map(column => {
        const columnGoals = goals.filter(
          goal => (goal.dailyStatus[dateKey] ?? 'todo') === column.status,
        );

        return (
          <View key={column.status} style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>{column.label}</Text>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>{columnGoals.length}</Text>
              </View>
            </View>

            {columnGoals.length === 0 ? (
              <View style={styles.emptyColumn}>
                <Text style={styles.emptyText}>Nothing here</Text>
              </View>
            ) : (
              columnGoals.map(goal => (
                <Pressable
                  key={goal.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${goal.title}, ${goal.category ?? 'Uncategorized'}, ${column.status}`}
                  accessibilityHint="Double tap to move this item to the next status."
                  onPress={() => onGoalPressed(goal)}
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <Text style={styles.cardTitle} numberOfLines={4}>
                    {goal.title}
                  </Text>

                  {goal.category && (
                    <Text style={styles.category}>{goal.category}</Text>
                  )}
                </Pressable>
              ))
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 120,
    gap: spacing.sm,
  },

  column: {
    width: 260,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },

  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginBottom: 4,
  },

  columnTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },

  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 82,
  },

  cardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  cardPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.98 }],
  },

  category: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 10,
  },

  emptyColumn: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
