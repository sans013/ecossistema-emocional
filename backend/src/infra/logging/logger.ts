export type LogLevel = 'info' | 'warn' | 'error';

export interface Logger {
  info(event: string, meta?: Record<string, unknown>): void;
  warn(event: string, meta?: Record<string, unknown>): void;
  error(event: string, meta?: Record<string, unknown>): void;
}

function writeLog(level: LogLevel, event: string, meta?: Record<string, unknown>): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(meta ? { meta } : {}),
  };

  const line = `${JSON.stringify(entry)}\n`;
  if (level === 'error') {
    process.stderr.write(line);
  } else {
    process.stdout.write(line);
  }
}

export const logger: Logger = {
  info: (event, meta) => writeLog('info', event, meta),
  warn: (event, meta) => writeLog('warn', event, meta),
  error: (event, meta) => writeLog('error', event, meta),
};