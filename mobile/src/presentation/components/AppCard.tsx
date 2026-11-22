import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { COLORS, RADII, SPACING } from '../theme/tokens';

export function AppCard({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
});