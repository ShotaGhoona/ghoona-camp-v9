# Titles API - 詳細仕様

## Overview
称号・バッジ・実績管理に関するAPIエンドポイントの詳細仕様書です。
RESTful API設計に従い、称号の取得・実績管理を提供します。

## Database Schema Reference

### titles テーブル
- `id` (UUID): 称号ID
- `level` (INTEGER): レベル (1-8)
- `name_jp` (VARCHAR(50)): 日本語名
- `name_en` (VARCHAR(50)): 英語名
- `description` (TEXT): 称号の説明・ストーリー
- `required_days` (INTEGER): 獲得に必要な参加日数
- `image_url` (TEXT): 称号カード画像URL
- `color_theme` (VARCHAR(50)): テーマカラー
- `is_active` (BOOLEAN): 称号の有効状態
- `created_at` (TIMESTAMP WITH TIME ZONE): 作成日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

### title_achievements テーブル
- `id` (UUID): 実績ID
- `user_id` (UUID): ユーザーID
- `title_id` (UUID): 称号ID
- `achieved_at` (TIMESTAMP WITH TIME ZONE): 獲得日時
- `is_current` (BOOLEAN): 現在設定中の称号かどうか
- `created_at` (TIMESTAMP WITH TIME ZONE): 作成日時
- `updated_at` (TIMESTAMP WITH TIME ZONE): 更新日時

## API Endpoints

### 1. GET /titles
全称号（8段階）の一覧を取得。

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
    "titles": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "level": 1,
        "name_jp": "まどろみ見習い",
        "name_en": "Sleeper",
        "description": "朝活の世界への第一歩。まだ眠気と戦いながらも、新しい習慣への挑戦を始めた勇敢な初心者。",
        "required_days": 1,
        "image_url": "https://example.com/titles/sleeper.jpg",
        "color_theme": "#E3F2FD",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00+00:00",
        "updated_at": "2025-01-01T00:00:00+00:00"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "level": 2,
        "name_jp": "早起き候補生",
        "name_en": "Early Bird Candidate",
        "description": "継続の力を感じ始めた段階。朝の時間の価値に気づき、新しいライフスタイルへの意欲を見せている。",
        "required_days": 7,
        "image_url": "https://example.com/titles/candidate.jpg",
        "color_theme": "#F3E5F5",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00+00:00",
        "updated_at": "2025-01-01T00:00:00+00:00"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "level": 3,
        "name_jp": "朝活探検家",
        "name_en": "Morning Explorer",
        "description": "朝の時間を積極的に活用し、様々な活動に挑戦する探究心旺盛な実践者。",
        "required_days": 30,
        "image_url": "https://example.com/titles/explorer.jpg",
        "color_theme": "#E8F5E8",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00+00:00",
        "updated_at": "2025-01-01T00:00:00+00:00"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "level": 4,
        "name_jp": "朝の住人",
        "name_en": "Morning Resident",
        "description": "朝活が日常の一部となり、朝の時間帯に完全に適応した住人。安定した継続力を持つ。",
        "required_days": 100,
        "image_url": "https://example.com/titles/resident.jpg",
        "color_theme": "#FFF3E0",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00+00:00",
        "updated_at": "2025-01-01T00:00:00+00:00"
      }
    ]
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

### 2. GET /titles/{titleId}
指定称号の詳細情報を取得。

#### Request

**URL Parameters:**
- `titleId` (string, required): 称号ID

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
    "title": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "level": 4,
      "name_jp": "朝の住人",
      "name_en": "Morning Resident",
      "description": "朝活が日常の一部となり、朝の時間帯に完全に適応した住人。安定した継続力を持つ。",
      "required_days": 100,
      "image_url": "https://example.com/titles/resident.jpg",
      "color_theme": "#FFF3E0",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00+00:00",
      "updated_at": "2025-01-01T00:00:00+00:00",
      "holder_count": 42,
      "rarity_percentage": 8.5
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
    "code": "TITLE_NOT_FOUND",
    "message": "Title not found"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### 3. GET /users/{userId}/achievements
ユーザーの称号取得履歴・現在設定中の称号を取得。

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
    "achievements": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "title_id": "550e8400-e29b-41d4-a716-446655440000",
        "achieved_at": "2025-01-01T06:30:00+00:00",
        "is_current": false,
        "created_at": "2025-01-01T06:30:00+00:00",
        "updated_at": "2025-01-15T10:00:00+00:00",
        "title": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "level": 1,
          "name_jp": "まどろみ見習い",
          "name_en": "Sleeper",
          "description": "朝活の世界への第一歩。まだ眠気と戦いながらも、新しい習慣への挑戦を始めた勇敢な初心者。",
          "required_days": 1,
          "image_url": "https://example.com/titles/sleeper.jpg",
          "color_theme": "#E3F2FD"
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440011",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "title_id": "550e8400-e29b-41d4-a716-446655440001",
        "achieved_at": "2025-01-08T06:00:00+00:00",
        "is_current": false,
        "created_at": "2025-01-08T06:00:00+00:00",
        "updated_at": "2025-01-15T10:00:00+00:00",
        "title": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "level": 2,
          "name_jp": "早起き候補生",
          "name_en": "Early Bird Candidate",
          "description": "継続の力を感じ始めた段階。朝の時間の価値に気づき、新しいライフスタイルへの意欲を見せている。",
          "required_days": 7,
          "image_url": "https://example.com/titles/candidate.jpg",
          "color_theme": "#F3E5F5"
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440012",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "title_id": "550e8400-e29b-41d4-a716-446655440002",
        "achieved_at": "2025-02-01T06:00:00+00:00",
        "is_current": true,
        "created_at": "2025-02-01T06:00:00+00:00",
        "updated_at": "2025-02-01T06:00:00+00:00",
        "title": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "level": 3,
          "name_jp": "朝活探検家",
          "name_en": "Morning Explorer",
          "description": "朝の時間を積極的に活用し、様々な活動に挑戦する探究心旺盛な実践者。",
          "required_days": 30,
          "image_url": "https://example.com/titles/explorer.jpg",
          "color_theme": "#E8F5E8"
        }
      }
    ]
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

### 4. PUT /users/{userId}/achievements/{titleId}
現在表示する称号を変更。獲得済み称号から選択。

#### Request

**URL Parameters:**
- `userId` (string, required): ユーザーID
- `titleId` (string, required): 称号ID

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
    "achievement": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "title_id": "550e8400-e29b-41d4-a716-446655440000",
      "achieved_at": "2025-01-01T06:30:00+00:00",
      "is_current": true,
      "created_at": "2025-01-01T06:30:00+00:00",
      "updated_at": "2025-01-21T10:00:00+00:00"
    }
  },
  "message": "Current title updated successfully",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**Error (404 Not Found):**
```json
{
  "error": {
    "code": "ACHIEVEMENT_NOT_FOUND",
    "message": "Achievement not found"
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

**Error (400 Bad Request):**
```json
{
  "error": {
    "code": "TITLE_NOT_ACHIEVED",
    "message": "Title not achieved by user"
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

