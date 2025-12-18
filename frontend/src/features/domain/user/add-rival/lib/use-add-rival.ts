/**
 * ライバル追加 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userApi } from '@/entities/domain/user/api/user-api';

type UseAddRivalOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useAddRival(options?: UseAddRivalOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      rivalUserId,
    }: {
      userId: string;
      rivalUserId: string;
    }) => {
      return userApi.addRival(userId, { rivalUserId });
    },
    onSuccess: (response, variables) => {
      // ライバル一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['rivals', variables.userId],
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error('Add rival failed:', error);
      options?.onError?.(error);
    },
  });
}
