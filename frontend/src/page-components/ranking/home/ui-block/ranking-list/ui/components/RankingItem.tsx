'use client';

import { User } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/shadcn/ui/avatar';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import type { RankingEntry } from '@/entities/domain/attendance/model/types';

interface RankingItemProps {
  entry: RankingEntry;
  isCurrentUser?: boolean;
  onClick?: (entry: RankingEntry) => void;
}

export function RankingItem({
  entry,
  isCurrentUser,
  onClick,
}: RankingItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
        'cursor-pointer shadow-raised',
        'hover:scale-[0.98] hover:shadow-raised-sm active:scale-[0.97] active:shadow-inset',
        isCurrentUser ? 'bg-primary/10' : 'bg-card',
      )}
      onClick={() => onClick?.(entry)}
    >
      {/* 順位 */}
      <span className='w-6 shrink-0 text-center text-sm font-medium tabular-nums text-muted-foreground'>
        {entry.rank}
      </span>

      {/* アバター */}
      <div className='relative'>
        <Avatar className='size-8'>
          <AvatarImage
            src={entry.user.avatarUrl ?? undefined}
            alt={entry.user.displayName ?? 'User'}
          />
          <AvatarFallback className='bg-muted text-xs'>
            <User className='size-4 text-muted-foreground' />
          </AvatarFallback>
        </Avatar>
      </div>

      {/* ユーザー情報 */}
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>
          {entry.user.displayName ?? 'Unknown'}
        </p>
        {entry.user.tagline && (
          <p className='truncate text-[10px] text-muted-foreground'>
            {entry.user.tagline}
          </p>
        )}
      </div>

      {/* スコア */}
      <div className='shrink-0 text-right'>
        <span className='text-sm font-semibold tabular-nums text-foreground'>
          {entry.score}
        </span>
        <span className='ml-0.5 text-[10px] text-muted-foreground'>日</span>
      </div>
    </div>
  );
}
