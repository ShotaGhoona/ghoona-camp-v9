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
  AttendanceStatisticsResponse,
  AttendanceSummariesResponse,
  AttendanceSummariesParams,
} from '../model/types';

export const attendanceApi = {
  // ========================================
  // ランキング
  // ========================================

  /**
   * 全ランキングを一括取得
   * @param params クエリパラメータ（year, month, limit）
   */
  getRankings: async (
    params?: RankingsParams,
  ): Promise<AllRankingsResponse> => {
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
  getMyRankings: async (
    params?: MyRankingsParams,
  ): Promise<MyRankingsResponse> => {
    const response = await httpClient.get<MyRankingsResponse>(
      '/api/v1/rankings/me',
      { params },
    );
    return response.data;
  },

  // ========================================
  // 参加統計・サマリー
  // ========================================

  /**
   * 参加統計を取得
   * @param userId ユーザーID
   */
  getStatistics: async (
    userId: string,
  ): Promise<AttendanceStatisticsResponse> => {
    const response = await httpClient.get<AttendanceStatisticsResponse>(
      `/api/v1/users/${userId}/attendance/statistics`,
    );
    return response.data;
  },

  /**
   * 参加サマリーを取得（日単位）
   * @param userId ユーザーID
   * @param params クエリパラメータ（dateFrom, dateTo）
   */
  getSummaries: async (
    userId: string,
    params?: AttendanceSummariesParams,
  ): Promise<AttendanceSummariesResponse> => {
    const response = await httpClient.get<AttendanceSummariesResponse>(
      `/api/v1/users/${userId}/attendance/summaries`,
      {
        params: {
          date_from: params?.dateFrom,
          date_to: params?.dateTo,
        },
      },
    );
    return response.data;
  },
};
