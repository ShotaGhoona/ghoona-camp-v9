'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  CalendarDays,
  Target,
  Award,
  Users,
  Bell,
  Palette,
  User,
  Eye,
  LogOut,
} from 'lucide-react';

import { useAppSelector } from '@/store/hooks';
import { useLogout } from '@/features/domain/user/logout/lib/use-logout';
import { ThemeSheet } from '@/features/core/theme/ui/ThemeSheet';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import { Button } from '@/shared/ui/shadcn/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/shadcn/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/ui/dropdown-menu';

const mainNavItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/ranking', label: 'ランキング', icon: Trophy },
  { href: '/activity', label: '参加履歴', icon: Calendar },
  { href: '/events', label: 'イベント', icon: CalendarDays },
  { href: '/goals', label: '目標', icon: Target },
  { href: '/titles', label: '称号', icon: Award },
  { href: '/members', label: 'メンバー', icon: Users },
];

const settingsMenuItems = [
  { href: '/settings/profile', label: 'プロフィール設定', icon: User },
  { href: '/settings/vision', label: 'ビジョン設定', icon: Eye },
  { href: '/settings/notifications', label: '通知設定', icon: Bell },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const logoutMutation = useLogout();
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (username?: string | null, email?: string | null) => {
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <header className='z-10 bg-primary shadow-raised'>
        <div className='flex h-14 items-center justify-between px-4'>
          {/* Logo */}
          <div className='flex items-center gap-8'>
            <Link href='/dashboard' className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary-foreground/20 font-bold text-primary-foreground'>
                G
              </div>
              <span className='text-lg font-bold text-primary-foreground'>
                Ghoona Camp
              </span>
            </Link>

            {/* Main Navigation */}
            <nav className='hidden h-14 items-center md:flex'>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex h-full items-center gap-1.5 px-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-primary-foreground/60 hover:text-primary-foreground',
                    )}
                  >
                    <Icon className='size-4' />
                    {item.label}
                    {/* 下線インジケーター */}
                    <span
                      className={cn(
                        'absolute bottom-0 left-0 h-0.5 w-full transition-all',
                        isActive ? 'bg-primary-foreground' : 'bg-transparent',
                      )}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className='flex items-center gap-2'>
            {/* Notification Button */}
            <Button
              variant='ghost'
              size='icon'
              className='relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'
            >
              <Bell className='size-5' />
              {/* 未読通知バッジ (TODO: API連携) */}
              <span className='absolute right-1 top-1 size-2 rounded-full bg-primary-foreground' />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-9 gap-2 rounded-full px-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'
                >
                  <Avatar className='size-7'>
                    <AvatarImage src={user?.avatar_url ?? undefined} />
                    <AvatarFallback className='bg-primary-foreground/20 text-primary-foreground'>
                      {getInitials(user?.username, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className='hidden text-sm font-medium md:inline-block'>
                    {user?.username || user?.email || 'ユーザー'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                variant='raised'
                className='w-64 p-3'
              >
                {/* ユーザー情報ヘッダー */}
                <div className='mb-3 flex items-center gap-3 rounded-lg bg-muted/50 p-3 shadow-inset-sm'>
                  <Avatar className='size-10 shadow-raised-sm'>
                    <AvatarImage src={user?.avatar_url ?? undefined} />
                    <AvatarFallback className='bg-primary text-primary-foreground'>
                      {getInitials(user?.username, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 overflow-hidden'>
                    <p className='truncate text-sm font-semibold'>
                      {user?.username || 'ユーザー'}
                    </p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* 設定グループ */}
                <div className='mb-2'>
                  <DropdownMenuGroup className='space-y-0.5'>
                    {settingsMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.href}
                          asChild
                          className='cursor-pointer rounded-lg px-3 py-2 transition-all hover:bg-muted/50 hover:shadow-inset-sm focus:bg-muted/50 focus:shadow-inset-sm'
                        >
                          <Link href={item.href}>
                            <div className='mr-3 flex size-7 items-center justify-center rounded-md bg-muted shadow-raised-sm'>
                              <Icon className='size-3.5 text-muted-foreground' />
                            </div>
                            <span className='text-sm'>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuItem
                      onClick={() => setIsThemeSheetOpen(true)}
                      className='cursor-pointer rounded-lg px-3 py-2 transition-all hover:bg-muted/50 hover:shadow-inset-sm focus:bg-muted/50 focus:shadow-inset-sm'
                    >
                      <div className='mr-3 flex size-7 items-center justify-center rounded-md bg-muted shadow-raised-sm'>
                        <Palette className='size-3.5 text-muted-foreground' />
                      </div>
                      <span className='text-sm'>テーマ設定</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </div>

                {/* 区切り線 */}
                <div className='my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent' />

                {/* ログアウト */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className='cursor-pointer rounded-lg px-3 py-2 text-destructive transition-all hover:bg-destructive/10 hover:shadow-inset-sm focus:bg-destructive/10 focus:shadow-inset-sm'
                >
                  <div className='mr-3 flex size-7 items-center justify-center rounded-md bg-destructive/10'>
                    <LogOut className='size-3.5' />
                  </div>
                  <span className='text-sm'>
                    {logoutMutation.isPending
                      ? 'ログアウト中...'
                      : 'ログアウト'}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Theme Settings Sheet */}
      <ThemeSheet open={isThemeSheetOpen} onOpenChange={setIsThemeSheetOpen} />
    </>
  );
}
