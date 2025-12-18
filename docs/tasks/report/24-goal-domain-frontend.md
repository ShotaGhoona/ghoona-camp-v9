# Goal Domain フロントエンド実装レポート

## 概要

目標ドメインのフロントエンド実装。目標ページのAPI接続、目標作成・更新・削除機能をFSD構成で実装。

## 変更ファイル

```
frontend/src/
├── entities/domain/goal/
│   ├── model/types.ts                # 型定義（一覧・作成・更新・削除）
│   └── api/goal-api.ts               # APIクライアント
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
│       │   └── GoalDetailContent.tsx          # useDeleteGoal
│       ├── create-goal/ui/
│       │   ├── CreateGoalModalSheet.tsx       # UIラッパー
│       │   └── CreateGoalContent.tsx          # useCreateGoal
│       ├── edit-goal/ui/
│       │   ├── EditGoalModalSheet.tsx         # UIラッパー
│       │   └── EditGoalContent.tsx            # useUpdateGoal
│       ├── goals-sidebar/ui/
│       │   ├── GoalsSidebar.tsx               # usePublicGoals
│       │   └── components/SidebarGoalCard.tsx # creator情報なし対応
│       └── timeline-view/ui/
│           ├── GoalsTimelineView.tsx          # isLoading対応
│           └── components/
│               ├── GoalTimelineBar.tsx        # 型変更
│               └── GoalTimelineLabel.tsx      # 型変更
```

## Entity層

### 型定義（types.ts）

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
};
```

**目標作成者（未使用 - バックエンド未対応）:**
```typescript
type GoalCreator = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

type GoalItemWithCreator = GoalItem & {
  creator: GoalCreator;
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

**ユーティリティ関数:**
```typescript
// 残り日数計算
function getRemainingDays(goal: GoalItem): number | null;

// 進捗率計算（期間ベース）
function getProgressPercent(goal: GoalItem): number | null;
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
| `@/shared/dummy-data/goals/goals` | `@/entities/domain/goal/model/types` |
| `CURRENT_USER_ID` | `useAppSelector((state) => state.auth)` |
| `dummyGoals` | `useMyGoals()` / `usePublicGoals()` |

## 残課題

### バックエンドAPIの修正が必要

**問題:**
`GET /goals/public` のレスポンスに作成者情報（displayName, avatarUrl）が含まれていない。

**現在のレスポンス:**
```json
{
  "goals": [{
    "id": "...",
    "userId": "...",   // ← userIdのみ
    "title": "...",
    ...
  }]
}
```

**必要なレスポンス:**
```json
{
  "goals": [{
    "id": "...",
    "userId": "...",
    "title": "...",
    "creator": {       // ← これが必要
      "id": "...",
      "displayName": "田中太郎",
      "avatarUrl": "https://..."
    }
  }]
}
```

**影響箇所:**
- `GoalsSidebar > SidebarGoalCard` - 作成者のアバター・名前が表示できない
- `GoalDetailContent` - 他人の目標の場合、作成者名が表示できない

**暫定対応:**
- アバターの代わりにTargetアイコンを表示
- 作成者名の代わりに「他のメンバーの目標」と表示
