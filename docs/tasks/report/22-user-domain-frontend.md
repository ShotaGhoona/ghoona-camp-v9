# User Domain フロントエンド実装レポート

## 概要

ユーザードメインのフロントエンド実装。メンバーページのAPI接続、認証機能、プロフィール更新機能、ライバル機能をFSD構成で実装。

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
│   ├── update-profile/lib/use-update-profile.ts  # プロフィール更新hook
│   ├── get-rivals/lib/use-rivals.ts         # ライバル一覧取得hook
│   ├── add-rival/lib/use-add-rival.ts       # ライバル追加hook
│   ├── delete-rival/lib/use-delete-rival.ts # ライバル削除hook
│   ├── get-skills/lib/use-skills.ts         # スキル一覧取得hook
│   └── get-interests/lib/use-interests.ts   # 興味一覧取得hook
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

**ライバル用:**
```typescript
type RivalUser = {
  id, username, avatarUrl, displayName, tagline,
  totalAttendanceDays, currentStreakDays, maxStreakDays, currentTitleLevel
};

type Rival = { id, rivalUser: RivalUser, createdAt };

type RivalsListResponse = {
  data: { rivals[], maxRivals: 3, remainingSlots }
};

type AddRivalRequest = { rivalUserId };
```

**スキル・興味一覧用:**
```typescript
type SkillsListResponse = {
  data: { skills: string[] }
};

type InterestsListResponse = {
  data: { interests: string[] }
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
| `getRivals` | GET /api/v1/users/{id}/rivals | ライバル一覧取得 |
| `addRival` | POST /api/v1/users/{id}/rivals | ライバル追加 |
| `deleteRival` | DELETE /api/v1/users/{id}/rivals/{rivalId} | ライバル削除 |
| `getSkills` | GET /api/v1/users/skills | スキル一覧取得 |
| `getInterests` | GET /api/v1/users/interests | 興味一覧取得 |

## Feature層

### hooks一覧

| hook | 用途 | React Query |
|------|------|-------------|
| `useUsers` | 一覧取得 | useQuery |
| `useUserDetail` | 詳細取得 | useQuery |
| `useLogin` | ログイン | useMutation |
| `useLogout` | ログアウト | useMutation |
| `useUpdateProfile` | プロフィール更新 | useMutation |
| `useRivals` | ライバル一覧取得 | useQuery |
| `useAddRival` | ライバル追加 | useMutation |
| `useDeleteRival` | ライバル削除 | useMutation |
| `useSkills` | スキル一覧取得 | useQuery（30分キャッシュ） |
| `useInterests` | 興味一覧取得 | useQuery（30分キャッシュ） |

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
- ライバル追加/削除成功時に`['rivals', userId]`を無効化

### フィルターサイドバー連携
- `MembersFilterSidebar`で`useSkills()`、`useInterests()`を使用
- ダミーデータ(`ALL_SKILLS`, `ALL_INTERESTS`)からAPIデータに移行
- フィルター選択肢がDBの実データから動的に取得される
