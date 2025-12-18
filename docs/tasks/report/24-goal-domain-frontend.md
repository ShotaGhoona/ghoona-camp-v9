# Goal Domain フロントエンド実装レポート

## 概要

目標ドメインのフロントエンド実装。目標ページのAPI接続、目標作成・更新・削除機能をFSD構成で実装。
バックエンドと連携し、全APIでcreator情報（displayName, avatarUrl）を返すように対応。

## 変更ファイル

### フロントエンド

```
frontend/src/
├── entities/domain/goal/
│   ├── model/types.ts                # 型定義（GoalItem + creator）
│   ├── api/goal-api.ts               # APIクライアント
│   └── utils/                        # ユーティリティ関数
│       ├── get-remaining-days.ts     # 残り日数計算
│       └── get-progress-percent.ts   # 進捗率計算
├── features/domain/goal/
│   ├── get-my-goals/lib/use-my-goals.ts       # 自分の目標一覧取得hook
│   ├── get-public-goals/lib/use-public-goals.ts  # 公開目標一覧取得hook
│   ├── create-goal/lib/use-create-goal.ts     # 目標作成hook
│   ├── update-goal/lib/use-update-goal.ts     # 目標更新hook
│   └── delete-goal/lib/use-delete-goal.ts     # 目標削除hook
├── page-components/goals/home/
│   ├── ui/GoalsHomeContainer.tsx              # API接続（useAppSelector, useMyGoals, usePublicGoals）
│   └── ui-block/
│       ├── goal-detail-modal/ui/
│       │   ├── GoalDetailModalSheet.tsx       # UIラッパー
│       │   └── GoalDetailContent.tsx          # useDeleteGoal, creator表示
│       ├── create-goal/ui/
│       │   ├── CreateGoalModalSheet.tsx       # UIラッパー
│       │   ├── CreateGoalContent.tsx          # useCreateGoal
│       │   ├── GoalComparePanel.tsx           # usePublicGoals（比較パネル）
│       │   └── components/GoalCompareItem.tsx # creator表示
│       ├── edit-goal/ui/
│       │   ├── EditGoalModalSheet.tsx         # UIラッパー
│       │   └── EditGoalContent.tsx            # useUpdateGoal, creator表示
│       ├── goals-sidebar/ui/
│       │   ├── GoalsSidebar.tsx               # usePublicGoals
│       │   └── components/SidebarGoalCard.tsx # creator表示（アバター + displayName）
│       └── timeline-view/ui/
│           ├── GoalsTimelineView.tsx          # isLoading対応
│           └── components/
│               ├── GoalTimelineBar.tsx        # 型変更
│               └── GoalTimelineLabel.tsx      # 型変更
```

### バックエンド

```
backend/app/
├── domain/repositories/goal_repository.py      # GoalCreator, GoalItem.creator追加
├── infrastructure/db/repositories/goal_repository_impl.py  # JOINクエリでcreator取得
├── application/schemas/goal_schemas.py         # GoalCreatorDTO追加
├── application/use_cases/goal_usecase.py       # creator変換追加
├── presentation/schemas/goal_schemas.py        # GoalCreatorResponse追加
└── presentation/api/goal_api.py                # レスポンスにcreator追加
```

## Entity層

### 型定義（types.ts）

**目標作成者:**
```typescript
type GoalCreator = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};
```

**目標アイテム:**
```typescript
type GoalItem = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startedAt: string;      // YYYY-MM-DD
  endedAt: string | null; // YYYY-MM-DD
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
  creator: GoalCreator;   // 作成者情報（全APIで返却）
};
```

**APIレスポンス:**
```typescript
type MyGoalsListResponse = {
  data: { goals: GoalItem[]; total: number; };
  message: string;
  timestamp: string;
};

type PublicGoalsListResponse = {
  data: { goals: GoalItem[]; total: number; };
  message: string;
  timestamp: string;
};
```

**リクエスト:**
```typescript
type CreateGoalRequest = {
  title: string;
  description?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  isPublic?: boolean;
};

type UpdateGoalRequest = {
  title?: string;
  description?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  isPublic?: boolean;
};
```

### ユーティリティ関数（utils/）

FSDアーキテクチャに準拠し、`model/types.ts`から分離。

**get-remaining-days.ts:**
```typescript
import type { GoalItem } from '../model/types';

// 残り日数計算
export function getRemainingDays(goal: GoalItem): number | null;
```

**get-progress-percent.ts:**
```typescript
import type { GoalItem } from '../model/types';

// 進捗率計算（期間ベース）
export function getProgressPercent(goal: GoalItem): number | null;
```

**使用例:**
```typescript
import { getRemainingDays } from '@/entities/domain/goal/utils/get-remaining-days';
import { getProgressPercent } from '@/entities/domain/goal/utils/get-progress-percent';
```

### APIクライアント（goal-api.ts）

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| `getMyGoals` | GET /api/v1/goals/me | 自分の目標一覧取得 |
| `getPublicGoals` | GET /api/v1/goals/public | 公開目標一覧取得 |
| `createGoal` | POST /api/v1/goals | 目標作成 |
| `updateGoal` | PUT /api/v1/goals/{goalId} | 目標更新 |
| `deleteGoal` | DELETE /api/v1/goals/{goalId} | 目標削除 |

## Feature層

### hooks一覧

| hook | 用途 | React Query | キャッシュ無効化 |
|------|------|-------------|-----------------|
| `useMyGoals` | 自分の目標取得 | useQuery | - |
| `usePublicGoals` | 公開目標取得 | useQuery | - |
| `useCreateGoal` | 目標作成 | useMutation | my-goals, public-goals |
| `useUpdateGoal` | 目標更新 | useMutation | my-goals, public-goals |
| `useDeleteGoal` | 目標削除 | useMutation | my-goals, public-goals |

### hook実装パターン

```typescript
/**
 * 目標作成 Hook
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '@/entities/domain/goal/api/goal-api';

export function useCreateGoal(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => goalApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-goals'] });
      queryClient.invalidateQueries({ queryKey: ['public-goals'] });
      options?.onSuccess?.();
    },
  });
}
```

## コンポーネント設計

### 責務分離（ModalSheet / Content）

**ModalSheet（UIラッパー）:**
- Modal/Sheetの表示制御
- ViewMode切り替え
- `onClose` コールバック提供

**Content（ロジック）:**
- React Query hookの呼び出し
- フォーム状態管理
- API呼び出し実行
- ローディング状態管理

```
GoalDetailModalSheet
  └─ GoalDetailContent（useDeleteGoal）

CreateGoalModalSheet
  └─ CreateGoalContent（useCreateGoal）

EditGoalModalSheet
  └─ EditGoalContent（useUpdateGoal）
```

### 認証状態取得

```typescript
// GoalsHomeContainer.tsx
const { user } = useAppSelector((state) => state.auth);
```

### 目標検索（モーダル用）

親コンポーネントから`myGoals`/`publicGoals`をpropsで渡し、goalIdから検索:

```typescript
// GoalDetailModalSheet
const goal = goalProp ??
  (goalId
    ? myGoals.find((g) => g.id === goalId) ??
      publicGoals.find((g) => g.id === goalId)
    : null);
```

## ダミーデータからの移行

| 変更前 | 変更後 |
|--------|--------|
| `@/shared/dummy-data/goals/goals` (型) | `@/entities/domain/goal/model/types` |
| `@/shared/dummy-data/goals/goals` (utils) | `@/entities/domain/goal/utils/*` |
| `CURRENT_USER_ID` | `useAppSelector((state) => state.auth)` |
| `dummyGoals` | `useMyGoals()` / `usePublicGoals()` |

## バックエンド修正内容

### GoalItemにcreator情報を追加

全APIでcreator情報（displayName, avatarUrl）を返すように修正。

**修正方針:**
- `GoalItem`に`creator`フィールドを追加（必須）
- 全メソッド（get_my_goals, get_public_goals, create, update, get_by_id）でJOINクエリを使用
- `users`テーブルから`avatar_url`、`user_metadata`テーブルから`display_name`を取得

**レスポンス例:**
```json
{
  "data": {
    "goals": [{
      "id": "...",
      "userId": "...",
      "title": "TypeScriptをマスターする",
      "creator": {
        "id": "...",
        "displayName": "田中太郎",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
      }
    }],
    "total": 1
  }
}
```

## creator情報のUI表示

### SidebarGoalCard

- アバター画像を表示（なければUserアイコン）
- displayNameを日付の前に表示

```
[アバター] 山田太郎 ・ 12/1 〜 12/31
           TypeScriptをマスターする
           [進行中] 残り12日
```

### GoalDetailContent

- ヘッダーにアバター画像を表示（なければUserアイコン）
- 他人の目標の場合「山田太郎の目標」と表示

### EditGoalContent

- ヘッダーにアバター画像を表示（なければUserアイコン）

### CreateGoalContent

- 新規作成のためcreator情報なし
- Targetアイコンを表示

### GoalComparePanel / GoalCompareItem

- 目標作成時の比較パネル（みんなの目標を見ながら作成）
- usePublicGoalsで公開目標を取得
- 自分の目標は除外してフィルタリング
- アバター画像を表示（なければUserアイコン）
- displayNameを表示
