import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getMobileEnv } from './src/data/config/env';
import { HttpClient } from './src/data/http/HttpClient';
import { AppObservabilityService } from './src/data/observability/AppObservabilityService';
import { ApiAuthRepository } from './src/data/repositories/ApiAuthRepository';
import { ApiUserRepository } from './src/data/repositories/ApiUserRepository';
import { SecureTokenStorage } from './src/data/storage/SecureTokenStorage';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { ThemeProvider } from './src/presentation/theme/ThemeContext';
import { SessionProvider, useSession } from './src/presentation/viewmodels/SessionContext';

function AppWithTheme() {
  const { fontSizeOption } = useSession();
  return (
    <ThemeProvider fontSizeOption={fontSizeOption}>
      <StatusBar style="dark" />
      <RootNavigator />
    </ThemeProvider>
  );
}

export default function App() {
  const dependencies = useMemo(() => {
    const env = getMobileEnv();
    const tokenStorage = new SecureTokenStorage();
    const observability = new AppObservabilityService(env.enableCrashlytics);
    const httpClient = new HttpClient(env.apiBaseUrl, tokenStorage, observability);

    return {
      authRepository: new ApiAuthRepository(httpClient),
      userRepository: new ApiUserRepository(httpClient),
      tokenStorage,
      observability,
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SessionProvider
        authRepository={dependencies.authRepository}
        userRepository={dependencies.userRepository}
        tokenStorage={dependencies.tokenStorage}
        observability={dependencies.observability}
      >
        <AppWithTheme />
      </SessionProvider>
    </SafeAreaProvider>
  );
}