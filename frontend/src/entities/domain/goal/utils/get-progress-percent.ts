/**
 * 目標の進捗率を計算（期間ベース）
 */

import type { GoalItem } from '../model/types';

export function getProgressPercent(goal: GoalItem): number | null {
  if (!goal.endedAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(goal.startedAt);
  const endDate = new Date(goal.endedAt);

  const totalDays =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays =
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  if (totalDays <= 0) return 100;
  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  return Math.round(progress);
}
