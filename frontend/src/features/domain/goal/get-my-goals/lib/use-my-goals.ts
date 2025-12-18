/**
 * 自分の目標一覧取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { goalApi } from '@/entities/domain/goal/api/goal-api';

export type MyGoalsFilter = {
  year: number;
  month: number;
  isPublic?: boolean;
};

export function useMyGoals(filter: MyGoalsFilter) {
  return useQuery({
    queryKey: ['my-goals', filter],
    queryFn: () =>
      goalApi.getMyGoals({
        year: filter.year,
        month: filter.month,
        is_public: filter.isPublic,
      }),
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
