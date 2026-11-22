export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, passwordHash: string): Promise<boolean>;
}

export interface TokenPayload {
  sub: string;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}