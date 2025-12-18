# GET /users/{userId}/rivals - ライバル一覧取得API

## Overview
ユーザーが設定したライバル一覧を取得するAPI。
ダッシュボードでの比較表示に使用。

**制約:** 最大3人まで

## Endpoint
```
GET /api/v1/users/{userId}/rivals
```

## Access Control
- **認証**: 🔐 必須（JWT Cookie認証）
- **権限**: 👤 本人のみ（自分のライバル一覧のみ取得可能）

## Path Parameters

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `userId` | string (UUID) | ✅ | ユーザーID |

## Response

### Success Response (200 OK)

```json
{
  "data": {
    "rivals": [
      {
        "id": "rival-001",
        "rivalUser": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "username": "suzuki_hanako",
          "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki",
          "displayName": "鈴木花子",
          "tagline": "デザイナー × 朝活コミュニティ運営",
          "totalAttendanceDays": 234,
          "currentStreakDays": 67,
          "maxStreakDays": 67,
          "currentTitleLevel": 7
        },
        "createdAt": "2024-12-01T00:00:00Z"
      },
      {
        "id": "rival-002",
        "rivalUser": {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "username": "tanaka_jiro",
          "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka",
          "displayName": "田中二郎",
          "tagline": "スタートアップCTO / 朝型人間",
          "totalAttendanceDays": 312,
          "currentStreakDays": 89,
          "maxStreakDays": 120,
          "currentTitleLevel": 8
        },
        "createdAt": "2024-11-15T00:00:00Z"
      }
    ],
    "maxRivals": 3,
    "remainingSlots": 1
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### Response Fields

#### Root Data

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `rivals` | Rival[] | ライバル一覧 |
| `maxRivals` | number | 最大登録可能数（固定: 3） |
| `remainingSlots` | number | 残り登録可能数 |

#### Rival Object

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | string (UUID) | ライバル関係ID |
| `rivalUser` | RivalUser | ライバルユーザー情報 |
| `createdAt` | string (ISO 8601) | ライバル設定日時 |

#### RivalUser Object（比較表示用）

| フィールド | 型 | Nullable | 説明 |
|-----------|-----|----------|------|
| `id` | string (UUID) | ❌ | ユーザーID |
| `username` | string | ❌ | ユーザー名 |
| `avatarUrl` | string | ✅ | アバター画像URL |
| `displayName` | string | ❌ | 表示名 |
| `tagline` | string | ✅ | 一言プロフィール |
| `totalAttendanceDays` | number | ❌ | 総参加日数 |
| `currentStreakDays` | number | ❌ | 現在の連続参加日数 |
| `maxStreakDays` | number | ❌ | 最大連続参加日数 |
| `currentTitleLevel` | number (1-8) | ❌ | 現在の称号レベル |

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

#### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "このユーザーのライバル一覧を取得する権限がありません"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

## Data Sources

| テーブル | 取得フィールド |
|---------|---------------|
| `user_rivals` | id, rival_user_id, created_at |
| `users` | id, username, avatar_url |
| `user_metadata` | display_name, tagline |
| `attendance_statistics` | total_attendance_days, current_streak_days, max_streak_days |
| `title_achievements` | title_level (is_current=true) |

## Related Endpoints

- `POST /users/{userId}/rivals` - ライバル追加
- `DELETE /users/{userId}/rivals/{rivalId}` - ライバル削除
