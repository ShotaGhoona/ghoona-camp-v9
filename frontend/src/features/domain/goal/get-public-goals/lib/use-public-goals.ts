/**
 * 公開目標一覧取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { goalApi } from '@/entities/domain/goal/api/goal-api';

export type PublicGoalsFilter = {
  year: number;
  month: number;
  userId?: string;
};

export function usePublicGoals(filter: PublicGoalsFilter) {
  return useQuery({
    queryKey: ['public-goals', filter],
    queryFn: () =>
      goalApi.getPublicGoals({
        year: filter.year,
        month: filter.month,
        user_id: filter.userId,
      }),
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
