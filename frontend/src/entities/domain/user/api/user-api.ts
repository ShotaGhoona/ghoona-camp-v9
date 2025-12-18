/**
 * User API Client
 */

import httpClient from '@/shared/api/client/http-client';
import type {
  UserSearchParams,
  UsersListResponse,
  UserDetailResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from '../model/types';

export const userApi = {
  // ========================================
  // ユーザー一覧・詳細
  // ========================================

  /** ユーザー一覧取得 */
  getUsers: async (params?: UserSearchParams): Promise<UsersListResponse> => {
    const response = await httpClient.get<UsersListResponse>('/api/v1/users', {
      params,
    });
    return response.data;
  },

  /** ユーザー詳細取得 */
  getUserById: async (userId: string): Promise<UserDetailResponse> => {
    const response = await httpClient.get<UserDetailResponse>(
      `/api/v1/users/${userId}`,
    );
    return response.data;
  },

  // ========================================
  // 認証
  // ========================================

  /** ログイン */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>(
      '/auth/login',
      credentials,
    );
    return response.data;
  },

  /** ログアウト */
  logout: async (): Promise<LogoutResponse> => {
    const response = await httpClient.post<LogoutResponse>('/auth/logout');
    return response.data;
  },

  /** 現在のユーザー情報取得 */
  getMe: async (): Promise<MeResponse> => {
    const response = await httpClient.get<MeResponse>('/auth/me');
    return response.data;
  },
};
