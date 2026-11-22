import { Request } from 'express';
import { AppError } from '../../domain/errors/AppError';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function getAuthenticatedUserId(req: AuthenticatedRequest): string {
  if (!req.userId) {
    throw new AppError('Usuário não autenticado.', 401, 'UNAUTHORIZED');
  }
  return req.userId;
}