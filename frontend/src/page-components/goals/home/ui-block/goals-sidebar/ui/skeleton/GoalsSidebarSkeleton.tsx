'use client';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';

import { SidebarGoalCardSkeleton } from './SidebarGoalCardSkeleton';

interface GoalsSidebarSkeletonProps {
  count?: number;
}

export function GoalsSidebarSkeleton({ count = 5 }: GoalsSidebarSkeletonProps) {
  return (
    <ScrollArea className='min-h-0 flex-1'>
      <div className='flex flex-col gap-3 p-4'>
        {Array.from({ length: count }).map((_, index) => (
          <SidebarGoalCardSkeleton key={index} />
        ))}
      </div>
    </ScrollArea>
  );
}
