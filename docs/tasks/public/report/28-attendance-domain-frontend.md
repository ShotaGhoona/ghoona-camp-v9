# Attendance Domain（ランキング）フロントエンド実装レポート

## 概要

Attendanceドメイン（ランキング機能）のフロントエンド実装。ランキングページのAPI接続、月間・総合・連続日数ランキング表示機能をFSD構成で実装。

## 変更ファイル

```
frontend/src/
├── entities/domain/attendance/
│   ├── model/types.ts                # 型定義
│   └── api/attendance-api.ts         # APIクライアント
├── features/domain/attendance/
│   ├── get-rankings/lib/use-rankings.ts      # 全ランキング取得hook
│   └── get-my-rankings/lib/use-my-rankings.ts  # 自分のランキング取得hook
└── page-components/ranking/home/
    ├── ui/RankingHomeContainer.tsx           # API接続（useRankings, useAppSelector）
    └── ui-block/ranking-list/ui/
        ├── RankingColumn.tsx                 # isLoading対応
        ├── components/
        │   ├── TopThreeItem.tsx              # トップ3表示
        │   └── RankingItem.tsx               # 4位以下表示
        └── skeleton/
            ├── RankingColumnSkeleton.tsx     # カラムスケルトン
            ├── TopThreeItemSkeleton.tsx      # トップ3スケルトン
            └── RankingItemSkeleton.tsx       # 4位以下スケルトン
```

## Entity層

### 型定義（types.ts）

**ランキングユーザー:**
```typescript
type RankingUser = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  tagline: string | null;
};
```

**ランキングエントリ:**
```typescript
type RankingEntry = {
  rank: number;
  user: RankingUser;
  currentTitleLevel: number;
  score: number;
};
```

**ランキング一覧:**
```typescript
type RankingList = {
  entries: RankingEntry[];
  total: number;
};

type MonthlyRankingList = {
  year: number;
  month: number;
  entries: RankingEntry[];
  total: number;
};
```

**自分のランキング:**
```typescript
type CurrentUserRanking = {
  rank: number;
  score: number;
};

type CurrentUserRankings = {
  monthly: CurrentUserRanking;
  total: CurrentUserRanking;
  streak: CurrentUserRanking;
};
```

**APIレスポンス:**
```typescript
type AllRankingsResponse = {
  data: {
    monthly: MonthlyRankingList;
    total: RankingList;
    streak: RankingList;
    currentUser: CurrentUserRankings;
  };
  message: string;
  timestamp: string;
};

type MyRankingsResponse = {
  data: CurrentUserRankings;
  message: string;
  timestamp: string;
};
```

**リクエストパラメータ:**
```typescript
type RankingsParams = {
  year?: number;
  month?: number;
  limit?: number;
};

type MyRankingsParams = {
  year?: number;
  month?: number;
};
```

### APIクライアント（attendance-api.ts）

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| `getRankings` | GET /api/v1/rankings | 全ランキング一括取得 |
| `getMyRankings` | GET /api/v1/rankings/me | 自分のランキング取得 |

## Feature層

### hooks一覧

| hook | 用途 | React Query |
|------|------|-------------|
| `useRankings` | 全ランキング取得 | useQuery（5分キャッシュ） |
| `useMyRankings` | 自分のランキング取得 | useQuery（5分キャッシュ） |

### hook実装パターン

```typescript
/**
 * 全ランキング取得 Hook
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/entities/domain/attendance/api/attendance-api';
import type { RankingsParams } from '@/entities/domain/attendance/model/types';

export function useRankings(params?: RankingsParams, enabled = true) {
  return useQuery({
    queryKey: ['rankings', params?.year, params?.month, params?.limit],
    queryFn: () => attendanceApi.getRankings(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
```

## コンポーネント設計

### RankingHomeContainer

- `useRankings()`で全ランキングデータを取得
- `useAppSelector((state) => state.auth)`で認証状態を取得
- `isLoading`を子コンポーネントに伝播
- `currentUserId`を子コンポーネントに渡して自分のエントリをハイライト

### RankingColumn

- ランキング種別（monthly/total/streak）ごとのカラム表示
- ヘッダーに自分のスコア・順位を表示
- `isLoading=true`時は`RankingColumnSkeleton`を表示
- トップ3は`TopThreeItem`、4位以下は`RankingItem`で表示

### TopThreeItem / RankingItem

- ユーザーアバター、displayName、tagline、スコアを表示
- `isCurrentUser=true`の場合は`bg-primary/10`で背景をハイライト

## ローディング対応

### パターン

- `RankingHomeContainer`で`isLoading`を取得
- 各`RankingColumn`に`isLoading`を伝播
- `isLoading=true`時は`RankingColumnSkeleton`を表示

### スケルトン構成

```
RankingColumnSkeleton
├── ヘッダー（実コンポーネント + スコア部分のみスケルトン）
└── リスト部分
    ├── TopThreeItemSkeleton × 3
    └── RankingItemSkeleton × 7
```

## 自分のエントリのハイライト

### 実装方法

1. `RankingHomeContainer`で`useAppSelector`から`user.id`を取得
2. `currentUserId`として各`RankingColumn`に渡す
3. `RankingColumn`内で`entry.user.id === currentUserId`を計算
4. `isCurrentUser`として`TopThreeItem`/`RankingItem`に渡す
5. 各コンポーネントで`bg-primary/10`を適用

```typescript
// RankingHomeContainer
const { user } = useAppSelector((state) => state.auth);
const currentUserId = user?.id ?? null;

// RankingColumn
<TopThreeItem
  entry={entry}
  isCurrentUser={entry.user.id === currentUserId}
  onClick={onEntryClick}
/>
```

## ダミーデータからの移行

| 変更前 | 変更後 |
|--------|--------|
| `@/shared/dummy-data/ranking/ranking` (型) | `@/entities/domain/attendance/model/types` |
| `monthlyRanking`, `totalRanking`, `streakRanking` | `useRankings()` |
| `CURRENT_USER_ID` | `useAppSelector((state) => state.auth)` |
| `entry.isCurrentUser` | `entry.user.id === currentUserId` |
| `getScoreValue(entry, type)` | `entry.score` |

## ランキング種別

| type | ヘッダー | 説明 |
|------|---------|------|
| `monthly` | 今月 / 参加日数 | 月間参加日数ランキング |
| `total` | 総合 / 累計参加 | 総参加日数ランキング |
| `streak` | 連続 / 継続日数 | 連続参加日数ランキング |

## 備考

ファイルパスは `attendance` だが、現在はランキング機能のみ実装。
将来的に以下の機能が追加される予定：
- カレンダー表示用の参加サマリー取得
- 参加統計の取得
