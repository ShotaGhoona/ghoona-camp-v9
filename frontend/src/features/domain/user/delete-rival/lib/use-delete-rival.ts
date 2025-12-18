/**
 * ライバル削除 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userApi } from '@/entities/domain/user/api/user-api';

type UseDeleteRivalOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useDeleteRival(options?: UseDeleteRivalOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, rivalId }: { userId: string; rivalId: string }) => {
      return userApi.deleteRival(userId, rivalId);
    },
    onSuccess: (response, variables) => {
      // ライバル一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['rivals', variables.userId],
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error('Delete rival failed:', error);
      options?.onError?.(error);
    },
  });
}
