import { getEnv } from './infra/config/env';
import { checkDatabaseConnection, closePool } from './infra/database/pool';
import { logger } from './infra/logging/logger';
import { createApp } from './presentation/app';

const env = getEnv();

const app = createApp({
  corsOrigin: env.CORS_ORIGIN,
  checkDatabase: checkDatabaseConnection,
});

const server = app.listen(env.PORT, () => {
  logger.info('server_started', {
    port: env.PORT,
    environment: env.NODE_ENV,
  });
});

async function shutdown(signal: string): Promise<void> {
  logger.info('shutdown_initiated', { signal });

  server.close(async (err) => {
    if (err) {
      logger.error('server_close_error', { error: err.message });
      process.exit(1);
    }

    try {
      await closePool();
      logger.info('shutdown_completed');
      process.exit(0);
    } catch (closeErr) {
      logger.error('database_close_error', {
        error: closeErr instanceof Error ? closeErr.message : 'Unknown error',
      });
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));