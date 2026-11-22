import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { logger } from '../../infra/logging/logger';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Os dados enviados são inválidos.',
        details: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
    return;
  }

  logger.error('unhandled_http_error', {
    method: req.method,
    path: req.path,
    error: err instanceof Error ? err.message : 'Unknown error',
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro interno. Tente novamente em instantes.',
    },
  });
}