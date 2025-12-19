/**
 * ユーザー称号実績取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { titleApi } from '@/entities/domain/title/api/title-api';

/**
 * ユーザーの称号実績を取得
 * @param userId ユーザーID、nullの場合はクエリを実行しない
 */
export function useUserTitleAchievements(userId: string | null) {
  return useQuery({
    queryKey: ['user-title-achievements', userId],
    queryFn: () => titleApi.getUserTitleAchievements(userId!),
    enabled: userId !== null,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
