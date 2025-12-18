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
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  RivalsListResponse,
  AddRivalRequest,
  AddRivalResponse,
  DeleteRivalResponse,
  SkillsListResponse,
  InterestsListResponse,
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

  // ========================================
  // プロフィール更新
  // ========================================

  /** プロフィール更新 */
  updateUser: async (
    userId: string,
    data: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> => {
    const response = await httpClient.put<UpdateUserProfileResponse>(
      `/api/v1/users/${userId}`,
      data,
    );
    return response.data;
  },

  // ========================================
  // ライバル
  // ========================================

  /** ライバル一覧取得 */
  getRivals: async (userId: string): Promise<RivalsListResponse> => {
    const response = await httpClient.get<RivalsListResponse>(
      `/api/v1/users/${userId}/rivals`,
    );
    return response.data;
  },

  /** ライバル追加 */
  addRival: async (
    userId: string,
    data: AddRivalRequest,
  ): Promise<AddRivalResponse> => {
    const response = await httpClient.post<AddRivalResponse>(
      `/api/v1/users/${userId}/rivals`,
      data,
    );
    return response.data;
  },

  /** ライバル削除 */
  deleteRival: async (
    userId: string,
    rivalId: string,
  ): Promise<DeleteRivalResponse> => {
    const response = await httpClient.delete<DeleteRivalResponse>(
      `/api/v1/users/${userId}/rivals/${rivalId}`,
    );
    return response.data;
  },

  // ========================================
  // スキル・興味一覧
  // ========================================

  /** スキル一覧取得 */
  getSkills: async (): Promise<SkillsListResponse> => {
    const response =
      await httpClient.get<SkillsListResponse>('/api/v1/users/skills');
    return response.data;
  },

  /** 興味・関心一覧取得 */
  getInterests: async (): Promise<InterestsListResponse> => {
    const response =
      await httpClient.get<InterestsListResponse>('/api/v1/users/interests');
    return response.data;
  },
};
