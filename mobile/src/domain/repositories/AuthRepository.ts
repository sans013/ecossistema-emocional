import { PublicUser, UserPreferences } from '../entities/User';

export interface AuthSession {
  token: string;
  usuario: PublicUser;
  preferencias?: UserPreferences;
}

export interface RegisterParams {
  nomeExibicao: string;
  email: string;
  senha: string;
}

export interface LoginParams {
  email: string;
  senha: string;
}

export interface AuthRepository {
  register(params: RegisterParams): Promise<AuthSession>;
  login(params: LoginParams): Promise<AuthSession>;
}