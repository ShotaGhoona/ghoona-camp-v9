/**
 * Title Domain Types
 *
 * 称号ドメインのAPI型定義
 * 称号マスターデータ（TITLE_MASTER）は shared/types/title/title.ts で管理
 */

import type { TitleLevel } from '@/shared/domain/title/model/types';

// ========================================
// GET /titles/{level}/holders
// ========================================

/** 称号保持者 */
export type TitleHolder = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  achievedAt: string;
};

/** 称号保持者一覧レスポンス */
export type TitleHoldersResponse = {
  data: {
    level: TitleLevel;
    holders: TitleHolder[];
    total: number;
  };
  message: string;
  timestamp: string;
};

// ========================================
// GET /users/{userId}/title-achievements
// ========================================

/** ユーザー称号実績 */
export type UserTitleAchievement = {
  titleLevel: TitleLevel;
  achievedAt: string;
};

/** ユーザー称号実績レスポンス */
export type UserTitleAchievementsResponse = {
  data: {
    currentTitleLevel: TitleLevel;
    totalAttendanceDays: number;
    achievements: UserTitleAchievement[];
  };
  message: string;
  timestamp: string;
};
