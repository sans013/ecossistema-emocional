import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getMobileEnv } from './src/data/config/env';
import { HttpClient } from './src/data/http/HttpClient';
import { AppObservabilityService } from './src/data/observability/AppObservabilityService';
import { ApiAuthRepository } from './src/data/repositories/ApiAuthRepository';
import { ApiEmotionalRecordRepository } from './src/data/repositories/ApiEmotionalRecordRepository';
import { ApiUserRepository } from './src/data/repositories/ApiUserRepository';
import { SecureTokenStorage } from './src/data/storage/SecureTokenStorage';
import { UserExportData } from './src/domain/entities/User';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { ThemeProvider } from './src/presentation/theme/ThemeContext';
import { RecordsProvider } from './src/presentation/viewmodels/RecordsViewModel';
import { SessionProvider, useSession } from './src/presentation/viewmodels/SessionContext';

interface AppShellProps {
  exportUserData: () => Promise<UserExportData>;
}

function AppShell({ exportUserData }: AppShellProps) {
  const { fontSizeOption } = useSession();
  return (
    <ThemeProvider fontSizeOption={fontSizeOption}>
      <StatusBar style="dark" />
      <RootNavigator exportUserData={exportUserData} />
    </ThemeProvider>
  );
}

export default function App() {
  const dependencies = useMemo(() => {
    const env = getMobileEnv();
    const tokenStorage = new SecureTokenStorage();
    const observability = new AppObservabilityService(env.enableCrashlytics);
    const httpClient = new HttpClient(env.apiBaseUrl, tokenStorage, observability);
    const userRepository = new ApiUserRepository(httpClient);
    const recordRepository = new ApiEmotionalRecordRepository(httpClient);

    return {
      authRepository: new ApiAuthRepository(httpClient),
      userRepository,
      recordRepository,
      tokenStorage,
      observability,
      exportUserData: () => userRepository.exportData(),
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
        <RecordsProvider
          recordRepository={dependencies.recordRepository}
          observability={dependencies.observability}
        >
          <AppShell exportUserData={dependencies.exportUserData} />
        </RecordsProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}