import { randomUUID } from 'crypto';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import {
  CreateEmotionalRecordUseCase,
  DeleteEmotionalRecordUseCase,
  GetEmotionalRecordUseCase,
  GetReflectionSummaryUseCase,
  ListEmotionalRecordsUseCase,
  UpdateEmotionalRecordUseCase,
} from '../../src/application/use-cases/EmotionalRecordUseCases';
import {
  ContextSlug,
  EmotionalRecord,
  ReflectionSummary,
} from '../../src/domain/entities/EmotionalRecord';
import {
  PublicUser,
  User,
  UserExportData,
  UserPreferences,
  UserProfile,
} from '../../src/domain/entities/User';
import {
  CreateEmotionalRecordData,
  EmotionalRecordRepository,
  ListEmotionalRecordsFilter,
  UpdateEmotionalRecordData,
} from '../../src/domain/repositories/EmotionalRecordRepository';
import {
  CreateUserData,
  UpdatePreferencesData,
  UserRepository,
} from '../../src/domain/repositories/UserRepository';
import { JwtTokenService } from '../../src/infra/security/JwtTokenService';
import { createApp } from '../../src/presentation/app';
import { EmotionalRecordController } from '../../src/presentation/controllers/EmotionalRecordController';
import { createAuthenticateMiddleware } from '../../src/presentation/middlewares/authenticate';
import { createRequireLgpdConsentMiddleware } from '../../src/presentation/middlewares/requireLgpdConsent';
import { createRecordRoutes } from '../../src/presentation/routes/recordRoutes';
import { createReflectionRoutes } from '../../src/presentation/routes/reflectionRoutes';

const CONTEXT_NAMES: Record<ContextSlug, string> = {
  sono: 'Sono',
  estudo: 'Estudo',
  trabalho: 'Trabalho',
  descanso: 'Descanso',
  relacoes: 'Relações',
};

class StubUserRepository implements UserRepository {
  constructor(private readonly consentByUser: Map<string, boolean>) {}

  async findByEmail(): Promise<User | null> {
    return null;
  }

  async findProfileById(userId: string): Promise<UserProfile | null> {
    if (!this.consentByUser.has(userId)) return null;
    const now = new Date();
    const consent = this.consentByUser.get(userId) ?? false;
    return {
      usuario: {
        id: userId,
        nomeExibicao: 'Pessoa Fictícia',
        email: `${userId}@exemplo.com`,
        consentimentoLgpd: consent,
        consentimentoAceitoEm: consent ? now : null,
        criadoEm: now,
        atualizadoEm: now,
      },
      preferencias: {
        usuarioId: userId,
        nivelEcossistema: 'suave',
        rotulosHumorCustom: {},
        lembretesAtivos: false,
        lembretesTurnos: [],
        tamanhoFonte: 'padrao',
        rotulosSempreVisiveis: true,
        atualizadoEm: now,
      },
    };
  }

  async createWithDefaultPreferences(_data: CreateUserData): Promise<UserProfile> {
    throw new Error('Not implemented');
  }
  async recordLgpdConsent(_userId: string): Promise<PublicUser | null> {
    return null;
  }
  async updatePreferences(
    _userId: string,
    _data: UpdatePreferencesData
  ): Promise<UserPreferences | null> {
    return null;
  }
  async exportAllUserData(_userId: string): Promise<UserExportData | null> {
    return null;
  }
  async deleteAllRecords(): Promise<void> {}
  async deleteAccount(): Promise<boolean> {
    return false;
  }
}

class InMemoryEmotionalRecordRepository implements EmotionalRecordRepository {
  private records = new Map<string, EmotionalRecord>();

  async create(data: CreateEmotionalRecordData): Promise<EmotionalRecord> {
    const now = new Date();
    const record: EmotionalRecord = {
      id: randomUUID(),
      usuarioId: data.usuarioId,
      nivelHumor: data.nivelHumor,
      contextos: [...data.contextos],
      pensamento: data.pensamento,
      registradoEm: now,
      atualizadoEm: now,
    };
    this.records.set(record.id, record);
    return record;
  }

  async findAllByUser(
    userId: string,
    filters?: ListEmotionalRecordsFilter
  ): Promise<EmotionalRecord[]> {
    return Array.from(this.records.values()).filter((r) => {
      if (r.usuarioId !== userId) return false;
      if (filters?.contexto && !r.contextos.includes(filters.contexto)) return false;
      return true;
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<EmotionalRecord | null> {
    const record = this.records.get(id);
    return record && record.usuarioId === userId ? record : null;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateEmotionalRecordData
  ): Promise<EmotionalRecord | null> {
    const record = this.records.get(id);
    if (!record || record.usuarioId !== userId) return null;
    const updated: EmotionalRecord = {
      ...record,
      nivelHumor: data.nivelHumor,
      contextos: [...data.contextos],
      pensamento: data.pensamento,
      atualizadoEm: new Date(),
    };
    this.records.set(id, updated);
    return updated;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const record = this.records.get(id);
    if (!record || record.usuarioId !== userId) return false;
    return this.records.delete(id);
  }

  async getReflectionSummary(
    userId: string,
    periodoDias: 7 | 30
  ): Promise<ReflectionSummary> {
    const mine = Array.from(this.records.values()).filter((r) => r.usuarioId === userId);
    const moodCount = new Map<number, number>();
    const contextCount = new Map<ContextSlug, number>();

    for (const r of mine) {
      moodCount.set(r.nivelHumor, (moodCount.get(r.nivelHumor) ?? 0) + 1);
      for (const slug of r.contextos) {
        contextCount.set(slug, (contextCount.get(slug) ?? 0) + 1);
      }
    }

    return {
      periodoDias,
      totalRegistros: mine.length,
      frequenciaHumores: Array.from(moodCount.entries()).map(([nivelHumor, quantidade]) => ({
        nivelHumor,
        quantidade,
      })),
      contextosMaisPresentes: Array.from(contextCount.entries()).map(([slug, quantidade]) => ({
        slug,
        nome: CONTEXT_NAMES[slug],
        quantidade,
      })),
    };
  }
}

function buildTestSetup() {
  const claraId = randomUUID();
  const rafaelId = randomUUID();
  const semConsentId = randomUUID();

  const consentMap = new Map<string, boolean>([
    [claraId, true],
    [rafaelId, true],
    [semConsentId, false],
  ]);

  const userRepo = new StubUserRepository(consentMap);
  const recordRepo = new InMemoryEmotionalRecordRepository();
  const tokenService = new JwtTokenService('segredo_de_teste_com_mais_de_32_caracteres', '1h');

  const controller = new EmotionalRecordController(
    new CreateEmotionalRecordUseCase(recordRepo),
    new ListEmotionalRecordsUseCase(recordRepo),
    new GetEmotionalRecordUseCase(recordRepo),
    new UpdateEmotionalRecordUseCase(recordRepo),
    new DeleteEmotionalRecordUseCase(recordRepo),
    new GetReflectionSummaryUseCase(recordRepo)
  );

  const authenticate = createAuthenticateMiddleware(tokenService);
  const requireLgpdConsent = createRequireLgpdConsentMiddleware(userRepo);

  const app = createApp({
    corsOrigin: 'http://localhost:8081',
    checkDatabase: async () => true,
    recordRouter: createRecordRoutes(controller, authenticate, requireLgpdConsent),
    reflectionRouter: createReflectionRoutes(controller, authenticate),
  });

  return {
    app,
    claraToken: tokenService.sign({ sub: claraId }),
    rafaelToken: tokenService.sign({ sub: rafaelId }),
    semConsentToken: tokenService.sign({ sub: semConsentId }),
  };
}

describe('CRUD de Registros Emocionais e Reflexão', () => {
  it('bloqueia criação de registro quando o consentimento LGPD ainda não foi aceito', async () => {
    const { app, semConsentToken } = buildTestSetup();

    const res = await request(app)
      .post('/api/v1/registros')
      .set('Authorization', `Bearer ${semConsentToken}`)
      .send({ nivel_humor: 4, contextos: ['sono'] });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('LGPD_CONSENT_REQUIRED');
  });

  it('executa CRUD completo, resumo reflexivo e impede acesso de outro usuário', async () => {
    const { app, claraToken, rafaelToken } = buildTestSetup();

    // Criar
    const createRes = await request(app)
      .post('/api/v1/registros')
      .set('Authorization', `Bearer ${claraToken}`)
      .send({
        nivel_humor: 4,
        contextos: ['estudo', 'descanso', 'estudo'],
        pensamento: 'Terminei a leitura da tarde e senti leveza.',
      });

    expect(createRes.status).toBe(201);
    const registroId = createRes.body.registro.id as string;
    expect(createRes.body.registro.contextos).toEqual(['estudo', 'descanso']);

    // Isolamento: Rafael não pode consultar, alterar nem excluir o registro da Clara
    const rafaelGet = await request(app)
      .get(`/api/v1/registros/${registroId}`)
      .set('Authorization', `Bearer ${rafaelToken}`);
    expect(rafaelGet.status).toBe(404);

    const rafaelDelete = await request(app)
      .delete(`/api/v1/registros/${registroId}`)
      .set('Authorization', `Bearer ${rafaelToken}`);
    expect(rafaelDelete.status).toBe(404);

    // Validação de UUID malformado no servidor
    const invalidIdRes = await request(app)
      .get('/api/v1/registros/id-invalido')
      .set('Authorization', `Bearer ${claraToken}`);
    expect(invalidIdRes.status).toBe(400);

    // Listar com filtro de contexto
    const listRes = await request(app)
      .get('/api/v1/registros?contexto=estudo')
      .set('Authorization', `Bearer ${claraToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.registros).toHaveLength(1);

    // Editar
    const updateRes = await request(app)
      .put(`/api/v1/registros/${registroId}`)
      .set('Authorization', `Bearer ${claraToken}`)
      .send({
        nivel_humor: 2,
        contextos: ['sono', 'trabalho'],
        pensamento: 'Pausa com chá quente ajudou um pouco.',
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.registro.nivel_humor).toBe(2);
    expect(updateRes.body.registro.contextos).toEqual(['sono', 'trabalho']);

    // Reflexão
    const reflectionRes = await request(app)
      .get('/api/v1/reflexao/resumo?periodo=7')
      .set('Authorization', `Bearer ${claraToken}`);
    expect(reflectionRes.status).toBe(200);
    expect(reflectionRes.body.total_registros).toBe(1);
    expect(reflectionRes.body.frequencia_humores[0]).toEqual({
      nivel_humor: 2,
      quantidade: 1,
    });

    // Excluir
    const deleteRes = await request(app)
      .delete(`/api/v1/registros/${registroId}`)
      .set('Authorization', `Bearer ${claraToken}`);
    expect(deleteRes.status).toBe(204);
  });
});