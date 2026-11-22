import {
  EcosystemLevel,
  FontSizeOption,
  PublicUser,
  ReminderShift,
  User,
  UserExportData,
  UserPreferences,
  UserProfile,
} from '../entities/User';

export interface CreateUserData {
  nomeExibicao: string;
  email: string;
  senhaHash: string;
}

export interface UpdatePreferencesData {
  nivelEcossistema?: EcosystemLevel;
  rotulosHumorCustom?: Record<string, string>;
  lembretesAtivos?: boolean;
  lembretesTurnos?: ReminderShift[];
  tamanhoFonte?: FontSizeOption;
  rotulosSempreVisiveis?: boolean;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findProfileById(userId: string): Promise<UserProfile | null>;
  createWithDefaultPreferences(data: CreateUserData): Promise<UserProfile>;
  recordLgpdConsent(userId: string): Promise<PublicUser | null>;
  updatePreferences(userId: string, data: UpdatePreferencesData): Promise<UserPreferences | null>;
  exportAllUserData(userId: string): Promise<UserExportData | null>;
  deleteAllRecords(userId: string): Promise<void>;
  deleteAccount(userId: string): Promise<boolean>;
}