# Title Domain フロントエンド実装レポート

## 概要

称号ドメインのフロントエンド実装。称号ページのAPI接続、称号保持者一覧・ユーザー称号実績取得機能をFSD構成で実装。
称号マスターデータ（TITLE_MASTER）はフロントエンドで管理し、バックエンドは獲得実績・保持者情報のみを管理する設計。

## 変更ファイル

```
frontend/src/
├── entities/domain/title/
│   ├── model/types.ts                # API型定義
│   └── api/title-api.ts              # APIクライアント
├── features/domain/title/
│   ├── get-title-holders/lib/use-title-holders.ts           # 保持者一覧取得hook
│   └── get-user-title-achievements/lib/use-user-title-achievements.ts  # ユーザー称号実績取得hook
├── page-components/titles/home/
│   ├── ui/TitlesHomeContainer.tsx    # API接続（useAppSelector, useUserTitleAchievements）
│   └── ui-block/
│       └── title-gallery/ui/
│           ├── TitleGallery.tsx      # Title型を使用
│           └── components/TitleCard.tsx  # Title型を使用
└── widgets/title/title-detail-modal/ui/
    ├── TitleDetailModalSheet.tsx     # UIラッパーのみ
    └── TitleDetailContent.tsx        # useTitleHolders, useUserTitleAchievements
```

## データ責務分離

| データ | 保持場所 | 理由 |
|--------|----------|------|
| 称号マスター（名前、説明、必要日数、色テーマ等） | **フロントエンド** (`TITLE_MASTER`) | 静的データ、変更頻度低い |
| 誰が何を獲得したか（実績） | **バックエンド** (`title_achievements`) | 動的データ、認証が必要 |
| 参加日数（称号計算の元データ） | **バックエンド** (`attendance_statistics`) | Discord連携で自動記録 |

## Entity層

### 型定義（types.ts）

**称号保持者:**
```typescript
type TitleHolder = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  achievedAt: string;
};
```

**称号保持者一覧レスポンス:**
```typescript
type TitleHoldersResponse = {
  data: {
    level: TitleLevel;
    holders: TitleHolder[];
    total: number;
  };
  message: string;
  timestamp: string;
};
```

**ユーザー称号実績:**
```typescript
type UserTitleAchievement = {
  titleLevel: TitleLevel;
  achievedAt: string;
};
```

**ユーザー称号実績レスポンス:**
```typescript
type UserTitleAchievementsResponse = {
  data: {
    currentTitleLevel: TitleLevel;
    totalAttendanceDays: number;
    achievements: UserTitleAchievement[];
  };
  message: string;
  timestamp: string;
};
```

### APIクライアント（title-api.ts）

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| `getTitleHolders` | GET /api/v1/titles/{level}/holders | 指定レベルの保持者一覧取得 |
| `getUserTitleAchievements` | GET /api/v1/users/{userId}/title-achievements | ユーザーの称号実績取得 |

## Feature層

### hooks一覧

| hook | 用途 | React Query |
|------|------|-------------|
| `useTitleHolders` | 指定レベルの保持者一覧取得 | useQuery |
| `useUserTitleAchievements` | ユーザーの称号実績取得 | useQuery |

### hook実装パターン

```typescript
/**
 * 称号保持者一覧取得 Hook
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { titleApi } from '@/entities/domain/title/api/title-api';
import type { TitleLevel } from '@/shared/types/title/title';

export function useTitleHolders(level: TitleLevel | null) {
  return useQuery({
    queryKey: ['title-holders', level],
    queryFn: () => titleApi.getTitleHolders(level!),
    enabled: level !== null,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
```

## コンポーネント設計

### 責務分離（ModalSheet / Content）

**ModalSheet（UIラッパー）:**
- Modal/Sheetの表示制御
- ViewMode切り替え
- `titleLevel`のみをContentに渡す

**Content（ロジック）:**
- `useTitleHolders`で保持者一覧取得
- `useUserTitleAchievements`でユーザー獲得状態取得
- ローディング状態管理

```
TitleDetailModalSheet
  └─ TitleDetailContent（useTitleHolders, useUserTitleAchievements）
```

### 認証状態取得

```typescript
// TitlesHomeContainer.tsx, TitleDetailContent.tsx
const { user } = useAppSelector((state) => state.auth);
```

### 称号マスターデータとの組み合わせ

フロントエンドの`TITLE_MASTER`とAPIレスポンスを組み合わせて表示:

```typescript
import { getTitleByLevel, TITLE_MASTER, type TitleLevel } from '@/shared/types/title/title';

// 称号マスターから取得
const title = getTitleByLevel(titleLevel);

// APIデータから獲得状態を計算
const achievedLevels = new Set<TitleLevel>(
  achievements.map((a) => a.titleLevel),
);
const isAchieved = achievedLevels.has(titleLevel);
const isCurrent = titleLevel === currentTitleLevel;
```

## ダミーデータからの移行

| 変更前 | 変更後 |
|--------|--------|
| `@/shared/dummy-data/titles/titles` (型) | `@/entities/domain/title/model/types` |
| `@/shared/dummy-data/titles/titles` (TitleWithHolders) | `@/shared/types/title/title` (Title) + API |
| `dummyTitlesWithHolders` | `TITLE_MASTER` + `useTitleHolders()` |
| `dummyUserTitleProgress` | `useUserTitleAchievements()` |

## 称号レベル対応表

フロントエンドの`TITLE_MASTER`で定義（`shared/types/title/title.ts`）:

| Level | 日本語名 | 英語名 | 必要日数 |
|-------|---------|--------|---------|
| 1 | まどろみ見習い | Sleeper | 0 |
| 2 | 夜明けの旅人 | Dawn Wanderer | 7 |
| 3 | 朝焼け探検家 | Aurora Scout | 30 |
| 4 | サンライズ職人 | Sunrise Crafter | 60 |
| 5 | 太陽追い | Sun Chaser | 100 |
| 6 | 暁の達人 | Daybreak Master | 150 |
| 7 | 曙光の守護者 | Aurora Guardian | 250 |
| 8 | 太陽賢者 | Solar Sage | 365 |

## UI表示

### TitlesHomeContainer

- `useUserTitleAchievements`でユーザーの称号実績を取得
- `TITLE_MASTER`と組み合わせて現在の称号、進捗を表示
- `CurrentTitleCard`, `UserStatsCard`, `TitleJourneyProgress`, `TitleGallery`を配置

### TitleGallery / TitleCard

- `TITLE_MASTER`を使用して全称号を表示
- `achievedLevels`で獲得済み/未獲得を判定
- 未獲得はグレースケール表示

### TitleDetailContent

- `useTitleHolders`で保持者一覧を取得
- `useUserTitleAchievements`でユーザーの獲得状態を取得
- ローディング中はスピナー表示
- 保持者アバターをクリックでメンバー詳細モーダルを開く
