/**
 * 目標削除 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '@/entities/domain/goal/api/goal-api';

type UseDeleteGoalOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useDeleteGoal(options?: UseDeleteGoalOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => {
      return goalApi.deleteGoal(goalId);
    },
    onSuccess: () => {
      // 自分の目標一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['my-goals'],
      });
      // 公開目標一覧のキャッシュも無効化
      queryClient.invalidateQueries({
        queryKey: ['public-goals'],
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error('Goal deletion failed:', error);
      options?.onError?.(error);
    },
  });
}
