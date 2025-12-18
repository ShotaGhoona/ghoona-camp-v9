/**
 * 興味・関心一覧取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { userApi } from '@/entities/domain/user/api/user-api';

export function useInterests() {
  return useQuery({
    queryKey: ['interests'],
    queryFn: () => userApi.getInterests(),
    staleTime: 1000 * 60 * 30, // 30分キャッシュ（頻繁に変わらないため）
  });
}
