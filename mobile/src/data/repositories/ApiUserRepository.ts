import { PublicUser, UserExportData, UserPreferences, UserProfile } from '../../domain/entities/User';
import {
  UpdatePreferencesParams,
  UserRepository,
} from '../../domain/repositories/UserRepository';
import { HttpClient } from '../http/HttpClient';
import {
  ApiPreferencesDto,
  ApiRecordDto,
  ApiUserDto,
  mapPreferences,
  mapRecord,
  mapUser,
} from './mappers';

export class ApiUserRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

  async getProfile(): Promise<UserProfile> {
    const res = await this.http.request<{
      usuario: ApiUserDto;
      preferencias: ApiPreferencesDto;
    }>('/me');

    return {
      usuario: mapUser(res.usuario),
      preferencias: mapPreferences(res.preferencias),
    };
  }

  async acceptLgpdConsent(): Promise<PublicUser> {
    const res = await this.http.request<{ usuario: ApiUserDto }>('/me/consent', {
      method: 'POST',
      body: { aceito: true },
    });
    return mapUser(res.usuario);
  }

  async updatePreferences(params: UpdatePreferencesParams): Promise<UserPreferences> {
    const payload: Record<string, unknown> = {};
    if (params.nivelEcossistema !== undefined) payload.nivel_ecossistema = params.nivelEcossistema;
    if (params.rotulosHumorCustom !== undefined)
      payload.rotulos_humor_custom = params.rotulosHumorCustom;
    if (params.lembretesAtivos !== undefined) payload.lembretes_ativos = params.lembretesAtivos;
    if (params.lembretesTurnos !== undefined) payload.lembretes_turnos = params.lembretesTurnos;
    if (params.tamanhoFonte !== undefined) payload.tamanho_fonte = params.tamanhoFonte;
    if (params.rotulosSempreVisiveis !== undefined)
      payload.rotulos_sempre_visiveis = params.rotulosSempreVisiveis;

    const res = await this.http.request<{ preferencias: ApiPreferencesDto }>('/me/preferences', {
      method: 'PATCH',
      body: payload,
    });
    return mapPreferences(res.preferencias);
  }

  async exportData(): Promise<UserExportData> {
    const res = await this.http.request<{
      exportado_em: string;
      usuario: ApiUserDto;
      preferencias: ApiPreferencesDto;
      registros: ApiRecordDto[];
    }>('/me/export');

    return {
      exportadoEm: res.exportado_em,
      usuario: mapUser(res.usuario),
      preferencias: mapPreferences(res.preferencias),
      registros: res.registros.map(mapRecord),
    };
  }

  async deleteAllRecords(): Promise<void> {
    await this.http.request<void>('/me/registros', { method: 'DELETE' });
  }

  async deleteAccount(): Promise<void> {
    await this.http.request<void>('/me', { method: 'DELETE' });
  }
}