/**
 * 目標更新 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '@/entities/domain/goal/api/goal-api';
import type { UpdateGoalRequest } from '@/entities/domain/goal/model/types';

type UseUpdateGoalOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useUpdateGoal(options?: UseUpdateGoalOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: UpdateGoalRequest }) => {
      return goalApi.updateGoal(goalId, data);
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
      console.error('Goal update failed:', error);
      options?.onError?.(error);
    },
  });
}
