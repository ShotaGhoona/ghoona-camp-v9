# GET /users/{userId} - ユーザー詳細取得API

## Overview
指定したユーザーの詳細情報を取得するAPI。
メンバー詳細モーダルで使用。メタデータ・SNSリンク・参加統計・称号情報を含む。

## Endpoint
```
GET /api/v1/users/{userId}
```

## Access Control
- **認証**: 🔐 必須（JWT Cookie認証）
- **権限**: 認証済みユーザーであれば誰でもアクセス可能

## Path Parameters

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `userId` | string (UUID) | ✅ | 取得対象のユーザーID |

### リクエスト例
```
GET /api/v1/users/550e8400-e29b-41d4-a716-446655440001
```

## Response

### Success Response (200 OK)

```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "yamada_taro",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada",
      "displayName": "山田太郎",
      "tagline": "毎朝5時起きを目指すエンジニア",
      "bio": "フロントエンドエンジニアとして5年目。朝活で読書と技術学習を続けています。最近はRustに興味があります。",
      "skills": ["TypeScript", "React", "Node.js", "AWS"],
      "interests": ["読書", "ランニング", "コーヒー"],
      "vision": "技術で社会に貢献するエンジニアになる",
      "isVisionPublic": true,
      "socialLinks": [
        {
          "id": "link-001",
          "platform": "twitter",
          "url": "https://twitter.com/yamada_taro",
          "title": null
        },
        {
          "id": "link-002",
          "platform": "github",
          "url": "https://github.com/yamada-taro",
          "title": null
        }
      ],
      "totalAttendanceDays": 156,
      "currentStreakDays": 23,
      "maxStreakDays": 45,
      "currentTitleLevel": 6,
      "joinedAt": "2024-01-15T00:00:00Z"
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### Response Fields

#### User Object

| フィールド | 型 | Nullable | 説明 |
|-----------|-----|----------|------|
| `id` | string (UUID) | ❌ | ユーザーID |
| `username` | string | ❌ | ユーザー名 |
| `avatarUrl` | string | ✅ | アバター画像URL |
| `displayName` | string | ❌ | 表示名 |
| `tagline` | string | ✅ | 一言プロフィール |
| `bio` | string | ✅ | 自己紹介文 |
| `skills` | string[] | ❌ | スキル一覧（空配列の可能性あり） |
| `interests` | string[] | ❌ | 興味・関心一覧（空配列の可能性あり） |
| `vision` | string | ✅ | ビジョン（`isVisionPublic`がfalseの場合はnull） |
| `isVisionPublic` | boolean | ❌ | ビジョンの公開設定 |
| `socialLinks` | SocialLink[] | ❌ | SNSリンク一覧（空配列の可能性あり） |
| `totalAttendanceDays` | number | ❌ | 総参加日数 |
| `currentStreakDays` | number | ❌ | 現在の連続参加日数 |
| `maxStreakDays` | number | ❌ | 最大連続参加日数 |
| `currentTitleLevel` | number (1-8) | ❌ | 現在の称号レベル（フロントで`TITLE_MASTER`から解決） |
| `joinedAt` | string (ISO 8601) | ❌ | 登録日時 |

#### SocialLink Object

| フィールド | 型 | Nullable | 説明 |
|-----------|-----|----------|------|
| `id` | string (UUID) | ❌ | リンクID |
| `platform` | string | ❌ | プラットフォーム種別（下記参照） |
| `url` | string | ❌ | リンクURL |
| `title` | string | ✅ | リンクのタイトル |

**platform の値:**
- `twitter`
- `instagram`
- `github`
- `linkedin`
- `website`
- `blog`
- `note`

### Error Responses

#### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

#### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたユーザーが見つかりません"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

#### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "無効なユーザーIDです"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

## Data Sources

このAPIは以下のテーブルを結合して取得します：

| テーブル | 取得フィールド |
|---------|---------------|
| `users` | id, username, avatar_url, created_at |
| `user_metadata` | display_name, tagline, bio, skills, interests |
| `user_visions` | vision, is_public |
| `user_social_links` | id, platform, url, title |
| `attendance_statistics` | total_attendance_days, current_streak_days, max_streak_days |
| `title_achievements` | title_level (is_current=true) |

## Privacy Rules

1. **Vision**: `user_visions.is_public` が `false` の場合、`vision` フィールドは `null` を返す
2. **Social Links**: `user_social_links.is_public` が `false` のリンクは除外する

## Notes

- `currentTitleLevel` は `title_achievements` で `is_current=true` のレコードから取得
- 称号未取得の場合は `1` を返す
- 称号のマスターデータ（名前、色など）はフロントエンドの `TITLE_MASTER` で管理
- `users.is_active` が `false` のユーザーは404エラーを返す

## Related Endpoints

- `GET /users` - メンバー一覧取得（同じレスポンス構造）
- `PUT /users/{userId}` - ユーザー情報更新（本人のみ）
