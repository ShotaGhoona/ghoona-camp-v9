/**
 * Goal Entity - 型定義
 * バックエンドAPIレスポンスに基づく
 */

// ========================================
// 目標アイテム
// ========================================

/** 目標作成者 */
export type GoalCreator = {
  id: string;
  displayName: string | null;
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

