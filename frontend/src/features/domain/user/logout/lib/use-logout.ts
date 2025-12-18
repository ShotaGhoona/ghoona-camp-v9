/**
 * ログアウト Hook
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { userApi } from '@/entities/domain/user/api/user-api';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: () => userApi.logout(),
    onSuccess: () => {
      dispatch(clearUser());
      router.push('/login');
    },
    onError: (error: unknown) => {
      console.error('Logout failed:', error);
    },
  });
}
