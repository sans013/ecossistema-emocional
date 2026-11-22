import { PublicUser, UserExportData, UserPreferences, UserProfile } from '../../domain/entities/User';
import { AppError } from '../../domain/errors/AppError';
import { UpdatePreferencesData, UserRepository } from '../../domain/repositories/UserRepository';
import { UpdatePreferencesInput } from '../schemas/meSchemas';

export class GetProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    const profile = await this.userRepository.findProfileById(userId);
    if (!profile) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }
    return profile;
  }
}

export class AcceptLgpdConsentUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const updated = await this.userRepository.recordLgpdConsent(userId);
    if (!updated) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }
    return updated;
  }
}

export class UpdatePreferencesUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, input: UpdatePreferencesInput): Promise<UserPreferences> {
    const data: UpdatePreferencesData = {
      ...(input.nivel_ecossistema !== undefined && { nivelEcossistema: input.nivel_ecossistema }),
      ...(input.rotulos_humor_custom !== undefined && {
        rotulosHumorCustom: input.rotulos_humor_custom,
      }),
      ...(input.lembretes_ativos !== undefined && { lembretesAtivos: input.lembretes_ativos }),
      ...(input.lembretes_turnos !== undefined && { lembretesTurnos: input.lembretes_turnos }),
      ...(input.tamanho_fonte !== undefined && { tamanhoFonte: input.tamanho_fonte }),
      ...(input.rotulos_sempre_visiveis !== undefined && {
        rotulosSempreVisiveis: input.rotulos_sempre_visiveis,
      }),
    };

    const updated = await this.userRepository.updatePreferences(userId, data);
    if (!updated) {
      throw new AppError('Preferências não encontradas.', 404, 'PREFERENCES_NOT_FOUND');
    }
    return updated;
  }
}

export class ExportUserDataUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserExportData> {
    const exported = await this.userRepository.exportAllUserData(userId);
    if (!exported) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }
    return exported;
  }
}

export class DeleteAllUserRecordsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.deleteAllRecords(userId);
  }
}

export class DeleteAccountUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const deleted = await this.userRepository.deleteAccount(userId);
    if (!deleted) {
      throw new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
    }
  }
}