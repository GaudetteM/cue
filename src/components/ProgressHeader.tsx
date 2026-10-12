import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

interface Props {
  completed: number;
  total: number;
}

export function ProgressHeader({ completed, total }: Props) {
  const progress = total === 0 ? 0 : completed / total;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.number}>
            {completed}
            <Text style={styles.total}> / {total}</Text>
          </Text>

          <Text style={styles.label}>goals complete</Text>
        </View>

        <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.progress, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  number: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },

  total: {
    color: colors.textMuted,
    fontWeight: '500',
  },

  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  percent: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },

  track: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },

  progress: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
});
