# Goals API - 詳細仕様

## Overview
ユーザーの目標設定・管理に関するAPIエンドポイントの詳細仕様書です。
RESTful API設計に従い、目標の作成・取得・更新・削除を提供します。

## API Endpoints

### 1. GET /goals/me
自分の目標一覧を取得。プライベート・パブリック両方の目標を含む。

#### Request

**Query Parameters:**
- `search` (string, optional): 目標タイトルでの検索
- `is_public` (boolean, optional): 公開設定でフィルタリング（true=公開のみ, false=プライベートのみ, 省略=全て）
- `started_from` (string, optional): 目標開始日でフィルタリング（YYYY-MM-DD形式）
- `started_to` (string, optional): 目標開始日でフィルタリング（YYYY-MM-DD形式）
- `ended_from` (string, optional): 目標終了日でフィルタリング（YYYY-MM-DD形式）
- `ended_to` (string, optional): 目標終了日でフィルタリング（YYYY-MM-DD形式）
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
    "goals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "毎朝6時に起きる習慣をつける",
        "description": "健康的な生活リズムを作るために、毎朝6時に起床する習慣を身につけたい。朝活で他の参加者との交流も楽しみにしている。",
        "started_at": "2025-01-01",
        "ended_at": "2025-03-31",
        "is_active": true,
        "is_public": true,
        "created_at": "2025-01-01T00:00:00+00:00",
        "updated_at": "2025-01-01T00:00:00+00:00"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "英語の勉強を継続する",
        "description": "TOEIC800点を目指して、毎日30分の英語学習を継続する。",
        "started_at": "2025-01-15",
        "ended_at": "2025-06-30",
        "is_active": true,
        "is_public": false,
        "created_at": "2025-01-15T00:00:00+00:00",
        "updated_at": "2025-01-15T00:00:00+00:00"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0,
      "has_more": false
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

### 2. GET /goals/public
全ユーザーの公開目標一覧を取得。

#### Request

**Query Parameters:**
- `search` (string, optional): 目標タイトルでの検索
- `user` (string, optional): 特定ユーザーIDでフィルタリング
- `started_from` (string, optional): 目標開始日でフィルタリング（YYYY-MM-DD形式）
- `started_to` (string, optional): 目標開始日でフィルタリング（YYYY-MM-DD形式）
- `ended_from` (string, optional): 目標終了日でフィルタリング（YYYY-MM-DD形式）
- `ended_to` (string, optional): 目標終了日でフィルタリング（YYYY-MM-DD形式）
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
    "goals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "毎朝6時に起きる習慣をつける",
        "description": "健康的な生活リズムを作るために、毎朝6時に起床する習慣を身につけたい。朝活で他の参加者との交流も楽しみにしている。",
        "started_at": "2025-01-01",
        "ended_at": "2025-03-31",
        "is_active": true,
        "is_public": true,
        "created_at": "2025-01-01T00:00:00+00:00",
        "updated_at": "2025-01-01T00:00:00+00:00",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "username": "john_doe",
          "avatar_url": "https://example.com/avatars/john_doe.jpg"
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "user_id": "550e8400-e29b-41d4-a716-446655440002",
        "title": "プログラミングスキルの向上",
        "description": "Reactを使ったWebアプリケーション開発のスキルを向上させる。毎日2時間の学習時間を確保して、実際にプロジェクトを作りながら学習を進める。",
        "started_at": "2025-02-01",
        "ended_at": "2025-05-31",
        "is_active": true,
        "is_public": true,
        "created_at": "2025-01-21T10:00:00+00:00",
        "updated_at": "2025-01-21T10:00:00+00:00",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "username": "jane_smith",
          "avatar_url": "https://example.com/avatars/jane_smith.jpg"
        }
      }
    ],
    "pagination": {
      "total": 127,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 3. POST /goals
新しい目標を作成。

#### Request

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Body:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "プログラミングスキルの向上",
  "description": "Reactを使ったWebアプリケーション開発のスキルを向上させる。毎日2時間の学習時間を確保して、実際にプロジェクトを作りながら学習を進める。",
  "started_at": "2025-02-01",
  "ended_at": "2025-05-31",
  "is_public": true
}
```


#### Response

**Success (201 Created):**
```json
{
  "data": {
    "goal": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "プログラミングスキルの向上",
      "description": "Reactを使ったWebアプリケーション開発のスキルを向上させる。毎日2時間の学習時間を確保して、実際にプロジェクトを作りながら学習を進める。",
      "started_at": "2025-02-01",
      "ended_at": "2025-05-31",
      "is_active": true,
      "is_public": true,
      "created_at": "2025-01-21T10:00:00+00:00",
      "updated_at": "2025-01-21T10:00:00+00:00"
    }
  },
  "message": "Goal created successfully",
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

### 4. PUT /goals/{goalId}
目標の内容を更新。

#### Request

**URL Parameters:**
- `goalId` (string, required): 目標ID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "毎朝5:30に起きる習慣をつける",
  "description": "健康的な生活リズムを作るために、毎朝5:30に起床する習慣を身につけたい。朝活で他の参加者との交流も楽しみにしている。時間を30分早めてより効果的な朝の時間を作る。",
  "ended_at": "2025-06-30",
  "is_public": true,
  "is_active": true
}
```


#### Response

**Success (200 OK):**
```json
{
  "data": {
    "goal": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "毎朝5:30に起きる習慣をつける",
      "description": "健康的な生活リズムを作るために、毎朝5:30に起床する習慣を身につけたい。朝活で他の参加者との交流も楽しみにしている。時間を30分早めてより効果的な朝の時間を作る。",
      "started_at": "2025-01-01",
      "ended_at": "2025-06-30",
      "is_active": true,
      "is_public": true,
      "created_at": "2025-01-01T00:00:00+00:00",
      "updated_at": "2025-01-21T10:00:00+00:00"
    }
  },
  "message": "Goal updated successfully",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**Error (404 Not Found):**
```json
{
  "error": {
    "code": "GOAL_NOT_FOUND",
    "message": "Goal not found"
  },
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

### 5. DELETE /goals/{goalId}
目標を削除。

#### Request

**URL Parameters:**
- `goalId` (string, required): 目標ID

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
    "code": "GOAL_NOT_FOUND",
    "message": "Goal not found"
  },
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

## Common Error Responses

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": {
      "reason": "Missing or invalid authorization token"
    }
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
