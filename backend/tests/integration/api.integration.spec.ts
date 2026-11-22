import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { getEnv } from '../../src/infra/config/env';
import { createContainer } from '../../src/infra/container/createContainer';
import { checkDatabaseConnection, closePool, getPool } from '../../src/infra/database/pool';
import { createApp } from '../../src/presentation/app';

const env = getEnv();
const pool = getPool();
const container = createContainer(pool, env);

const app = createApp({
  corsOrigin: env.CORS_ORIGIN,
  checkDatabase: checkDatabaseConnection,
  authRouter: container.authRouter,
  meRouter: container.meRouter,
  recordRouter: container.recordRouter,
  reflectionRouter: container.reflectionRouter,
});

const createdTokens: string[] = [];

afterAll(async () => {
  for (const token of createdTokens) {
    await request(app).delete('/api/v1/me').set('Authorization', `Bearer ${token}`);
  }
  await closePool();
});

describe('Integração API + PostgreSQL (Fluxo End-to-End do Backend)', () => {
  it('valida ciclo completo com persistência real, isolamento e LGPD', async () => {
    const suffix = Date.now();

    // 1. Cadastro da usuária fictícia Clara
    const claraReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        nome_exibicao: 'Clara Mendes',
        email: `clara.ficticia.${suffix}@exemplo.com`,
        senha: 'SenhaForte123',
      });
    expect(claraReg.status).toBe(201);
    const claraToken = claraReg.body.token as string;
    createdTokens.push(claraToken);

    // 2. Cadastro do usuário fictício Rafael (para testar isolamento)
    const rafaelReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        nome_exibicao: 'Rafael Fictício',
        email: `rafael.ficticio.${suffix}@exemplo.com`,
        senha: 'SenhaForte123',
      });
    expect(rafaelReg.status).toBe(201);
    const rafaelToken = rafaelReg.body.token as string;
    createdTokens.push(rafaelToken);

    // 3. Tentar criar registro antes do consentimento LGPD deve falhar (403)
    const blockedCreate = await request(app)
      .post('/api/v1/registros')
      .set('Authorization', `Bearer ${claraToken}`)
      .send({ nivel_humor: 4, contextos: ['sono'] });
    expect(blockedCreate.status).toBe(403);
    expect(blockedCreate.body.error.code).toBe('LGPD_CONSENT_REQUIRED');

    // 4. Aceitar consentimento LGPD
    const consentRes = await request(app)
      .post('/api/v1/me/consent')
      .set('Authorization', `Bearer ${claraToken}`)
      .send({ aceito: true });
    expect(consentRes.status).toBe(200);
    expect(consentRes.body.usuario.consentimento_lgpd).toBe(true);

    // 5. Criar registro emocional com múltiplos contextos
    const createRes = await request(app)
      .post('/api/v1/registros')
      .set('Authorization', `Bearer ${claraToken}`)
      .send({
        nivel_humor: 4,
        contextos: ['estudo', 'descanso'],
        pensamento: 'Terminei a leitura da tarde e senti leveza.',
      });
    expect(createRes.status).toBe(201);
    const registroId = createRes.body.registro.id as string;

    // 6. Listar filtrando por "estudo" e confirmar que "descanso" continua presente no item
    const filteredList = await request(app)
      .get('/api/v1/registros?contexto=estudo')
      .set('Authorization', `Bearer ${claraToken}`);
    expect(filteredList.status).toBe(200);
    expect(filteredList.body.registros).toHaveLength(1);
    expect(filteredList.body.registros[0].contextos).toEqual(['estudo', 'descanso']);

    // 7. Garantir que Rafael não vê nem altera o registro da Clara
    const rafaelRead = await request(app)
      .get(`/api/v1/registros/${registroId}`)
      .set('Authorization', `Bearer ${rafaelToken}`);
    expect(rafaelRead.status).toBe(404);

    // 8. Atualizar registro (PUT)
    const updateRes = await request(app)
      .put(`/api/v1/registros/${registroId}`)
      .set('Authorization', `Bearer ${claraToken}`)
      .send({
        nivel_humor: 2,
        contextos: ['sono', 'trabalho'],
        pensamento: 'Noite curta de sono, pausa para respirar.',
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.registro.nivel_humor).toBe(2);
    expect(updateRes.body.registro.contextos).toEqual(['sono', 'trabalho']);

    // 9. Consultar resumo reflexivo (7 dias)
    const summaryRes = await request(app)
      .get('/api/v1/reflexao/resumo?periodo=7')
      .set('Authorization', `Bearer ${claraToken}`);
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.total_registros).toBe(1);
    expect(summaryRes.body.contextos_mais_presentes).toHaveLength(2);

    // 10. Exportar dados (LGPD) deve incluir o registro atualizado
    const exportRes = await request(app)
      .get('/api/v1/me/export')
      .set('Authorization', `Bearer ${claraToken}`);
    expect(exportRes.status).toBe(200);
    expect(exportRes.body.registros).toHaveLength(1);
    expect(exportRes.body.registros[0].id).toBe(registroId);

    // 11. Excluir registro individual
    const deleteRes = await request(app)
      .delete(`/api/v1/registros/${registroId}`)
      .set('Authorization', `Bearer ${claraToken}`);
    expect(deleteRes.status).toBe(204);

    const afterDeleteGet = await request(app)
      .get(`/api/v1/registros/${registroId}`)
      .set('Authorization', `Bearer ${claraToken}`);
    expect(afterDeleteGet.status).toBe(404);
  });
});