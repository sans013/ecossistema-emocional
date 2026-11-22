import {
  EcosystemLevel,
  FontSizeOption,
  PublicUser,
  ReminderShift,
  UserExportData,
  UserPreferences,
  UserProfile,
} from '../entities/User';

export interface UpdatePreferencesParams {
  nivelEcossistema?: EcosystemLevel;
  rotulosHumorCustom?: Record<string, string>;
  lembretesAtivos?: boolean;
  lembretesTurnos?: ReminderShift[];
  tamanhoFonte?: FontSizeOption;
  rotulosSempreVisiveis?: boolean;
}

export interface UserRepository {
  getProfile(): Promise<UserProfile>;
  acceptLgpdConsent(): Promise<PublicUser>;
  updatePreferences(params: UpdatePreferencesParams): Promise<UserPreferences>;
  exportData(): Promise<UserExportData>;
  deleteAllRecords(): Promise<void>;
  deleteAccount(): Promise<void>;
}