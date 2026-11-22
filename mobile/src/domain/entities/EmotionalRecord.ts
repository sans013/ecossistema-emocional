export const VALID_CONTEXT_SLUGS = [
  'sono',
  'estudo',
  'trabalho',
  'descanso',
  'relacoes',
] as const;

export type ContextSlug = (typeof VALID_CONTEXT_SLUGS)[number];

export interface ContextOption {
  slug: ContextSlug;
  nome: string;
  iconKey: 'sleep' | 'study' | 'work' | 'rest' | 'relations';
}

export const CONTEXT_CATALOG: ContextOption[] = [
  { slug: 'sono', nome: 'Sono', iconKey: 'sleep' },
  { slug: 'estudo', nome: 'Estudo', iconKey: 'study' },
  { slug: 'trabalho', nome: 'Trabalho', iconKey: 'work' },
  { slug: 'descanso', nome: 'Descanso', iconKey: 'rest' },
  { slug: 'relacoes', nome: 'Relações', iconKey: 'relations' },
];

export interface EmotionalRecord {
  id: string;
  nivelHumor: number;
  contextos: ContextSlug[];
  pensamento: string | null;
  mensagemFlor?: string | null;
  registradoEm: string;
  atualizadoEm: string;
}

export interface MoodFrequency {
  nivelHumor: number;
  quantidade: number;
}

export interface ContextFrequency {
  slug: ContextSlug;
  nome: string;
  quantidade: number;
}

export interface ReflectionSummary {
  periodoDias: 7 | 30;
  totalRegistros: number;
  frequenciaHumores: MoodFrequency[];
  contextosMaisPresentes: ContextFrequency[];
}