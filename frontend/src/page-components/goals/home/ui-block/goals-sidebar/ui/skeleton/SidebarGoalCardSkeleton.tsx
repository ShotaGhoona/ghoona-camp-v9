'use client';

import { Card } from '@/shared/ui/shadcn/ui/card';
import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';

export function SidebarGoalCardSkeleton() {
  return (
    <Card variant='raised' className='p-3'>
      <div className='flex items-start gap-3'>
        {/* アバター */}
        <Skeleton className='size-10 shrink-0 rounded-full' />

        {/* コンテンツ */}
        <div className='min-w-0 flex-1'>
          <Skeleton className='h-3 w-32' />
          <Skeleton className='mt-1.5 h-4 w-full' />
          <div className='mt-2 flex items-center gap-2'>
            <Skeleton className='h-4 w-12 rounded-full' />
            <Skeleton className='h-3 w-16' />
          </div>
        </div>
      </div>
    </Card>
  );
}
