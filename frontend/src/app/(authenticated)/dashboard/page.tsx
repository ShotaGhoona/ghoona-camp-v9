'use client';

import { useAppSelector } from '@/store/hooks';
import { useLogout } from '@/features/auth/logout/lib/use-logout';
import { Button } from '@/shared/ui/shadcn/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn/ui/card';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // デバッグ用ログ
  console.log('Dashboard - Auth State:', { user, isLoading, isAuthenticated });

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-lg text-gray-600'>認証情報を読み込み中...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-8'>
      <div className='mx-auto max-w-7xl'>
        <Card>
          <CardHeader>
            <CardTitle className='text-3xl'>ダッシュボード</CardTitle>
            <CardDescription>
              {user ? (
                <>ようこそ、{user.email || `ユーザーID: ${user.id}`} さん</>
              ) : (
                <>ようこそ</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {/* ユーザー情報セクション */}
              {user ? (
                <div className='rounded-md bg-gray-50 p-4'>
                  <h2 className='mb-2 text-sm font-semibold text-gray-700'>
                    ユーザー情報
                  </h2>
                  <div className='space-y-1 text-sm text-gray-600'>
                    <p>
                      <span className='font-medium'>ユーザーID:</span> {user.id}
                    </p>
                    {user.email && (
                      <p>
                        <span className='font-medium'>メールアドレス:</span>{' '}
                        {user.email}
                      </p>
                    )}
                    {user.name && (
                      <p>
                        <span className='font-medium'>名前:</span> {user.name}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className='rounded-md bg-blue-50 p-4'>
                  <p className='text-sm text-blue-700'>
                    認証は成功していますが、ユーザー情報の読み込みに失敗しました。
                  </p>
                </div>
              )}

              {/* ログアウトボタン */}
              <div className='flex items-center justify-between border-t pt-6'>
                <div className='text-sm text-gray-600'>
                  セッションを終了してログアウトします
                </div>
                <Button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  variant='destructive'
                  size='default'
                >
                  {logoutMutation.isPending ? 'ログアウト中...' : 'ログアウト'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
