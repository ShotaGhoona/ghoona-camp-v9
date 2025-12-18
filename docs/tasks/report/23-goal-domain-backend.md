# Goal Domain バックエンド実装レポート

## 概要

目標ドメインのバックエンドAPI（`GET /goals/me`、`POST /goals`、`GET /goals/public`、`PUT /goals/{goalId}`、`DELETE /goals/{goalId}`）をオニオンアーキテクチャに従って実装。
全APIで作成者情報（displayName, avatarUrl）を返すように対応。

## 変更ファイル

```
backend/app/
├── domain/
│   ├── repositories/
│   │   └── goal_repository.py            # リポジトリI/F・データクラス
│   └── exceptions/
│       └── goal.py                       # 目標例外
├── infrastructure/
│   └── db/
│       └── repositories/
│           └── goal_repository_impl.py   # リポジトリ実装
├── application/
│   ├── schemas/
│   │   └── goal_schemas.py               # DTO（一覧・作成・更新）
│   └── use_cases/
│       └── goal_usecase.py               # ユースケース
├── presentation/
│   ├── api/
│   │   └── goal_api.py                   # 目標API
│   └── schemas/
│       └── goal_schemas.py               # リクエスト/レスポンス
├── di/
│   └── goal.py                           # 依存性注入
└── main.py                               # ルーター登録
```

## APIエンドポイント

### GET /api/v1/goals/me

自分の目標一覧取得（プライベート・パブリック両方含む）

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | ✅ | 表示対象の年（2000-2100） |
| `month` | int | ✅ | 表示対象の月（1-12） |
| `is_public` | boolean | - | 公開設定フィルター |

**フィルタリングロジック:**
指定月に「かかる」目標を返す:
- 開始日が月末以前 AND (終了日が月初以降 OR 終了日がnull)

**認証:** JWT Cookie認証必須（👤 本人のみ）

### POST /api/v1/goals

新しい目標を作成（201 Created）

**リクエストボディ:**

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `title` | string | ✅ | 最大200文字 |
| `description` | string \| null | - | 目標詳細 |
| `startedAt` | string | - | 開始日（YYYY-MM-DD）、省略時は今日 |
| `endedAt` | string \| null | - | 終了日（YYYY-MM-DD） |
| `isPublic` | boolean | - | 公開設定（default: false） |

**認証:** JWT Cookie認証必須（👤 本人のみ）

### GET /api/v1/goals/public

公開目標一覧取得

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | ✅ | 表示対象の年（2000-2100） |
| `month` | int | ✅ | 表示対象の月（1-12） |
| `user_id` | string | - | 特定ユーザーIDでフィルタリング |

**認証:** JWT Cookie認証必須（🔐 認証済み）

### PUT /api/v1/goals/{goal_id}

目標を更新（部分更新対応）

**リクエストボディ（すべてオプショナル）:**

| フィールド | 型 | 制約 |
|-----------|-----|------|
| `title` | string | 最大200文字 |
| `description` | string \| null | 目標詳細 |
| `startedAt` | string | 開始日（YYYY-MM-DD） |
| `endedAt` | string \| null | 終了日（YYYY-MM-DD） |
| `isPublic` | boolean | 公開設定 |

**認証:** JWT Cookie認証必須（👤 本人のみ）

**エラーレスポンス:**
- `401`: 未認証
- `403`: 権限なし（他人の目標）
- `404`: 目標不在
- `400`: バリデーションエラー

### DELETE /api/v1/goals/{goal_id}

目標を削除

**認証:** JWT Cookie認証必須（👤 本人のみ）

**エラーレスポンス:**
- `401`: 未認証
- `403`: 権限なし（他人の目標）
- `404`: 目標不在

## 実装詳細

### Domain層

**データクラス:**
- `GoalSearchFilter` - 自分の目標検索フィルター（user_id, year, month, is_public）
- `PublicGoalSearchFilter` - 公開目標検索フィルター（year, month, user_id）
- `GoalCreator` - 目標作成者情報（id, display_name, avatar_url）
- `GoalItem` - 目標アイテム（10フィールド + creator）
- `GoalListResult` - 目標一覧結果（goals, total）
- `GoalCreateData` - 目標作成データ
- `GoalUpdateData` - 目標更新データ（部分更新用）

**リポジトリインターフェース:**
- `get_my_goals()` - 自分の目標一覧取得
- `create()` - 目標作成
- `get_public_goals()` - 公開目標一覧取得
- `get_by_id()` - ID検索
- `update()` - 目標更新
- `delete()` - 目標削除

**ドメイン例外:**
- `GoalNotFoundError` - 目標不在
- `GoalForbiddenError` - 権限エラー

### Infrastructure層

**クエリ:**
- goals + users + user_metadata テーブルをJOINして取得
- 全メソッドでcreator情報（displayName, avatarUrl）を返却

```python
# JOINクエリ例
query = (
    self.session.query(GoalModel, UserModel, UserMetadataModel)
    .join(UserModel, GoalModel.user_id == UserModel.id)
    .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
    .filter(...)
)
```

**フィルタリング:**
- 月にかかる目標: `started_at <= month_end AND (ended_at >= month_start OR ended_at IS NULL)`
- is_public フィルター
- user_id フィルター

**作成処理:**
- started_at 未指定時は `date.today()` を使用
- 作成後、JOINクエリで再取得してcreator情報を含めて返却

**更新処理:**
- 部分更新（指定されたフィールドのみ更新）
- 更新後、JOINクエリで再取得してcreator情報を含めて返却

**削除処理:**
- 物理削除

### Application層

**DTO:**
- `GoalCreatorDTO` - 目標作成者情報（id, display_name, avatar_url）
- `GoalItemDTO` - 目標アイテム（creator含む）
- `MyGoalsListDTO` - 自分の目標一覧
- `PublicGoalsListDTO` - 公開目標一覧
- `CreateGoalInputDTO` - 目標作成入力
- `UpdateGoalInputDTO` - 目標更新入力

**Usecaseメソッド:**
- `get_my_goals()` - 自分の目標一覧取得
- `create_goal()` - 目標作成
- `get_public_goals()` - 公開目標一覧取得
- `update_goal()` - 目標更新（権限チェック付き）
- `delete_goal()` - 目標削除（権限チェック付き）

**エラーハンドリング:**
- Usecaseでドメイン例外を投げる
- Presentation層でキャッチしてHTTPExceptionに変換

### Presentation層

**スキーマ:**
- `GoalCreatorResponse` - 目標作成者レスポンス（id, displayName, avatarUrl）
- `GoalItemResponse` - 目標アイテムレスポンス（creator含む）
- `MyGoalsListAPIResponse` - 自分の目標一覧レスポンス
- `PublicGoalsListAPIResponse` - 公開目標一覧レスポンス
- `CreateGoalRequest` / `CreateGoalAPIResponse` - 目標作成
- `UpdateGoalRequest` / `UpdateGoalAPIResponse` - 目標更新
- `DeleteGoalAPIResponse` - 目標削除

**共通スキーマ活用:**
- `BaseAPIResponse[T]` - 共通レスポンス形式
- `ErrorResponse` - エラーレスポンス

### DI層

- `get_goal_usecase()` - GoalUsecaseの依存性注入

## レスポンス例

### GET /api/v1/goals/me

```json
{
  "data": {
    "goals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "userId": "550e8400-e29b-41d4-a716-446655440001",
        "title": "毎朝6時に起きる",
        "description": "朝活を習慣化するため",
        "startedAt": "2025-01-01",
        "endedAt": "2025-03-31",
        "isActive": true,
        "isPublic": true,
        "createdAt": "2025-01-01T00:00:00",
        "updatedAt": "2025-01-01T00:00:00",
        "creator": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "displayName": "田中太郎",
          "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
        }
      }
    ],
    "total": 1
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### POST /api/v1/goals

```json
{
  "data": {
    "goal": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "title": "毎朝6時に起きる",
      "description": "朝活を習慣化するため",
      "startedAt": "2025-01-01",
      "endedAt": "2025-03-31",
      "isActive": true,
      "isPublic": true,
      "createdAt": "2025-01-01T00:00:00",
      "updatedAt": "2025-01-01T00:00:00",
      "creator": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "displayName": "田中太郎",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
      }
    }
  },
  "message": "目標を作成しました",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

## 関連ドキュメント

- `docs/requirements/12-api.md` - API設計書（Goal Management セクション）
- `docs/requirements/11-db.md` - データベース設計（goals テーブル）
