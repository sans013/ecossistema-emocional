import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { useAppTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';

export interface InputFieldProps extends TextInputProps {
  label: string;
  helperText?: string;
  errorText?: string;
  isPassword?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export function InputField({
  label,
  helperText,
  errorText,
  isPassword = false,
  leftIcon,
  secureTextEntry,
  style,
  ...rest
}: InputFieldProps) {
  const { colors, scaledFont } = useAppTheme();
  const [hidden, setHidden] = useState(isPassword);

  const inputFontSize = scaledFont(15);

  return (
    <View style={styles.container}>
      <AppText variant="cardTitle" style={styles.label}>
        {label}
      </AppText>

      <View
        style={[
          styles.inputBox,
          errorText ? styles.inputError : styles.inputNormal,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword ? hidden : secureTextEntry}
          style={[
            styles.input,
            { fontSize: inputFontSize, color: colors.textPrimary },
            style,
          ]}
          {...rest}
        />

        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            onPress={() => setHidden((prev) => !prev)}
            style={styles.toggleBtn}
            hitSlop={8}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={colors.textSecondary}
            />
            <AppText variant="caption" style={styles.toggleText}>
              {hidden ? 'Mostrar' : 'Ocultar'}
            </AppText>
          </Pressable>
        )}
      </View>

      {errorText ? (
        <AppText variant="caption" color={colors.danger} style={styles.helper}>
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: 6,
  },
  inputBox: {
    minHeight: 50,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  inputNormal: {
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  toggleText: {
    fontWeight: '600',
  },
  helper: {
    marginTop: 6,
  },
});