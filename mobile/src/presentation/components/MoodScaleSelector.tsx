import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { DEFAULT_MOOD_CATALOG, getMoodDefinition } from '../../domain/entities/MoodCatalog';
import { COLORS, RADII } from '../theme/tokens';
import { AppText } from './AppText';
import { MoodGlyph } from './MoodGlyph';

interface MoodScaleSelectorProps {
  selectedLevel: number | null;
  onSelectLevel: (level: number) => void;
  customLabels?: Record<string, string>;
  showLabels?: boolean;
  compact?: boolean;
}

export function MoodScaleSelector({
  selectedLevel,
  onSelectLevel,
  customLabels,
  showLabels = true,
  compact = false,
}: MoodScaleSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {DEFAULT_MOOD_CATALOG.map((baseMood) => {
        const mood = getMoodDefinition(baseMood.level, customLabels);
        const isSelected = selectedLevel === mood.level;

        return (
          <Pressable
            key={mood.level}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${mood.displayLabel}, ${mood.climateLabel}`}
            onPress={() => onSelectLevel(mood.level)}
            style={[
              styles.optionCard,
              compact && styles.optionCardCompact,
              isSelected && {
                backgroundColor: mood.softColor,
                borderColor: mood.accentColor,
                borderWidth: 1.5,
              },
            ]}
          >
            <MoodGlyph
              iconKey={mood.iconKey}
              softColor={isSelected ? COLORS.surface : mood.softColor}
              accentColor={mood.accentColor}
              size={compact ? 'sm' : 'md'}
              label={mood.displayLabel}
              sublabel={mood.climateLabel}
              showLabels={showLabels}
            />
            {isSelected && (
              <AppText variant="caption" color={mood.accentColor} style={styles.selectedTag}>
                Selecionado
              </AppText>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    paddingRight: 4,
  },
  optionCard: {
    width: 82,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 112,
  },
  optionCardCompact: {
    width: 72,
    minHeight: 96,
    paddingVertical: 8,
  },
  selectedTag: {
    marginTop: 4,
    fontWeight: '700',
  },
});