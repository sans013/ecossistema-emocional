import { NextFunction, Response } from 'express';
import { AppError } from '../../domain/errors/AppError';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthenticatedRequest, getAuthenticatedUserId } from '../types/AuthenticatedRequest';

export function createRequireLgpdConsentMiddleware(userRepository: UserRepository) {
  return async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = getAuthenticatedUserId(req);
      const profile = await userRepository.findProfileById(userId);

      if (!profile) {
        next(new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND'));
        return;
      }

      if (!profile.usuario.consentimentoLgpd) {
        next(
          new AppError(
            'É necessário aceitar o consentimento LGPD antes de criar o primeiro registro.',
            403,
            'LGPD_CONSENT_REQUIRED'
          )
        );
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}