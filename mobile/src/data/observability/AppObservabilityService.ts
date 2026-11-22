import { ObservabilityService } from '../../domain/services/ObservabilityService';

const SENSITIVE_KEYS = /senha|password|token|authorization|secret/i;

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    clean[key] = SENSITIVE_KEYS.test(key) ? '[REDACTED]' : value;
  }
  return clean;
}

export class AppObservabilityService implements ObservabilityService {
  constructor(private readonly crashlyticsEnabled: boolean) {}

  recordError(error: unknown, context?: Record<string, unknown>): void {
    const normalized = error instanceof Error ? error : new Error(String(error));
    const safeContext = sanitizeMeta(context);

    if (this.crashlyticsEnabled) {
      // Ponto de integração nativa com Firebase Crashlytics (EAS / Dev Build)
      // crashlytics().recordError(normalized);
    }

    if (__DEV__) {
      console.warn('[Observability][Error]', normalized.message, safeContext ?? {});
    }
  }

  logEvent(name: string, params?: Record<string, unknown>): void {
    const safeParams = sanitizeMeta(params);

    if (this.crashlyticsEnabled) {
      // crashlytics().log(`${name}: ${JSON.stringify(safeParams ?? {})}`);
    }

    if (__DEV__) {
      console.info('[Observability][Event]', name, safeParams ?? {});
    }
  }
}