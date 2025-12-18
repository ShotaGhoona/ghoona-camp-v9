'use client';

import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';

export function GoalCompareItemSkeleton() {
  return (
    <div className='rounded-lg p-3 shadow-raised-sm'>
      <div className='flex items-start gap-3'>
        {/* アバター */}
        <Skeleton className='size-10 shrink-0 rounded-full' />

        {/* 内容 */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-4 w-12 rounded-full' />
          </div>
          <Skeleton className='mt-1 h-4 w-full' />
          <Skeleton className='mt-1 h-3 w-3/4' />
        </div>
      </div>
    </div>
  );
}
