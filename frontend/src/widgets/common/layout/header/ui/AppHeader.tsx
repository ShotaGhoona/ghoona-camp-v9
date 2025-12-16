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
import { useLogout } from '@/features/auth/logout/lib/use-logout';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
      <header className='bg-primary shadow-raised z-10'>
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
            <nav className='hidden items-center gap-1 md:flex'>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground',
                    )}
                  >
                    <Icon className='size-4' />
                    {item.label}
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
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium'>
                      {user?.username || 'ユーザー'}
                    </p>
                    <p className='text-xs text-gray-500'>{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {settingsMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className='cursor-pointer'>
                          <Icon className='mr-2 size-4' />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  {/* テーマ設定 */}
                  <DropdownMenuItem
                    onClick={() => setIsThemeSheetOpen(true)}
                    className='cursor-pointer'
                  >
                    <Palette className='mr-2 size-4' />
                    テーマ設定
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  variant='destructive'
                  className='cursor-pointer'
                >
                  <LogOut className='mr-2 size-4' />
                  {logoutMutation.isPending ? 'ログアウト中...' : 'ログアウト'}
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
