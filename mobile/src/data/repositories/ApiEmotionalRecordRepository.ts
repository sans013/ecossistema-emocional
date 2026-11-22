import { EmotionalRecord, ReflectionSummary } from '../../domain/entities/EmotionalRecord';
import {
  EmotionalRecordRepository,
  ListRecordsParams,
  SaveRecordParams,
} from '../../domain/repositories/EmotionalRecordRepository';
import { HttpClient } from '../http/HttpClient';
import {
  ApiRecordDto,
  ApiReflectionSummaryDto,
  mapRecord,
  mapReflectionSummary,
} from './mappers';

export class ApiEmotionalRecordRepository implements EmotionalRecordRepository {
  constructor(private readonly http: HttpClient) {}

  async create(params: SaveRecordParams): Promise<EmotionalRecord> {
    const res = await this.http.request<{ registro: ApiRecordDto }>('/registros', {
      method: 'POST',
      body: {
        nivel_humor: params.nivelHumor,
        contextos: params.contextos,
        pensamento: params.pensamento,
        ...(params.mensagemFlor !== undefined ? { mensagem_flor: params.mensagemFlor } : {}),
      },
    });
    return mapRecord(res.registro);
  }

  async list(params?: ListRecordsParams): Promise<EmotionalRecord[]> {
    const query = new URLSearchParams();
    if (params?.contexto) query.append('contexto', params.contexto);
    if (params?.dias) query.append('dias', String(params.dias));

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const res = await this.http.request<{ registros: ApiRecordDto[] }>(`/registros${suffix}`);
    return res.registros.map(mapRecord);
  }

  async getById(id: string): Promise<EmotionalRecord> {
    const res = await this.http.request<{ registro: ApiRecordDto }>(`/registros/${id}`);
    return mapRecord(res.registro);
  }

  async update(id: string, params: SaveRecordParams): Promise<EmotionalRecord> {
    const res = await this.http.request<{ registro: ApiRecordDto }>(`/registros/${id}`, {
      method: 'PUT',
      body: {
        nivel_humor: params.nivelHumor,
        contextos: params.contextos,
        pensamento: params.pensamento,
        ...(params.mensagemFlor !== undefined ? { mensagem_flor: params.mensagemFlor } : {}),
      },
    });
    return mapRecord(res.registro);
  }

  async remove(id: string): Promise<void> {
    await this.http.request<void>(`/registros/${id}`, { method: 'DELETE' });
  }

  async getReflectionSummary(periodoDias: 7 | 30): Promise<ReflectionSummary> {
    const res = await this.http.request<ApiReflectionSummaryDto>(
      `/reflexao/resumo?periodo=${periodoDias}`
    );
    return mapReflectionSummary(res);
  }
}