export interface MobileEnvConfig {
  apiBaseUrl: string;
  enableCrashlytics: boolean;
}

export function getMobileEnv(): MobileEnvConfig {
  const rawUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const apiBaseUrl = rawUrl && rawUrl.length > 0 ? rawUrl.replace(/\/+$/, '') : 'http://localhost:3000/api/v1';
  const enableCrashlytics = process.env.EXPO_PUBLIC_ENABLE_CRASHLYTICS === 'true';

  return {
    apiBaseUrl,
    enableCrashlytics,
  };
}