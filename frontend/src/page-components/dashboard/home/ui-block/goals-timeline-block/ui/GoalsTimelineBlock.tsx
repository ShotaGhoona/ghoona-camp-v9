'use client';

import { useState, useCallback } from 'react';

import { useAppSelector } from '@/store/hooks';
import { useMyGoals } from '@/features/domain/goal/get-my-goals/lib/use-my-goals';
import { GoalsTimelineView } from '@/page-components/goals/home/ui-block/timeline-view/ui/GoalsTimelineView';

export function GoalsTimelineBlock() {
  const { user } = useAppSelector((state) => state.auth);
  const now = new Date();
  const [currentYear] = useState(now.getFullYear());
  const [currentMonth] = useState(now.getMonth() + 1);

  const { data, isLoading } = useMyGoals({
    year: currentYear,
    month: currentMonth,
  });

  const handleGoalClick = useCallback(() => {
    // ダッシュボードでは詳細モーダルを開かない（クリックで目標ページへ遷移など将来対応）
  }, []);

  return (
    <GoalsTimelineView
      year={currentYear}
      month={currentMonth}
      goals={data?.data.goals ?? []}
      onGoalClick={handleGoalClick}
      isLoading={isLoading}
      currentUserId={user?.id}
    />
  );
}
