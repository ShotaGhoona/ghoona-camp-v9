# User Domain フロントエンド実装レポート

## 概要

ユーザードメインのフロントエンド実装。メンバーページのAPI接続、認証機能、プロフィール更新機能をFSD構成で実装。

## 変更ファイル

```
frontend/src/
├── shared/types/
│   ├── api/pagination.ts             # Pagination型（共通）
│   └── user/sns.ts                   # SnsPlatform型（共通）
├── entities/domain/user/
│   ├── model/types.ts                # 型定義（一覧・詳細・認証・更新）
│   └── api/user-api.ts               # APIクライアント
├── features/domain/user/
│   ├── get-users/lib/use-users.ts           # 一覧取得hook
│   ├── get-user-detail/lib/use-user-detail.ts  # 詳細取得hook
│   ├── login/lib/use-login.ts               # ログインhook
│   ├── logout/lib/use-logout.ts             # ログアウトhook
│   └── update-profile/lib/use-update-profile.ts  # プロフィール更新hook
├── page-components/members/home/
│   ├── ui/MembersHomeContainer.tsx
│   └── ui-block/gallery-view/ui/
│       ├── MembersGalleryView.tsx
│       ├── components/MemberCard.tsx
│       └── skeleton/
│           ├── MemberCardSkeleton.tsx
│           └── MembersGallerySkeleton.tsx
├── widgets/member/member-detail-modal/ui/
│   ├── MemberDetailModalSheet.tsx
│   ├── MemberDetailContent.tsx
│   └── skeleton/MemberDetailSkeleton.tsx
├── store/slices/authSlice.ts         # 認証状態管理
└── app/providers.tsx                 # AuthInitializer
```

## Entity層

### 型定義（types.ts）

**一覧用:**
```typescript
type UserListItem = {
  id: string;
  avatarUrl: string | null;
  displayName: string | null;
  tagline: string | null;
  currentTitleLevel: number;
};
```

**詳細用:**
```typescript
type UserDetail = {
  id, username, avatarUrl, displayName, tagline, bio,
  skills[], interests[], vision, isVisionPublic,
  socialLinks[], totalAttendanceDays, currentStreakDays,
  maxStreakDays, currentTitleLevel, joinedAt
};
```

**認証用:**
```typescript
type LoginRequest = { email: string; password: string; };
type MeResponse = { id, email, username, avatar_url, discord_id, is_active };
```

**プロフィール更新用:**
```typescript
type UpdateUserProfileRequest = {
  username?, avatarUrl?, displayName?, tagline?, bio?,
  skills?, interests?, vision?, isVisionPublic?, socialLinks?
};
```

### APIクライアント（user-api.ts）

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| `getUsers` | GET /api/v1/users | 一覧取得 |
| `getUserById` | GET /api/v1/users/{id} | 詳細取得 |
| `login` | POST /auth/login | ログイン |
| `logout` | POST /auth/logout | ログアウト |
| `getMe` | GET /auth/me | 現在のユーザー取得 |
| `updateUser` | PUT /api/v1/users/{id} | プロフィール更新 |

## Feature層

### hooks一覧

| hook | 用途 | React Query |
|------|------|-------------|
| `useUsers` | 一覧取得 | useQuery |
| `useUserDetail` | 詳細取得 | useQuery |
| `useLogin` | ログイン | useMutation |
| `useLogout` | ログアウト | useMutation |
| `useUpdateProfile` | プロフィール更新 | useMutation |

### 統一パターン

```typescript
/**
 * {機能名} Hook
 */

'use client';

import { useQuery/useMutation } from '@tanstack/react-query';
import { userApi } from '@/entities/domain/user/api/user-api';
import type { ... } from '@/entities/domain/user/model/types';

export function use{Feature}() {
  // ...
}
```

## 認証フロー

### ログイン
1. `userApi.login()` でログイン実行
2. `userApi.getMe()` でユーザー情報取得
3. `setUser()` でRedux storeに保存
4. `/dashboard` にリダイレクト

### 認証状態復元（AuthInitializer）
- アプリ起動時に `/auth/me` を呼び出し
- 成功: `setUser()` で状態復元
- 失敗: `clearUser()` で状態クリア

## 実装パターン

### FSD構成
- `entities/domain/` - ドメインエンティティ・API
- `features/domain/` - ドメイン機能（React Query hooks）
- `shared/types/` - 共通型（Pagination, SnsPlatform等）

### ローディング
- `isLoading`を子コンポーネントに伝播
- 各コンポーネント内で`skeleton/`配下のスケルトンを表示

### キャッシュ無効化
- プロフィール更新成功時に`['user', userId]`と`['users']`を無効化
