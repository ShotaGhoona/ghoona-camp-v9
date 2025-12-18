'use client';

import { Target, Users } from 'lucide-react';

import { Card } from '@/shared/ui/shadcn/ui/card';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';

import {
  dummyGoals,
  CURRENT_USER_ID,
  type GoalItem,
} from '@/shared/dummy-data/goals/goals';
import { SidebarGoalCard } from './components/SidebarGoalCard';

interface GoalsSidebarProps {
  onGoalClick: (goal: GoalItem) => void;
}

/** みんなの公開目標を取得（自分以外） */
function getPublicGoals(): GoalItem[] {
  return dummyGoals.filter(
    (goal) => goal.isPublic && goal.userId !== CURRENT_USER_ID,
  );
}

export function GoalsSidebar({ onGoalClick }: GoalsSidebarProps) {
  const publicGoals = getPublicGoals();

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
          {publicGoals.length}件の公開目標
        </p>
      </div>

      {/* 目標リスト */}
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
    </Card>
  );
}
