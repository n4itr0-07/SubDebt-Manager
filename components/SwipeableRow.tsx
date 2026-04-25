import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { spacing } from '../constants/typography';

interface SwipeableRowProps {
  children?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({ 
  children, 
  onEdit, 
  onDelete,
}) => {
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.actionsContainer}>
        {onEdit && (
          <Animated.View style={[styles.action, styles.editAction, { transform: [{ translateX: trans }] }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onEdit();
              }}
            >
              <Ionicons name="create-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        {onDelete && (
          <Animated.View style={[styles.action, styles.deleteAction, { transform: [{ translateX: trans }] }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onDelete();
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    width: 140,
    marginRight: spacing.base,
  },
  action: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: spacing.xs,
  },
  editAction: {
    backgroundColor: 'rgba(79,195,247,0.3)',
  },
  deleteAction: {
    backgroundColor: 'rgba(239,83,80,0.3)',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});
