'use client';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';

import { GoalCompareItemSkeleton } from './GoalCompareItemSkeleton';

interface GoalComparePanelSkeletonProps {
  count?: number;
}

export function GoalComparePanelSkeleton({
  count = 4,
}: GoalComparePanelSkeletonProps) {
  return (
    <div className='flex h-full'>
      <ScrollArea className='flex-1'>
        <div className='flex flex-col gap-3 p-4'>
          {Array.from({ length: count }).map((_, index) => (
            <GoalCompareItemSkeleton key={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
