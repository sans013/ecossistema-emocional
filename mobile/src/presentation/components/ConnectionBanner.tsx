import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppText } from './AppText';

interface ConnectionBannerProps {
  isConnected: boolean;
}

export function ConnectionBanner({ isConnected }: ConnectionBannerProps) {
  if (isConnected) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <AppText variant="caption" color={COLORS.warningText}>
        Sem conexão no momento. Seus dados continuam seguros até a rede voltar.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
});