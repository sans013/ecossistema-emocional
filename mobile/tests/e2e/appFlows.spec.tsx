import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  ContextSlug,
  EmotionalRecord,
  ReflectionSummary,
} from '../../src/domain/entities/EmotionalRecord';
import { PublicUser, UserExportData, UserPreferences, UserProfile } from '../../src/domain/entities/User';
import { AuthRepository, AuthSession } from '../../src/domain/repositories/AuthRepository';
import {
  EmotionalRecordRepository,
  ListRecordsParams,
  SaveRecordParams,
} from '../../src/domain/repositories/EmotionalRecordRepository';
import { UpdatePreferencesParams, UserRepository } from '../../src/domain/repositories/UserRepository';
import { ObservabilityService } from '../../src/domain/services/ObservabilityService';
import { TokenStorage } from '../../src/domain/services/TokenStorage';
import { CreateRecordScreen } from '../../src/presentation/screens/CreateRecordScreen';
import { DiaryScreen } from '../../src/presentation/screens/DiaryScreen';
import { LgpdConsentScreen } from '../../src/presentation/screens/LgpdConsentScreen';
import { SettingsScreen } from '../../src/presentation/screens/SettingsScreen';
import { ThemeProvider } from '../../src/presentation/theme/ThemeContext';
import { RecordsProvider } from '../../src/presentation/viewmodels/RecordsViewModel';
import { SessionProvider, useSession } from '../../src/presentation/viewmodels/SessionContext';

const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

const INITIAL_SAFE_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function createTestEnvironment(initialConsent: boolean) {
  let token: string | null = 'jwt-ficticio-e2e';
  const now = new Date().toISOString();

  let user: PublicUser = {
    id: 'user-ficticio-1',
    nomeExibicao: 'Clara Mendes',
    email: 'clara.ficticia@exemplo.com',
    consentimentoLgpd: initialConsent,
    consentimentoAceitoEm: initialConsent ? now : null,
    criadoEm: now,
    atualizadoEm: now,
  };

  let preferences: UserPreferences = {
    nivelEcossistema: 'suave',
    rotulosHumorCustom: {},
    lembretesAtivos: false,
    lembretesTurnos: [],
    tamanhoFonte: 'padrao',
    rotulosSempreVisiveis: true,
    atualizadoEm: now,
  };

  let records: EmotionalRecord[] = [];
  let seq = 0;

  const tokenStorage: TokenStorage = {
    getToken: jest.fn(async () => token),
    saveToken: jest.fn(async (nextToken: string) => {
      token = nextToken;
    }),
    clearToken: jest.fn(async () => {
      token = null;
    }),
  };

  const observability: ObservabilityService = {
    recordError: jest.fn(),
    logEvent: jest.fn(),
  };

  const authRepository: AuthRepository = {
    register: jest.fn(async (): Promise<AuthSession> => ({ token: 'jwt-ficticio-e2e', usuario: user, preferencias: preferences })),
    login: jest.fn(async (): Promise<AuthSession> => ({ token: 'jwt-ficticio-e2e', usuario: user })),
  };

  const userRepository: UserRepository = {
    getProfile: jest.fn(async (): Promise<UserProfile> => ({ usuario: { ...user }, preferencias: { ...preferences } })),
    acceptLgpdConsent: jest.fn(async (): Promise<PublicUser> => {
      user = {
        ...user,
        consentimentoLgpd: true,
        consentimentoAceitoEm: new Date().toISOString(),
      };
      return { ...user };
    }),
    updatePreferences: jest.fn(async (params: UpdatePreferencesParams): Promise<UserPreferences> => {
      preferences = {
        ...preferences,
        ...(params.nivelEcossistema !== undefined && { nivelEcossistema: params.nivelEcossistema }),
        ...(params.rotulosHumorCustom !== undefined && { rotulosHumorCustom: params.rotulosHumorCustom }),
        ...(params.lembretesAtivos !== undefined && { lembretesAtivos: params.lembretesAtivos }),
        ...(params.lembretesTurnos !== undefined && { lembretesTurnos: params.lembretesTurnos }),
        ...(params.tamanhoFonte !== undefined && { tamanhoFonte: params.tamanhoFonte }),
        ...(params.rotulosSempreVisiveis !== undefined && {
          rotulosSempreVisiveis: params.rotulosSempreVisiveis,
        }),
        atualizadoEm: new Date().toISOString(),
      };
      return { ...preferences };
    }),
    exportData: jest.fn(async (): Promise<UserExportData> => ({
      exportadoEm: new Date().toISOString(),
      usuario: { ...user },
      preferencias: { ...preferences },
      registros: records,
    })),
    deleteAllRecords: jest.fn(async () => {
      records = [];
    }),
    deleteAccount: jest.fn(async () => {
      records = [];
    }),
  };

  const recordRepository: EmotionalRecordRepository = {
    create: jest.fn(async (params: SaveRecordParams): Promise<EmotionalRecord> => {
      const created: EmotionalRecord = {
        id: `rec-e2e-${++seq}`,
        nivelHumor: params.nivelHumor,
        contextos: [...params.contextos],
        pensamento: params.pensamento,
        registradoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };
      records = [created, ...records];
      return created;
    }),
    list: jest.fn(async (params?: ListRecordsParams): Promise<EmotionalRecord[]> => {
      if (!params?.contexto) return [...records];
      const slug: ContextSlug = params.contexto;
      return records.filter((item) => item.contextos.includes(slug));
    }),
    getById: jest.fn(async (id: string): Promise<EmotionalRecord> => {
      const found = records.find((r) => r.id === id);
      if (!found) throw new Error('Registro não encontrado');
      return found;
    }),
    update: jest.fn(async (id: string, params: SaveRecordParams): Promise<EmotionalRecord> => {
      const existing = records.find((r) => r.id === id);
      if (!existing) throw new Error('Registro não encontrado');
      const updated: EmotionalRecord = {
        ...existing,
        nivelHumor: params.nivelHumor,
        contextos: [...params.contextos],
        pensamento: params.pensamento,
        atualizadoEm: new Date().toISOString(),
      };
      records = records.map((r) => (r.id === id ? updated : r));
      return updated;
    }),
    remove: jest.fn(async (id: string) => {
      records = records.filter((r) => r.id !== id);
    }),
    getReflectionSummary: jest.fn(async (periodoDias: 7 | 30): Promise<ReflectionSummary> => ({
      periodoDias,
      totalRegistros: records.length,
      frequenciaHumores: [],
      contextosMaisPresentes: [],
    })),
  };

  function ThemeBridge({ children }: { children: React.ReactNode }) {
    const { fontSizeOption } = useSession();
    return <ThemeProvider fontSizeOption={fontSizeOption}>{children}</ThemeProvider>;
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={INITIAL_SAFE_METRICS}>
        <SessionProvider
          authRepository={authRepository}
          userRepository={userRepository}
          tokenStorage={tokenStorage}
          observability={observability}
        >
          <RecordsProvider recordRepository={recordRepository} observability={observability}>
            <ThemeBridge>{children}</ThemeBridge>
          </RecordsProvider>
        </SessionProvider>
      </SafeAreaProvider>
    );
  }

  return {
    Wrapper,
    userRepository,
    recordRepository,
  };
}

describe('Fluxos E2E de Interface do Aplicativo', () => {
  it('exige aceite explícito na tela de consentimento LGPD antes de liberar o avanço', async () => {
    const { Wrapper, userRepository } = createTestEnvironment(false);
    await render(
      <Wrapper>
        <LgpdConsentScreen />
      </Wrapper>
    );

    const confirmBtn = screen.getByRole('button', { name: 'Concordar e começar' });
    expect(confirmBtn.props.accessibilityState?.disabled).toBe(true);

    await fireEvent.press(
      screen.getByText('Li e concordo com o armazenamento seguro dos meus registros emocionais')
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Concordar e começar' }).props.accessibilityState
          ?.disabled
      ).toBe(false);
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Concordar e começar' }));

    await waitFor(() => {
      expect(userRepository.acceptLgpdConsent).toHaveBeenCalledTimes(1);
    });
  });

  it('cria um registro emocional na tela CreateRecordScreen e exibe no Diário', async () => {
    const { Wrapper, recordRepository } = createTestEnvironment(true);

    await render(
      <Wrapper>
        <CreateRecordScreen
          navigation={mockNavigation as never}
          route={{ key: 'CreateRecord-1', name: 'CreateRecord' } as never}
        />
        <DiaryScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Meu Diário')).toBeTruthy();
    });

    await fireEvent.press(screen.getByLabelText('Estudo'));
    await fireEvent.changeText(
      screen.getByLabelText('Pensamento opcional'),
      'Concluí o capítulo com calma e boa concentração.'
    );
    await fireEvent.press(screen.getByText('Salvar registro'));

    await waitFor(() => {
      expect(recordRepository.create).toHaveBeenCalledWith({
        nivelHumor: 4,
        contextos: ['estudo'],
        pensamento: 'Concluí o capítulo com calma e boa concentração.',
      });
      expect(mockNavigation.replace).toHaveBeenCalledWith('RecordSaved', {
        recordId: 'rec-e2e-1',
        nivelHumor: 4,
      });
      expect(screen.getByText('Concluí o capítulo com calma e boa concentração.')).toBeTruthy();
    });
  });

  it('atualiza personalização e acessibilidade separadamente na tela de Ajustes', async () => {
    const { Wrapper, userRepository } = createTestEnvironment(true);

    await render(
      <Wrapper>
        <SettingsScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Personalização')).toBeTruthy();
      expect(screen.getByText('Acessibilidade')).toBeTruthy();
    });

    await fireEvent.press(screen.getByText('Desativada'));
    await waitFor(() => {
      expect(userRepository.updatePreferences).toHaveBeenCalledWith({
        nivelEcossistema: 'desativada',
      });
    });

    await fireEvent.press(screen.getByText('Extra grande'));
    await waitFor(() => {
      expect(userRepository.updatePreferences).toHaveBeenCalledWith({
        tamanhoFonte: 'extra_grande',
      });
      expect(screen.getByText('Preferência salva.')).toBeTruthy();
    });
  });
});