import { Response } from 'express';
import { consentSchema, updatePreferencesSchema } from '../../application/schemas/meSchemas';
import {
  AcceptLgpdConsentUseCase,
  DeleteAccountUseCase,
  DeleteAllUserRecordsUseCase,
  ExportUserDataUseCase,
  GetProfileUseCase,
  UpdatePreferencesUseCase,
} from '../../application/use-cases/MeUseCases';
import {
  presentExportData,
  presentPreferences,
  presentUser,
} from '../presenters/userPresenter';
import { AuthenticatedRequest, getAuthenticatedUserId } from '../types/AuthenticatedRequest';

export class MeController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly acceptLgpdConsentUseCase: AcceptLgpdConsentUseCase,
    private readonly updatePreferencesUseCase: UpdatePreferencesUseCase,
    private readonly exportUserDataUseCase: ExportUserDataUseCase,
    private readonly deleteAllUserRecordsUseCase: DeleteAllUserRecordsUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase
  ) {}

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    const profile = await this.getProfileUseCase.execute(userId);

    res.status(200).json({
      usuario: presentUser(profile.usuario),
      preferencias: presentPreferences(profile.preferencias),
    });
  };

  acceptConsent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    consentSchema.parse(req.body);

    const updatedUser = await this.acceptLgpdConsentUseCase.execute(userId);
    res.status(200).json({ usuario: presentUser(updatedUser) });
  };

  updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    const input = updatePreferencesSchema.parse(req.body);

    const updated = await this.updatePreferencesUseCase.execute(userId, input);
    res.status(200).json({ preferencias: presentPreferences(updated) });
  };

  exportData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    const exported = await this.exportUserDataUseCase.execute(userId);

    res.status(200).json(presentExportData(exported));
  };

  deleteAllRecords = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    await this.deleteAllUserRecordsUseCase.execute(userId);

    res.status(204).send();
  };

  deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    await this.deleteAccountUseCase.execute(userId);

    res.status(204).send();
  };
}