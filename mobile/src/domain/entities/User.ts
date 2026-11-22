export type EcosystemLevel = 'desativada' | 'suave' | 'completa';
export type FontSizeOption = 'padrao' | 'grande' | 'extra_grande';
export type ReminderShift = 'manha' | 'tarde' | 'noite';

export interface PublicUser {
  id: string;
  nomeExibicao: string;
  email: string;
  consentimentoLgpd: boolean;
  consentimentoAceitoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UserPreferences {
  nivelEcossistema: EcosystemLevel;
  rotulosHumorCustom: Record<string, string>;
  lembretesAtivos: boolean;
  lembretesTurnos: ReminderShift[];
  tamanhoFonte: FontSizeOption;
  rotulosSempreVisiveis: boolean;
  atualizadoEm: string;
}

export interface UserProfile {
  usuario: PublicUser;
  preferencias: UserPreferences;
}

export interface UserExportData {
  exportadoEm: string;
  usuario: PublicUser;
  preferencias: UserPreferences;
  registros: Array<{
    id: string;
    nivelHumor: number;
    contextos: string[];
    pensamento: string | null;
    registradoEm: string;
    atualizadoEm: string;
  }>;
}