export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type MoodIconKey = 'storm' | 'fog' | 'breeze' | 'mild_sun' | 'clear_sky';

export interface MoodDefinition {
  level: MoodLevel;
  defaultLabel: string;
  climateLabel: string;
  iconKey: MoodIconKey;
  softColor: string;
  accentColor: string;
  gardenFeedback: string;
}

export const DEFAULT_MOOD_CATALOG: ReadonlyArray<MoodDefinition> = [
  {
    level: 1,
    defaultLabel: 'Muito mal',
    climateLabel: 'Tempestade',
    iconKey: 'storm',
    softColor: '#EAE8F3',
    accentColor: '#5B587A',
    gardenFeedback: 'Seu jardim acolhe a chuva sem pressa. Tudo bem desacelerar hoje.',
  },
  {
    level: 2,
    defaultLabel: 'Mal',
    climateLabel: 'Névoa',
    iconKey: 'fog',
    softColor: '#E8EAF2',
    accentColor: '#686C85',
    gardenFeedback: 'Mesmo sob névoa, parar para se ouvir já é um gesto de cuidado.',
  },
  {
    level: 3,
    defaultLabel: 'Neutro',
    climateLabel: 'Brisa',
    iconKey: 'breeze',
    softColor: '#E6EFEA',
    accentColor: '#4A6B5D',
    gardenFeedback: 'Uma brisa calma passou pelo seu jardim. Volte quando quiser.',
  },
  {
    level: 4,
    defaultLabel: 'Bem',
    climateLabel: 'Sol ameno',
    iconKey: 'mild_sun',
    softColor: '#FCF0D5',
    accentColor: '#C48A2B',
    gardenFeedback: 'Seu jardim recebeu um toque de sol. Volte quando quiser, sem pressa.',
  },
  {
    level: 5,
    defaultLabel: 'Muito bem',
    climateLabel: 'Céu limpo',
    iconKey: 'clear_sky',
    softColor: '#E3F0F5',
    accentColor: '#3E7A8C',
    gardenFeedback: 'Céu aberto no seu ecossistema. Que bom registrar este momento leve.',
  },
];

export function getMoodDefinition(
  level: number,
  customLabels?: Record<string, string>
): MoodDefinition & { displayLabel: string } {
  const base =
    DEFAULT_MOOD_CATALOG.find((item) => item.level === level) ?? DEFAULT_MOOD_CATALOG[2];
  const custom = customLabels?.[String(base.level)]?.trim();

  return {
    ...base,
    displayLabel: custom && custom.length > 0 ? custom : base.defaultLabel,
  };
}