# Event Domain フロントエンド実装レポート

## 概要

イベントドメインのフロントエンド実装。イベントページ・参加履歴ページのAPI接続をFSD構成で実装。

**イベントページ機能:**
- 一覧・詳細・作成・更新・削除
- イベント参加・キャンセル

**参加履歴ページ機能:**
- 自分が参加/主催のイベント取得（カレンダー表示用）

## 変更ファイル

```
frontend/src/
├── shared/domain/event/
│   ├── model/types.ts                    # 基本型定義（EventType, RecurrencePattern）
│   └── data/event-master.ts              # マスターデータ（ラベル、色、定数）
├── entities/domain/event/
│   ├── model/types.ts                    # API型定義（+ MyEventItem等）
│   └── api/event-api.ts                  # APIクライアント（+ getMyEvents）
├── features/domain/event/
│   ├── get-events/lib/use-events.ts              # 一覧取得hook
│   ├── get-my-events/lib/use-my-events.ts        # 自分のイベント取得hook
│   ├── get-event-detail/lib/use-event-detail.ts  # 詳細取得hook
│   ├── create-event/lib/use-create-event.ts      # 作成hook
│   ├── update-event/lib/use-update-event.ts      # 更新hook
│   ├── delete-event/lib/use-delete-event.ts      # 削除hook
│   ├── join-event/lib/use-join-event.ts          # 参加hook
│   └── leave-event/lib/use-leave-event.ts        # キャンセルhook
├── page-components/events/home/
│   ├── ui/EventsHomeContainer.tsx                # API接続（useEvents）
│   └── ui-block/
│       ├── calendar-view/ui/
│       │   ├── EventsCalendarView.tsx            # カレンダー表示
│       │   └── components/CalendarCard.tsx       # 日付カード
│       ├── gallery-view/ui/
│       │   ├── EventsGalleryView.tsx             # ギャラリー表示
│       │   └── components/EventCard.tsx          # イベントカード
│       ├── filter-sidebar/
│       │   ├── model/types.ts                    # フィルター型
│       │   └── ui/EventsFilterSidebar.tsx        # フィルターサイドバー
│       ├── create-event/ui/CreateEventContent.tsx       # 作成フォーム
│       ├── edit-event/ui/
│       │   ├── EditEventModalSheet.tsx           # 編集モーダル
│       │   └── EditEventContent.tsx              # 編集フォーム
│       └── event-detail-modal/ui/
│           ├── EventDetailModalSheet.tsx         # 詳細モーダル
│           └── EventDetailContent.tsx            # 詳細表示・参加・削除
└── page-components/activity/home/
    ├── ui/ActivityHomeContainer.tsx              # API接続（useMyEvents）
    └── ui-block/calendar-view/ui/
        ├── ActivityCalendarView.tsx              # カレンダー表示（MyEventItem型）
        └── components/ActivityEventCard.tsx      # イベントカード（MyEventItem型）
```

## Shared Domain層

### 基本型定義（model/types.ts）

```typescript
/** イベントタイプ */
type EventType = 'study' | 'exercise' | 'meditation' | 'reading' | 'general';

/** 繰り返しパターン */
type RecurrencePattern = 'daily' | 'weekly' | 'monthly';
```

### マスターデータ（data/event-master.ts）

```typescript
/** イベントタイプのラベル */
const EVENT_TYPE_LABELS: Record<EventType, string> = {
  study: '勉強',
  exercise: '運動',
  meditation: '瞑想',
  reading: '読書',
  general: 'その他',
};

/** 全イベントタイプ */
const ALL_EVENT_TYPES: EventType[];

/** イベントタイプに対応する色 */
const EVENT_TYPE_COLORS: Record<EventType, string>;

/** 繰り返しパターンのラベル */
const RECURRENCE_PATTERN_LABELS: Record<RecurrencePattern, string>;
```

## Entity層

### 型定義（types.ts）

**イベント主催者:**
```typescript
type EventCreator = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};
```

**イベント参加者:**
```typescript
type EventParticipant = {
  id: string;
  userId: string;
  userName: string | null;
  avatarUrl: string | null;
  status: 'registered' | 'cancelled';
};
```

**イベント一覧アイテム:**
```typescript
type EventListItem = {
  id: string;
  title: string;
  eventType: EventType;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  maxParticipants: number | null;
  participantCount: number;
  isParticipating: boolean;
  isRecurring: boolean;
  creator: EventCreator;
};
```

**イベント詳細:**
```typescript
type EventDetail = EventListItem & {
  description: string | null;
  recurrencePattern: RecurrencePattern | null;
  participants: EventParticipant[];
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};
```

**APIレスポンス:**
```typescript
type EventListResponse = {
  data: { events: EventListItem[] };
  message: string;
  timestamp: string;
};

type EventDetailResponse = {
  data: { event: EventDetail };
  message: string;
  timestamp: string;
};
```

**自分のイベント（/events/me）:**
```typescript
type EventRole = 'participant' | 'organizer';

type MyEventItem = {
  id: string;
  title: string;
  eventType: EventType;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  role: EventRole;
  maxParticipants: number | null;
  participantCount: number;
};

type MyEventsResponse = {
  data: { events: MyEventItem[] };
  message: string;
  timestamp: string;
};

type MyEventsParams = {
  year: number;
  month: number;
};
```

### APIクライアント（event-api.ts）

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| `getEvents` | GET /api/v1/events | イベント一覧取得（月ベース） |
| `getMyEvents` | GET /api/v1/events/me | 自分のイベント取得 |
| `getEventById` | GET /api/v1/events/{id} | イベント詳細取得 |
| `createEvent` | POST /api/v1/events | イベント作成 |
| `updateEvent` | PUT /api/v1/events/{id} | イベント更新 |
| `deleteEvent` | DELETE /api/v1/events/{id} | イベント削除 |
| `joinEvent` | POST /api/v1/events/{id}/participants | イベント参加 |
| `leaveEvent` | DELETE /api/v1/events/{id}/participants | 参加キャンセル |

## Feature層

### hooks一覧

| hook | 用途 | React Query | キャッシュ無効化 |
|------|------|-------------|-----------------|
| `useEvents` | 一覧取得 | useQuery | - |
| `useMyEvents` | 自分のイベント取得 | useQuery | - |
| `useEventDetail` | 詳細取得 | useQuery | - |
| `useCreateEvent` | 作成 | useMutation | `['events']` |
| `useUpdateEvent` | 更新 | useMutation | `['events']`, `['event', id]` |
| `useDeleteEvent` | 削除 | useMutation | `['events']`, `['event', id]` |
| `useJoinEvent` | 参加 | useMutation | `['events']`, `['event', id]` |
| `useLeaveEvent` | キャンセル | useMutation | `['events']`, `['event', id]` |

### hook実装パターン

**useQuery（取得系）:**
```typescript
export function useEvents(filter: EventsFilter, enabled = true) {
  return useQuery({
    queryKey: ['events', filter],
    queryFn: () => eventApi.getEvents({
      year: filter.year,
      month: filter.month,
      event_type: filter.eventTypes?.join(','),
      participated: filter.participated,
    }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
```

**useMutation（更新系）:**
```typescript
export function useJoinEvent(options?: UseJoinEventOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventApi.joinEvent(eventId),
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      options?.onError?.(error);
    },
  });
}
```

## コンポーネント設計

### 責務分離（ModalSheet / Content）

**ModalSheet（UIラッパー）:**
- Modal/Sheetの表示制御
- ViewMode切り替え
- `eventId`のみをContentに渡す

**Content（ロジック）:**
- `useEventDetail`で詳細取得
- `useJoinEvent`/`useLeaveEvent`/`useDeleteEvent`で操作
- ローディング状態管理

```
EventDetailModalSheet
  └─ EventDetailContent（useEventDetail, useJoinEvent, useLeaveEvent, useDeleteEvent）

EditEventModalSheet
  └─ EditEventContent（useEventDetail, useUpdateEvent）
```

### EventsHomeContainer

- `useEvents()`でイベント一覧を取得
- 月送りで`year`, `month`を更新
- フィルター状態を管理（eventTypes, participated）
- 表示モード切り替え（カレンダー/ギャラリー）

### EventDetailContent

- `useEventDetail(eventId)`で詳細取得
- 参加ボタン: `isParticipating`で表示切り替え
- 編集/削除ボタン: `isOwner`で表示切り替え
- 参加者一覧をアバターで表示

### ActivityHomeContainer

- `useMyEvents({ year, month })`で自分のイベントを取得
- `useAttendanceStatistics(userId)`で参加統計を取得（Attendanceドメイン）
- 月送りで`year`, `month`を更新
- カレンダーに自分の参加/主催イベントを表示

### ActivityCalendarView / ActivityEventCard

- `MyEventItem`型を使用（`EventListItem`とは異なる）
- `role`フィールドで参加者/主催者を識別
- イベントカードにはタイプラベルと時間を表示

## イベントタイプ

| eventType | ラベル | 色 |
|-----------|-------|-----|
| `study` | 勉強 | bg-blue-100 text-blue-700 |
| `exercise` | 運動 | bg-green-100 text-green-700 |
| `meditation` | 瞑想 | bg-purple-100 text-purple-700 |
| `reading` | 読書 | bg-amber-100 text-amber-700 |
| `general` | その他 | bg-gray-100 text-gray-700 |

## ダミーデータからの移行

### イベントページ

| 変更前 | 変更後 |
|--------|--------|
| `@/shared/types/event/event` (定数) | `@/shared/domain/event/data/event-master` |
| `@/shared/dummy-data/events/events` (型) | `@/entities/domain/event/model/types` |
| `dummyEvents` | `useEvents()` |
| ハードコードされたイベント | API取得 |

### 参加履歴ページ（Activity）

| 変更前 | 変更後 |
|--------|--------|
| `@/shared/dummy-data/events/events` (型) | `@/entities/domain/event/model/types` (MyEventItem) |
| `dummyEvents` + フィルタリング | `useMyEvents({ year, month })` |
| `CURRENT_USER_ID` | `useAppSelector((state) => state.auth)` |
| `EVENT_TYPE_LABELS` (ダミー) | `@/shared/domain/event/data/event-master` |

## 備考

### イベントページ

- カレンダービュー: 月ベースでイベントを取得し、日付ごとにグループ化して表示
- ギャラリービュー: 月のイベントをカード形式で一覧表示
- フィルター: イベントタイプ（複数選択可）、参加状態でフィルタリング可能
- 参加状態: `isParticipating`フラグで参加ボタンの表示を切り替え
- 権限管理: `isOwner`フラグで編集/削除ボタンの表示を切り替え

### 参加履歴ページ（Activity）

- カレンダービュー: 自分が参加/主催のイベントのみ表示
- `role`フィールド: `participant`（参加者）または`organizer`（主催者）
- イベントカードクリックで詳細モーダルを表示（イベントページと共通）
