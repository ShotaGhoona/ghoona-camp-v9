# Event API 設計

## 概要

イベント機能のAPI設計。朝活イベントの作成・参加管理を行う。

**月ベース取得**: UIがカレンダー/ギャラリーで月単位表示するため、ページネーションではなく月指定で全件取得する。

## データ責務分離

| データ | 保持場所 | 理由 |
|--------|----------|------|
| イベントマスター | **バックエンド** (`events`) | 動的データ、認証が必要 |
| 参加者情報 | **バックエンド** (`event_participants`) | 動的データ、認証が必要 |
| イベントタイプラベル | **フロントエンド** (`EVENT_TYPE_LABELS`) | 静的データ、変更頻度低い |
| ユーザー情報 | **バックエンド** (`users`, `user_metadata`) | 認証情報 |

## DBテーブル

### events

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PRIMARY KEY | イベントID |
| title | VARCHAR(100) | NOT NULL | イベント名 |
| description | TEXT | | 説明文 |
| event_type | VARCHAR(20) | NOT NULL | イベントタイプ |
| scheduled_date | DATE | NOT NULL | 開催日 |
| start_time | TIME | NOT NULL | 開始時間 |
| end_time | TIME | NOT NULL | 終了時間 |
| max_participants | INTEGER | | 定員（NULLで無制限） |
| is_recurring | BOOLEAN | DEFAULT FALSE | 定期開催フラグ |
| recurrence_pattern | VARCHAR(20) | | 繰り返しパターン |
| creator_id | UUID | REFERENCES users(id) | 主催者ID |
| is_active | BOOLEAN | DEFAULT TRUE | 有効フラグ |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新日時 |

**event_type の値:**
- `study` - 勉強
- `exercise` - 運動
- `meditation` - 瞑想
- `reading` - 読書
- `general` - その他

**recurrence_pattern の値:**
- `daily` - 毎日
- `weekly` - 毎週
- `monthly` - 毎月

### event_participants

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PRIMARY KEY | 参加レコードID |
| event_id | UUID | REFERENCES events(id) | イベントID |
| user_id | UUID | REFERENCES users(id) | ユーザーID |
| status | VARCHAR(20) | NOT NULL DEFAULT 'registered' | 参加ステータス |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 申込日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新日時 |

**制約:**
- UNIQUE(event_id, user_id) - 同一イベントへの重複申込を防ぐ

**status の値:**
- `registered` - 参加登録済み
- `cancelled` - キャンセル済み

## APIエンドポイント

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/events` | イベント一覧を取得（月ベース） | 🔐 |
| POST | `/events` | イベントを作成 | 🔐 |
| GET | `/events/{eventId}` | イベント詳細を取得 | 🔐 |
| PUT | `/events/{eventId}` | イベントを更新 | 👑 主催者のみ |
| DELETE | `/events/{eventId}` | イベントを削除 | 👑 主催者のみ |
| POST | `/events/{eventId}/participants` | イベントに参加申込 | 🔐 |
| DELETE | `/events/{eventId}/participants` | 参加をキャンセル | 🔐 |

## API詳細

### GET /events

月ベースでイベント一覧を取得。カレンダー/ギャラリービューのメインAPI。

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | ○ | 対象年 |
| `month` | int | ○ | 対象月（1-12） |
| `event_type` | string | - | カンマ区切りでフィルタ（例: `study,exercise`） |
| `participated` | boolean | - | `true`=参加済みのみ, `false`=未参加のみ |

**例:** `GET /events?year=2025&month=1&event_type=study,exercise&participated=true`

**Response:**
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
      "maxParticipants": 10,
      "participantCount": 5,
      "isParticipating": true,
      "isRecurring": true,
      "creator": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "displayName": "山田太郎",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada"
      }
    }
  ],
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `400`: year, month が不正
- `401`: 未認証

### POST /events

新しいイベントを作成。

**Request Body:**
```json
{
  "title": "朝の瞑想会",
  "description": "心を落ち着かせて1日をスタート。初心者歓迎です。",
  "eventType": "meditation",
  "scheduledDate": "2025-01-06",
  "startTime": "06:00",
  "endTime": "06:30",
  "maxParticipants": 10,
  "isRecurring": true,
  "recurrencePattern": "weekly"
}
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "朝の瞑想会",
    "description": "心を落ち着かせて1日をスタート。初心者歓迎です。",
    "eventType": "meditation",
    "scheduledDate": "2025-01-06",
    "startTime": "06:00",
    "endTime": "06:30",
    "maxParticipants": 10,
    "participantCount": 0,
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "displayName": "山田太郎",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada"
    },
    "isOwner": true,
    "isParticipating": false,
    "createdAt": "2025-01-01T00:00:00+00:00"
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `400`: バリデーションエラー（title空、scheduledDate不正等）
- `401`: 未認証

### GET /events/{eventId}

イベント詳細を取得。参加者一覧を含む。

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "朝の瞑想会",
    "description": "心を落ち着かせて1日をスタート。初心者歓迎です。",
    "eventType": "meditation",
    "scheduledDate": "2025-01-06",
    "startTime": "06:00",
    "endTime": "06:30",
    "maxParticipants": 10,
    "participantCount": 5,
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "displayName": "山田太郎",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada"
    },
    "participants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "userId": "550e8400-e29b-41d4-a716-446655440011",
        "userName": "鈴木花子",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki",
        "status": "registered"
      }
    ],
    "isOwner": false,
    "isParticipating": true,
    "createdAt": "2025-01-01T00:00:00+00:00"
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `401`: 未認証
- `404`: イベントが存在しない

### PUT /events/{eventId}

イベントを更新。主催者のみ実行可能。

**Request Body:**
```json
{
  "title": "朝の瞑想会（初心者向け）",
  "description": "心を落ち着かせて1日をスタート。初心者大歓迎です！",
  "eventType": "meditation",
  "scheduledDate": "2025-01-06",
  "startTime": "06:00",
  "endTime": "06:45",
  "maxParticipants": 15,
  "isRecurring": true,
  "recurrencePattern": "weekly"
}
```

**Response:** `GET /events/{eventId}` と同じ形式

**エラーレスポンス:**
- `400`: バリデーションエラー
- `401`: 未認証
- `403`: 主催者ではない
- `404`: イベントが存在しない

### DELETE /events/{eventId}

イベントを削除。主催者のみ実行可能。

**Response:**
```json
{
  "data": null,
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `401`: 未認証
- `403`: 主催者ではない
- `404`: イベントが存在しない

### POST /events/{eventId}/participants

イベントに参加申込。定員チェックも実行。

**Response:**
```json
{
  "data": {
    "eventId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440011",
    "status": "registered",
    "createdAt": "2025-01-21T10:00:00+00:00"
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `400`: 既に参加済み
- `401`: 未認証
- `404`: イベントが存在しない
- `409`: 定員に達している

### DELETE /events/{eventId}/participants

参加をキャンセル。ログインユーザー自身の参加をキャンセル。

**Response:**
```json
{
  "data": null,
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `400`: 参加していない
- `401`: 未認証
- `404`: イベントが存在しない

## 実装詳細

### Domain層

**データクラス:**
- `Event` - イベントエンティティ
- `EventParticipant` - 参加者エンティティ
- `EventCreator` - 主催者情報（id, display_name, avatar_url）
- `EventFilter` - 検索条件（year, month, event_type, participated）
- `CreateEventInput` - 作成入力
- `UpdateEventInput` - 更新入力

**リポジトリインターフェース:**
- `find_by_month()` - 月ベースでイベント一覧取得
- `find_by_id()` - イベント詳細取得
- `create()` - イベント作成
- `update()` - イベント更新
- `delete()` - イベント削除
- `add_participant()` - 参加者追加
- `remove_participant()` - 参加者削除
- `get_participant_count()` - 参加者数取得
- `is_participating()` - 参加状態確認

**ドメイン例外:**
- `EventNotFoundError` - イベントが存在しない
- `EventFullError` - 定員に達している
- `AlreadyParticipatingError` - 既に参加済み
- `NotParticipatingError` - 参加していない
- `NotEventOwnerError` - 主催者ではない
- `InvalidEventTypeError` - イベントタイプが不正
- `InvalidMonthError` - 月が1-12の範囲外

### Infrastructure層

**イベント一覧クエリ:**
```sql
SELECT
  e.id,
  e.title,
  e.event_type,
  e.scheduled_date,
  e.start_time,
  e.end_time,
  e.max_participants,
  e.is_recurring,
  u.id AS creator_id,
  um.display_name AS creator_display_name,
  u.avatar_url AS creator_avatar_url,
  (
    SELECT COUNT(*) FROM event_participants ep
    WHERE ep.event_id = e.id AND ep.status = 'registered'
  ) AS participant_count,
  EXISTS (
    SELECT 1 FROM event_participants ep
    WHERE ep.event_id = e.id
      AND ep.user_id = :current_user_id
      AND ep.status = 'registered'
  ) AS is_participating
FROM events e
JOIN users u ON e.creator_id = u.id
LEFT JOIN user_metadata um ON u.id = um.user_id
WHERE e.is_active = true
  AND EXTRACT(YEAR FROM e.scheduled_date) = :year
  AND EXTRACT(MONTH FROM e.scheduled_date) = :month
ORDER BY e.scheduled_date ASC, e.start_time ASC
```

### Application層

**DTO:**
- `EventListItemDTO` - 一覧用DTO
- `EventDetailDTO` - 詳細用DTO
- `EventParticipantDTO` - 参加者DTO
- `CreateEventDTO` - 作成用DTO
- `UpdateEventDTO` - 更新用DTO

**Usecaseメソッド:**
- `get_events_by_month()` - 月ベースでイベント一覧取得
- `get_event_detail()` - イベント詳細取得
- `create_event()` - イベント作成
- `update_event()` - イベント更新
- `delete_event()` - イベント削除
- `join_event()` - イベント参加
- `leave_event()` - イベント参加キャンセル

### Presentation層

**スキーマ:**
- `EventListItemResponse` - 一覧アイテムレスポンス
- `EventListResponse` - 一覧レスポンス
- `EventDetailResponse` - 詳細レスポンス
- `CreateEventRequest` - 作成リクエスト
- `UpdateEventRequest` - 更新リクエスト
- `ParticipantResponse` - 参加者レスポンス

### DI層

- `get_event_usecase()` - EventUsecaseの依存性注入

## 変更ファイル（予定）

```
backend/app/
├── domain/
│   ├── entities/
│   │   └── event.py                          # イベントエンティティ
│   ├── repositories/
│   │   └── event_repository.py               # リポジトリI/F
│   └── exceptions/
│       └── event.py                          # イベント例外
├── infrastructure/
│   └── db/
│       └── repositories/
│           └── event_repository_impl.py      # リポジトリ実装
├── application/
│   ├── schemas/
│   │   └── event_schemas.py                  # DTO
│   └── use_cases/
│       └── event_usecase.py                  # ユースケース
├── presentation/
│   ├── api/
│   │   └── event_api.py                      # イベントAPI
│   └── schemas/
│       └── event_schemas.py                  # リクエスト/レスポンス
├── di/
│   └── event.py                              # 依存性注入
└── main.py                                   # ルーター登録
```

## フロントエンド実装

### 必要なhooks

| hook | 用途 | React Query |
|------|------|-------------|
| `useEvents` | イベント一覧取得（月ベース） | useQuery |
| `useEventDetail` | イベント詳細取得 | useQuery |
| `useCreateEvent` | イベント作成 | useMutation |
| `useUpdateEvent` | イベント更新 | useMutation |
| `useDeleteEvent` | イベント削除 | useMutation |
| `useJoinEvent` | イベント参加 | useMutation |
| `useLeaveEvent` | 参加キャンセル | useMutation |

### 型定義

```typescript
// entities/domain/event/model/types.ts

/** イベントタイプ */
export type EventType = 'study' | 'exercise' | 'meditation' | 'reading' | 'general';

/** 繰り返しパターン */
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';

/** 参加ステータス */
export type ParticipantStatus = 'registered' | 'cancelled';

/** イベント主催者 */
export type EventCreator = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};

/** イベント参加者 */
export type EventParticipant = {
  id: string;
  userId: string;
  userName: string | null;
  avatarUrl: string | null;
  status: ParticipantStatus;
};

/** イベント一覧アイテム */
export type EventListItem = {
  id: string;
  title: string;
  eventType: EventType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number | null;
  participantCount: number;
  isParticipating: boolean;
  isRecurring: boolean;
  creator: EventCreator;
};

/** イベント詳細 */
export type EventDetail = EventListItem & {
  description: string | null;
  recurrencePattern: RecurrencePattern | null;
  participants: EventParticipant[];
  isOwner: boolean;
  createdAt: string;
};

/** イベント一覧レスポンス */
export type EventListResponse = {
  data: EventListItem[];
  message: string;
  timestamp: string;
};

/** イベント詳細レスポンス */
export type EventDetailResponse = {
  data: EventDetail;
  message: string;
  timestamp: string;
};

/** イベント作成リクエスト */
export type CreateEventRequest = {
  title: string;
  description?: string | null;
  eventType: EventType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number | null;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
};

/** イベント更新リクエスト */
export type UpdateEventRequest = CreateEventRequest;

/** イベントフィルター */
export type EventFilter = {
  year: number;
  month: number;
  eventType?: EventType[];
  participated?: boolean;
};
```

## 12-api.md との差分

| 現行（12-api.md） | 提案 | 理由 |
|------------------|------|------|
| `date_from`, `date_to` | `year`, `month` | 月ベースで取得するUIに合わせる |
| `limit`, `offset` | 削除 | 月単位取得でページネーション不要 |
| `status` (upcoming/ongoing/past) | 削除 | 月指定で自動的に絞られる |
| `PUT /events/{eventId}/participants/{userId}` | `DELETE /events/{eventId}/participants` | 自分の参加のみ操作、userId不要 |
| - | `isParticipating` を一覧に含める | フィルター用 |
| - | `isOwner` を詳細に含める | 編集/削除ボタン表示判定用 |

## UI連携ポイント

### 一覧ページ

**ギャラリービュー/カレンダービュー共通:**
- `events` をそのまま使用
- フィルター: `event_type`, `participated` クエリパラメータ
- 月変更: `year`, `month` パラメータ

**イベントカード表示:**
- `participantCount` / `maxParticipants` で参加状況表示
- `isParticipating` で自分の参加状態表示
- `creator.avatarUrl` で主催者アバター表示

### 詳細モーダル

**表示切り替え:**
- `isOwner` = true → 「編集」「削除」ボタン表示
- `isOwner` = false → 「参加する」ボタン表示

**参加者一覧:**
- `participants` をグリッド表示
- クリックでメンバー詳細モーダル

### 作成/編集モーダル

**作成:**
- `POST /events` でリクエスト
- 成功後、一覧をinvalidate

**編集:**
- `PUT /events/{eventId}` でリクエスト
- 成功後、詳細・一覧をinvalidate

### 参加/キャンセル

**参加:**
- `POST /events/{eventId}/participants`
- 成功後、詳細・一覧をinvalidate

**キャンセル:**
- `DELETE /events/{eventId}/participants`
- 成功後、詳細・一覧をinvalidate
