import { describe, expect, it } from 'vitest';
import { parseEnv } from '../../src/infra/config/env';

describe('parseEnv', () => {
  it('valida corretamente variáveis completas', () => {
    const config = parseEnv({
      NODE_ENV: 'test',
      PORT: '4000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'a'.repeat(32),
      JWT_EXPIRES_IN: '7d',
      BCRYPT_SALT_ROUNDS: '12',
      CORS_ORIGIN: 'http://localhost:8081',
    });

    expect(config.PORT).toBe(4000);
    expect(config.BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('falha quando JWT_SECRET é curto ou ausente', () => {
    expect(() =>
      parseEnv({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'curto',
      })
    ).toThrow(/Configuração de ambiente inválida/);
  });
});