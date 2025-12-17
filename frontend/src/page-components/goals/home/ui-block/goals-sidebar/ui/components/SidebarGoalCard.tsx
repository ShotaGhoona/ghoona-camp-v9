'use client';

import { User } from 'lucide-react';

import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { Card } from '@/shared/ui/shadcn/ui/card';

import type { GoalItem } from '@/shared/dummy-data/goals/goals';
import { getRemainingDays } from '@/shared/dummy-data/goals/goals';

interface SidebarGoalCardProps {
  goal: GoalItem;
  onClick?: (goal: GoalItem) => void;
}

/** 残り日数の表示テキスト */
function getRemainingText(days: number | null): string {
  if (days === null) return '期限なし';
  if (days < 0) return '期限切れ';
  if (days === 0) return '今日まで';
  return `残り${days}日`;
}

export function SidebarGoalCard({ goal, onClick }: SidebarGoalCardProps) {
  const handleClick = () => {
    onClick?.(goal);
  };

  const remainingDays = getRemainingDays(goal);
  const remainingText = getRemainingText(remainingDays);
  const isCompleted = !goal.isActive;

  return (
    <Card
      variant="raised"
      className="cursor-pointer p-3 transition-all hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* アバター */}
        <div className="size-10 shrink-0 overflow-hidden rounded-full bg-muted shadow-inset-sm">
          {goal.creator.avatarUrl ? (
            <img
              src={goal.creator.avatarUrl}
              alt={goal.creator.displayName}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <User className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            {goal.creator.displayName}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-tight">
            {goal.title}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant={isCompleted ? 'secondary' : 'default'}
              className="h-4 px-1 text-[10px]"
            >
              {isCompleted ? '完了' : '進行中'}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {isCompleted ? '達成済み' : remainingText}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
