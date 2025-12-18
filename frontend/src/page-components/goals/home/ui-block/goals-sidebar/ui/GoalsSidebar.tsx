'use client';

import { Target, Users } from 'lucide-react';

import { Card } from '@/shared/ui/shadcn/ui/card';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';

import type { GoalItem } from '@/entities/domain/goal/model/types';
import { usePublicGoals } from '@/features/domain/goal/get-public-goals/lib/use-public-goals';
import { SidebarGoalCard } from './components/SidebarGoalCard';
import { GoalsSidebarSkeleton } from './skeleton/GoalsSidebarSkeleton';

interface GoalsSidebarProps {
  year: number;
  month: number;
  onGoalClick: (goal: GoalItem) => void;
}

export function GoalsSidebar({ year, month, onGoalClick }: GoalsSidebarProps) {
  const { data: publicGoalsData, isLoading } = usePublicGoals({
    year,
    month,
  });

  const publicGoals = publicGoalsData?.data.goals ?? [];

  return (
    <Card
      variant='raised'
      className='flex h-full flex-col gap-0 overflow-hidden p-0'
    >
      {/* ヘッダー */}
      <div className='shrink-0 border-b bg-muted/30 px-4 py-3'>
        <div className='flex items-center gap-2'>
          <Users className='size-4 text-muted-foreground' />
          <h3 className='text-sm font-semibold'>みんなの目標</h3>
        </div>
        <p className='mt-1 text-xs text-muted-foreground'>
          {isLoading ? '読み込み中...' : `${publicGoals.length}件の公開目標`}
        </p>
      </div>

      {/* 目標リスト */}
      {isLoading ? (
        <GoalsSidebarSkeleton />
      ) : (
        <ScrollArea className='min-h-0 flex-1'>
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
                <SidebarGoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={onGoalClick}
                />
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
