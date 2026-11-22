import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../theme/tokens';
import { useAppTheme } from '../theme/ThemeContext';
import { AppText } from './AppText';

interface TabMeta {
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TAB_META: Record<string, TabMeta> = {
  HomeTab: {
    label: 'Início',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  DiaryTab: {
    label: 'Diário',
    activeIcon: 'journal',
    inactiveIcon: 'journal-outline',
  },
  ReflectionTab: {
    label: 'Reflexão',
    activeIcon: 'leaf',
    inactiveIcon: 'leaf-outline',
  },
  SettingsTab: {
    label: 'Ajustes',
    activeIcon: 'settings',
    inactiveIcon: 'settings-outline',
  },
};

export function BottomTabBar({
  state,
  navigation,
  onPressCreateRecord,
}: BottomTabBarProps & { onPressCreateRecord: () => void }) {
  const insets = useSafeAreaInsets();
  const { scaledFont } = useAppTheme();

  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  const renderTabButton = (route: (typeof state.routes)[number], indexInState: number) => {
    const isFocused = state.index === indexInState;
    const meta = TAB_META[route.name] ?? {
      label: route.name,
      activeIcon: 'ellipse',
      inactiveIcon: 'ellipse-outline',
    };

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={meta.label}
        onPress={onPress}
        style={styles.tabItem}
      >
        <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
          <Ionicons
            name={isFocused ? meta.activeIcon : meta.inactiveIcon}
            size={20}
            color={isFocused ? COLORS.primaryDark : COLORS.textSecondary}
          />
        </View>
        <AppText
          variant="caption"
          numberOfLines={1}
          style={{
            fontSize: scaledFont(12),
            lineHeight: Math.round(scaledFont(12) * 1.25),
            fontWeight: isFocused ? '700' : '500',
            color: isFocused ? COLORS.primaryDark : COLORS.textSecondary,
          }}
        >
          {meta.label}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, SPACING.sm) },
      ]}
    >
      <View style={styles.bar}>
        {leftRoutes.map((route) => {
          const idx = state.routes.findIndex((r) => r.key === route.key);
          return renderTabButton(route, idx);
        })}

        <View style={styles.centerSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Registrar novo momento"
            onPress={onPressCreateRecord}
            style={({ pressed }) => [
              styles.fab,
              pressed && styles.fabPressed,
            ]}
          >
            <Ionicons name="add" size={26} color={COLORS.textOnPrimary} />
          </Pressable>
          <AppText
            variant="caption"
            numberOfLines={1}
            style={{
              fontSize: scaledFont(11),
              lineHeight: Math.round(scaledFont(11) * 1.2),
              fontWeight: '600',
              color: COLORS.primaryDark,
              marginTop: 2,
            }}
          >
            Registrar
          </AppText>
        </View>

        {rightRoutes.map((route) => {
          const idx = state.routes.findIndex((r) => r.key === route.key);
          return renderTabButton(route, idx);
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 2,
  },
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 2,
  },
  iconPillActive: {
    backgroundColor: COLORS.primarySoft,
  },
  centerSlot: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -22,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  fabPressed: {
    opacity: 0.88,
  },
});