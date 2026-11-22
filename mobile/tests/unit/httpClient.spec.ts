import { ApiError, HttpClient } from '../../src/data/http/HttpClient';
import { ObservabilityService } from '../../src/domain/services/ObservabilityService';
import { TokenStorage } from '../../src/domain/services/TokenStorage';

describe('HttpClient', () => {
  const tokenStorage: TokenStorage = {
    getToken: jest.fn(async () => 'jwt-token-ficticio'),
    saveToken: jest.fn(async () => undefined),
    clearToken: jest.fn(async () => undefined),
  };

  const observability: ObservabilityService = {
    recordError: jest.fn(),
    logEvent: jest.fn(),
  };

  it('envia header Authorization Bearer em rotas autenticadas', async () => {
    const mockFetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 'ok' }),
    })) as unknown as typeof fetch;

    const client = new HttpClient('https://api.exemplo.com/api/v1', tokenStorage, observability, mockFetch);
    const data = await client.request<{ status: string }>('/me');

    expect(data.status).toBe('ok');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.exemplo.com/api/v1/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-ficticio',
        }),
      })
    );
  });

  it('converte resposta de erro da API em ApiError tipado', async () => {
    const mockFetch = jest.fn(async () => ({
      ok: false,
      status: 403,
      text: async () =>
        JSON.stringify({
          error: {
            code: 'LGPD_CONSENT_REQUIRED',
            message: 'Consentimento obrigatório.',
          },
        }),
    })) as unknown as typeof fetch;

    const client = new HttpClient('https://api.exemplo.com/api/v1', tokenStorage, observability, mockFetch);

    await expect(client.request('/registros', { method: 'POST', body: {} })).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 403,
      code: 'LGPD_CONSENT_REQUIRED',
    } satisfies Partial<ApiError>);
  });

  it('trata resposta 204 No Content sem tentar fazer parse de JSON', async () => {
    const mockFetch = jest.fn(async () => ({
      ok: true,
      status: 204,
      text: async () => '',
    })) as unknown as typeof fetch;

    const client = new HttpClient('https://api.exemplo.com/api/v1', tokenStorage, observability, mockFetch);
    const result = await client.request<void>('/me', { method: 'DELETE' });

    expect(result).toBeUndefined();
  });
});