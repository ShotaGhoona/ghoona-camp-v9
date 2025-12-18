/**
 * 目標の残り日数を計算
 */

import type { GoalItem } from '../model/types';

export function getRemainingDays(goal: GoalItem): number | null {
  if (!goal.endedAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(goal.endedAt);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
