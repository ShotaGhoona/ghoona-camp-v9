# DELETE /users/{userId}/rivals/{rivalId} - ライバル削除API

## Overview
ライバル関係を解除するAPI。

## Endpoint
```
DELETE /api/v1/users/{userId}/rivals/{rivalId}
```

## Access Control
- **認証**: 🔐 必須（JWT Cookie認証）
- **権限**: 👤 本人のみ（自分のライバルのみ削除可能）

## Path Parameters

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `userId` | string (UUID) | ✅ | ユーザーID |
| `rivalId` | string (UUID) | ✅ | ライバル関係ID（`user_rivals.id`） |

## Response

### Success Response (200 OK)

```json
{
  "data": {
    "remainingSlots": 2
  },
  "message": "ライバルを解除しました",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### Response Fields

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `remainingSlots` | number | 残り登録可能数 |

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
    "message": "このライバル関係を解除する権限がありません"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

#### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたライバル関係が見つかりません"
  },
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

## Data Sources

| テーブル | 操作 |
|---------|------|
| `user_rivals` | DELETE |

## Related Endpoints

- `GET /users/{userId}/rivals` - ライバル一覧取得
- `POST /users/{userId}/rivals` - ライバル追加
