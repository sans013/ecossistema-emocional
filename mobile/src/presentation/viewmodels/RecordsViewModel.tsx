import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getFlowerByMood } from '../../domain/catalog/FlowerCatalog';
import {
  ContextSlug,
  EmotionalRecord,
  ReflectionSummary,
} from '../../domain/entities/EmotionalRecord';
import { EmotionalRecordRepository } from '../../domain/repositories/EmotionalRecordRepository';
import { IAGenRepository } from '../../domain/repositories/IAGenRepository';
import { ObservabilityService } from '../../domain/services/ObservabilityService';
import { useSession } from './SessionContext';

export interface RecordsContextValue {
  records: EmotionalRecord[];
  loadingList: boolean;
  listError: string | null;
  selectedContextFilter: ContextSlug | 'todos';
  setSelectedContextFilter: (filter: ContextSlug | 'todos') => void;
  refreshRecords: (contextFilter?: ContextSlug | 'todos') => Promise<void>;
  createRecord: (params: {
    nivelHumor: number;
    contextos: ContextSlug[];
    pensamento: string | null;
    mensagemFlor?: string | null;
  }) => Promise<EmotionalRecord>;
  generateFlowerMessage: (params: {
    nivelHumor: number;
    contextos: ContextSlug[];
    pensamento: string | null;
  }) => Promise<{ mensagem: string; geradoPorIA: boolean }>;
  getRecordById: (id: string) => Promise<EmotionalRecord>;
  updateRecord: (
    id: string,
    params: {
      nivelHumor: number;
      contextos: ContextSlug[];
      pensamento: string | null;
      mensagemFlor?: string | null;
    }
  ) => Promise<EmotionalRecord>;
  deleteRecord: (id: string) => Promise<void>;
  fetchReflectionSummary: (periodoDias: 7 | 30) => Promise<ReflectionSummary>;
}

const RecordsContext = createContext<RecordsContextValue | null>(null);

interface RecordsProviderProps {
  recordRepository: EmotionalRecordRepository;
  iagenRepository?: IAGenRepository;
  observability: ObservabilityService;
  children: React.ReactNode;
}

export function RecordsProvider({
  recordRepository,
  iagenRepository,
  observability,
  children,
}: RecordsProviderProps) {
  const { isAuthenticated, user } = useSession();
  const [records, setRecords] = useState<EmotionalRecord[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedContextFilter, setSelectedContextFilter] = useState<ContextSlug | 'todos'>(
    'todos'
  );

  const refreshRecords = useCallback(
    async (contextFilter: ContextSlug | 'todos' = selectedContextFilter) => {
      if (!isAuthenticated || !user?.consentimentoLgpd) {
        setRecords([]);
        return;
      }

      setLoadingList(true);
      setListError(null);
      try {
        const items = await recordRepository.list(
          contextFilter !== 'todos' ? { contexto: contextFilter } : undefined
        );
        setRecords(items);
      } catch (err) {
        observability.recordError(err, { action: 'list_records' });
        setListError('Não foi possível carregar seus registros agora.');
      } finally {
        setLoadingList(false);
      }
    },
    [isAuthenticated, user?.consentimentoLgpd, recordRepository, observability, selectedContextFilter]
  );

  useEffect(() => {
    void refreshRecords(selectedContextFilter);
  }, [refreshRecords, selectedContextFilter]);

  const createRecord = useCallback(
    async (params: {
      nivelHumor: number;
      contextos: ContextSlug[];
      pensamento: string | null;
      mensagemFlor?: string | null;
    }) => {
      const created = await recordRepository.create(params);
      setRecords((prev) => [created, ...prev]);
      observability.logEvent('record_created');
      return created;
    },
    [recordRepository, observability]
  );

  const generateFlowerMessage = useCallback(
    async (params: {
      nivelHumor: number;
      contextos: ContextSlug[];
      pensamento: string | null;
    }): Promise<{ mensagem: string; geradoPorIA: boolean }> => {
      const fallback = getFlowerByMood(params.nivelHumor).mensagemFallback;
      if (!iagenRepository) {
        return { mensagem: fallback, geradoPorIA: false };
      }

      try {
        const response = await iagenRepository.generateFlowerMessage(params);
        observability.logEvent('iagen_flower_message_generated');
        return { mensagem: response.mensagem, geradoPorIA: true };
      } catch (err) {
        observability.recordError(err, { action: 'generate_flower_message' });
        return { mensagem: fallback, geradoPorIA: false };
      }
    },
    [iagenRepository, observability]
  );

  const getRecordById = useCallback(
    async (id: string) => {
      return recordRepository.getById(id);
    },
    [recordRepository]
  );

  const updateRecord = useCallback(
    async (
      id: string,
      params: {
        nivelHumor: number;
        contextos: ContextSlug[];
        pensamento: string | null;
        mensagemFlor?: string | null;
      }
    ) => {
      const updated = await recordRepository.update(id, params);
      setRecords((prev) => prev.map((item) => (item.id === id ? updated : item)));
      observability.logEvent('record_updated');
      return updated;
    },
    [recordRepository, observability]
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      await recordRepository.remove(id);
      setRecords((prev) => prev.filter((item) => item.id !== id));
      observability.logEvent('record_deleted');
    },
    [recordRepository, observability]
  );

  const fetchReflectionSummary = useCallback(
    async (periodoDias: 7 | 30) => {
      return recordRepository.getReflectionSummary(periodoDias);
    },
    [recordRepository]
  );

  const value = useMemo<RecordsContextValue>(
    () => ({
      records,
      loadingList,
      listError,
      selectedContextFilter,
      setSelectedContextFilter,
      refreshRecords,
      createRecord,
      generateFlowerMessage,
      getRecordById,
      updateRecord,
      deleteRecord,
      fetchReflectionSummary,
    }),
    [
      records,
      loadingList,
      listError,
      selectedContextFilter,
      refreshRecords,
      createRecord,
      generateFlowerMessage,
      getRecordById,
      updateRecord,
      deleteRecord,
      fetchReflectionSummary,
    ]
  );

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords(): RecordsContextValue {
  const ctx = useContext(RecordsContext);
  if (!ctx) {
    throw new Error('useRecords deve ser utilizado dentro de RecordsProvider.');
  }
  return ctx;
}

export function formatRecordDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const now = new Date();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return `Hoje, ${hh}:${mm}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Ontem, ${hh}:${mm}`;
  }

  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  return `${date.getDate()} ${months[date.getMonth()]}, ${hh}:${mm}`;
}