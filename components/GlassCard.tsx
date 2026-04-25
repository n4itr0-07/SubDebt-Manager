import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../constants/colors';

interface GlassCardProps extends ViewProps {
  children?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
  },
});
