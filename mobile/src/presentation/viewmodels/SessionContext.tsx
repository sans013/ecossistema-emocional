import NetInfo from '@react-native-community/netinfo';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  EcosystemLevel,
  FontSizeOption,
  PublicUser,
  ReminderShift,
  UserPreferences,
} from '../../domain/entities/User';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { UpdatePreferencesParams, UserRepository } from '../../domain/repositories/UserRepository';
import { ObservabilityService } from '../../domain/services/ObservabilityService';
import { TokenStorage } from '../../domain/services/TokenStorage';
import { ApiError } from '../../data/http/HttpClient';

const DEFAULT_PREFERENCES: UserPreferences = {
  nivelEcossistema: 'suave',
  rotulosHumorCustom: {},
  lembretesAtivos: false,
  lembretesTurnos: [],
  tamanhoFonte: 'padrao',
  rotulosSempreVisiveis: true,
  atualizadoEm: '',
};

export interface SessionContextValue {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  isConnected: boolean;
  user: PublicUser | null;
  preferences: UserPreferences;
  fontSizeOption: FontSizeOption;
  ecosystemLevel: EcosystemLevel;
  login: (email: string, senha: string) => Promise<void>;
  register: (nomeExibicao: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  acceptLgpdConsent: () => Promise<void>;
  updatePreferences: (params: UpdatePreferencesParams) => Promise<UserPreferences>;
  deleteAllRecords: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export interface SessionProviderProps {
  authRepository: AuthRepository;
  userRepository: UserRepository;
  tokenStorage: TokenStorage;
  observability: ObservabilityService;
  children: React.ReactNode;
}

export function SessionProvider({
  authRepository,
  userRepository,
  tokenStorage,
  observability,
  children,
}: SessionProviderProps) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsConnected(online);
    });
    return () => unsubscribe();
  }, []);

  const clearSessionState = useCallback(async () => {
    await tokenStorage.clearToken();
    setUser(null);
    setPreferences(DEFAULT_PREFERENCES);
  }, [tokenStorage]);

  const refreshProfile = useCallback(async () => {
    const profile = await userRepository.getProfile();
    setUser(profile.usuario);
    setPreferences(profile.preferencias);
  }, [userRepository]);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      try {
        const existingToken = await tokenStorage.getToken();
        if (!existingToken) {
          if (active) setIsBootstrapping(false);
          return;
        }
        const profile = await userRepository.getProfile();
        if (active) {
          setUser(profile.usuario);
          setPreferences(profile.preferencias);
        }
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 401) {
          await tokenStorage.clearToken();
        } else {
          observability.recordError(err, { stage: 'session_bootstrap' });
        }
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    }
    void bootstrap();
    return () => {
      active = false;
    };
  }, [tokenStorage, userRepository, observability]);

  const login = useCallback(
    async (email: string, senha: string) => {
      const session = await authRepository.login({ email, senha });
      await tokenStorage.saveToken(session.token);
      try {
        const profile = await userRepository.getProfile();
        setUser(profile.usuario);
        setPreferences(profile.preferencias);
      } catch {
        setUser(session.usuario);
        if (session.preferencias) {
          setPreferences(session.preferencias);
        }
      }
      observability.logEvent('user_logged_in');
    },
    [authRepository, userRepository, tokenStorage, observability]
  );

  const register = useCallback(
    async (nomeExibicao: string, email: string, senha: string) => {
      const session = await authRepository.register({ nomeExibicao, email, senha });
      await tokenStorage.saveToken(session.token);
      setUser(session.usuario);
      setPreferences(session.preferencias ?? DEFAULT_PREFERENCES);
      observability.logEvent('user_registered');
    },
    [authRepository, tokenStorage, observability]
  );

  const logout = useCallback(async () => {
    await clearSessionState();
    observability.logEvent('user_logged_out');
  }, [clearSessionState, observability]);

  const acceptLgpdConsent = useCallback(async () => {
    const updatedUser = await userRepository.acceptLgpdConsent();
    setUser(updatedUser);
    observability.logEvent('lgpd_consent_accepted');
  }, [userRepository, observability]);

  const updatePreferences = useCallback(
    async (params: UpdatePreferencesParams) => {
      const updated = await userRepository.updatePreferences(params);
      setPreferences(updated);
      return updated;
    },
    [userRepository]
  );

  const deleteAllRecords = useCallback(async () => {
    await userRepository.deleteAllRecords();
    observability.logEvent('all_records_deleted');
  }, [userRepository, observability]);

  const deleteAccount = useCallback(async () => {
    await userRepository.deleteAccount();
    await clearSessionState();
    observability.logEvent('account_deleted');
  }, [userRepository, clearSessionState, observability]);

  const value = useMemo<SessionContextValue>(
    () => ({
      isBootstrapping,
      isAuthenticated: Boolean(user),
      isConnected,
      user,
      preferences,
      fontSizeOption: preferences.tamanhoFonte,
      ecosystemLevel: preferences.nivelEcossistema,
      login,
      register,
      logout,
      refreshProfile,
      acceptLgpdConsent,
      updatePreferences,
      deleteAllRecords,
      deleteAccount,
    }),
    [
      isBootstrapping,
      user,
      isConnected,
      preferences,
      login,
      register,
      logout,
      refreshProfile,
      acceptLgpdConsent,
      updatePreferences,
      deleteAllRecords,
      deleteAccount,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession deve ser utilizado dentro de SessionProvider.');
  }
  return ctx;
}

export function formatReminderShifts(shifts: ReminderShift[]): string {
  if (shifts.length === 0) return 'Nenhum turno selecionado';
  const labels: Record<ReminderShift, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
  };
  return shifts.map((s) => labels[s]).join(', ');
}