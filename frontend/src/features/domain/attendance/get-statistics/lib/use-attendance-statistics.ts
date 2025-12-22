/**
 * 参加統計取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/entities/domain/attendance/api/attendance-api';

/**
 * 参加統計を取得
 * @param userId ユーザーID
 * @param enabled クエリを有効にするかどうか（default: true）
 */
export function useAttendanceStatistics(userId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['attendance', 'statistics', userId],
    queryFn: () => attendanceApi.getStatistics(userId!),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
