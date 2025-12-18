'use client';

import { useState } from 'react';
import { useLogin } from '@/features/domain/user/login/lib/use-login';
import type { LoginRequest } from '@/entities/domain/user/model/types';
import { Button } from '@/shared/ui/shadcn/ui/button';
import { Input } from '@/shared/ui/shadcn/ui/input';
import { Label } from '@/shared/ui/shadcn/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn/ui/card';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const credentials: LoginRequest = { email, password };
    loginMutation.mutate(credentials);
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>ログイン</CardTitle>
        <CardDescription>Ghoona Camp にログイン</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>メールアドレス</Label>
            <Input
              id='email'
              type='email'
              placeholder='email@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>パスワード</Label>
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {loginMutation.isError && (
            <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
              ログインに失敗しました。メールアドレスとパスワードを確認してください。
            </div>
          )}

          <Button
            type='submit'
            className='w-full'
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
