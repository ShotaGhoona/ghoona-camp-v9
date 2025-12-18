/**
 * 目標作成 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '@/entities/domain/goal/api/goal-api';
import type { CreateGoalRequest } from '@/entities/domain/goal/model/types';

type UseCreateGoalOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useCreateGoal(options?: UseCreateGoalOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalRequest) => {
      return goalApi.createGoal(data);
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
      console.error('Goal creation failed:', error);
      options?.onError?.(error);
    },
  });
}
