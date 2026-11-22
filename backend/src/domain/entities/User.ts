export type EcosystemLevel = 'desativada' | 'suave' | 'completa';
export type FontSizeOption = 'padrao' | 'grande' | 'extra_grande';
export type ReminderShift = 'manha' | 'tarde' | 'noite';

export interface User {
  id: string;
  nomeExibicao: string;
  email: string;
  senhaHash: string;
  consentimentoLgpd: boolean;
  consentimentoAceitoEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

export type PublicUser = Omit<User, 'senhaHash'>;

export interface UserPreferences {
  usuarioId: string;
  nivelEcossistema: EcosystemLevel;
  rotulosHumorCustom: Record<string, string>;
  lembretesAtivos: boolean;
  lembretesTurnos: ReminderShift[];
  tamanhoFonte: FontSizeOption;
  rotulosSempreVisiveis: boolean;
  atualizadoEm: Date;
}

export interface UserProfile {
  usuario: PublicUser;
  preferencias: UserPreferences;
}

export interface ExportedRecord {
  id: string;
  nivelHumor: number;
  contextos: string[];
  pensamento: string | null;
  registradoEm: Date;
  atualizadoEm: Date;
}

export interface UserExportData {
  exportadoEm: string;
  usuario: PublicUser;
  preferencias: UserPreferences;
  registros: ExportedRecord[];
}

export function toPublicUser(user: User): PublicUser {
  const { senhaHash: _omitido, ...publicUser } = user;
  return publicUser;
}