import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'outlined' | 'danger';

interface AppButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  const textColor =
    variant === 'outlined'
      ? COLORS.primary
      : COLORS.textOnPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText variant="body" color={textColor} style={styles.label}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: RADII.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  outlined: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});