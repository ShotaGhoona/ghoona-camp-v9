/**
 * 全ランキング取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/entities/domain/attendance/api/attendance-api';
import type { RankingsParams } from '@/entities/domain/attendance/model/types';

/**
 * 全ランキングを一括取得
 * @param params クエリパラメータ（year, month, limit）
 * @param enabled クエリを有効にするかどうか（default: true）
 */
export function useRankings(params?: RankingsParams, enabled = true) {
  return useQuery({
    queryKey: ['rankings', params?.year, params?.month, params?.limit],
    queryFn: () => attendanceApi.getRankings(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
