# ゴールページ 実装レポート

## 概要

ユーザーの目標をタイムライン形式で管理し、他メンバーの公開目標も閲覧できるページ。

## 関連コミット

| コミット | メッセージ |
|----------|------------|
| `27486b9` | feat: goal page |

## ディレクトリ構成

```
frontend/src/page-components/goals/home/
├── ui/
│   └── GoalsHomeContainer.tsx    # メインコンテナ
└── ui-block/
    ├── timeline-view/
    │   └── ui/
    │       ├── GoalsTimelineView.tsx
    │       └── components/
    │           ├── GoalTimelineBar.tsx    # タイムラインバー
    │           └── GoalTimelineLabel.tsx  # 左側ラベル
    ├── goals-sidebar/
    │   └── ui/
    │       ├── GoalsSidebar.tsx          # みんなの目標サイドバー
    │       └── components/
    │           └── SidebarGoalCard.tsx
    ├── goal-detail-modal/
    │   ├── lib/
    │   │   └── use-view-mode.ts
    │   └── ui/
    │       ├── GoalDetailModalSheet.tsx
    │       └── GoalDetailContent.tsx
    ├── create-goal/
    │   ├── lib/
    │   │   └── use-compare-mode.ts       # 比較モード用Hook
    │   └── ui/
    │       ├── CreateGoalModalSheet.tsx
    │       ├── CreateGoalContent.tsx
    │       ├── GoalComparePanel.tsx      # 比較パネル
    │       └── components/
    │           └── GoalCompareItem.tsx
    └── edit-goal/
        └── ui/
            ├── EditGoalModalSheet.tsx
            └── EditGoalContent.tsx

frontend/src/widgets/view/timeline-view/
└── ui/
    └── TimelineViewWidget.tsx  # 汎用タイムラインWidget

frontend/src/shared/dummy-data/goals/goals.ts  # ダミーデータ
```

## 実装内容

### 1. ページレイアウト

```
┌─────────────────────────────────────┬──────────────────┐
│ 左側: タイムラインビュー             │ 右側: サイドバー  │
│ ┌─────────────────────────────────┐ │ ┌──────────────┐ │
│ │ [<] 2025年1月 [>]  [+ 新規作成] │ │ │みんなの目標   │ │
│ ├─────────────────────────────────┤ │ │10件の公開目標 │ │
│ │      1  2  3  4  5 ... 31       │ │ ├──────────────┤ │
│ │ 目標1 ████████████████          │ │ │[目標カード]   │ │
│ │ 目標2      ███████████          │ │ │[目標カード]   │ │
│ │ 目標3 ██████████████████████    │ │ │...           │ │
│ └─────────────────────────────────┘ │ └──────────────┘ │
└─────────────────────────────────────┴──────────────────┘
```

### 2. TimelineViewWidget（汎用タイムラインWidget）

ジェネリクス対応の汎用タイムラインコンポーネント：

```typescript
interface TimelineViewWidgetProps<T> {
  year: number;
  month: number;
  data: T[];
  startDateExtractor: (item: T) => string;
  endDateExtractor: (item: T) => string | null;
  labelRenderer: (item: T) => ReactNode;
  barRenderer?: (item: T, barProps: TimelineBarProps) => ReactNode;
  onItemClick?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
  emptyContent?: ReactNode;
}
```

特徴：
- 月単位での表示（日付ヘッダー）
- 左側に固定ラベル列（`sticky`）
- 今日の日付をハイライト表示
- 土曜（青）・日曜（赤）の色分け
- 開始/終了が月をまたぐ場合のバー表示対応
- 横スクロール対応

### 3. GoalsTimelineView

自分の目標をタイムライン表示：

- GoalTimelineLabel: 目標タイトル + アバター
- GoalTimelineBar: 期間を示すバー（公開/非公開でアイコン表示）
- クリックで詳細モーダルを開く

### 4. GoalsSidebar（みんなの目標）

他メンバーの公開目標をリスト表示：

- 公開目標の件数表示
- SidebarGoalCard: 作成者アバター、目標タイトル、期間
- クリックで詳細モーダルを開く

### 5. 目標詳細モーダル

モーダル/シート切り替え可能（他ページと同じパターン）：

- 作成者アバター、名前
- 目標タイトル
- 詳細説明
- 期間（開始日〜終了日 or 無期限）
- 公開/非公開状態
- 「編集」ボタン（自分の目標のみ）
- 作成者クリックでメンバー詳細へ

### 6. 新規作成モーダル（CreateGoalModalSheet）

入力項目：
- 目標タイトル（必須）
- 詳細説明（任意）
- 開始日（必須、デフォルト: 今日）
- 終了日（任意、未設定で無期限）
- 公開設定（Switch）

比較モード機能：
- Eyeアイコンでみんなの目標を横に表示
- 他メンバーの目標を参考にしながら作成可能

### 7. 編集モーダル（EditGoalModalSheet）

新規作成モーダルと同様のフォーム。既存の値をプリフィル。

## 目標データ構造

```typescript
interface GoalItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startedAt: string;        // YYYY-MM-DD
  endedAt: string | null;   // YYYY-MM-DD or null（無期限）
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  creator: GoalCreator;     // 表示用
}
```

## ダミーデータ

`shared/dummy-data/goals/goals.ts`：

- `dummyGoals`: 15件の目標データ（自分5件 + 他者10件）
- `CURRENT_USER_ID`: 現在のユーザーID
- `getMyGoals()`: 自分の目標を取得
- `getPublicGoals()`: 他者の公開目標を取得
- `getRemainingDays()`: 残り日数を計算
- `getProgressPercent()`: 進捗率を計算（期間ベース）

## 技術的ポイント

1. **汎用Widget**: `TimelineViewWidget`はジェネリクスで再利用可能
2. **固定列**: ラベル列は`sticky`で固定、日付部分のみスクロール
3. **月またぎ対応**: バーの角丸で期間が範囲外に続くことを視覚化
4. **比較モード**: 新規作成時に他メンバーの目標を参照可能
5. **モーダル連携**: 目標詳細 → メンバー詳細への遷移
