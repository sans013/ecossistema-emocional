import { NextFunction, Response } from 'express';
import { AppError } from '../../domain/errors/AppError';
import { TokenService } from '../../domain/services/SecurityServices';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export function createAuthenticateMiddleware(tokenService: TokenService) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next(new AppError('Token de autenticação ausente.', 401, 'UNAUTHORIZED'));
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      next(new AppError('Token de autenticação ausente.', 401, 'UNAUTHORIZED'));
      return;
    }

    try {
      const payload = tokenService.verify(token);
      req.userId = payload.sub;
      next();
    } catch (err) {
      next(err);
    }
  };
}