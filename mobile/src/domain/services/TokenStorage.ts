export interface TokenStorage {
  getToken(): Promise<string | null>;
  saveToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
}