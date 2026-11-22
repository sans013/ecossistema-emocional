import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MoodIconKey } from '../../domain/entities/MoodCatalog';
import { COLORS, RADII } from '../theme/tokens';
import { AppText } from './AppText';

interface MoodGlyphProps {
  iconKey: MoodIconKey;
  softColor: string;
  accentColor: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  showLabels?: boolean;
}

const ICON_MAP: Record<MoodIconKey, keyof typeof Ionicons.glyphMap> = {
  storm: 'thunderstorm-outline',
  fog: 'cloudy-outline',
  breeze: 'leaf-outline',
  mild_sun: 'partly-sunny-outline',
  clear_sky: 'sunny-outline',
};

export function MoodGlyph({
  iconKey,
  softColor,
  accentColor,
  size = 'md',
  label,
  sublabel,
  showLabels = true,
}: MoodGlyphProps) {
  const circleDim = size === 'sm' ? 40 : size === 'lg' ? 58 : 48;
  const iconDim = size === 'sm' ? 20 : size === 'lg' ? 28 : 22;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.circle,
          {
            width: circleDim,
            height: circleDim,
            borderRadius: RADII.pill,
            backgroundColor: softColor,
          },
        ]}
      >
        <Ionicons name={ICON_MAP[iconKey]} size={iconDim} color={accentColor} />
      </View>

      {showLabels && label && (
        <AppText variant="caption" color={COLORS.textPrimary} style={styles.label}>
          {label}
        </AppText>
      )}
      {showLabels && sublabel && (
        <AppText variant="caption" color={COLORS.textSecondary} style={styles.sublabel}>
          {sublabel}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 6,
    fontWeight: '700',
    textAlign: 'center',
  },
  sublabel: {
    marginTop: 2,
    textAlign: 'center',
  },
});