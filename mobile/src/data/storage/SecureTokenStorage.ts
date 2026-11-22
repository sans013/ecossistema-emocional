import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TokenStorage } from '../../domain/services/TokenStorage';

const TOKEN_KEY = 'ecossistema_emocional_auth_token';

export class SecureTokenStorage implements TokenStorage {
  private memoryFallback: string | null = null;

  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return this.memoryFallback;
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  async saveToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      this.memoryFallback = token;
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async clearToken(): Promise<void> {
    if (Platform.OS === 'web') {
      this.memoryFallback = null;
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}