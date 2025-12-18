# POST /users/{userId}/rivals - ライバル追加API

## Overview
新しいライバルを追加するAPI。
メンバー詳細モーダルの「ライバルに設定する」ボタンで使用。

**制約:** 最大3人まで

## Endpoint
```
POST /api/v1/users/{userId}/rivals
```

## Access Control
- **認証**: 🔐 必須（JWT Cookie認証）
- **権限**: 👤 本人のみ（自分のライバルのみ追加可能）

## Path Parameters

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `userId` | string (UUID) | ✅ | ユーザーID |

## Request Body

```json
{
  "rivalUserId": "550e8400-e29b-41d4-a716-446655440002"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `rivalUserId` | string (UUID) | ✅ | ライバルに設定するユーザーID |

## Response

### Success Response (201 Created)

```json
{
  "data": {
    "rival": {
      "id": "rival-003",
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
      "createdAt": "2025-01-21T10:00:00Z"
    },
    "remainingSlots": 2
  },
  "message": "ライバルを追加しました",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### Response Fields

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `rival` | Rival | 追加されたライバル情報 |
| `remainingSlots` | number | 残り登録可能数 |

※ Rival / RivalUser Object の詳細は `GET /users/{userId}/rivals` を参照

### Error Responses

#### 400 Bad Request - 自分自身を指定
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "自分自身をライバルに設定することはできません"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

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
    "message": "このユーザーのライバルを追加する権限がありません"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

#### 404 Not Found - 対象ユーザーが存在しない
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたユーザーが見つかりません"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

#### 409 Conflict - 既にライバル登録済み
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "このユーザーは既にライバルに設定されています"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

#### 409 Conflict - 上限到達
```json
{
  "error": {
    "code": "RIVAL_LIMIT_EXCEEDED",
    "message": "ライバルは最大3人までです"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

## Validation Rules

1. **自分自身は不可**: `rivalUserId` が自分のIDと同じ場合はエラー
2. **重複不可**: 既にライバル登録済みの場合はエラー
3. **上限チェック**: 既に3人登録済みの場合はエラー
4. **存在チェック**: `rivalUserId` が存在し、`is_active=true` であること

## Data Sources

| テーブル | 操作 |
|---------|------|
| `user_rivals` | INSERT |

## Business Rules

- ライバル設定は**一方向**（AがBをライバルにしてもBには影響なし）
- ライバルに設定されたことは相手に**通知しない**（プライバシー配慮）

## Related Endpoints

- `GET /users/{userId}/rivals` - ライバル一覧取得
- `DELETE /users/{userId}/rivals/{rivalId}` - ライバル削除
