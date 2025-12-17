'use client';

import { User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/ui/avatar';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import type { RankingEntry, RankingType } from '@/shared/dummy-data/ranking/ranking';
import { getScoreValue } from '@/shared/dummy-data/ranking/ranking';

interface RankingItemProps {
  entry: RankingEntry;
  rankingType: RankingType;
  onClick?: (entry: RankingEntry) => void;
}

export function RankingItem({ entry, rankingType, onClick }: RankingItemProps) {
  const score = getScoreValue(entry, rankingType);

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
        'cursor-pointer shadow-raised',
        'hover:shadow-raised-sm hover:scale-[0.98] active:shadow-inset active:scale-[0.97]',
        entry.isCurrentUser ? 'bg-primary/20' : 'bg-card'
      )}
      onClick={() => onClick?.(entry)}
    >
      {/* 順位 */}
      <span className="w-6 shrink-0 text-center text-sm font-medium tabular-nums text-muted-foreground">
        {entry.rank}
      </span>

      {/* アバター */}
      <div className="relative">
        <Avatar className="size-8">
          <AvatarImage src={entry.user.avatarUrl ?? undefined} alt={entry.user.displayName} />
          <AvatarFallback className="bg-muted text-xs">
            <User className="size-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        {/* 自分インジケーター（小さなドット） */}
        {entry.isCurrentUser && (
          <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-[1.5px] ring-background" />
        )}
      </div>

      {/* ユーザー情報 */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          'truncate text-sm',
          entry.isCurrentUser ? 'font-semibold' : 'font-medium'
        )}>
          {entry.user.displayName}
        </p>
        {entry.user.bio && (
          <p className="truncate text-[10px] text-muted-foreground">
            {entry.user.bio}
          </p>
        )}
      </div>

      {/* スコア */}
      <div className="shrink-0 text-right">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {score}
        </span>
        <span className="ml-0.5 text-[10px] text-muted-foreground">日</span>
      </div>
    </div>
  );
}
