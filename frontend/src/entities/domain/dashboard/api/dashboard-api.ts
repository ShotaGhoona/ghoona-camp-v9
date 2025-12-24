/**
 * Dashboard API Client
 */

import httpClient from '@/shared/api/client/http-client';
import type {
  DashboardLayoutResponse,
  UpdateDashboardLayoutRequest,
  UpdateDashboardLayoutResponse,
} from '../model/types';

export const dashboardApi = {
  // ========================================
  // レイアウト取得
  // ========================================

  /** ダッシュボードレイアウト取得 */
  getLayout: async (): Promise<DashboardLayoutResponse> => {
    const response = await httpClient.get<DashboardLayoutResponse>(
      '/api/v1/dashboard/layout',
    );
    return response.data;
  },

  // ========================================
  // レイアウト更新
  // ========================================

  /** ダッシュボードレイアウト更新 */
  updateLayout: async (
    data: UpdateDashboardLayoutRequest,
  ): Promise<UpdateDashboardLayoutResponse> => {
    const response = await httpClient.put<UpdateDashboardLayoutResponse>(
      '/api/v1/dashboard/layout',
      data,
    );
    return response.data;
  },
};
