# User API 実装レポート

## 概要

ユーザードメインのバックエンドAPI（`GET /users`、`GET /users/{userId}`）をオニオンアーキテクチャに従って実装。

## 変更ファイル

```
backend/app/
├── domain/
│   └── repositories/
│       └── user_repository.py         # リポジトリI/F・データクラス
├── infrastructure/
│   └── db/
│       ├── repositories/
│       │   └── user_repository_impl.py # リポジトリ実装
│       └── session.py                  # get_db追加
├── application/
│   ├── schemas/
│   │   └── user_schemas.py            # DTO
│   └── use_cases/
│       └── user_usecase.py            # ユースケース
├── presentation/
│   ├── api/
│   │   └── user_api.py                # APIエンドポイント
│   └── schemas/
│       └── user_schemas.py            # リクエスト/レスポンス
├── di/
│   └── user.py                        # 依存性注入
└── main.py                            # ルーター登録
```

## APIエンドポイント

### GET /api/v1/users

メンバー一覧取得（検索・フィルタ・ページネーション対応）

**クエリパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `search` | string | キーワード検索（displayName, tagline） |
| `skills` | string | スキルフィルタ（カンマ区切り、OR検索） |
| `interests` | string | 興味フィルタ（カンマ区切り、OR検索） |
| `title_levels` | string | 称号レベルフィルタ（カンマ区切り、1-8） |
| `limit` | int | 取得件数（default: 20, max: 100） |
| `offset` | int | オフセット |

**レスポンス（一覧用）:**

```json
{
  "data": {
    "users": [
      {
        "id": "uuid",
        "avatarUrl": "https://...",
        "displayName": "やまたろ",
        "tagline": "毎朝5時起き継続中！",
        "currentTitleLevel": 4
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

### GET /api/v1/users/{user_id}

ユーザー詳細取得（メタデータ・SNSリンク・参加統計・称号含む）

**レスポンス（詳細用）:**

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "username": "yamada_taro",
      "avatarUrl": "https://...",
      "displayName": "やまたろ",
      "tagline": "毎朝5時起き継続中！",
      "bio": "エンジニア×朝活で人生変えます",
      "skills": ["TypeScript", "React"],
      "interests": ["読書", "ランニング"],
      "vision": "フルスタックエンジニアとして独立する",
      "isVisionPublic": true,
      "socialLinks": [
        {"id": "uuid", "platform": "twitter", "url": "https://...", "title": "X"}
      ],
      "totalAttendanceDays": 78,
      "currentStreakDays": 12,
      "maxStreakDays": 21,
      "currentTitleLevel": 4,
      "joinedAt": "2025-01-01T00:00:00+00:00"
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

## 実装詳細

### Domain層

**データクラス:**
- `UserSearchFilter` - 検索フィルター条件
- `UserListItem` - 一覧用データ（5フィールド）
- `PaginatedUserList` - ページネーション付き一覧
- `UserWithDetails` - 詳細用データ（全フィールド）

**リポジトリインターフェース:**
- `get_users_list()` - 一覧取得
- `get_user_detail_by_id()` - 詳細取得

### Infrastructure層

**一覧クエリ（3テーブル結合）:**
- users, user_metadata, title_achievements

**詳細クエリ（6テーブル結合）:**
- users, user_metadata, user_visions, user_social_links, attendance_statistics, title_achievements

**フィルタリング:**
- search: ILIKE（部分一致）
- skills/interests: ARRAY overlap（OR検索）
- title_levels: IN検索

## 関連ドキュメント

- `docs/requirements/api/user/get-users.md`
- `docs/requirements/api/user/get-user-by-id.md`
