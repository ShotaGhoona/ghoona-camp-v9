# Dashboard Domain フロントエンド実装レポート

## 概要

ダッシュボードドメインのフロントエンド実装。ダッシュボードレイアウトのAPI接続をFSD構成で実装。
ユーザーごとにカスタマイズ可能なダッシュボードのブロック配置を永続化する。

## 変更ファイル

### 新規作成

```
frontend/src/
├── entities/domain/dashboard/
│   ├── model/types.ts                # API型定義
│   └── api/dashboard-api.ts          # APIクライアント
└── features/domain/dashboard/
    ├── get-layout/lib/use-dashboard-layout.ts    # レイアウト取得hook
    └── update-layout/lib/use-update-layout.ts    # レイアウト更新hook
```

### 修正

```
frontend/src/page-components/dashboard/home/
├── model/types.ts                    # UI型定義（BlockConfig, GridLayoutItem）
├── config/block-config.ts            # entity型使用に変更、DEFAULT_BLOCKS削除
├── lib/use-dashboard-layouts.ts      # API接続（useDashboardLayout, useUpdateLayout）
└── ui/
    ├── DashboardContainer.tsx        # blocks, gridLayouts使用に変更
    └── components/
        ├── BlockRenderContent.tsx    # import修正
        └── AddBlockDialog.tsx        # import修正
```

## Entity層

### 型定義（types.ts）

**ブロックタイプ:**
```typescript
type DashboardBlockType =
  | 'current-title'
  | 'title-journey'
  | 'user-stats'
  | 'activity-calendar'
  | 'events-calendar'
  | 'ranking'
  | 'goals-sidebar'
  | 'goals-timeline';
```

**ダッシュボードブロック:**
```typescript
type DashboardBlock = {
  id: string;
  type: DashboardBlockType;
  x: number; // X座標（0-11）
  y: number; // Y座標（0以上）
  w: number; // 幅（1-12）
  h: number; // 高さ（1以上）
};
```

**APIレスポンス:**
```typescript
type DashboardLayoutResponse = {
  data: { blocks: DashboardBlock[] };
  message: string;
  timestamp: string;
};

type UpdateDashboardLayoutResponse = {
  data: { blocks: DashboardBlock[] };
  message: string;
  timestamp: string;
};
```

**リクエスト:**
```typescript
type UpdateDashboardLayoutRequest = {
  blocks: DashboardBlock[];
};
```

### APIクライアント（dashboard-api.ts）

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| `getLayout` | GET /api/v1/dashboard/layout | レイアウト取得 |
| `updateLayout` | PUT /api/v1/dashboard/layout | レイアウト更新（全体置換） |

## Feature層

### hooks一覧

| hook | 用途 | React Query | キャッシュ |
|------|------|-------------|-----------|
| `useDashboardLayout` | レイアウト取得 | useQuery | 5分 |
| `useUpdateLayout` | レイアウト更新 | useMutation | dashboard-layout無効化 |

### hook実装パターン

**レイアウト取得:**
```typescript
export function useDashboardLayout(enabled = true) {
  return useQuery({
    queryKey: ['dashboard-layout'],
    queryFn: () => dashboardApi.getLayout(),
    enabled,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
```

**レイアウト更新:**
```typescript
export function useUpdateLayout(options?: UseUpdateLayoutOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDashboardLayoutRequest) => {
      return dashboardApi.updateLayout(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-layout'] });
      options?.onSuccess?.();
    },
  });
}
```

## Page Components層

### UI型定義（model/types.ts）

Entity層の`DashboardBlockType`を再エクスポートし、UI固有の型を定義。

```typescript
import type { DashboardBlockType } from '@/entities/domain/dashboard/model/types';

type BlockSizeConstraints = {
  minW: number; maxW: number;
  minH: number; maxH: number;
  defaultW: number; defaultH: number;
};

type BlockConfig = {
  type: DashboardBlockType;
  label: string;
  constraints: BlockSizeConstraints;
};

type GridLayoutItem = {
  i: string; // react-grid-layout用ID（= DashboardBlock.id）
  x: number; y: number; w: number; h: number;
  minW?: number; maxW?: number;
  minH?: number; maxH?: number;
};
```

### useDashboardLayouts（API接続）

ローカルhookをAPI接続に対応。

**主な変更:**
- `useDashboardLayout()`でAPIからレイアウト取得
- `useUpdateLayout()`でAPIにレイアウト保存
- 500msデバウンスで自動保存
- 初期状態は空配列（バックエンドで初期データ投入）

**データフロー:**
```
1. 初回ロード
   └─→ useDashboardLayout() でAPI取得
   └─→ blocks stateに反映

2. レイアウト変更時（ドラッグ/リサイズ/追加/削除）
   └─→ ローカル blocks を即時更新
   └─→ 500msデバウンス後に useUpdateLayout()

3. DashboardBlock → GridLayoutItem 変換
   └─→ BLOCK_CONFIGS から制約（min/max）を付与
   └─→ react-grid-layout に渡す
```

### DashboardContainer

**変更点:**
- `layouts` → `blocks`（DashboardBlock[]）
- `layoutsWithConstraints` → `gridLayouts`（GridLayoutItem[]）
- `item.i` → `block.id`
- `item.blockType` → `block.type`

## 型の責務分離

| 層 | ファイル | 型 | 用途 |
|---|---|---|---|
| Entity | `entities/.../types.ts` | `DashboardBlockType`, `DashboardBlock` | API通信 |
| Entity | `entities/.../types.ts` | `DashboardLayoutResponse`, `UpdateDashboardLayoutRequest` | API型 |
| UI | `home/model/types.ts` | `BlockConfig`, `BlockSizeConstraints` | ブロック設定 |
| UI | `home/model/types.ts` | `GridLayoutItem` | react-grid-layout用 |

## ブロックタイプ

| type | ラベル | サイズ制約 |
|------|-------|-----------|
| `current-title` | 現在の称号 | 2x2 〜 4x3 |
| `title-journey` | 称号ジャーニー | 4x2 〜 12x3 |
| `user-stats` | あなたの記録 | 2x2 〜 4x4 |
| `activity-calendar` | 参加カレンダー | 5x9 〜 12x9 |
| `events-calendar` | イベントカレンダー | 5x9 〜 12x9 |
| `ranking` | ランキング | 3x4 〜 6x8 |
| `goals-sidebar` | 目標一覧 | 3x4 〜 6x8 |
| `goals-timeline` | 目標タイムライン | 6x4 〜 12x8 |

## 備考

- デフォルトレイアウトはバックエンドで初期データとして投入
- フロントエンドは空配列で初期化し、APIから取得
- レイアウト変更は500msデバウンスで自動保存（UX向上）
- 編集モード終了時の明示的な保存は不要（変更時に自動保存済み）
