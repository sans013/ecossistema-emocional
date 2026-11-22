import React, { createContext, useContext, useMemo } from 'react';
import { FontSizeOption } from '../../domain/entities/User';
import { DayShiftContext, getDayShiftContext } from '../../domain/services/ContextService';
import { COLORS, FONT_SCALE_MULTIPLIERS, SHIFT_BACKGROUNDS } from './tokens';

interface ThemeContextValue {
  colors: typeof COLORS;
  backgroundColor: string;
  dayShift: DayShiftContext;
  fontSizeOption: FontSizeOption;
  fontScale: number;
  scaledFont: (baseSize: number) => number;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  fontSizeOption: FontSizeOption;
  children: React.ReactNode;
}

export function ThemeProvider({ fontSizeOption, children }: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(() => {
    const dayShift = getDayShiftContext();
    const fontScale = FONT_SCALE_MULTIPLIERS[fontSizeOption] ?? 1;

    return {
      colors: COLORS,
      backgroundColor: SHIFT_BACKGROUNDS[dayShift.shift],
      dayShift,
      fontSizeOption,
      fontScale,
      scaledFont: (baseSize: number) => Math.round(baseSize * fontScale),
    };
  }, [fontSizeOption]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    const dayShift = getDayShiftContext();
    return {
      colors: COLORS,
      backgroundColor: SHIFT_BACKGROUNDS[dayShift.shift],
      dayShift,
      fontSizeOption: 'padrao',
      fontScale: 1,
      scaledFont: (baseSize: number) => baseSize,
    };
  }
  return ctx;
}