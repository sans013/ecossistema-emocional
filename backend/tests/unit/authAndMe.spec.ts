import request from 'supertest';
import { describe, expect, it } from 'vitest';
import {
  LoginUserUseCase,
  RegisterUserUseCase,
} from '../../src/application/use-cases/AuthUseCases';
import {
  AcceptLgpdConsentUseCase,
  DeleteAccountUseCase,
  DeleteAllUserRecordsUseCase,
  ExportUserDataUseCase,
  GetProfileUseCase,
  UpdatePreferencesUseCase,
} from '../../src/application/use-cases/MeUseCases';
import {
  PublicUser,
  toPublicUser,
  User,
  UserExportData,
  UserPreferences,
  UserProfile,
} from '../../src/domain/entities/User';
import {
  CreateUserData,
  UpdatePreferencesData,
  UserRepository,
} from '../../src/domain/repositories/UserRepository';
import { PasswordHasher } from '../../src/domain/services/SecurityServices';
import { JwtTokenService } from '../../src/infra/security/JwtTokenService';
import { createApp } from '../../src/presentation/app';
import { AuthController } from '../../src/presentation/controllers/AuthController';
import { MeController } from '../../src/presentation/controllers/MeController';
import { createAuthenticateMiddleware } from '../../src/presentation/middlewares/authenticate';
import { createAuthRoutes } from '../../src/presentation/routes/authRoutes';
import { createMeRoutes } from '../../src/presentation/routes/meRoutes';

class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();
  private preferences = new Map<string, UserPreferences>();
  private counter = 0;

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findProfileById(userId: string): Promise<UserProfile | null> {
    const user = this.users.get(userId);
    const pref = this.preferences.get(userId);
    if (!user || !pref) return null;
    return { usuario: toPublicUser(user), preferencias: pref };
  }

  async createWithDefaultPreferences(data: CreateUserData): Promise<UserProfile> {
    const now = new Date();
    const id = `user-ficticio-${++this.counter}`;
    const user: User = {
      id,
      nomeExibicao: data.nomeExibicao,
      email: data.email,
      senhaHash: data.senhaHash,
      consentimentoLgpd: false,
      consentimentoAceitoEm: null,
      criadoEm: now,
      atualizadoEm: now,
    };
    const pref: UserPreferences = {
      usuarioId: id,
      nivelEcossistema: 'suave',
      rotulosHumorCustom: {},
      lembretesAtivos: false,
      lembretesTurnos: [],
      tamanhoFonte: 'padrao',
      rotulosSempreVisiveis: true,
      atualizadoEm: now,
    };
    this.users.set(id, user);
    this.preferences.set(id, pref);
    return { usuario: toPublicUser(user), preferencias: pref };
  }

  async recordLgpdConsent(userId: string): Promise<PublicUser | null> {
    const user = this.users.get(userId);
    if (!user) return null;
    user.consentimentoLgpd = true;
    user.consentimentoAceitoEm = user.consentimentoAceitoEm ?? new Date();
    return toPublicUser(user);
  }

  async updatePreferences(
    userId: string,
    data: UpdatePreferencesData
  ): Promise<UserPreferences | null> {
    const pref = this.preferences.get(userId);
    if (!pref) return null;
    Object.assign(pref, data, { atualizadoEm: new Date() });
    return pref;
  }

  async exportAllUserData(userId: string): Promise<UserExportData | null> {
    const profile = await this.findProfileById(userId);
    if (!profile) return null;
    return {
      exportadoEm: new Date().toISOString(),
      usuario: profile.usuario,
      preferencias: profile.preferencias,
      registros: [],
    };
  }

  async deleteAllRecords(_userId: string): Promise<void> {}

  async deleteAccount(userId: string): Promise<boolean> {
    this.preferences.delete(userId);
    return this.users.delete(userId);
  }
}

class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return hashed === `hashed:${plain}`;
  }
}

function buildTestApp() {
  const repo = new InMemoryUserRepository();
  const hasher = new FakePasswordHasher();
  const tokenService = new JwtTokenService('segredo_de_teste_com_mais_de_32_caracteres', '1h');

  const authController = new AuthController(
    new RegisterUserUseCase(repo, hasher, tokenService),
    new LoginUserUseCase(repo, hasher, tokenService)
  );

  const meController = new MeController(
    new GetProfileUseCase(repo),
    new AcceptLgpdConsentUseCase(repo),
    new UpdatePreferencesUseCase(repo),
    new ExportUserDataUseCase(repo),
    new DeleteAllUserRecordsUseCase(repo),
    new DeleteAccountUseCase(repo)
  );

  const authenticate = createAuthenticateMiddleware(tokenService);

  return createApp({
    corsOrigin: 'http://localhost:8081',
    checkDatabase: async () => true,
    authRouter: createAuthRoutes(authController),
    meRouter: createMeRoutes(meController, authenticate),
  });
}

describe('Fluxo de Autenticação, Preferências e LGPD', () => {
  it('rejeita acesso a rotas protegidas sem token', async () => {
    const app = buildTestApp();
    const res = await request(app).get('/api/v1/me');
    expect(res.status).toBe(401);
  });

  it('valida senha fraca no servidor durante o cadastro', async () => {
    const app = buildTestApp();
    const res = await request(app).post('/api/v1/auth/register').send({
      nome_exibicao: 'Clara Mendes',
      email: 'clara.ficticia@exemplo.com',
      senha: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('cadastra, autentica, aceita LGPD, salva preferências, exporta e exclui conta', async () => {
    const app = buildTestApp();

    // 1. Cadastro (dados fictícios)
    const registerRes = await request(app).post('/api/v1/auth/register').send({
      nome_exibicao: 'Clara Mendes',
      email: 'clara.ficticia@exemplo.com',
      senha: 'SenhaForte123',
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeTruthy();
    expect(registerRes.body.usuario.consentimento_lgpd).toBe(false);
    expect(registerRes.body.usuario.senha_hash).toBeUndefined();

    // 2. Login
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'clara.ficticia@exemplo.com',
      senha: 'SenhaForte123',
    });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token as string;

    // 3. Consentimento LGPD explícito
    const consentRes = await request(app)
      .post('/api/v1/me/consent')
      .set('Authorization', `Bearer ${token}`)
      .send({ aceito: true });
    expect(consentRes.status).toBe(200);
    expect(consentRes.body.usuario.consentimento_lgpd).toBe(true);

    // 4. Personalização e Acessibilidade separadas
    const prefRes = await request(app)
      .patch('/api/v1/me/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nivel_ecossistema: 'completa',
        tamanho_fonte: 'grande',
      });
    expect(prefRes.status).toBe(200);
    expect(prefRes.body.preferencias.nivel_ecossistema).toBe('completa');
    expect(prefRes.body.preferencias.tamanho_fonte).toBe('grande');

    // 5. Exportação dos próprios dados
    const exportRes = await request(app)
      .get('/api/v1/me/export')
      .set('Authorization', `Bearer ${token}`);
    expect(exportRes.status).toBe(200);
    expect(exportRes.body.usuario.email).toBe('clara.ficticia@exemplo.com');
    expect(exportRes.body.registros).toEqual([]);

    // 6. Exclusão permanente da conta
    const deleteRes = await request(app)
      .delete('/api/v1/me')
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(204);

    // 7. Confirma que a conta removida não existe mais
    const afterDeleteRes = await request(app)
      .get('/api/v1/me')
      .set('Authorization', `Bearer ${token}`);
    expect(afterDeleteRes.status).toBe(404);
  });
});