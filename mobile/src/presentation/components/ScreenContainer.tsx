import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING } from '../theme/tokens';
import { useAppTheme } from '../theme/ThemeContext';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  scrollProps?: ScrollViewProps;
  noHorizontalPadding?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = true,
  scrollProps,
  noHorizontalPadding = false,
}: ScreenContainerProps) {
  const { backgroundColor } = useAppTheme();

  const contentStyle = [
    styles.content,
    !noHorizontalPadding && styles.horizontalPadding,
    scrollProps?.contentContainerStyle,
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={contentStyle}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            {...scrollProps}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, !noHorizontalPadding && styles.horizontalPadding]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  horizontalPadding: {
    paddingHorizontal: SPACING.md,
  },
  content: {
    paddingTop: SPACING.md,
    paddingBottom: 96,
  },
});