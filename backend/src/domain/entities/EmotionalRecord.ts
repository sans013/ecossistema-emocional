export const VALID_CONTEXT_SLUGS = [
  'sono',
  'estudo',
  'trabalho',
  'descanso',
  'relacoes',
] as const;

export type ContextSlug = (typeof VALID_CONTEXT_SLUGS)[number];

export interface EmotionalRecord {
  id: string;
  usuarioId: string;
  nivelHumor: number;
  contextos: ContextSlug[];
  pensamento: string | null;
  mensagemFlor?: string | null;
  registradoEm: Date;
  atualizadoEm: Date;
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