# Users API - 詳細仕様

## Overview
ユーザー認証・プロフィール管理に関するAPIエンドポイントの詳細仕様書です。
RESTful API設計に従い、ユーザー情報の取得・更新・検索・ライバル管理を提供します。

## Database Schema Reference

### users テーブル
- `id` (UUID): ユーザーID
- `clerk_id` (VARCHAR(255)): Clerk User ID
- `email` (VARCHAR(255)): メールアドレス
- `username` (VARCHAR(100)): ユーザー名
- `avatar_url` (TEXT): アバター画像URL
- `discord_id` (VARCHAR(255)): Discord User ID
- `is_active` (BOOLEAN): アカウント有効状態
- `created_at` (TIMESTAMP WITH TIME ZONE): 作成日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

### user_metadata テーブル
- `id` (UUID): メタデータID
- `user_id` (UUID): ユーザーID
- `display_name` (VARCHAR(100)): 表示名
- `tagline` (VARCHAR(150)): 一言プロフィール
- `bio` (TEXT): 自己紹介文章
- `skills` (TEXT[]): スキル (配列)
- `interests` (TEXT[]): 興味・関心 (配列)
- `created_at` (TIMESTAMP WITH TIME ZONE): 作成日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

### user_social_links テーブル
- `id` (UUID): リンクID
- `user_id` (UUID): ユーザーID
- `platform` (VARCHAR(50)): プラットフォーム
- `url` (TEXT): リンクURL
- `title` (VARCHAR(100)): リンクのタイトル・説明
- `is_public` (BOOLEAN): 公開設定
- `created_at` (TIMESTAMP WITH TIME ZONE): 作成日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

### user_rivals テーブル
- `id` (UUID): 関係ID
- `user_id` (UUID): ユーザーID
- `rival_user_id` (UUID): ライバルのユーザーID
- `created_at` (TIMESTAMP WITH TIME ZONE): 設定日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

## API Endpoints

### 1. GET /auth/me
現在ログイン中のユーザー情報を取得。

#### Request

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
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "clerk_id": "user_2abc123def456789",
      "email": "john.doe@example.com",
      "username": "john_doe",
      "display_name": "John Doe",
      "avatar_url": "https://example.com/avatars/john_doe.jpg",
      "discord_id": "123456789012345678",
      "is_active": true,
      "created_at": "2024-12-01T06:30:00+00:00",
      "updated_at": "2025-01-21T10:00:00+00:00"
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

### 2. GET /users
全ユーザーの一覧を取得。

#### Request

**Query Parameters:**
- `search` (string, optional): ユーザー名での検索
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
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "avatar_url": "https://example.com/avatars/john_doe.jpg",
        "display_name": "John Doe",
        "tagline": "朝活で人生を変える挑戦者",
        "is_active": true,
        "created_at": "2024-12-01T06:30:00+00:00"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "avatar_url": "https://example.com/avatars/jane_smith.jpg",
        "display_name": "Jane Smith",
        "tagline": "健康的な朝の習慣を大切にしています",
        "is_active": true,
        "created_at": "2024-11-15T08:00:00+00:00"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "avatar_url": "https://example.com/avatars/mike_wilson.jpg",
        "display_name": "Mike Wilson",
        "tagline": "継続は力なり、毎日コツコツと",
        "is_active": true,
        "created_at": "2024-10-20T09:15:00+00:00"
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

### 3. GET /users/{userId}
指定したユーザーの詳細情報を取得。

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
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "john_doe",
      "display_name": "John Doe",
      "avatar_url": "https://example.com/avatars/john_doe.jpg",
      "is_active": true,
      "created_at": "2024-12-01T06:30:00+00:00",
      "updated_at": "2025-01-21T10:00:00+00:00",
      "metadata": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "display_name": "John Doe",
        "tagline": "朝活で人生を変える挑戦者",
        "bio": "プログラマーとして働きながら、朝活を通じて自己成長を目指しています。読書と運動が趣味で、特に技術書とランニングが好きです。みなさんと一緒に成長していけたら嬉しいです。",
        "skills": ["JavaScript", "React", "Node.js", "Python"],
        "interests": ["読書", "ランニング", "プログラミング", "英語学習"],
        "created_at": "2024-12-01T06:30:00+00:00",
        "updated_at": "2025-01-15T09:00:00+00:00"
      },
      "social_links": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440020",
          "platform": "twitter",
          "url": "https://twitter.com/john_doe",
          "title": "個人のTwitter",
          "is_public": true,
          "created_at": "2024-12-05T10:00:00+00:00",
          "updated_at": "2024-12-05T10:00:00+00:00"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440021",
          "platform": "github",
          "url": "https://github.com/johndoe",
          "title": "GitHub",
          "is_public": true,
          "created_at": "2024-12-05T10:05:00+00:00",
          "updated_at": "2024-12-05T10:05:00+00:00"
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
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 4. PUT /users/{userId}
ユーザーの基本情報を更新。

#### Request

**URL Parameters:**
- `userId` (string, required): ユーザーID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Body:**
```json
{
  "username": "john_doe_updated",
  "avatar_url": "https://example.com/avatars/john_doe_new.jpg",
  "metadata": {
    "display_name": "John Doe Updated",
    "tagline": "朝活で人生を変える挑戦者（更新版）",
    "bio": "プログラマーとして働きながら、朝活を通じて自己成長を目指しています。最近はGoも学習中です。",
    "skills": ["JavaScript", "React", "Node.js", "Python", "Go"],
    "interests": ["読書", "ランニング", "プログラミング", "英語学習", "瞑想"]
  }
}
```

#### Response

**Success (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "clerk_id": "user_2abc123def456789",
      "email": "john.doe@example.com",
      "username": "john_doe_updated",
      "display_name": "John Doe Updated",
      "avatar_url": "https://example.com/avatars/john_doe_new.jpg",
      "discord_id": "123456789012345678",
      "is_active": true,
      "created_at": "2024-12-01T06:30:00+00:00",
      "updated_at": "2025-01-21T10:30:00+00:00",
      "metadata": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "display_name": "John Doe Updated",
        "tagline": "朝活で人生を変える挑戦者（更新版）",
        "bio": "プログラマーとして働きながら、朝活を通じて自己成長を目指しています。最近はGoも学習中です。",
        "skills": ["JavaScript", "React", "Node.js", "Python", "Go"],
        "interests": ["読書", "ランニング", "プログラミング", "英語学習", "瞑想"],
        "updated_at": "2025-01-21T10:30:00+00:00"
      }
    }
  },
  "message": "User updated successfully",
  "timestamp": "2025-01-21T10:30:00+00:00"
}
```

**Error (403 Forbidden):**
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied"
  },
  "timestamp": "2025-01-21T10:30:00+00:00"
}
```

**Error (400 Bad Request):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters"
  },
  "timestamp": "2025-01-21T10:30:00+00:00"
}
```

### 5. POST /users/{userId}/social-links
新しいSNSリンク・外部リンクを追加。

#### Request

**URL Parameters:**
- `userId` (string, required): ユーザーID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Body:**
```json
{
  "platform": "linkedin",
  "url": "https://linkedin.com/in/johndoe",
  "title": "LinkedIn",
  "is_public": true
}
```

#### Response

**Success (201 Created):**
```json
{
  "data": {
    "social_link": {
      "id": "550e8400-e29b-41d4-a716-446655440023",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "platform": "linkedin",
      "url": "https://linkedin.com/in/johndoe",
      "title": "LinkedIn",
      "is_public": true,
      "created_at": "2025-01-21T10:30:00+00:00",
      "updated_at": "2025-01-21T10:30:00+00:00"
    }
  },
  "message": "Social link created successfully",
  "timestamp": "2025-01-21T10:30:00+00:00"
}
```

### 6. PUT /users/{userId}/social-links/{linkId}
既存のSNSリンク・外部リンクを更新。

#### Request

**URL Parameters:**
- `userId` (string, required): ユーザーID
- `linkId` (string, required): リンクID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Body:**
```json
{
  "url": "https://linkedin.com/in/john-doe-updated",
  "title": "LinkedIn Profile",
  "is_public": true
}
```

#### Response

**Success (200 OK):**
```json
{
  "data": {
    "social_link": {
      "id": "550e8400-e29b-41d4-a716-446655440023",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "platform": "linkedin",
      "url": "https://linkedin.com/in/john-doe-updated",
      "title": "LinkedIn Profile",
      "is_public": true,
      "created_at": "2025-01-21T10:30:00+00:00",
      "updated_at": "2025-01-21T10:45:00+00:00"
    }
  },
  "message": "Social link updated successfully",
  "timestamp": "2025-01-21T10:45:00+00:00"
}
```

### 7. DELETE /users/{userId}/social-links/{linkId}
SNSリンク・外部リンクを削除。

#### Request

**URL Parameters:**
- `userId` (string, required): ユーザーID
- `linkId` (string, required): リンクID

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
    "code": "SOCIAL_LINK_NOT_FOUND",
    "message": "Social link not found"
  },
  "timestamp": "2025-01-21T10:45:00+00:00"
}
```

### 8. GET /users/{userId}/rivals
ユーザーが設定したライバル一覧を取得。

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
    "rivals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440030",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "rival_user_id": "550e8400-e29b-41d4-a716-446655440002",
        "created_at": "2024-12-10T10:00:00+00:00",
        "updated_at": "2024-12-10T10:00:00+00:00",
        "rival_user": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "username": "jane_smith",
          "avatar_url": "https://example.com/avatars/jane_smith.jpg"
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440031",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "rival_user_id": "550e8400-e29b-41d4-a716-446655440003",
        "created_at": "2024-12-15T10:00:00+00:00",
        "updated_at": "2024-12-15T10:00:00+00:00",
        "rival_user": {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "username": "mike_wilson",
          "avatar_url": "https://example.com/avatars/mike_wilson.jpg"
        }
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

### 9. POST /users/{userId}/rivals
新しいライバルを追加。

#### Request

**URL Parameters:**
- `userId` (string, required): ユーザーID

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Body:**
```json
{
  "rival_user_id": "550e8400-e29b-41d4-a716-446655440004"
}
```

#### Response

**Success (201 Created):**
```json
{
  "data": {
    "rival": {
      "id": "550e8400-e29b-41d4-a716-446655440032",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "rival_user_id": "550e8400-e29b-41d4-a716-446655440004",
      "created_at": "2025-01-21T10:30:00+00:00",
      "updated_at": "2025-01-21T10:30:00+00:00"
    }
  },
  "message": "Rival added successfully",
  "timestamp": "2025-01-21T10:30:00+00:00"
}
```

**Error (400 Bad Request):**
```json
{
  "error": {
    "code": "RIVAL_LIMIT_EXCEEDED",
    "message": "Maximum 3 rivals allowed"
  },
  "timestamp": "2025-01-21T10:30:00+00:00"
}
```

**Error (409 Conflict):**
```json
{
  "error": {
    "code": "RIVAL_ALREADY_EXISTS",
    "message": "User is already added as rival"
  },
  "timestamp": "2025-01-21T10:30:00+00:00"
}
```

### 10. DELETE /users/{userId}/rivals/{rivalId}
ライバル関係を解除。

#### Request

**URL Parameters:**
- `userId` (string, required): ユーザーID
- `rivalId` (string, required): ライバル関係ID

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
    "code": "RIVAL_NOT_FOUND",
    "message": "Rival relationship not found"
  },
  "timestamp": "2025-01-21T10:45:00+00:00"
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

