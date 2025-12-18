'use client';

import { Target } from 'lucide-react';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';

import { usePublicGoals } from '@/features/domain/goal/get-public-goals/lib/use-public-goals';
import { useAppSelector } from '@/store/hooks';
import { GoalCompareItem } from './components/GoalCompareItem';
import { GoalComparePanelSkeleton } from './skeleton/GoalComparePanelSkeleton';

export function GoalComparePanel() {
  const { user } = useAppSelector((state) => state.auth);
  const today = new Date();
  const { data, isLoading } = usePublicGoals({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });

  // 自分以外の公開目標
  const publicGoals = (data?.data?.goals ?? []).filter(
    (goal) => goal.userId !== user?.id,
  );

  if (isLoading) {
    return <GoalComparePanelSkeleton />;
  }

  return (
    <div className='flex h-full'>
      {/* 目標リスト */}
      <ScrollArea className='flex-1'>
        <div className='flex flex-col gap-3 p-4'>
          {publicGoals.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Target className='mb-2 size-8 text-muted-foreground/50' />
              <p className='text-sm text-muted-foreground'>
                公開されている目標がありません
              </p>
            </div>
          ) : (
            publicGoals.map((goal) => (
              <GoalCompareItem key={goal.id} goal={goal} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
