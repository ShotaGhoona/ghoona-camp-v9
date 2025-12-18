/**
 * スキル一覧取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { userApi } from '@/entities/domain/user/api/user-api';

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => userApi.getSkills(),
    staleTime: 1000 * 60 * 30, // 30分キャッシュ（頻繁に変わらないため）
  });
}
