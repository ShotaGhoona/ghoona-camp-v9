'use client';

import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';

export function RankingItemSkeleton() {
  return (
    <div className='flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-raised'>
      {/* 順位 */}
      <Skeleton className='size-6 shrink-0' />

      {/* アバター */}
      <Skeleton className='size-8 shrink-0 rounded-full' />

      {/* ユーザー情報 */}
      <Skeleton className='h-4 flex-1' />

      {/* スコア */}
      <Skeleton className='h-4 w-10 shrink-0' />
    </div>
  );
}
