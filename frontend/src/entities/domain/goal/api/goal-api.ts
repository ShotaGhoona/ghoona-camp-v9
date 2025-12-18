/**
 * Goal API Client
 */

import httpClient from '@/shared/api/client/http-client';
import type {
  MyGoalsSearchParams,
  MyGoalsListResponse,
  PublicGoalsSearchParams,
  PublicGoalsListResponse,
  CreateGoalRequest,
  CreateGoalResponse,
  UpdateGoalRequest,
  UpdateGoalResponse,
  DeleteGoalResponse,
} from '../model/types';

export const goalApi = {
  // ========================================
  // 目標一覧
  // ========================================

  /** 自分の目標一覧取得 */
  getMyGoals: async (
    params: MyGoalsSearchParams,
  ): Promise<MyGoalsListResponse> => {
    const response = await httpClient.get<MyGoalsListResponse>(
      '/api/v1/goals/me',
      { params },
    );
    return response.data;
  },

  /** 公開目標一覧取得 */
  getPublicGoals: async (
    params: PublicGoalsSearchParams,
  ): Promise<PublicGoalsListResponse> => {
    const response = await httpClient.get<PublicGoalsListResponse>(
      '/api/v1/goals/public',
      { params },
    );
    return response.data;
  },

  // ========================================
  // 目標CRUD
  // ========================================

  /** 目標作成 */
  createGoal: async (data: CreateGoalRequest): Promise<CreateGoalResponse> => {
    const response = await httpClient.post<CreateGoalResponse>(
      '/api/v1/goals',
      data,
    );
    return response.data;
  },

  /** 目標更新 */
  updateGoal: async (
    goalId: string,
    data: UpdateGoalRequest,
  ): Promise<UpdateGoalResponse> => {
    const response = await httpClient.put<UpdateGoalResponse>(
      `/api/v1/goals/${goalId}`,
      data,
    );
    return response.data;
  },

  /** 目標削除 */
  deleteGoal: async (goalId: string): Promise<DeleteGoalResponse> => {
    const response = await httpClient.delete<DeleteGoalResponse>(
      `/api/v1/goals/${goalId}`,
    );
    return response.data;
  },
};
