/**
 * Title API Client
 *
 * 称号ドメインのAPIクライアント
 */

import httpClient from '@/shared/api/client/http-client';
import type { TitleLevel } from '@/shared/domain/title/model/types';
import type {
  TitleHoldersResponse,
  UserTitleAchievementsResponse,
} from '../model/types';

export const titleApi = {
  // ========================================
  // 称号保持者
  // ========================================

  /**
   * 指定レベルの称号保持者一覧を取得
   * @param level 称号レベル (1-8)
   */
  getTitleHolders: async (level: TitleLevel): Promise<TitleHoldersResponse> => {
    const response = await httpClient.get<TitleHoldersResponse>(
      `/api/v1/titles/${level}/holders`,
    );
    return response.data;
  },

  // ========================================
  // ユーザー称号実績
  // ========================================

  /**
   * ユーザーの称号実績を取得
   * @param userId ユーザーID
   */
  getUserTitleAchievements: async (
    userId: string,
  ): Promise<UserTitleAchievementsResponse> => {
    const response = await httpClient.get<UserTitleAchievementsResponse>(
      `/api/v1/users/${userId}/title-achievements`,
    );
    return response.data;
  },
};
