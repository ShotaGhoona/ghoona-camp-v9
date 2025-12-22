/**
 * 参加サマリー取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/entities/domain/attendance/api/attendance-api';
import type { AttendanceSummariesParams } from '@/entities/domain/attendance/model/types';

/**
 * 参加サマリーを取得（日単位）
 * @param userId ユーザーID
 * @param params クエリパラメータ（dateFrom, dateTo）
 * @param enabled クエリを有効にするかどうか（default: true）
 */
export function useAttendanceSummaries(
  userId: string | null,
  params?: AttendanceSummariesParams,
  enabled = true,
) {
  return useQuery({
    queryKey: [
      'attendance',
      'summaries',
      userId,
      params?.dateFrom,
      params?.dateTo,
    ],
    queryFn: () => attendanceApi.getSummaries(userId!, params),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
