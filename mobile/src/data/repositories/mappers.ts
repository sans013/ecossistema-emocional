import {
  ContextSlug,
  EmotionalRecord,
  ReflectionSummary,
} from '../../domain/entities/EmotionalRecord';
import {
  EcosystemLevel,
  FontSizeOption,
  PublicUser,
  ReminderShift,
  UserPreferences,
} from '../../domain/entities/User';

export interface ApiUserDto {
  id: string;
  nome_exibicao: string;
  email: string;
  consentimento_lgpd: boolean;
  consentimento_aceito_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface ApiPreferencesDto {
  nivel_ecossistema: EcosystemLevel;
  rotulos_humor_custom: Record<string, string>;
  lembretes_ativos: boolean;
  lembretes_turnos: ReminderShift[];
  tamanho_fonte: FontSizeOption;
  rotulos_sempre_visiveis: boolean;
  atualizado_em: string;
}

export interface ApiRecordDto {
  id: string;
  nivel_humor: number;
  contextos: ContextSlug[];
  pensamento: string | null;
  mensagem_flor?: string | null;
  registrado_em: string;
  atualizado_em: string;
}

export interface ApiReflectionSummaryDto {
  periodo_dias: 7 | 30;
  total_registros: number;
  frequencia_humores: Array<{ nivel_humor: number; quantidade: number }>;
  contextos_mais_presentes: Array<{ slug: ContextSlug; nome: string; quantidade: number }>;
}

export function mapUser(dto: ApiUserDto): PublicUser {
  return {
    id: dto.id,
    nomeExibicao: dto.nome_exibicao,
    email: dto.email,
    consentimentoLgpd: dto.consentimento_lgpd,
    consentimentoAceitoEm: dto.consentimento_aceito_em,
    criadoEm: dto.criado_em,
    atualizadoEm: dto.atualizado_em,
  };
}

export function mapPreferences(dto: ApiPreferencesDto): UserPreferences {
  return {
    nivelEcossistema: dto.nivel_ecossistema,
    rotulosHumorCustom: dto.rotulos_humor_custom ?? {},
    lembretesAtivos: dto.lembretes_ativos,
    lembretesTurnos: dto.lembretes_turnos ?? [],
    tamanhoFonte: dto.tamanho_fonte,
    rotulosSempreVisiveis: dto.rotulos_sempre_visiveis,
    atualizadoEm: dto.atualizado_em,
  };
}

export function mapRecord(dto: ApiRecordDto): EmotionalRecord {
  return {
    id: dto.id,
    nivelHumor: dto.nivel_humor,
    contextos: dto.contextos ?? [],
    pensamento: dto.pensamento,
    mensagemFlor: dto.mensagem_flor ?? null,
    registradoEm: dto.registrado_em,
    atualizadoEm: dto.atualizado_em,
  };
}

export function mapReflectionSummary(dto: ApiReflectionSummaryDto): ReflectionSummary {
  return {
    periodoDias: dto.periodo_dias,
    totalRegistros: dto.total_registros,
    frequenciaHumores: dto.frequencia_humores.map((item) => ({
      nivelHumor: item.nivel_humor,
      quantidade: item.quantidade,
    })),
    contextosMaisPresentes: dto.contextos_mais_presentes.map((item) => ({
      slug: item.slug,
      nome: item.nome,
      quantidade: item.quantidade,
    })),
  };
}