'use client';

import { cn } from '@/shared/ui/shadcn/lib/utils';

import type { GoalItem } from '@/shared/dummy-data/goals/goals';
import type { TimelineBarProps } from '@/widgets/view/timeline-view/ui/TimelineViewWidget';

interface GoalTimelineBarProps {
  goal: GoalItem;
  barProps: TimelineBarProps;
}

export function GoalTimelineBar({ goal, barProps }: GoalTimelineBarProps) {
  const isCompleted = !goal.isActive;

  return (
    <div
      className={cn(
        'flex h-9 items-center px-3 text-xs font-medium transition-all',
        'shadow-raised-sm hover:shadow-raised active:shadow-inset-sm',
        isCompleted
          ? 'bg-muted text-muted-foreground'
          : 'bg-primary text-primary-foreground',
        barProps.startsBeforeRange ? 'rounded-l-md' : 'rounded-l-full',
        barProps.endsAfterRange ? 'rounded-r-md' : 'rounded-r-full',
      )}
    >
      <span className='truncate'>{goal.title}</span>
    </div>
  );
}
