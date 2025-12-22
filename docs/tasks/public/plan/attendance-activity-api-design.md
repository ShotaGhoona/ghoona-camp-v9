# Attendance Activity API 設計

## 概要

参加履歴ページ（Activity）で使用するAPI設計。統計カードとカレンダー表示を実現する。

**ドメイン分離**: Attendance（参加記録）とEvent（イベント）を分離し、フロントエンドで組み合わせる。

## データ責務分離

| データ | ドメイン | 用途 |
|--------|----------|------|
| 参加統計 | **Attendance** | 統計カード表示 |
| 参加サマリー（日単位） | **Attendance** | カレンダーのマーカー表示 |
| 自分のイベント | **Event** | カレンダーのイベントカード表示 |

## DBテーブル（既存）

### attendance_statistics

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PRIMARY KEY | ID |
| user_id | UUID | UNIQUE, NOT NULL | ユーザーID |
| total_attendance_days | INTEGER | DEFAULT 0 | 総参加日数 |
| current_streak_days | INTEGER | DEFAULT 0 | 現在の連続日数 |
| max_streak_days | INTEGER | DEFAULT 0 | 最大連続日数 |
| last_attendance_date | DATE | | 最終参加日 |
| first_attendance_date | DATE | | 初回参加日 |
| total_duration_minutes | INTEGER | DEFAULT 0 | 累計参加時間（分） |
| created_at | TIMESTAMP WITH TIME ZONE | | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | | 更新日時 |

### attendance_summaries

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PRIMARY KEY | ID |
| user_id | UUID | NOT NULL | ユーザーID |
| date | DATE | NOT NULL | 参加日 |
| total_duration_minutes | INTEGER | DEFAULT 0 | 参加時間（分） |
| session_count | INTEGER | DEFAULT 0 | セッション数 |
| first_join_time | TIME | | 最初の参加時刻 |
| last_leave_time | TIME | | 最後の退出時刻 |
| is_morning_active | BOOLEAN | DEFAULT FALSE | 朝活時間帯(6-7時)の参加有無 |
| created_at | TIMESTAMP WITH TIME ZONE | | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | | 更新日時 |

## APIエンドポイント

### Attendanceドメイン（新規）

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users/{userId}/attendance/statistics` | 参加統計を取得 | 👤 本人のみ |
| GET | `/users/{userId}/attendance/summaries` | 日単位の参加サマリーを取得 | 👤 本人のみ |

### Eventドメイン（新規追加）

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/events/me` | 自分が参加登録 or 主催のイベントを取得 | 🔐 認証済み |

---

## API詳細

### GET /users/{userId}/attendance/statistics

参加統計を取得。統計カードのメインAPI。

**アクセス権**: 👤 本人のみ（`userId` がログインユーザーと一致）

**パスパラメータ**:

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `userId` | UUID | ユーザーID |

**Response**:
```json
{
  "data": {
    "totalAttendanceDays": 47,
    "currentStreakDays": 12,
    "maxStreakDays": 21,
    "thisMonthDays": 14,
    "thisWeekDays": 5
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**フィールド説明**:

| フィールド | 説明 | 計算方法 |
|-----------|------|----------|
| `totalAttendanceDays` | 総参加日数 | DBから取得 |
| `currentStreakDays` | 現在の連続日数 | DBから取得 |
| `maxStreakDays` | 最大連続日数 | DBから取得 |
| `thisMonthDays` | 今月の参加日数 | **動的計算**: attendance_summariesから当月分をCOUNT |
| `thisWeekDays` | 今週の参加日数 | **動的計算**: attendance_summariesから今週分をCOUNT |

**エラーレスポンス**:
- `401`: 未認証
- `403`: 他人のデータにアクセス

---

### GET /users/{userId}/attendance/summaries

日単位の参加サマリーを取得。カレンダーのマーカー表示用。

**アクセス権**: 👤 本人のみ

**パスパラメータ**:

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `userId` | UUID | ユーザーID |

**クエリパラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `date_from` | string | - | 開始日（YYYY-MM-DD）デフォルト: 当月1日 |
| `date_to` | string | - | 終了日（YYYY-MM-DD）デフォルト: 当月末日 |

**例**: `GET /users/123/attendance/summaries?date_from=2025-01-01&date_to=2025-01-31`

**Response**:
```json
{
  "data": {
    "summaries": [
      {
        "date": "2025-01-06",
        "isMorningActive": true
      },
      {
        "date": "2025-01-07",
        "isMorningActive": true
      },
      {
        "date": "2025-01-08",
        "isMorningActive": true
      }
    ],
    "period": {
      "dateFrom": "2025-01-01",
      "dateTo": "2025-01-31"
    },
    "total": 14
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス**:
- `400`: date_from > date_to（期間が不正）
- `401`: 未認証
- `403`: 他人のデータにアクセス

---

### GET /events/me

自分が参加登録 or 主催しているイベントを取得。カレンダーのイベントカード表示用。

**アクセス権**: 🔐 認証済み

**クエリパラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | ○ | 対象年 |
| `month` | int | ○ | 対象月（1-12） |

**例**: `GET /events/me?year=2025&month=1`

**Response**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "朝の瞑想会",
      "eventType": "meditation",
      "scheduledDate": "2025-01-06",
      "startTime": "06:00",
      "endTime": "06:30",
      "role": "participant",
      "maxParticipants": 10,
      "participantCount": 5
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "もくもく会",
      "eventType": "study",
      "scheduledDate": "2025-01-08",
      "startTime": "06:00",
      "endTime": "07:00",
      "role": "organizer",
      "maxParticipants": null,
      "participantCount": 8
    }
  ],
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**フィールド説明**:

| フィールド | 説明 |
|-----------|------|
| `role` | `"participant"` = 参加者, `"organizer"` = 主催者 |

**エラーレスポンス**:
- `400`: year, month が不正
- `401`: 未認証

---

## 実装詳細

### Domain層

**Attendanceドメイン追加:**

データクラス（`attendance_repository.py`に追加）:
- `AttendanceStatisticsResult` - 統計結果
- `AttendanceSummaryItem` - サマリーアイテム
- `AttendanceSummariesResult` - サマリー結果
- `DateRange` - 日付範囲

リポジトリインターフェース（`IAttendanceRepository`を新規作成）:
- `get_statistics()` - 統計取得
- `get_summaries()` - サマリー取得

ドメイン例外（`attendance.py`に追加）:
- `AttendanceStatisticsNotFoundError` - 統計が存在しない
- `InvalidDateRangeError` - 日付範囲が不正
- `NotOwnAttendanceError` - 他人の参加データにアクセス

**Eventドメイン追加:**

リポジトリインターフェース（`event_repository.py`に追加）:
- `find_my_events()` - 自分のイベント取得

### Infrastructure層

**統計取得クエリ**:
```sql
-- 基本統計
SELECT
  total_attendance_days,
  current_streak_days,
  max_streak_days
FROM attendance_statistics
WHERE user_id = :user_id

-- 今月の参加日数（動的計算）
SELECT COUNT(*)
FROM attendance_summaries
WHERE user_id = :user_id
  AND date >= :month_start
  AND date <= :month_end
  AND is_morning_active = true

-- 今週の参加日数（動的計算）
SELECT COUNT(*)
FROM attendance_summaries
WHERE user_id = :user_id
  AND date >= :week_start
  AND date <= :week_end
  AND is_morning_active = true
```

**サマリー取得クエリ**:
```sql
SELECT date, is_morning_active
FROM attendance_summaries
WHERE user_id = :user_id
  AND date >= :date_from
  AND date <= :date_to
  AND is_morning_active = true
ORDER BY date ASC
```

**自分のイベント取得クエリ**:
```sql
SELECT
  e.id,
  e.title,
  e.event_type,
  e.scheduled_date,
  e.start_time,
  e.end_time,
  e.max_participants,
  CASE
    WHEN e.creator_id = :user_id THEN 'organizer'
    ELSE 'participant'
  END AS role,
  (
    SELECT COUNT(*) FROM event_participants ep
    WHERE ep.event_id = e.id AND ep.status = 'registered'
  ) AS participant_count
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id AND ep.user_id = :user_id
WHERE e.is_active = true
  AND EXTRACT(YEAR FROM e.scheduled_date) = :year
  AND EXTRACT(MONTH FROM e.scheduled_date) = :month
  AND (
    e.creator_id = :user_id
    OR (ep.status = 'registered')
  )
ORDER BY e.scheduled_date ASC, e.start_time ASC
```

### Application層

**Attendanceドメイン:**

DTO（`attendance_schemas.py`に追加）:
- `AttendanceStatisticsDTO` - 統計DTO
- `AttendanceSummaryItemDTO` - サマリーアイテムDTO
- `AttendanceSummariesDTO` - サマリー結果DTO

Usecaseメソッド（`AttendanceUsecase`を新規作成）:
- `get_statistics()` - 統計取得
- `get_summaries()` - サマリー取得

**Eventドメイン:**

DTO（`event_schemas.py`に追加）:
- `MyEventItemDTO` - 自分のイベントDTO

Usecaseメソッド（`event_usecase.py`に追加）:
- `get_my_events()` - 自分のイベント取得

### Presentation層

**Attendanceドメイン:**

スキーマ（`attendance_schemas.py`に追加）:
- `AttendanceStatisticsResponse` - 統計レスポンス
- `AttendanceStatisticsAPIResponse` - 統計APIレスポンス
- `AttendanceSummaryItemResponse` - サマリーアイテムレスポンス
- `AttendanceSummariesDataResponse` - サマリーデータレスポンス
- `AttendanceSummariesAPIResponse` - サマリーAPIレスポンス

API（`attendance_api.py`に追加）:
- `GET /users/{userId}/attendance/statistics`
- `GET /users/{userId}/attendance/summaries`

**Eventドメイン:**

スキーマ（`event_schemas.py`に追加）:
- `MyEventItemResponse` - 自分のイベントアイテムレスポンス
- `MyEventsAPIResponse` - 自分のイベントAPIレスポンス

API（`event_api.py`に追加）:
- `GET /events/me`

### DI層

- `get_attendance_usecase()` - AttendanceUsecaseの依存性注入（新規）

---

## 変更ファイル（予定）

### バックエンド

```
backend/app/
├── domain/
│   ├── repositories/
│   │   ├── attendance_repository.py       # データクラス追加
│   │   └── event_repository.py            # find_my_events追加
│   └── exceptions/
│       └── attendance.py                  # 例外追加
├── infrastructure/
│   └── db/
│       └── repositories/
│           ├── attendance_repository_impl.py  # IAttendanceRepository実装追加
│           └── event_repository_impl.py       # find_my_events実装追加
├── application/
│   ├── schemas/
│   │   ├── attendance_schemas.py          # DTO追加
│   │   └── event_schemas.py               # MyEventItemDTO追加
│   └── use_cases/
│       ├── attendance_usecase.py          # AttendanceUsecase追加
│       └── event_usecase.py               # get_my_events追加
├── presentation/
│   ├── api/
│   │   ├── attendance_api.py              # 新エンドポイント追加
│   │   └── event_api.py                   # /events/me追加
│   └── schemas/
│       ├── attendance_schemas.py          # レスポンススキーマ追加
│       └── event_schemas.py               # MyEventsレスポンス追加
└── di/
    └── attendance.py                      # get_attendance_usecase追加
```

---

## フロントエンド実装

### 必要なhooks

| hook | 用途 | React Query |
|------|------|-------------|
| `useAttendanceStatistics` | 参加統計取得 | useQuery（5分キャッシュ） |
| `useAttendanceSummaries` | 参加サマリー取得 | useQuery（5分キャッシュ） |
| `useMyEvents` | 自分のイベント取得 | useQuery（5分キャッシュ） |

### 型定義

```typescript
// entities/domain/attendance/model/types.ts に追加

/** 参加統計 */
export type AttendanceStatistics = {
  totalAttendanceDays: number;
  currentStreakDays: number;
  maxStreakDays: number;
  thisMonthDays: number;
  thisWeekDays: number;
};

/** 参加統計レスポンス */
export type AttendanceStatisticsResponse = {
  data: AttendanceStatistics;
  message: string;
  timestamp: string;
};

/** 参加サマリーアイテム */
export type AttendanceSummaryItem = {
  date: string;
  isMorningActive: boolean;
};

/** 参加サマリー期間 */
export type AttendanceSummaryPeriod = {
  dateFrom: string;
  dateTo: string;
};

/** 参加サマリーデータ */
export type AttendanceSummariesData = {
  summaries: AttendanceSummaryItem[];
  period: AttendanceSummaryPeriod;
  total: number;
};

/** 参加サマリーレスポンス */
export type AttendanceSummariesResponse = {
  data: AttendanceSummariesData;
  message: string;
  timestamp: string;
};

/** 参加サマリークエリパラメータ */
export type AttendanceSummariesParams = {
  dateFrom?: string;
  dateTo?: string;
};
```

```typescript
// entities/domain/event/model/types.ts に追加

/** イベントでの役割 */
export type EventRole = 'participant' | 'organizer';

/** 自分のイベントアイテム */
export type MyEventItem = {
  id: string;
  title: string;
  eventType: EventType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  role: EventRole;
  maxParticipants: number | null;
  participantCount: number;
};

/** 自分のイベントレスポンス */
export type MyEventsResponse = {
  data: MyEventItem[];
  message: string;
  timestamp: string;
};

/** 自分のイベントクエリパラメータ */
export type MyEventsParams = {
  year: number;
  month: number;
};
```

### APIクライアント

```typescript
// entities/domain/attendance/api/attendance-api.ts に追加

/** 参加統計を取得 */
getStatistics: async (userId: string): Promise<AttendanceStatisticsResponse> => {
  const response = await apiClient.get(`/users/${userId}/attendance/statistics`);
  return response.data;
},

/** 参加サマリーを取得 */
getSummaries: async (
  userId: string,
  params?: AttendanceSummariesParams
): Promise<AttendanceSummariesResponse> => {
  const response = await apiClient.get(`/users/${userId}/attendance/summaries`, {
    params: {
      date_from: params?.dateFrom,
      date_to: params?.dateTo,
    },
  });
  return response.data;
},
```

```typescript
// entities/domain/event/api/event-api.ts に追加

/** 自分のイベントを取得 */
getMyEvents: async (params: MyEventsParams): Promise<MyEventsResponse> => {
  const response = await apiClient.get('/events/me', { params });
  return response.data;
},
```

---

## UI連携ポイント

### ActivityHomeContainer

**データ取得**:
1. `useAttendanceStatistics(userId)` → 統計カード表示
2. `useAttendanceSummaries(userId, { dateFrom, dateTo })` → カレンダーマーカー
3. `useMyEvents({ year, month })` → イベントカード表示

**カレンダー表示**:
- `summaries` から参加した日にマーカー表示
- `myEvents` からイベントカードを表示
- イベントクリックで詳細モーダルを開く

### StatsCardsSection

**変更点**:
- `AttendanceStatistics` 型をAPIの型に変更
- ダミーデータ → `useAttendanceStatistics` フック

### ActivityCalendarView

**変更点**:
- `dummyEvents` → `useMyEvents` フック
- 参加した日のマーカー表示を追加（`summaries`を使用）

---

## 12-api.md との差分

| 現行（12-api.md） | 提案 | 理由 |
|------------------|------|------|
| summariesに詳細情報（duration等） | dateとisMorningActiveのみ | UIで必要な情報のみに絞る |
| statisticsに全フィールド | 必要な5フィールドのみ | UIで必要な情報のみに絞る |
| - | `GET /events/me` 追加 | 自分のイベント取得用 |
