import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppText } from './AppText';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  onBack: () => void;
}

export function ScreenHeader({ title, subtitle, badgeText, onBack }: ScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={8}
        >
          <View style={styles.backCircle}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </View>
          <AppText variant="cardTitle">Voltar</AppText>
        </Pressable>

        {badgeText && (
          <View style={styles.badge}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primaryDark} />
            <AppText variant="caption" color={COLORS.primaryDark} style={styles.badgeText}>
              {badgeText}
            </AppText>
          </View>
        )}
      </View>

      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>
      {subtitle && <AppText variant="subtitle">{subtitle}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontWeight: '600',
  },
  title: {
    marginBottom: 4,
  },
});