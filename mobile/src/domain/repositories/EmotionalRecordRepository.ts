import {
  ContextSlug,
  EmotionalRecord,
  ReflectionSummary,
} from '../entities/EmotionalRecord';

export interface SaveRecordParams {
  nivelHumor: number;
  contextos: ContextSlug[];
  pensamento: string | null;
}

export interface ListRecordsParams {
  contexto?: ContextSlug;
  dias?: number;
}

export interface EmotionalRecordRepository {
  create(params: SaveRecordParams): Promise<EmotionalRecord>;
  list(params?: ListRecordsParams): Promise<EmotionalRecord[]>;
  getById(id: string): Promise<EmotionalRecord>;
  update(id: string, params: SaveRecordParams): Promise<EmotionalRecord>;
  remove(id: string): Promise<void>;
  getReflectionSummary(periodoDias: 7 | 30): Promise<ReflectionSummary>;
}