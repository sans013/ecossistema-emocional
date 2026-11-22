import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/presentation/app';

describe('GET /health', () => {
  it('retorna 200 quando o banco está disponível', async () => {
    const app = createApp({
      corsOrigin: 'http://localhost:8081',
      checkDatabase: async () => true,
    });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
  });

  it('retorna 503 quando a verificação do banco falha', async () => {
    const app = createApp({
      corsOrigin: 'http://localhost:8081',
      checkDatabase: async () => {
        throw new Error('DB offline');
      },
    });

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body.database).toBe('unavailable');
  });
});