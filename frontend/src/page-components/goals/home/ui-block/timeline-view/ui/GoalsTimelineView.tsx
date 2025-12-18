'use client';

import { Target, Loader2 } from 'lucide-react';

import { TimelineViewWidget } from '@/widgets/view/timeline-view/ui/TimelineViewWidget';

import type { GoalItem } from '@/entities/domain/goal/model/types';
import { GoalTimelineBar } from './components/GoalTimelineBar';
import { GoalTimelineLabel } from './components/GoalTimelineLabel';

interface GoalsTimelineViewProps {
  /** 表示する年 */
  year: number;
  /** 表示する月（1-12） */
  month: number;
  /** 表示する目標一覧 */
  goals: GoalItem[];
  /** 目標クリック時のコールバック */
  onGoalClick: (goal: GoalItem) => void;
  /** ローディング中かどうか */
  isLoading?: boolean;
  /** 現在のユーザーID */
  currentUserId?: string;
}

export function GoalsTimelineView({
  year,
  month,
  goals,
  onGoalClick,
  isLoading = false,
  currentUserId,
}: GoalsTimelineViewProps) {
  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='size-8 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>目標を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <TimelineViewWidget
      year={year}
      month={month}
      data={goals}
      startDateExtractor={(goal) => goal.startedAt}
      endDateExtractor={(goal) => goal.endedAt}
      labelRenderer={(goal) => (
        <GoalTimelineLabel goal={goal} currentUserId={currentUserId} />
      )}
      barRenderer={(goal, barProps) => (
        <GoalTimelineBar goal={goal} barProps={barProps} />
      )}
      onItemClick={onGoalClick}
      keyExtractor={(goal) => goal.id}
      emptyContent={
        <div className='flex flex-col items-center justify-center rounded-xl bg-muted/30 px-8 py-12 text-center shadow-inset'>
          <div className='mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted shadow-raised-sm'>
            <Target className='size-8 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium text-muted-foreground'>
            この月の目標はありません
          </p>
          <p className='mt-1 text-xs text-muted-foreground/70'>
            「新規作成」から目標を追加しましょう
          </p>
        </div>
      }
      rowHeight={72}
      cellWidth={42}
    />
  );
}
