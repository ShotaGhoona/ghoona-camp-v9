'use client';

import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';

export function TopThreeItemSkeleton() {
  return (
    <div className='flex flex-1 flex-col items-center gap-2 rounded-xl bg-card px-3 py-4 shadow-raised'>
      {/* アバター + 順位バッジ */}
      <div className='relative'>
        <Skeleton className='size-14 rounded-full' />
        <Skeleton className='absolute -bottom-1 -right-1 size-6 rounded-full' />
      </div>

      {/* ユーザー情報 */}
      <Skeleton className='h-4 w-16' />

      {/* スコア */}
      <Skeleton className='h-6 w-10' />
    </div>
  );
}
