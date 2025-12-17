# 参加履歴ページ 実装レポート

## 概要

ユーザーの朝活参加履歴を統計カードとカレンダー形式で表示するページ。

## 関連コミット

| コミット | メッセージ |
|----------|------------|
| `3d97289` | feat: event page（※実際は参加履歴ページ） |

## ディレクトリ構成

```
frontend/src/page-components/activity/home/
├── ui/
│   └── ActivityHomeContainer.tsx    # メインコンテナ
└── ui-block/
    ├── stats-cards/
    │   └── ui/
    │       └── StatsCardsSection.tsx    # 統計カード群
    └── calendar-view/
        └── ui/
            ├── ActivityCalendarView.tsx     # カレンダービュー
            └── components/
                └── ActivityEventCard.tsx    # イベントカード

frontend/src/shared/dummy-data/activity/activity.ts  # ダミーデータ
```

## 実装内容

### 1. ページレイアウト

```
┌──────────────────┬─────────────────────────────────┐
│ 左側: 統計カード │ 右側: カレンダービュー           │
│ ┌──────────────┐ │ ┌─────────────────────────────┐ │
│ │総参加日数     │ │ │[凡例]       [<] 2025年1月 [>]│ │
│ │47日          │ │ ├─────────────────────────────┤ │
│ │47時間        │ │ │日  月  火  水  木  金  土    │ │
│ └──────────────┘ │ │    1   2   3   4   5   6    │ │
│ ┌──────────────┐ │ │[*][*]         [*][*]        │ │
│ │連続参加       │ │ │7   8   9  10  11  12  13   │ │
│ │12日 継続中    │ │ │[*][*][*]             [*]   │ │
│ └──────────────┘ │ │...                          │ │
│ ┌──────────────┐ │ └─────────────────────────────┘ │
│ │最大連続       │ │                               │
│ │21日 自己ベスト│ │                               │
│ └──────────────┘ │                               │
│ ┌──────────────┐ │                               │
│ │今月の参加     │ │                               │
│ │14日 今週5日   │ │                               │
│ └──────────────┘ │                               │
└──────────────────┴─────────────────────────────────┘
```

### 2. StatsCardsSection（統計カード群）

4つの統計カードを縦に表示：

| カード | アイコン | 表示内容 |
|--------|----------|----------|
| 総参加日数 | Calendar | XX日 / 累計時間 |
| 連続参加 | Flame | XX日 / 継続中 |
| 最大連続 | Trophy | XX日 / 自己ベスト |
| 今月の参加 | CalendarDays | XX日 / 今週Y日 |

デザイン:
- `shadow-raised`でカード外枠
- `shadow-inset-sm`で値表示部分を凹み表現
- アイコンは`bg-muted`背景 + `shadow-raised-sm`

### 3. ActivityCalendarView（カレンダービュー）

`CalendarViewWidget`（汎用Widget）を使用：

- 月ナビゲーション（前月/次月）
- 参加日の凡例表示
- 自分が参加したイベントのみをカレンダーに表示
- イベントクリックで詳細モーダルを開く

### 4. ActivityEventCard（イベントカード）

参加したイベントをカレンダー上に表示：

- イベントタイプ（バッジカラー）
- イベントタイトル
- クリックでイベント詳細モーダルへ

## データ構造

### AttendanceStatistics（参加統計）

```typescript
interface AttendanceStatistics {
  userId: string;
  totalAttendanceDays: number;    // 総参加日数
  currentStreakDays: number;       // 現在の連続日数
  maxStreakDays: number;           // 最大連続日数
  lastAttendanceDate: string | null;
  firstAttendanceDate: string | null;
  totalDurationMinutes: number;    // 累計参加時間（分）
  thisMonthDays: number;           // 今月の参加日数
  thisWeekDays: number;            // 今週の参加日数
}
```

### AttendanceSummary（日単位の参加サマリー）

```typescript
interface AttendanceSummary {
  id: string;
  userId: string;
  date: string;                    // YYYY-MM-DD
  totalDurationMinutes: number;
  sessionCount: number;
  firstJoinTime: string | null;    // HH:mm
  lastLeaveTime: string | null;    // HH:mm
  isMorningActive: boolean;        // 朝活時間帯(6-7時)の参加有無
}
```

## ダミーデータ

`shared/dummy-data/activity/activity.ts`：

- `dummyUserStatistics`: ログインユーザーの統計情報
- `dummyAttendanceSummaries`: 複数月分の参加履歴（33件）
- `formatDuration()`: 分を「X時間Y分」形式にフォーマット

## フィルタリングロジック

```typescript
// 自分が参加したイベントをフィルタリング
const participatedEvents = useMemo(() => {
  return dummyEvents.filter((event) => {
    // 月フィルター
    // 自分が参加しているかチェック（status: 'registered'）
    return isParticipating;
  });
}, [currentYear, currentMonth]);
```

## 技術的ポイント

1. **Widget再利用**: `CalendarViewWidget`をイベントページと共有
2. **モーダル連携**: `EventDetailModalSheet`をイベントページと共有
3. **統計表示**: ネオモルフィズムスタイル（raised/inset）で立体感
4. **データ分離**: 統計情報と参加履歴を別々の型で管理
