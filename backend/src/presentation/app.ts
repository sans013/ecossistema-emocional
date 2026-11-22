import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';

export interface AppDependencies {
  corsOrigin: string;
  checkDatabase: () => Promise<boolean>;
}

export function createApp({ corsOrigin, checkDatabase }: AppDependencies): Express {
  const app = express();

  const allowedOrigins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', async (_req, res) => {
    try {
      const dbOk = await checkDatabase();
      res.status(200).json({
        status: 'ok',
        database: dbOk ? 'connected' : 'unavailable',
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        status: 'degraded',
        database: 'unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Rota não encontrada.',
      },
    });
  });

  app.use(errorHandler);

  return app;
}