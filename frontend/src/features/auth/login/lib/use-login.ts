import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/entities/auth/api/auth-api';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import type { LoginFormData } from '../model/types';

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (credentials: LoginFormData) => {
      return authApi.login({
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
