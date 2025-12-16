'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from '@/store/index';
import { QueryProvider } from '@/app/provider/QueryProvider';
import { setUser, clearUser } from '@/store/slices/authSlice';
import { authApi } from '@/entities/auth/api/auth-api';

/**
 * 認証状態を復元するコンポーネント
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authApi.getAuthStatus();
        if (response.is_authenticated && response.user_id) {
          dispatch(setUser({ id: response.user_id }));
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
        <AuthInitializer>{children}</AuthInitializer>
      </QueryProvider>
    </Provider>
  );
}
