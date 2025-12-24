/**
 * ダッシュボードレイアウト取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/entities/domain/dashboard/api/dashboard-api';

export function useDashboardLayout(enabled = true) {
  return useQuery({
    queryKey: ['dashboard-layout'],
    queryFn: () => dashboardApi.getLayout(),
    enabled,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
