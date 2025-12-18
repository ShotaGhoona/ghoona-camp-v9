'use client';

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
      isLoading={isLoading}
      rowHeight={72}
      cellWidth={42}
    />
  );
}
