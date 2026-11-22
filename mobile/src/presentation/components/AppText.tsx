import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

type TextVariant = 'title' | 'subtitle' | 'cardTitle' | 'body' | 'caption';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

const BASE_SIZES: Record<TextVariant, number> = {
  title: 24,
  subtitle: 15,
  cardTitle: 17,
  body: 15,
  caption: 13,
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const { colors, scaledFont } = useAppTheme();
  const fontSize = scaledFont(BASE_SIZES[variant]);
  const lineHeight = Math.round(fontSize * 1.38);

  const defaultColor =
    variant === 'subtitle' || variant === 'caption' ? colors.textSecondary : colors.textPrimary;

  return (
    <Text
      style={[
        styles[variant],
        { fontSize, lineHeight, color: color ?? defaultColor },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700' },
  subtitle: { fontWeight: '400' },
  cardTitle: { fontWeight: '600' },
  body: { fontWeight: '400' },
  caption: { fontWeight: '500' },
});