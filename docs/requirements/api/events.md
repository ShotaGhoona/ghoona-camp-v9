# Events API - 詳細仕様

## Overview
朝活イベントの作成・管理に関するAPIエンドポイントの詳細仕様書です。
RESTful API設計に従い、イベントの作成・取得・更新・削除・参加管理を提供します。

## Database Schema Reference

### events テーブル
- `id` (UUID): イベントID
- `creator_id` (UUID): 作成者ID
- `title` (VARCHAR(200)): イベント名
- `description` (TEXT): イベント詳細
- `event_type` (VARCHAR(50)): イベントタイプ
- `scheduled_date` (DATE): 開催日
- `start_time` (TIME): 開始時間
- `end_time` (TIME): 終了時間
- `max_participants` (INTEGER): 最大参加者数
- `is_recurring` (BOOLEAN): 定期開催かどうか
- `recurrence_pattern` (VARCHAR(50)): 繰り返しパターン
- `discord_channel_id` (VARCHAR(255)): 対応するDiscordチャンネルID
- `is_active` (BOOLEAN): イベント有効状態
- `created_at` (TIMESTAMP WITH TIME ZONE): 作成日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

### event_participants テーブル
- `id` (UUID): 参加ID
- `event_id` (UUID): イベントID
- `user_id` (UUID): 参加者ID
- `status` (VARCHAR(20)): 参加状態
- `created_at` (TIMESTAMP WITH TIME ZONE): 登録日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

## API Endpoints

### 1. GET /events
開催予定・開催中のイベント一覧を取得。日時順でソート。

#### Request

**Query Parameters:**
- `status` (string, optional): イベントステータスでフィルタリング（upcoming, ongoing, past）
- `creator` (string, optional): 作成者のユーザーIDでフィルタリング
- `date_from` (string, optional): 開始日時でフィルタリング（ISO 8601形式）
- `date_to` (string, optional): 終了日時でフィルタリング（ISO 8601形式）
- `limit` (number, optional): 取得件数制限（デフォルト: 20, 最大: 100）
- `offset` (number, optional): オフセット（ページネーション用）

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

#### Response

**Success (200 OK):**
```json
{
  "data": {
    "events": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "creator_id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "朝の読書会",
        "description": "みんなで読書の時間を共有しましょう。お互いに読んでいる本について話し合い、モチベーションを高め合います。",
        "event_type": "study",
        "scheduled_date": "2025-01-25",
        "start_time": "06:00:00",
        "end_time": "07:00:00",
        "max_participants": 10,
        "is_recurring": false,
        "recurrence_pattern": null,
        "discord_channel_id": "1234567890123456789",
        "is_active": true,
        "created_at": "2025-01-21T10:00:00+00:00",
        "updated_at": "2025-01-21T10:00:00+00:00",
        "creator": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "username": "john_doe",
          "avatar_url": "https://example.com/avatars/john_doe.jpg"
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "creator_id": "550e8400-e29b-41d4-a716-446655440002",
        "title": "朝ヨガセッション",
        "description": "心と体をリフレッシュする朝のヨガセッション。初心者歓迎です。",
        "event_type": "exercise",
        "scheduled_date": "2025-01-26",
        "start_time": "06:30:00",
        "end_time": "07:30:00",
        "max_participants": 8,
        "is_recurring": true,
        "recurrence_pattern": "weekly",
        "discord_channel_id": "1234567890123456790",
        "is_active": true,
        "created_at": "2025-01-20T15:00:00+00:00",
        "updated_at": "2025-01-20T15:00:00+00:00",
        "creator": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "username": "jane_smith",
          "avatar_url": "https://example.com/avatars/jane_smith.jpg"
        }
      }
    ],
    "pagination": {
      "total": 42,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 2. POST /events
新しい朝活イベントを作成。

#### Request

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "朝の瞑想会",
  "description": "一日を穏やかに始めるための瞑想セッション。初心者でも参加しやすい内容です。",
  "event_type": "meditation",
  "scheduled_date": "2025-01-30",
  "start_time": "06:00:00",
  "end_time": "06:30:00",
  "max_participants": 15,
  "is_recurring": false,
  "recurrence_pattern": null,
  "discord_channel_id": "1234567890123456791"
}
```

#### Response

**Success (201 Created):**
```json
{
  "data": {
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "creator_id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "朝の瞑想会",
      "description": "一日を穏やかに始めるための瞑想セッション。初心者でも参加しやすい内容です。",
      "event_type": "meditation",
      "scheduled_date": "2025-01-30",
      "start_time": "06:00:00",
      "end_time": "06:30:00",
      "max_participants": 15,
      "is_recurring": false,
      "recurrence_pattern": null,
      "discord_channel_id": "1234567890123456791",
      "is_active": true,
      "created_at": "2025-01-21T10:00:00+00:00",
      "updated_at": "2025-01-21T10:00:00+00:00"
    }
  },
  "message": "Event created successfully",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**Error (400 Bad Request):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 3. GET /events/{eventId}
指定イベントの詳細情報を取得。

#### Request

**URL Parameters:**
- `eventId` (string, required): イベントID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

#### Response

**Success (200 OK):**
```json
{
  "data": {
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "creator_id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "朝の読書会",
      "description": "みんなで読書の時間を共有しましょう。お互いに読んでいる本について話し合い、モチベーションを高め合います。",
      "event_type": "study",
      "scheduled_date": "2025-01-25",
      "start_time": "06:00:00",
      "end_time": "07:00:00",
      "max_participants": 10,
      "is_recurring": false,
      "recurrence_pattern": null,
      "discord_channel_id": "1234567890123456789",
      "is_active": true,
      "created_at": "2025-01-21T10:00:00+00:00",
      "updated_at": "2025-01-21T10:00:00+00:00",
      "creator": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "john_doe",
        "avatar_url": "https://example.com/avatars/john_doe.jpg"
      },
      "participants": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "username": "john_doe",
          "avatar_url": "https://example.com/avatars/john_doe.jpg",
          "status": "registered"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "username": "jane_smith",
          "avatar_url": "https://example.com/avatars/jane_smith.jpg",
          "status": "registered"
        }
      ]
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**Error (404 Not Found):**
```json
{
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event not found"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 4. PUT /events/{eventId}
イベント情報を更新。作成者のみが実行可能。

#### Request

**URL Parameters:**
- `eventId` (string, required): イベントID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "朝の読書会 - 今月のテーマ本",
  "description": "みんなで読書の時間を共有しましょう。今月は「7つの習慣」をテーマに話し合います。",
  "max_participants": 12,
  "is_active": true
}
```

#### Response

**Success (200 OK):**
```json
{
  "data": {
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "creator_id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "朝の読書会 - 今月のテーマ本",
      "description": "みんなで読書の時間を共有しましょう。今月は「7つの習慣」をテーマに話し合います。",
      "event_type": "study",
      "scheduled_date": "2025-01-25",
      "start_time": "06:00:00",
      "end_time": "07:00:00",
      "max_participants": 12,
      "is_recurring": false,
      "recurrence_pattern": null,
      "discord_channel_id": "1234567890123456789",
      "is_active": true,
      "created_at": "2025-01-21T10:00:00+00:00",
      "updated_at": "2025-01-21T12:00:00+00:00"
    }
  },
  "message": "Event updated successfully",
  "timestamp": "2025-01-21T12:00:00+00:00"
}
```

**Error (403 Forbidden):**
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied"
  },
  "timestamp": "2025-01-21T12:00:00+00:00"
}
```

### 5. DELETE /events/{eventId}
イベントを削除。作成者のみが実行可能。

#### Request

**URL Parameters:**
- `eventId` (string, required): イベントID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

#### Response

**Success (204 No Content):**
```
(空のレスポンスボディ)
```

**Error (404 Not Found):**
```json
{
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event not found"
  },
  "timestamp": "2025-01-21T12:00:00+00:00"
}
```

**Error (403 Forbidden):**
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied"
  },
  "timestamp": "2025-01-21T12:00:00+00:00"
}
```

### 6. POST /events/{eventId}/participants
イベントに参加申込を行う。

#### Request

**URL Parameters:**
- `eventId` (string, required): イベントID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

#### Response

**Success (201 Created):**
```json
{
  "data": {
    "participation": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440003",
      "status": "registered",
      "created_at": "2025-01-21T12:00:00+00:00",
      "updated_at": "2025-01-21T12:00:00+00:00"
    }
  },
  "message": "Successfully registered for event",
  "timestamp": "2025-01-21T12:00:00+00:00"
}
```

**Error (409 Conflict):**
```json
{
  "error": {
    "code": "EVENT_FULL",
    "message": "Event is full"
  },
  "timestamp": "2025-01-21T12:00:00+00:00"
}
```

**Error (409 Conflict):**
```json
{
  "error": {
    "code": "ALREADY_REGISTERED",
    "message": "Already registered"
  },
  "timestamp": "2025-01-21T12:00:00+00:00"
}
```

### 7. PUT /events/{eventId}/participants/{userId}
参加ステータスを更新（参加→キャンセル等）。

#### Request

**URL Parameters:**
- `eventId` (string, required): イベントID
- `userId` (string, required): ユーザーID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "cancelled"
}
```

#### Response

**Success (200 OK):**
```json
{
  "data": {
    "participation": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440003",
      "status": "cancelled",
      "created_at": "2025-01-21T12:00:00+00:00",
      "updated_at": "2025-01-21T13:00:00+00:00"
    }
  },
  "message": "Participation status updated successfully",
  "timestamp": "2025-01-21T13:00:00+00:00"
}
```

**Error (403 Forbidden):**
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied"
  },
  "timestamp": "2025-01-21T12:00:00+00:00"
}
```

## Common Error Responses

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 422 Unprocessable Entity
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal server error"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

