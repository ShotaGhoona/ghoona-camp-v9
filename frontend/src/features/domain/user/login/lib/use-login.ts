import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { userApi } from '@/entities/domain/user/api/user-api';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';

import type { LoginFormData } from '../model/types';

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (credentials: LoginFormData) => {
      return userApi.login({
        email: credentials.email,
        password: credentials.password,
      });
    },
    onSuccess: (data) => {
      dispatch(setUser({ id: data.user_id }));
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      console.error('Login failed:', error);
    },
  });
}
