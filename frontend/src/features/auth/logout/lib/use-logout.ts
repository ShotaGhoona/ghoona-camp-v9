import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/entities/auth/api/auth-api';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      dispatch(clearUser());
      router.push('/login');
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
    },
  });
}
