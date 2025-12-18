/**
 * ユーザー詳細取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/entities/domain/user/api/user-api';

export function useUserDetail(userId: string | null) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUserById(userId!),
    enabled: !!userId, // userIdがnullの時は実行しない
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
