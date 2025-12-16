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
      // バックエンドのリクエスト形式に変換
      return authApi.login({
        login_id: credentials.loginId,
        password: credentials.password,
      });
    },
    onSuccess: (data) => {
      // バックエンドレスポンス {access_token, user_id} からユーザーオブジェクトを生成
      dispatch(setUser({ id: data.user_id }));
      router.push('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });
}
