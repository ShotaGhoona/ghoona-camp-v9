# イベントページ 実装レポート

## 概要

イベント一覧をギャラリー/カレンダーの2つのビューで表示し、フィルター機能とイベント詳細・作成・編集モーダルを備えたページ。

## 関連コミット

| コミット | メッセージ |
|----------|------------|
| `3f7e9c6` | feat: event page |
| - | feat: event create/edit modals |

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
    ├── filter-sidebar/
    │   ├── model/
    │   │   └── types.ts
    │   └── ui/
    │       ├── EventsFilterSidebar.tsx
    │       └── FilterToggleButton.tsx
    ├── event-detail-modal/
    │   ├── lib/
    │   │   └── use-view-mode.ts
    │   └── ui/
    │       ├── EventDetailModalSheet.tsx
    │       └── EventDetailContent.tsx
    ├── create-event/
    │   └── ui/
    │       ├── CreateEventModalSheet.tsx
    │       └── CreateEventContent.tsx
    └── edit-event/
        └── ui/
            ├── EditEventModalSheet.tsx
            └── EditEventContent.tsx

frontend/src/widgets/view/calendar-view/
└── ui/
    └── CalendarViewWidget.tsx  # 汎用カレンダーWidget

frontend/src/shared/ui/form-fields/ui/
└── TimeField.tsx  # 時間入力フィールド（新規追加）
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
| イベントタイプ | 勉強、運動、瞑想、読書、その他 |
| 参加状態 | 参加済み/未参加 |

### 6. イベントカード（EventCard）

表示情報：
- イベントタイプ（カラーバッジ）
- タイトル
- 開催日時
- 参加者アバター（最大3名 + 残り人数）
- 自分の参加状態

### 7. イベント詳細モーダル（EventDetailModalSheet）

モーダル/シート切り替え可能：

- イベントタイプバッジ
- 主催者アバター
- タイトル、主催者名
- 日時情報（開催日、開始時間）
- 定期開催情報（毎週/毎日/毎月）
- 説明文
- 参加者一覧（クリックでメンバー詳細へ）

**主催者の場合：**
- 「編集する」ボタン → 編集モーダルを開く
- 「削除」ボタン → 確認後削除（未実装、alert表示）

**参加者の場合：**
- 「参加する」/「参加をキャンセル」ボタン（未実装、alert表示）

### 8. イベント作成モーダル（CreateEventModalSheet）

新規作成フォーム：

| フィールド | 必須 | 説明 |
|------------|------|------|
| イベント名 | ○ | タイトル |
| カテゴリ | ○ | イベントタイプ選択 |
| 詳細説明 | - | 説明文 |
| 開催日 | ○ | 日付選択 |
| 開始時間 | ○ | 時間選択 |
| 終了時間 | ○ | 時間選択 |
| 定員 | - | 0で無制限 |
| 定期開催 | - | ON/OFFスイッチ |
| 繰り返しパターン | - | 毎日/毎週/毎月 |

### 9. イベント編集モーダル（EditEventModalSheet）

- 作成モーダルと同じフォーム構造
- 既存イベントのデータを初期値として読み込み
- 主催者アバター表示

## モーダル連携フロー

```
EventsHomeContainer
├── イベントカードクリック → EventDetailModalSheet
│   ├── 主催者の場合 → 「編集する」クリック → EditEventModalSheet
│   └── 参加者クリック → MemberDetailModalSheet
└── 「新規作成」ボタン → CreateEventModalSheet
```

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

- `dummyEvents`: 2025年1月のイベントデータ（12件）
- `EventItem`型: イベントの型定義
- `EventType`: 'study' | 'exercise' | 'meditation' | 'reading' | 'general'
- `EVENT_TYPE_LABELS`: タイプのラベル定義

## 技術的ポイント

1. **モーダル構造**: ModalSheet + Content の2コンポーネント分離パターン
2. **ビューモード**: `useViewMode`フックでモーダル/シート切り替え
3. **汎用Widget**: `CalendarViewWidget`はジェネリクスで再利用可能
4. **ビュー切り替え**: 状態で条件分岐、データはそのまま共有
5. **モーダル連携**: 詳細 → 編集、詳細 → メンバー詳細への遷移
6. **月ナビゲーション**: `currentYear`/`currentMonth`の状態管理
7. **日付処理**: ISO形式（YYYY-MM-DD）で統一
8. **主催者判定**: `isOwner`フラグでボタン表示を切り替え
9. **TimeField**: 時間入力用の共通フォームフィールドを追加
