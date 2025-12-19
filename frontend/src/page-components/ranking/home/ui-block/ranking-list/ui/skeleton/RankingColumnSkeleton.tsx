'use client';

import { Calendar, Flame, Trophy } from 'lucide-react';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';
import type { RankingType } from '../RankingColumn';

import { TopThreeItemSkeleton } from './TopThreeItemSkeleton';
import { RankingItemSkeleton } from './RankingItemSkeleton';

interface RankingColumnSkeletonProps {
  type: RankingType;
}

const COLUMN_CONFIG = {
  monthly: {
    title: '今月',
    subtitle: '参加日数',
    icon: Calendar,
  },
  total: {
    title: '総合',
    subtitle: '累計参加',
    icon: Trophy,
  },
  streak: {
    title: '連続',
    subtitle: '継続日数',
    icon: Flame,
  },
};

export function RankingColumnSkeleton({ type }: RankingColumnSkeletonProps) {
  const config = COLUMN_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-0'>
      {/* ヘッダー */}
      <div className='shrink-0 px-4'>
        <div className='flex items-center justify-between rounded-xl bg-primary/20 p-3 shadow-raised'>
          {/* 左: アイコン + タイトル */}
          <div className='flex items-center gap-2.5'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-primary/20'>
              <Icon className='size-4 text-primary' />
            </div>
            <div>
              <h2 className='text-sm font-bold leading-tight'>
                {config.title}
              </h2>
              <p className='text-[10px] text-muted-foreground'>
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* 右: スコア・順位（スケルトン） */}
          <div className='flex items-baseline gap-1.5'>
            <Skeleton className='h-5 w-6' />
            <span className='text-[10px] text-muted-foreground'>日</span>
            <span className='mx-1 text-muted-foreground/50'>/</span>
            <Skeleton className='size-5 rounded' />
            <span className='text-[10px] text-muted-foreground'>位</span>
          </div>
        </div>
      </div>

      {/* ランキングリスト */}
      <div className='min-h-0 flex-1 overflow-hidden'>
        <ScrollArea className='h-full'>
          <div className='flex flex-col gap-4 p-6'>
            {/* トップ3（横並び） */}
            <div className='flex gap-3'>
              <TopThreeItemSkeleton />
              <TopThreeItemSkeleton />
              <TopThreeItemSkeleton />
            </div>

            {/* 4位以下 */}
            <div className='flex flex-col gap-2'>
              {Array.from({ length: 7 }).map((_, i) => (
                <RankingItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
