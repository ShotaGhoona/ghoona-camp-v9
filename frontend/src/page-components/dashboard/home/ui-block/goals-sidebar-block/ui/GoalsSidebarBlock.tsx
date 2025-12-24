'use client';

import { useState, useCallback } from 'react';

import { GoalsSidebar } from '@/page-components/goals/home/ui-block/goals-sidebar/ui/GoalsSidebar';

export function GoalsSidebarBlock() {
  const now = new Date();
  const [currentYear] = useState(now.getFullYear());
  const [currentMonth] = useState(now.getMonth() + 1);

  const handleGoalClick = useCallback(() => {
    // ダッシュボードでは詳細モーダルを開かない（クリックで目標ページへ遷移など将来対応）
  }, []);

  return (
    <GoalsSidebar
      year={currentYear}
      month={currentMonth}
      onGoalClick={handleGoalClick}
    />
  );
}
