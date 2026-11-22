export interface ObservabilityService {
  recordError(error: unknown, context?: Record<string, unknown>): void;
  logEvent(name: string, params?: Record<string, unknown>): void;
}