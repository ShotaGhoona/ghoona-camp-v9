/**
 * 称号保持者一覧取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { titleApi } from '@/entities/domain/title/api/title-api';
import type { TitleLevel } from '@/shared/domain/title/model/types';

/**
 * 指定レベルの称号保持者一覧を取得
 * @param level 称号レベル (1-8)、nullの場合はクエリを実行しない
 */
export function useTitleHolders(level: TitleLevel | null) {
  return useQuery({
    queryKey: ['title-holders', level],
    queryFn: () => titleApi.getTitleHolders(level!),
    enabled: level !== null,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
