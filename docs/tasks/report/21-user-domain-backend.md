# User Domain バックエンド実装レポート

## 概要

ユーザードメインのバックエンドAPI（`GET /users`、`GET /users/{userId}`、`PUT /users/{userId}`）および認証機能をオニオンアーキテクチャに従って実装。

## 変更ファイル

```
backend/app/
├── domain/
│   ├── entities/
│   │   └── user.py                       # ユーザーエンティティ
│   ├── repositories/
│   │   └── user_repository.py            # リポジトリI/F・データクラス
│   └── exceptions/
│       ├── auth.py                       # 認証例外
│       └── user.py                       # ユーザー例外
├── infrastructure/
│   ├── db/
│   │   ├── repositories/
│   │   │   └── user_repository_impl.py   # リポジトリ実装
│   │   └── session.py                    # get_db
│   └── security/
│       └── security_service_impl.py      # JWT認証
├── application/
│   ├── interfaces/
│   │   └── security_service.py           # セキュリティI/F
│   ├── schemas/
│   │   └── user_schemas.py               # DTO（一覧・詳細・認証・更新）
│   └── use_cases/
│       └── user_usecase.py               # ユースケース
├── presentation/
│   ├── api/
│   │   ├── user_api.py                   # ユーザーAPI
│   │   └── auth_api.py                   # 認証API
│   └── schemas/
│       ├── user_schemas.py               # リクエスト/レスポンス
│       └── auth_schemas.py               # 認証スキーマ
├── di/
│   └── user.py                           # 依存性注入
└── main.py                               # ルーター登録
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

### GET /api/v1/users/{user_id}

ユーザー詳細取得（メタデータ・SNSリンク・参加統計・称号含む）

### PUT /api/v1/users/{user_id}

ユーザープロフィール更新（本人のみ）

**認証:** JWT Cookie認証必須

**リクエストボディ（すべてオプショナル）:**

| フィールド | 型 | 制約 |
|-----------|-----|------|
| `username` | string | 最大100文字、英数字と`_`のみ、一意 |
| `avatarUrl` | string \| null | 有効なURL |
| `displayName` | string | 最大100文字 |
| `tagline` | string \| null | 最大150文字 |
| `bio` | string \| null | 最大1000文字 |
| `skills` | string[] | 各最大50文字、最大20個 |
| `interests` | string[] | 各最大50文字、最大20個 |
| `vision` | string \| null | 最大500文字 |
| `isVisionPublic` | boolean | - |
| `socialLinks` | SocialLinkInput[] | 最大10個、全置換 |

**エラーレスポンス:**
- `401`: 未認証
- `403`: 権限なし（他人のプロフィール）
- `404`: ユーザー不在
- `400`: バリデーションエラー
- `409`: usernameの重複

### 認証API

| エンドポイント | 説明 |
|---------------|------|
| `POST /api/v1/auth/login` | ログイン（Cookie設定） |
| `POST /api/v1/auth/logout` | ログアウト（Cookie削除） |
| `GET /api/v1/auth/me` | 現在のユーザー情報取得 |

## 実装詳細

### Domain層

**データクラス:**
- `UserSearchFilter` - 検索フィルター条件
- `UserListItem` - 一覧用データ（5フィールド）
- `PaginatedUserList` - ページネーション付き一覧
- `UserWithDetails` - 詳細用データ（全フィールド）
- `SocialLinkInput` - SNSリンク入力
- `UserProfileUpdateData` - プロフィール更新データ

**リポジトリインターフェース:**
- `get_users_list()` - 一覧取得
- `get_user_detail_by_id()` - 詳細取得
- `get_by_username()` - ユーザー名で取得
- `update_user_profile()` - プロフィール更新

**ドメイン例外:**
- `UserNotFoundError` - ユーザー不在
- `UsernameAlreadyExistsError` - ユーザー名重複
- `ForbiddenError` - 権限エラー
- `InvalidCredentialsError` - 認証失敗

### Infrastructure層

**一覧クエリ（3テーブル結合）:**
- users, user_metadata, title_achievements

**詳細クエリ（6テーブル結合）:**
- users, user_metadata, user_visions, user_social_links, attendance_statistics, title_achievements

**更新処理（4テーブル）:**
- users: username, avatar_url
- user_metadata: display_name, tagline, bio, skills, interests（UPSERT）
- user_visions: vision, is_public（UPSERT）
- user_social_links: 全置換（DELETE + INSERT）

**フィルタリング:**
- search: ILIKE（部分一致）
- skills/interests: ARRAY overlap（OR検索）
- title_levels: IN検索

### Application層

**DTO:**
- `UserListItemDTO` / `UserDetailDTO` - 一覧・詳細
- `LoginInputDTO` / `LoginOutputDTO` - ログイン
- `UpdateUserProfileInputDTO` - プロフィール更新

**エラーハンドリング:**
- Usecaseでドメイン例外を投げる
- Presentation層でキャッチしてHTTPExceptionに変換

### DI層

- `get_user_usecase()` - ユーザー一覧・詳細用
- `get_user_usecase_with_auth()` - 認証機能付き

## 関連ドキュメント

- `docs/requirements/api/user/get-users.md`
- `docs/requirements/api/user/get-user-by-id.md`
- `docs/requirements/api/user/put-user.md`
