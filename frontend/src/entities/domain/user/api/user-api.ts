/**
 * User API Client
 */

import httpClient from '@/shared/api/client/http-client';
import type {
  UserSearchParams,
  UsersListResponse,
  UserDetailResponse,
} from '../model/types';

export const userApi = {
  /**
   * ユーザー一覧取得
   */
  getUsers: async (params?: UserSearchParams): Promise<UsersListResponse> => {
    const response = await httpClient.get<UsersListResponse>('/api/v1/users', {
      params,
    });
    return response.data;
  },

  /**
   * ユーザー詳細取得
   */
  getUserById: async (userId: string): Promise<UserDetailResponse> => {
    const response = await httpClient.get<UserDetailResponse>(
      `/api/v1/users/${userId}`,
    );
    return response.data;
  },
};
