# GET /users - メンバー一覧取得API

## Overview
メンバー一覧ページで使用する、全ユーザーの一覧を取得するAPI。
検索・フィルタリング・ページネーションに対応。

## Endpoint
```
GET /api/v1/users
```

## Access Control
- **認証**: 🔐 必須（JWT Cookie認証）
- **権限**: 認証済みユーザーであれば誰でもアクセス可能

## Query Parameters

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `search` | string | ❌ | - | キーワード検索（displayName, taglineを対象） |
| `skills` | string | ❌ | - | スキルでフィルタ（カンマ区切りで複数指定可、OR検索） |
| `interests` | string | ❌ | - | 興味・関心でフィルタ（カンマ区切りで複数指定可、OR検索） |
| `title_levels` | string | ❌ | - | 称号レベルでフィルタ（カンマ区切りで複数指定可、1-8） |
| `limit` | number | ❌ | 20 | 取得件数（最大: 100） |
| `offset` | number | ❌ | 0 | オフセット（ページネーション用） |

### フィルタリング仕様

#### search（キーワード検索）
- `displayName` と `tagline` を対象に部分一致検索（大文字小文字を区別しない）
- 例: `search=エンジニア` → displayNameまたはtaglineに「エンジニア」を含むユーザー

#### skills（スキルフィルター）
- カンマ区切りで複数指定可能
- OR検索（指定したスキルのいずれかを持つユーザーがマッチ）
- 例: `skills=TypeScript,React` → TypeScriptまたはReactを持つユーザー

#### interests（興味・関心フィルター）
- カンマ区切りで複数指定可能
- OR検索（指定した興味のいずれかを持つユーザーがマッチ）
- 例: `interests=読書,ランニング` → 読書またはランニングに興味があるユーザー

#### title_levels（称号レベルフィルター）
- カンマ区切りで複数指定可能（1-8の整数）
- OR検索（指定したレベルのいずれかを持つユーザーがマッチ）
- 例: `title_levels=5,6,7` → レベル5, 6, 7の称号を持つユーザー

### リクエスト例
```
GET /api/v1/users?search=エンジニア&skills=TypeScript,React&limit=20&offset=0
```

## Response

### Success Response (200 OK)

```json
{
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "yamada_taro",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada",
        "displayName": "山田太郎",
        "tagline": "毎朝5時起きを目指すエンジニア",
        "bio": "フロントエンドエンジニアとして5年目。朝活で読書と技術学習を続けています。",
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
    ],
    "pagination": {
      "total": 127,
      "limit": 20,
      "offset": 0,
      "hasMore": true
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

#### Pagination Object

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `total` | number | 総件数 |
| `limit` | number | 取得件数制限 |
| `offset` | number | オフセット |
| `hasMore` | boolean | 次のページがあるか |

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

#### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "無効なパラメータです",
    "details": {
      "limit": "1から100の間で指定してください",
      "title_levels": "1から8の整数で指定してください"
    }
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

- デフォルトのソート順: `created_at` 降順（新しいユーザーが先頭）
- `currentTitleLevel` は `title_achievements` で `is_current=true` のレコードから取得
- 称号未取得の場合は `1` を返す
- 称号のマスターデータ（名前、色など）はフロントエンドの `TITLE_MASTER` で管理
