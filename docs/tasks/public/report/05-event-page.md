# イベントページ 実装レポート

## 概要

イベント一覧をギャラリー/カレンダーの2つのビューで表示し、フィルター機能とイベント詳細モーダルを備えたページ。

## 関連コミット

| コミット | メッセージ |
|----------|------------|
| `3f7e9c6` | feat: event page |

## ディレクトリ構成

```
frontend/src/page-components/events/home/
├── ui/
│   ├── EventsHomeContainer.tsx    # メインコンテナ
│   └── components/
│       └── ViewChangeSwitch.tsx   # ビュー切り替えスイッチ
└── ui-block/
    ├── gallery-view/
    │   └── ui/
    │       ├── EventsGalleryView.tsx
    │       └── components/
    │           └── EventCard.tsx
    ├── calendar-view/
    │   └── ui/
    │       ├── EventsCalendarView.tsx
    │       └── components/
    │           └── CalendarCard.tsx
    └── filter-sidebar/
        ├── model/
        │   └── types.ts
        └── ui/
            ├── EventsFilterSidebar.tsx
            └── FilterToggleButton.tsx

frontend/src/widgets/
├── event/event-detail-modal/
│   ├── lib/
│   │   └── use-view-mode.ts
│   └── ui/
│       ├── EventDetailModalSheet.tsx
│       └── EventDetailContent.tsx
└── view/calendar-view/
    └── ui/
        └── CalendarViewWidget.tsx  # 汎用カレンダーWidget
```

## 実装内容

### 1. ビュー切り替え

| ビュー | 説明 |
|--------|------|
| **ギャラリー** | カード形式のグリッド表示 |
| **カレンダー** | 月間カレンダー形式 |

`ViewChangeSwitch`コンポーネントでトグル。

### 2. 月ナビゲーション

- 前月/次月ボタン
- 「YYYY年MM月」表示
- 月を変更するとイベントが自動フィルタリング

### 3. ギャラリービュー（EventsGalleryView）

- グリッドレイアウト
- `EventCard`でイベント情報表示
  - イベントタイプバッジ
  - タイトル
  - 日時
  - 参加者数
  - 参加状態

### 4. カレンダービュー（CalendarViewWidget）

汎用的なカレンダーWidget：

```typescript
interface CalendarViewWidgetProps<T> {
  year: number;
  month: number;
  data: T[];
  dateExtractor: (item: T) => string;
  cardRenderer: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
}
```

特徴：
- 日曜始まり（日=赤、土=青）
- 今日の日付をハイライト
- 日付セルごとにスクロール可能
- ジェネリクスで任意のデータ型に対応

### 5. フィルターサイドバー

| フィルター項目 | 説明 |
|----------------|------|
| イベントタイプ | 勉強会、交流会、ワークショップ等 |
| 参加状態 | 参加予定/未参加 |

### 6. イベントカード（EventCard）

表示情報：
- イベントタイプ（カラーバッジ）
- タイトル
- 開催日時
- 参加者アバター（最大3名 + 残り人数）
- 自分の参加状態

### 7. イベント詳細モーダル

モーダル/シート切り替え可能：

- イベント画像
- タイトル、タイプ
- 日時、場所
- 説明文
- 参加者一覧（クリックでメンバー詳細へ）
- 「参加する」ボタン（未実装、alert表示）

## フィルタリングロジック

```typescript
// 暫定実装（バックエンド接続時に削除予定）
const filteredEvents = useMemo(() => {
  return dummyEvents.filter((event) => {
    // 月フィルター
    // イベントタイプフィルター
    // 参加状態フィルター
    return true;
  });
}, [currentYear, currentMonth, filter]);
```

## ダミーデータ

`shared/dummy-data/events/events.ts`：

- `dummyEvents`: 複数月にわたるイベントデータ
- `EventItem`型: イベントの型定義

## 技術的ポイント

1. **汎用Widget**: `CalendarViewWidget`はジェネリクスで再利用可能
2. **ビュー切り替え**: 状態で条件分岐、データはそのまま共有
3. **モーダル連携**: イベント詳細 → メンバー詳細への遷移
4. **月ナビゲーション**: `currentYear`/`currentMonth`の状態管理
5. **日付処理**: ISO形式（YYYY-MM-DD）で統一
