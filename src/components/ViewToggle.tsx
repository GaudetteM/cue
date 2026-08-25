import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { List, Columns3 } from 'lucide-react-native';

import { colors, radius, spacing } from '../theme/theme';

export type ViewMode = 'list' | 'board';

interface Props {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange('list')}
        style={[styles.option, value === 'list' && styles.activeOption]}
      >
        <List
          size={15}
          color={value === 'list' ? colors.text : colors.textMuted}
        />

        <Text style={[styles.label, value === 'list' && styles.activeLabel]}>
          LIST
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange('board')}
        style={[styles.option, value === 'board' && styles.activeOption]}
      >
        <Columns3
          size={15}
          color={value === 'board' ? colors.text : colors.textMuted}
        />

        <Text style={[styles.label, value === 'board' && styles.activeLabel]}>
          BOARD
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 82,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },

  activeOption: {
    backgroundColor: colors.surfaceElevated,
  },

  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  activeLabel: {
    color: colors.text,
  },
});
