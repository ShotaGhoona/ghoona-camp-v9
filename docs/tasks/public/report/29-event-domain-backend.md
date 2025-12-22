# Event Domain バックエンド実装レポート

## 概要

イベントドメインのバックエンドAPIをオニオンアーキテクチャに従って実装。

**エンドポイント一覧:**
- `GET /events` - 月ベースでイベント一覧取得
- `GET /events/me` - 自分が参加/主催のイベント取得
- `GET /events/{eventId}` - イベント詳細取得
- `POST /events` - イベント作成
- `PUT /events/{eventId}` - イベント更新
- `DELETE /events/{eventId}` - イベント削除
- `POST /events/{eventId}/participants` - イベント参加
- `DELETE /events/{eventId}/participants` - 参加キャンセル

月ベースでイベント一覧を取得し、参加・キャンセル機能を提供。

## 変更ファイル

```
backend/app/
├── domain/
│   ├── repositories/
│   │   └── event_repository.py            # リポジトリI/F・データクラス
│   └── exceptions/
│       └── event.py                       # イベント例外
├── infrastructure/
│   └── db/
│       └── repositories/
│           └── event_repository_impl.py   # リポジトリ実装
├── application/
│   ├── schemas/
│   │   └── event_schemas.py               # DTO
│   └── use_cases/
│       └── event_usecase.py               # ユースケース
├── presentation/
│   ├── api/
│   │   └── event_api.py                   # イベントAPI
│   └── schemas/
│       └── event_schemas.py               # リクエスト/レスポンス
├── di/
│   └── event.py                           # 依存性注入
└── main.py                                # ルーター登録
```

## APIエンドポイント

### GET /api/v1/events

月ベースでイベント一覧を取得。カレンダー/ギャラリービューのメインAPI。

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | ○ | 対象年（2000-2100） |
| `month` | int | ○ | 対象月（1-12） |
| `event_type` | string | - | カンマ区切りでフィルタ（例: `study,exercise`） |
| `participated` | boolean | - | `true`=参加済みのみ, `false`=未参加のみ |

**認証:** JWT Cookie認証必須（🔐 認証済み）

**レスポンス:**
```json
{
  "data": {
    "events": [
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
          "id": "...",
          "displayName": "山田太郎",
          "avatarUrl": "..."
        }
      }
    ]
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### GET /api/v1/events/me

自分が参加登録または主催しているイベント一覧を取得。カレンダーのイベントカード表示用。

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | ○ | 対象年（2000-2100） |
| `month` | int | ○ | 対象月（1-12） |

**認証:** JWT Cookie認証必須（🔐 認証済み）

**レスポンス:**
```json
{
  "data": {
    "events": [
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
    ]
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**フィールド説明:**

| フィールド | 説明 |
|-----------|------|
| `role` | `"participant"` = 参加者, `"organizer"` = 主催者 |

### GET /api/v1/events/{event_id}

イベント詳細を取得。参加者一覧を含む。

**認証:** JWT Cookie認証必須（🔐 認証済み）

### POST /api/v1/events

新しいイベントを作成（201 Created）

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `title` | string | ○ | イベント名（最大200文字） |
| `description` | string \| null | - | 説明文 |
| `eventType` | string | ○ | イベントタイプ |
| `scheduledDate` | string | ○ | 開催日（YYYY-MM-DD） |
| `startTime` | string | ○ | 開始時間（HH:MM） |
| `endTime` | string | ○ | 終了時間（HH:MM） |
| `maxParticipants` | int \| null | - | 定員（0/nullで無制限） |
| `isRecurring` | boolean | - | 定期開催フラグ |
| `recurrencePattern` | string \| null | - | 繰り返しパターン |

**認証:** JWT Cookie認証必須（🔐 認証済み）

### PUT /api/v1/events/{event_id}

イベントを更新（部分更新対応）

**認証:** JWT Cookie認証必須（👑 主催者のみ）

**エラーレスポンス:**
- `401`: 未認証
- `403`: 主催者ではない
- `404`: イベント不在
- `400`: バリデーションエラー

### DELETE /api/v1/events/{event_id}

イベントを削除（論理削除）

**認証:** JWT Cookie認証必須（👑 主催者のみ）

### POST /api/v1/events/{event_id}/participants

イベントに参加申込（201 Created）

**認証:** JWT Cookie認証必須（🔐 認証済み）

**エラーレスポンス:**
- `400`: 既に参加済み
- `401`: 未認証
- `404`: イベント不在
- `409`: 定員に達している

### DELETE /api/v1/events/{event_id}/participants

参加をキャンセル

**認証:** JWT Cookie認証必須（🔐 認証済み）

**エラーレスポンス:**
- `400`: 参加していない
- `401`: 未認証
- `404`: イベント不在

## 実装詳細

### Domain層

**イベントタイプ定義:**
- `study` - 勉強
- `exercise` - 運動
- `meditation` - 瞑想
- `reading` - 読書
- `general` - その他

**繰り返しパターン定義:**
- `daily` - 毎日
- `weekly` - 毎週
- `monthly` - 毎月

**データクラス:**
- `EventSearchFilter` - 検索フィルター（year, month, current_user_id, event_types, participated）
- `MyEventsFilter` - 自分のイベント検索フィルター（year, month, user_id）
- `EventCreator` - 主催者情報（id, display_name, avatar_url）
- `EventParticipant` - 参加者情報（id, user_id, user_name, avatar_url, status）
- `EventListItem` - 一覧用アイテム（11フィールド）
- `MyEventItem` - 自分のイベントアイテム（id, title, event_type, scheduled_date, start_time, end_time, role, max_participants, participant_count）
- `EventDetail` - 詳細用（一覧 + description, participants, is_owner等）
- `EventCreateData` - 作成データ
- `EventUpdateData` - 更新データ（部分更新用）
- `ParticipantResult` - 参加結果

**リポジトリインターフェース:**
- `get_events_by_month()` - 月ベースでイベント一覧取得
- `get_my_events()` - 自分が参加/主催のイベント取得
- `get_event_by_id()` - イベント詳細取得
- `create()` - イベント作成
- `update()` - イベント更新
- `delete()` - イベント削除（論理削除）
- `get_creator_id()` - 主催者ID取得
- `get_participant_count()` - 参加者数取得
- `get_max_participants()` - 定員取得
- `is_participating()` - 参加状態確認
- `add_participant()` - 参加者追加
- `remove_participant()` - 参加者削除

**ドメイン例外:**
- `EventNotFoundError` - イベント不在
- `EventForbiddenError` - 権限エラー
- `EventFullError` - 定員超過
- `AlreadyParticipatingError` - 既に参加済み
- `NotParticipatingError` - 参加していない
- `InvalidEventTypeError` - イベントタイプ不正
- `InvalidMonthError` - 月が1-12の範囲外

### Infrastructure層

**一覧クエリ（4テーブル結合 + サブクエリ）:**
- events, users, user_metadata
- 参加者数サブクエリ（event_participants）
- 参加状態サブクエリ（event_participants）

```python
query = (
    self.session.query(
        EventModel,
        UserModel,
        UserMetadataModel,
        participant_count_subq.label('participant_count'),
        is_participating_subq.label('is_participating'),
    )
    .join(UserModel, EventModel.creator_id == UserModel.id)
    .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
    .filter(EventModel.is_active == True)
    .filter(EventModel.scheduled_date >= month_start)
    .filter(EventModel.scheduled_date <= month_end)
)
```

**フィルタリング:**
- scheduled_date: 月初〜月末の範囲
- event_type: IN検索
- participated: 参加状態サブクエリでフィルタ

**自分のイベント取得クエリ（get_my_events）:**
- events, event_participants をJOIN
- 参加者数サブクエリ
- 主催者判定（creator_id = user_id）
- フィルター: 対象月 + (主催者 OR 参加登録済み)
- ソート: scheduled_date, start_time 昇順

**参加者管理:**
- add_participant: 既存キャンセル済みなら再登録、なければ新規作成
- remove_participant: ステータスを`cancelled`に変更

**削除処理:**
- 論理削除（is_active = False）

### Application層

**DTO:**
- `EventCreatorDTO` / `EventParticipantDTO` - 主催者・参加者DTO
- `EventListItemDTO` / `EventDetailDTO` - 一覧・詳細DTO
- `EventListDTO` - 一覧結果DTO
- `CreateEventInputDTO` / `UpdateEventInputDTO` - 作成・更新入力DTO
- `ParticipantResultDTO` - 参加結果DTO

**Usecaseメソッド:**
- `get_events_by_month()` - 月ベースでイベント一覧取得
- `get_event_detail()` - イベント詳細取得
- `create_event()` - イベント作成
- `update_event()` - イベント更新（権限チェック付き）
- `delete_event()` - イベント削除（権限チェック付き）
- `join_event()` - イベント参加（定員チェック付き）
- `leave_event()` - 参加キャンセル

### Presentation層

**スキーマ:**
- `EventCreatorResponse` / `EventParticipantResponse` - 主催者・参加者
- `EventListItemResponse` / `EventDetailResponse` - 一覧・詳細
- `EventListDataResponse` / `EventDetailDataResponse` - データラッパー
- `EventListAPIResponse` / `EventDetailAPIResponse` - APIレスポンス
- `CreateEventRequest` / `CreateEventDataResponse` / `CreateEventAPIResponse` - 作成
- `UpdateEventRequest` / `UpdateEventDataResponse` / `UpdateEventAPIResponse` - 更新
- `DeleteEventDataResponse` / `DeleteEventAPIResponse` - 削除
- `JoinEventAPIResponse` / `LeaveEventDataResponse` / `LeaveEventAPIResponse` - 参加・キャンセル

**レスポンス構造（他ドメインと統一）:**
- 一覧: `{ "data": { "events": [...] } }`
- 詳細/作成/更新: `{ "data": { "event": {...} } }`
- 削除/キャンセル: `{ "data": {} }`（空オブジェクト）

### DI層

- `get_event_usecase()` - EventUsecaseの依存性注入

## DBテーブル

### events

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | イベントID |
| creator_id | UUID | 主催者ID |
| title | VARCHAR(200) | イベント名 |
| description | TEXT | 説明文 |
| event_type | VARCHAR(50) | イベントタイプ |
| scheduled_date | DATE | 開催日 |
| start_time | TIME | 開始時間 |
| end_time | TIME | 終了時間 |
| max_participants | INTEGER | 定員 |
| is_recurring | BOOLEAN | 定期開催フラグ |
| recurrence_pattern | VARCHAR(50) | 繰り返しパターン |
| is_active | BOOLEAN | 有効フラグ |
| created_at | TIMESTAMP WITH TIME ZONE | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | 更新日時 |

### event_participants

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 参加ID |
| event_id | UUID | イベントID |
| user_id | UUID | ユーザーID |
| status | VARCHAR(20) | 参加ステータス（registered/cancelled） |
| created_at | TIMESTAMP WITH TIME ZONE | 登録日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | 更新日時 |

## 設計ポイント

### 月ベース取得

- ページネーションなし（月単位で全件取得）
- カレンダー/ギャラリービューのUIに最適化
- year, monthを必須パラメータ化

### 参加状態の効率的取得

- サブクエリで参加者数と参加状態を一括取得
- 一覧取得時にN+1問題を回避

### 権限管理

- isOwner: 詳細レスポンスに含めて編集/削除ボタン表示判定
- 更新/削除API: creator_idとcurrent_user_idを比較して権限チェック

### 論理削除

- イベント削除はis_active=Falseに更新
- 関連する参加者レコードは保持

## 関連ドキュメント

- `docs/tasks/public/plan/event-api-design.md` - API設計書
- `docs/tasks/public/report/05-event-page.md` - フロントエンド実装
