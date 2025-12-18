/**
 * ライバル一覧取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/entities/domain/user/api/user-api';

export function useRivals(userId: string | null) {
  return useQuery({
    queryKey: ['rivals', userId],
    queryFn: () => userApi.getRivals(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
