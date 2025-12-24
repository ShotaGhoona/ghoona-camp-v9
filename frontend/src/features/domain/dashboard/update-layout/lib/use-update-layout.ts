/**
 * ダッシュボードレイアウト更新 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/entities/domain/dashboard/api/dashboard-api';
import type { UpdateDashboardLayoutRequest } from '@/entities/domain/dashboard/model/types';

type UseUpdateLayoutOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useUpdateLayout(options?: UseUpdateLayoutOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDashboardLayoutRequest) => {
      return dashboardApi.updateLayout(data);
    },
    onSuccess: () => {
      // レイアウトのキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['dashboard-layout'],
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error('Dashboard layout update failed:', error);
      options?.onError?.(error);
    },
  });
}
