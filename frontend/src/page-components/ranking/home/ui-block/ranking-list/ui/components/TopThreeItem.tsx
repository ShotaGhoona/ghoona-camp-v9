'use client';

import { User } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/shadcn/ui/avatar';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import type { RankingEntry } from '@/entities/domain/attendance/model/types';

interface TopThreeItemProps {
  entry: RankingEntry;
  isCurrentUser?: boolean;
  onClick?: (entry: RankingEntry) => void;
}

const RANK_CONFIG = {
  1: {
    label: '1',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
  },
  2: {
    label: '2',
    badgeBg: 'bg-slate-400',
    badgeText: 'text-white',
  },
  3: {
    label: '3',
    badgeBg: 'bg-orange-400',
    badgeText: 'text-white',
  },
} as const;

export function TopThreeItem({
  entry,
  isCurrentUser,
  onClick,
}: TopThreeItemProps) {
  const config = RANK_CONFIG[entry.rank as 1 | 2 | 3];

  return (
    <div
      className={cn(
        'group flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl px-3 py-4',
        'shadow-raised transition-all duration-200',
        'hover:scale-[0.98] hover:shadow-raised-sm active:scale-[0.97] active:shadow-inset',
        isCurrentUser ? 'bg-primary/10' : 'bg-card',
      )}
      onClick={() => onClick?.(entry)}
    >
      {/* アバター + 順位バッジ */}
      <div className='relative'>
        <Avatar className='size-14'>
          <AvatarImage
            src={entry.user.avatarUrl ?? undefined}
            alt={entry.user.displayName ?? 'User'}
          />
          <AvatarFallback className='bg-muted'>
            <User className='size-6 text-muted-foreground' />
          </AvatarFallback>
        </Avatar>
        {/* 順位バッジ */}
        <div
          className={cn(
            'absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full text-xs font-bold ring-2 ring-card',
            config.badgeBg,
            config.badgeText,
          )}
        >
          {config.label}
        </div>
      </div>

      {/* ユーザー情報 */}
      <div className='flex flex-col items-center gap-0.5 text-center'>
        <p className='line-clamp-1 text-sm font-semibold'>
          {entry.user.displayName ?? 'Unknown'}
        </p>
        {entry.user.tagline && (
          <p className='line-clamp-1 text-[10px] text-muted-foreground'>
            {entry.user.tagline}
          </p>
        )}
      </div>

      {/* スコア */}
      <div className='text-center'>
        <span className='text-xl font-bold tabular-nums'>{entry.score}</span>
        <span className='ml-0.5 text-xs text-muted-foreground'>日</span>
      </div>
    </div>
  );
}
