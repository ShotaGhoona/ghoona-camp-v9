'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from '@/store/index';
import { QueryProvider } from '@/app/provider/QueryProvider';
import { ThemeProvider } from '@/features/core/theme/lib/theme-context';
import { Toaster } from '@/shared/ui/shadcn/ui/sonner';
import { setUser, clearUser } from '@/store/slices/authSlice';
import { userApi } from '@/entities/domain/user/api/user-api';

/**
 * 認証状態を復元するコンポーネント
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await userApi.getMe();
        if (response.id) {
          dispatch(
            setUser({
              id: response.id,
              email: response.email,
              username: response.username ?? undefined,
              avatar_url: response.avatar_url ?? undefined,
              discord_id: response.discord_id ?? undefined,
              is_active: response.is_active,
            }),
          );
        } else {
          dispatch(clearUser());
        }
      } catch {
        // トークンが無効または存在しない場合
        dispatch(clearUser());
      }
    };

    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryProvider>
        <ThemeProvider>
          <AuthInitializer>{children}</AuthInitializer>
          <Toaster />
        </ThemeProvider>
      </QueryProvider>
    </Provider>
  );
}
