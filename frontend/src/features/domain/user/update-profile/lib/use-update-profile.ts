/**
 * プロフィール更新 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userApi } from '@/entities/domain/user/api/user-api';
import type { UpdateUserProfileRequest } from '@/entities/domain/user/model/types';

type UseUpdateProfileOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useUpdateProfile(options?: UseUpdateProfileOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserProfileRequest;
    }) => {
      return userApi.updateUser(userId, data);
    },
    onSuccess: (response, variables) => {
      // ユーザー詳細のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['user', variables.userId],
      });
      // ユーザー一覧のキャッシュも無効化
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error('Profile update failed:', error);
      options?.onError?.(error);
    },
  });
}
