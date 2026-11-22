import {
  ContextSlug,
  EmotionalRecord,
  ReflectionSummary,
} from '../entities/EmotionalRecord';

export interface SaveRecordParams {
  nivelHumor: number;
  contextos: ContextSlug[];
  pensamento: string | null;
  mensagemFlor?: string | null;
}

export interface CreateEmotionalRecordData {
  usuarioId: string;
  nivelHumor: number;
  contextos: ContextSlug[];
  pensamento: string | null;
  mensagemFlor?: string | null;
}

export interface UpdateEmotionalRecordData {
  nivelHumor: number;
  contextos: ContextSlug[];
  pensamento: string | null;
  mensagemFlor?: string | null;
}

export interface ListEmotionalRecordsFilter {
  contexto?: ContextSlug;
  dias?: number;
}

export interface EmotionalRecordRepository {
  create(data: CreateEmotionalRecordData): Promise<EmotionalRecord>;
  findAllByUser(
    userId: string,
    filters?: ListEmotionalRecordsFilter
  ): Promise<EmotionalRecord[]>;
  findByIdAndUser(id: string, userId: string): Promise<EmotionalRecord | null>;
  update(
    id: string,
    userId: string,
    data: UpdateEmotionalRecordData
  ): Promise<EmotionalRecord | null>;
  delete(id: string, userId: string): Promise<boolean>;
  getReflectionSummary(userId: string, periodoDias: 7 | 30): Promise<ReflectionSummary>;
}