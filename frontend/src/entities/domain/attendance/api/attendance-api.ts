/**
 * Attendance API Client
 *
 * 参加ドメイン（ランキング）のAPIクライアント
 */

import httpClient from '@/shared/api/client/http-client';
import type {
  AllRankingsResponse,
  MyRankingsResponse,
  MyRankingsParams,
  RankingsParams,
} from '../model/types';

export const attendanceApi = {
  // ========================================
  // ランキング
  // ========================================

  /**
   * 全ランキングを一括取得
   * @param params クエリパラメータ（year, month, limit）
   */
  getRankings: async (params?: RankingsParams): Promise<AllRankingsResponse> => {
    const response = await httpClient.get<AllRankingsResponse>(
      '/api/v1/rankings',
      { params },
    );
    return response.data;
  },

  /**
   * 自分のランキング情報を取得
   * @param params クエリパラメータ（year, month）
   */
  getMyRankings: async (params?: MyRankingsParams): Promise<MyRankingsResponse> => {
    const response = await httpClient.get<MyRankingsResponse>(
      '/api/v1/rankings/me',
      { params },
    );
    return response.data;
  },
};
