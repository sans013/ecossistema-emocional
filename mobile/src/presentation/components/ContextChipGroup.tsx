import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CONTEXT_CATALOG, ContextSlug } from '../../domain/entities/EmotionalRecord';
import { COLORS, RADII } from '../theme/tokens';
import { useAppTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';

interface ContextChipGroupProps {
  selected: ContextSlug[];
  onToggle: (slug: ContextSlug) => void;
  showLabels?: boolean;
}

const CONTEXT_ICON_MAP: Record<
  (typeof CONTEXT_CATALOG)[number]['iconKey'],
  keyof typeof Ionicons.glyphMap
> = {
  sleep: 'bed-outline',
  study: 'book-outline',
  work: 'briefcase-outline',
  rest: 'cafe-outline',
  relations: 'people-outline',
};

export function ContextChipGroup({
  selected,
  onToggle,
  showLabels = true,
}: ContextChipGroupProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrap}>
      {CONTEXT_CATALOG.map((ctx) => {
        const active = selected.includes(ctx.slug);
        return (
          <Pressable
            key={ctx.slug}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            accessibilityLabel={ctx.nome}
            onPress={() => onToggle(ctx.slug)}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
          >
            <Ionicons
              name={CONTEXT_ICON_MAP[ctx.iconKey]}
              size={16}
              color={active ? COLORS.textOnPrimary : colors.textPrimary}
            />
            {showLabels && (
              <AppText
                variant="caption"
                color={active ? COLORS.textOnPrimary : colors.textPrimary}
                style={styles.chipLabel}
              >
                {ctx.nome}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipLabel: {
    fontWeight: '600',
  },
});