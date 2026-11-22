import { FontSizeOption } from '../../domain/entities/User';
import { DayShift } from '../../domain/services/ContextService';

export const COLORS = {
  primary: '#4A6B5D',
  primaryDark: '#365246',
  primarySoft: '#E3EDE8',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F4F1',
  border: '#DCE4DF',
  textPrimary: '#1E2A25',
  textSecondary: '#55655E',
  textOnPrimary: '#FFFFFF',
  danger: '#B84A4A',
  dangerSoft: '#FCEAEA',
  warningBg: '#FFF4E0',
  warningText: '#7A4F0B',
  onlineDot: '#3C8C5E',
  offlineDot: '#B84A4A',
} as const;

export const SHIFT_BACKGROUNDS: Record<DayShift, string> = {
  manha: '#F4F7F3',
  tarde: '#F7F5EF',
  noite: '#EEF3F4',
};

export const FONT_SCALE_MULTIPLIERS: Record<FontSizeOption, number> = {
  padrao: 1,
  grande: 1.15,
  extra_grande: 1.3,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const RADII = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;