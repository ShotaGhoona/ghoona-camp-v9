'use client';

import { Target } from 'lucide-react';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';

import {
  dummyGoals,
  CURRENT_USER_ID,
  type GoalItem,
} from '@/shared/dummy-data/goals/goals';
import { GoalCompareItem } from './components/GoalCompareItem';

/** みんなの公開目標を取得（自分以外） */
function getPublicGoals(): GoalItem[] {
  return dummyGoals.filter(
    (goal) => goal.isPublic && goal.userId !== CURRENT_USER_ID
  );
}

export function GoalComparePanel() {
  const publicGoals = getPublicGoals();

  return (
    <div className="flex h-full">
      {/* 目標リスト */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-4">
          {publicGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
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
