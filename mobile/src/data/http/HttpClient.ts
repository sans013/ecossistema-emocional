import { ObservabilityService } from '../../domain/services/ObservabilityService';
import { TokenStorage } from '../../domain/services/TokenStorage';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
  timeoutMs?: number;
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokenStorage: TokenStorage,
    private readonly observability: ObservabilityService,
    private readonly fetchImpl: typeof fetch = (input, init) => globalThis.fetch(input, init)
  ) {}

  async request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      authenticated = true,
      timeoutMs = 10_000,
    } = options;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (authenticated) {
      const token = await this.tokenStorage.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (response.status === 204) {
        return undefined as T;
      }

      const rawText = await response.text();
      const parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};

      if (!response.ok) {
        const errorObj = parsed.error as
          | { code?: string; message?: string; details?: unknown }
          | undefined;
        throw new ApiError(
          errorObj?.message ?? 'Não foi possível concluir a solicitação.',
          response.status,
          errorObj?.code ?? 'HTTP_ERROR',
          errorObj?.details
        );
      }

      return parsed as T;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }

      this.observability.recordError(err, { path, method });

      if (err instanceof Error && err.name === 'AbortError') {
        throw new ApiError(
          'A conexão demorou mais que o esperado. Tente novamente.',
          408,
          'TIMEOUT_ERROR'
        );
      }

      throw new ApiError(
        'Sem comunicação com o servidor no momento. Verifique sua conexão.',
        0,
        'NETWORK_ERROR'
      );
    } finally {
      clearTimeout(timer);
    }
  }
}