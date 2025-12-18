/**
 * User Entity - 型定義
 * バックエンドAPIレスポンスに基づく
 */

import type { Pagination } from '@/shared/types/api/pagination';
import type { SnsPlatform } from '@/shared/types/user/sns';

// ========================================
// 一覧用（GET /api/v1/users）
// ========================================

export type UserListItem = {
  id: string;
  avatarUrl: string | null;
  displayName: string | null;
  tagline: string | null;
  currentTitleLevel: number;
};

// ========================================
// 詳細用（GET /api/v1/users/{userId}）
// ========================================

export type SocialLink = {
  id: string;
  platform: SnsPlatform;
  url: string;
  title: string | null;
};

export type UserDetail = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  displayName: string | null;
  tagline: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  vision: string | null;
  isVisionPublic: boolean;
  socialLinks: SocialLink[];
  totalAttendanceDays: number;
  currentStreakDays: number;
  maxStreakDays: number;
  currentTitleLevel: number;
  joinedAt: string;
};

// ========================================
// APIレスポンス
// ========================================

export type UsersListResponse = {
  data: {
    users: UserListItem[];
    pagination: Pagination;
  };
  message: string;
  timestamp: string;
};

export type UserDetailResponse = {
  data: {
    user: UserDetail;
  };
  message: string;
  timestamp: string;
};

// ========================================
// 検索パラメータ
// ========================================

export type UserSearchParams = {
  search?: string;
  skills?: string;
  interests?: string;
  title_levels?: string;
  limit?: number;
  offset?: number;
};

// ========================================
// 認証関連（/auth/*）
// ========================================

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  user_id: string;
};

export type LogoutResponse = {
  message: string;
};

export type MeResponse = {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  discord_id: string | null;
  is_active: boolean;
};

/** 認証済みユーザー情報（Redux store用） */
export type User = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  discord_id?: string;
  is_active: boolean;
};

// ========================================
// プロフィール更新（PUT /api/v1/users/{userId}）
// ========================================

export type SocialLinkInput = {
  platform: SnsPlatform;
  url: string;
  title?: string | null;
};

export type UpdateUserProfileRequest = {
  username?: string;
  avatarUrl?: string | null;
  displayName?: string;
  tagline?: string | null;
  bio?: string | null;
  skills?: string[];
  interests?: string[];
  vision?: string | null;
  isVisionPublic?: boolean;
  socialLinks?: SocialLinkInput[];
};

export type UpdateUserProfileResponse = {
  data: {
    user: UserDetail;
  };
  message: string;
  timestamp: string;
};

// ========================================
// ライバル関連（/api/v1/users/{userId}/rivals）
// ========================================

/** ライバルユーザー情報（比較表示用） */
export type RivalUser = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  displayName: string | null;
  tagline: string | null;
  totalAttendanceDays: number;
  currentStreakDays: number;
  maxStreakDays: number;
  currentTitleLevel: number;
};

/** ライバル関係 */
export type Rival = {
  id: string;
  rivalUser: RivalUser;
  createdAt: string;
};

/** ライバル一覧レスポンス */
export type RivalsListResponse = {
  data: {
    rivals: Rival[];
    maxRivals: number;
    remainingSlots: number;
  };
  message: string;
  timestamp: string;
};

/** ライバル追加リクエスト */
export type AddRivalRequest = {
  rivalUserId: string;
};

/** ライバル追加レスポンス */
export type AddRivalResponse = {
  data: {
    rival: Rival;
    remainingSlots: number;
  };
  message: string;
  timestamp: string;
};

/** ライバル削除レスポンス */
export type DeleteRivalResponse = {
  data: {
    remainingSlots: number;
  };
  message: string;
  timestamp: string;
};

// ========================================
// スキル・興味一覧（GET /api/v1/users/skills, /interests）
// ========================================

/** スキル一覧レスポンス */
export type SkillsListResponse = {
  data: {
    skills: string[];
  };
  message: string;
  timestamp: string;
};

/** 興味・関心一覧レスポンス */
export type InterestsListResponse = {
  data: {
    interests: string[];
  };
  message: string;
  timestamp: string;
};
