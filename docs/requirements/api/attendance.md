# Attendance API - 詳細仕様

## Overview
Discord参加記録・統計管理に関するAPIエンドポイントの詳細仕様書です。
RESTful API設計に従い、参加サマリー・統計・ランキングの取得を提供します。

## Database Schema Reference

### attendance_summaries テーブル
- `id` (UUID): サマリーID
- `user_id` (UUID): ユーザーID
- `date` (DATE): 参加日
- `total_duration_minutes` (INTEGER): 1日の総参加時間(分)
- `session_count` (INTEGER): 参加セッション数
- `first_join_time` (TIME): 最初の参加時刻
- `last_leave_time` (TIME): 最後の退出時刻
- `is_morning_active` (BOOLEAN): 朝活時間帯(6-7時)の参加有無
- `created_at` (TIMESTAMP WITH TIME ZONE): 作成日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

### attendance_statistics テーブル
- `id` (UUID): 統計ID
- `user_id` (UUID): ユーザーID
- `total_attendance_days` (INTEGER): 総参加日数
- `current_streak_days` (INTEGER): 現在の連続参加日数
- `max_streak_days` (INTEGER): 最大連続参加日数
- `last_attendance_date` (DATE): 最後の参加日
- `first_attendance_date` (DATE): 初回参加日
- `total_duration_minutes` (INTEGER): 総参加時間(分)
- `created_at` (TIMESTAMP WITH TIME ZONE): 作成日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

## API Endpoints

### 1. GET /users/{userId}/attendance/summaries
ユーザーの日次参加サマリーを取得。

#### Request

**URL Parameters:**
- `userId` (string, required): ユーザーID

**Query Parameters:**
- `date_from` (string, optional): 開始日でフィルタリング（YYYY-MM-DD形式）
- `date_to` (string, optional): 終了日でフィルタリング（YYYY-MM-DD形式）

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
    "summaries": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "date": "2025-01-21",
        "total_duration_minutes": 65,
        "session_count": 2,
        "first_join_time": "06:00:00",
        "last_leave_time": "07:05:00",
        "is_morning_active": true,
        "created_at": "2025-01-21T07:05:00+00:00",
        "updated_at": "2025-01-21T07:05:00+00:00"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "date": "2025-01-20",
        "total_duration_minutes": 55,
        "session_count": 1,
        "first_join_time": "06:05:00",
        "last_leave_time": "07:00:00",
        "is_morning_active": true,
        "created_at": "2025-01-20T07:00:00+00:00",
        "updated_at": "2025-01-20T07:00:00+00:00"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "date": "2025-01-19",
        "total_duration_minutes": 72,
        "session_count": 3,
        "first_join_time": "05:58:00",
        "last_leave_time": "07:10:00",
        "is_morning_active": true,
        "created_at": "2025-01-19T07:10:00+00:00",
        "updated_at": "2025-01-19T07:10:00+00:00"
      }
    ]
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**Error (403 Forbidden):**
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**Error (404 Not Found):**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 2. GET /users/{userId}/attendance/statistics
ユーザーの参加統計を取得。

#### Request

**URL Parameters:**
- `userId` (string, required): ユーザーID

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
    "statistics": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "total_attendance_days": 45,
      "current_streak_days": 12,
      "max_streak_days": 18,
      "last_attendance_date": "2025-01-21",
      "first_attendance_date": "2024-12-01",
      "total_duration_minutes": 2850,
      "created_at": "2024-12-01T06:30:00+00:00",
      "updated_at": "2025-01-21T07:05:00+00:00"
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**Error (403 Forbidden):**
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**Error (404 Not Found):**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 3. GET /ranking/monthly
当月の参加日数ランキングを取得。

#### Request

**Query Parameters:**
- `month` (number, optional): 月でフィルタリング（1-12, デフォルト: 現在月）
- `limit` (number, optional): 取得件数制限（デフォルト: 50, 最大: 100）
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
    "ranking": [
      {
        "rank": 1,
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "john_doe",
        "avatar_url": "https://example.com/avatars/john_doe.jpg",
        "monthly_attendance_days": 21,
        "total_duration_minutes": 1260
      },
      {
        "rank": 2,
        "user_id": "550e8400-e29b-41d4-a716-446655440002",
        "username": "jane_smith",
        "avatar_url": "https://example.com/avatars/jane_smith.jpg",
        "monthly_attendance_days": 19,
        "total_duration_minutes": 1140
      },
      {
        "rank": 3,
        "user_id": "550e8400-e29b-41d4-a716-446655440003",
        "username": "mike_wilson",
        "avatar_url": "https://example.com/avatars/mike_wilson.jpg",
        "monthly_attendance_days": 18,
        "total_duration_minutes": 1080
      }
    ],
    "pagination": {
      "total": 127,
      "limit": 50,
      "offset": 0,
      "has_more": true
    },
    "month": 1,
    "year": 2025
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

### 4. GET /ranking/total
総合参加日数ランキングを取得。

#### Request

**Query Parameters:**
- `limit` (number, optional): 取得件数制限（デフォルト: 50, 最大: 100）
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
    "ranking": [
      {
        "rank": 1,
        "user_id": "550e8400-e29b-41d4-a716-446655440003",
        "username": "mike_wilson",
        "avatar_url": "https://example.com/avatars/mike_wilson.jpg",
        "total_attendance_days": 156,
        "total_duration_minutes": 9360,
        "first_attendance_date": "2024-08-15",
      },
      {
        "rank": 2,
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "john_doe",
        "avatar_url": "https://example.com/avatars/john_doe.jpg",
        "total_attendance_days": 89,
        "total_duration_minutes": 5340,
        "first_attendance_date": "2024-10-20",
      },
      {
        "rank": 3,
        "user_id": "550e8400-e29b-41d4-a716-446655440002",
        "username": "jane_smith",
        "avatar_url": "https://example.com/avatars/jane_smith.jpg",
        "total_attendance_days": 67,
        "total_duration_minutes": 4020,
        "first_attendance_date": "2024-11-10",
      }
    ],
    "pagination": {
      "total": 127,
      "limit": 50,
      "offset": 0,
      "has_more": true
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 5. GET /ranking/streak
連続参加日数ランキングを取得。

#### Request

**Query Parameters:**
- `limit` (number, optional): 取得件数制限（デフォルト: 50, 最大: 100）
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
    "ranking": [
      {
        "rank": 1,
        "user_id": "550e8400-e29b-41d4-a716-446655440002",
        "username": "jane_smith",
        "avatar_url": "https://example.com/avatars/jane_smith.jpg",
        "current_streak_days": 28,
        "max_streak_days": 35,
        "last_attendance_date": "2025-01-21",
      },
      {
        "rank": 2,
        "user_id": "550e8400-e29b-41d4-a716-446655440003",
        "username": "mike_wilson",
        "avatar_url": "https://example.com/avatars/mike_wilson.jpg",
        "current_streak_days": 22,
        "max_streak_days": 45,
        "last_attendance_date": "2025-01-21",
      },
      {
        "rank": 3,
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "john_doe",
        "avatar_url": "https://example.com/avatars/john_doe.jpg",
        "current_streak_days": 12,
        "max_streak_days": 18,
        "last_attendance_date": "2025-01-21",
      }
    ],
    "pagination": {
      "total": 127,
      "limit": 50,
      "offset": 0,
      "has_more": true
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
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

### 403 Forbidden
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
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

