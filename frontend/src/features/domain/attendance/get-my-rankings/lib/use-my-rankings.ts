/**
 * 自分のランキング取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/entities/domain/attendance/api/attendance-api';
import type { MyRankingsParams } from '@/entities/domain/attendance/model/types';

/**
 * 自分のランキング情報を取得
 * @param params クエリパラメータ（year, month）
 * @param enabled クエリを有効にするかどうか（default: true）
 */
export function useMyRankings(params?: MyRankingsParams, enabled = true) {
  return useQuery({
    queryKey: ['my-rankings', params?.year, params?.month],
    queryFn: () => attendanceApi.getMyRankings(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
