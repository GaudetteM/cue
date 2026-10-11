import React, { useRef } from 'react';

import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Check, Circle, Clock3, Pencil, Trash2 } from 'lucide-react-native';

import { Goal, GoalStatus } from '../types';

import { colors, radius, spacing } from '../theme/theme';

interface Props {
  goal: Goal;
  status: GoalStatus;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ACTION_WIDTH = 152;

export function GoalCard({ goal, status, onPress, onEdit, onDelete }: Props) {
  const isDoing = status === 'doing';
  const isDone = status === 'done';

  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  const gestureStartX = useRef(0);

  const animateTo = (position: number) => {
    Animated.spring(translateX, {
      toValue: position,
      useNativeDriver: true,
      bounciness: 0,
    }).start();

    isOpen.current = position !== 0;
  };

  const resetPosition = () => animateTo(0);
  const openActions = () => animateTo(-ACTION_WIDTH);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy),

      onPanResponderGrant: () => {
        translateX.stopAnimation();

        gestureStartX.current = isOpen.current ? -ACTION_WIDTH : 0;
      },

      onPanResponderMove: (_, gesture) => {
        const nextX = Math.min(
          0,
          Math.max(-ACTION_WIDTH, gestureStartX.current + gesture.dx),
        );

        translateX.setValue(nextX);
      },

      onPanResponderRelease: (_, gesture) => {
        const finalX = gestureStartX.current + gesture.dx;

        if (finalX < -ACTION_WIDTH / 2) {
          openActions();
        } else {
          resetPosition();
        }
      },

      onPanResponderTerminate: () => {
        animateTo(isOpen.current ? -ACTION_WIDTH : 0);
      },
    }),
  ).current;

  return (
    <View style={styles.wrapper}>
      {/* Actions behind the card */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            resetPosition();
            onEdit();
          }}
          style={styles.editAction}
        >
          <Pencil size={19} color={colors.text} />

          <Text style={styles.actionText}>Edit</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            resetPosition();
            onDelete();
          }}
          style={styles.deleteAction}
        >
          <Trash2 size={19} color={colors.text} />

          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>

      {/* Card */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              {
                translateX,
              },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View
            style={[
              styles.status,
              isDoing && styles.statusDoing,
              isDone && styles.statusDone,
            ]}
          >
            {isDone ? (
              <Check size={17} color={colors.background} strokeWidth={3} />
            ) : isDoing ? (
              <Clock3 size={16} color={colors.accent} strokeWidth={2.5} />
            ) : (
              <Circle size={17} color={colors.textMuted} strokeWidth={2} />
            )}
          </View>

          <View style={styles.content}>
            <Text
              style={[styles.title, isDone && styles.titleDone]}
              numberOfLines={2}
            >
              {goal.title}
            </Text>

            {goal.category && (
              <Text style={styles.category}>{goal.category}</Text>
            )}

            {isDoing && <Text style={styles.doingLabel}>IN PROGRESS</Text>}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
  },

  actions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    flexDirection: 'row',
    borderRadius: radius.md,
    overflow: 'hidden',
  },

  editAction: {
    width: ACTION_WIDTH / 2,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  deleteAction: {
    width: ACTION_WIDTH / 2,
    backgroundColor: '#8B3A3A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  actionText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },

  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  pressed: {
    opacity: 0.7,
  },

  status: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  statusDoing: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },

  statusDone: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },

  content: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },

  titleDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },

  category: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 5,
  },

  doingLabel: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 5,
  },
});
