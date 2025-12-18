/**
 * Goal Entity - 型定義
 * バックエンドAPIレスポンスに基づく
 */

// ========================================
// 目標アイテム
// ========================================

/** 目標作成者（表示用） */
export type GoalCreator = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

/** 目標アイテム（APIレスポンス） */
export type GoalItem = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startedAt: string; // YYYY-MM-DD
  endedAt: string | null; // YYYY-MM-DD
  isActive: boolean;
  isPublic: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

/** 目標アイテム（表示用、作成者情報付き） */
export type GoalItemWithCreator = GoalItem & {
  creator: GoalCreator;
};

// ========================================
// APIレスポンス
// ========================================

/** 自分の目標一覧レスポンス */
export type MyGoalsListResponse = {
  data: {
    goals: GoalItem[];
    total: number;
  };
  message: string;
  timestamp: string;
};

/** 公開目標一覧レスポンス */
export type PublicGoalsListResponse = {
  data: {
    goals: GoalItem[];
    total: number;
  };
  message: string;
  timestamp: string;
};

/** 目標作成レスポンス */
export type CreateGoalResponse = {
  data: {
    goal: GoalItem;
  };
  message: string;
  timestamp: string;
};

/** 目標更新レスポンス */
export type UpdateGoalResponse = {
  data: {
    goal: GoalItem;
  };
  message: string;
  timestamp: string;
};

/** 目標削除レスポンス */
export type DeleteGoalResponse = {
  data: Record<string, never>;
  message: string;
  timestamp: string;
};

// ========================================
// 検索パラメータ
// ========================================

/** 自分の目標検索パラメータ */
export type MyGoalsSearchParams = {
  year: number;
  month: number;
  is_public?: boolean;
};

/** 公開目標検索パラメータ */
export type PublicGoalsSearchParams = {
  year: number;
  month: number;
  user_id?: string;
};

// ========================================
// リクエスト
// ========================================

/** 目標作成リクエスト */
export type CreateGoalRequest = {
  title: string;
  description?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  isPublic?: boolean;
};

/** 目標更新リクエスト */
export type UpdateGoalRequest = {
  title?: string;
  description?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  isPublic?: boolean;
};

// ========================================
// ユーティリティ
// ========================================

/** 目標の残り日数を計算 */
export function getRemainingDays(goal: GoalItem): number | null {
  if (!goal.endedAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(goal.endedAt);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/** 目標の進捗率を計算（期間ベース） */
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
