import httpClient from '@/shared/api/client/http-client';
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from '../model/types';

/**
 * 認証API
 */
export const authApi = {
  /**
   * ログイン
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(
      '/auth/login',
      credentials,
    );
    return response.data;
  },

  /**
   * ログアウト
   */
  async logout(): Promise<LogoutResponse> {
    const response = await httpClient.post<LogoutResponse>('/auth/logout');
    return response.data;
  },

  /**
   * 現在のユーザー情報取得
   */
  async getMe(): Promise<MeResponse> {
    const response = await httpClient.get<MeResponse>('/auth/me');
    return response.data;
  },
};
