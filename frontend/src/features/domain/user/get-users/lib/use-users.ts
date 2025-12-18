/**
 * ユーザー一覧取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/entities/domain/user/api/user-api';
import type { UserSearchParams } from '@/entities/domain/user/model/types';

export type UserFilter = {
  search?: string;
  skills?: string[];
  interests?: string[];
  titleLevels?: number[];
  limit?: number;
  offset?: number;
};

function toSearchParams(filter: UserFilter): UserSearchParams {
  return {
    search: filter.search || undefined,
    skills: filter.skills?.length ? filter.skills.join(',') : undefined,
    interests: filter.interests?.length
      ? filter.interests.join(',')
      : undefined,
    title_levels: filter.titleLevels?.length
      ? filter.titleLevels.join(',')
      : undefined,
    limit: filter.limit,
    offset: filter.offset,
  };
}

export function useUsers(filter: UserFilter = {}) {
  return useQuery({
    queryKey: ['users', filter],
    queryFn: () => userApi.getUsers(toSearchParams(filter)),
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
