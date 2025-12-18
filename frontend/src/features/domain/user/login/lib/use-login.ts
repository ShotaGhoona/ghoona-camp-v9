/**
 * ログイン Hook
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { userApi } from '@/entities/domain/user/api/user-api';
import type { LoginRequest } from '@/entities/domain/user/model/types';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // ログイン実行
      await userApi.login(credentials);
      // ユーザー情報を取得
      const me = await userApi.getMe();
      return me;
    },
    onSuccess: (me) => {
      dispatch(
        setUser({
          id: me.id,
          email: me.email,
          username: me.username ?? undefined,
          avatar_url: me.avatar_url ?? undefined,
          discord_id: me.discord_id ?? undefined,
          is_active: me.is_active,
        }),
      );
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      console.error('Login failed:', error);
    },
  });
}
