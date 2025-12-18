'use client';

import { Target, Calendar } from 'lucide-react';

import type { GoalItem } from '@/shared/dummy-data/goals/goals';

interface GoalTimelineLabelProps {
  goal: GoalItem;
}

/** 日付をフォーマット（MM/DD形式） */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function GoalTimelineLabel({ goal }: GoalTimelineLabelProps) {
  const isCompleted = !goal.isActive;

  return (
    <div className='flex w-full items-center gap-3 overflow-hidden'>
      {/* アイコンコンテナ */}
      <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted shadow-raised-sm'>
        <Target
          className={`size-4 ${isCompleted ? 'text-muted-foreground' : 'text-primary'}`}
        />
      </div>

      {/* テキスト */}
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{goal.title}</p>
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <Calendar className='size-3' />
          <span>
            {formatDate(goal.startedAt)} 〜{' '}
            {goal.endedAt ? formatDate(goal.endedAt) : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
