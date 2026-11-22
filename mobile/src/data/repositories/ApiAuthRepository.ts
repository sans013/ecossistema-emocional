import {
  AuthRepository,
  AuthSession,
  LoginParams,
  RegisterParams,
} from '../../domain/repositories/AuthRepository';
import { HttpClient } from '../http/HttpClient';
import { ApiPreferencesDto, ApiUserDto, mapPreferences, mapUser } from './mappers';

export class ApiAuthRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async register(params: RegisterParams): Promise<AuthSession> {
    const response = await this.http.request<{
      token: string;
      usuario: ApiUserDto;
      preferencias?: ApiPreferencesDto;
    }>('/auth/register', {
      method: 'POST',
      authenticated: false,
      body: {
        nome_exibicao: params.nomeExibicao,
        email: params.email,
        senha: params.senha,
      },
    });

    return {
      token: response.token,
      usuario: mapUser(response.usuario),
      preferencias: response.preferencias ? mapPreferences(response.preferencias) : undefined,
    };
  }

  async login(params: LoginParams): Promise<AuthSession> {
    const response = await this.http.request<{
      token: string;
      usuario: ApiUserDto;
    }>('/auth/login', {
      method: 'POST',
      authenticated: false,
      body: {
        email: params.email,
        senha: params.senha,
      },
    });

    return {
      token: response.token,
      usuario: mapUser(response.usuario),
    };
  }
}