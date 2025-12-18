/**
 * User Entity - 型定義
 * バックエンドAPIレスポンスに基づく
 */

import type { Pagination } from '@/shared/types/api/pagination';

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
  platform: string;
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
  platform:
    | 'twitter'
    | 'instagram'
    | 'github'
    | 'linkedin'
    | 'website'
    | 'blog'
    | 'note';
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
