# Title Domain バックエンド実装レポート

## 概要

称号ドメインのバックエンドAPI（`GET /titles/{level}/holders`、`GET /users/{userId}/title-achievements`）をオニオンアーキテクチャに従って実装。

称号マスターデータはフロントエンドで管理（`TITLE_MASTER`）し、バックエンドは獲得実績・保持者情報のみを管理する。
現在の称号は獲得済みの最高レベルで自動決定（手動変更不要）。

## 変更ファイル

```
backend/app/
├── domain/
│   ├── repositories/
│   │   └── title_repository.py            # リポジトリI/F・データクラス
│   └── exceptions/
│       └── title.py                       # 称号例外
├── infrastructure/
│   └── db/
│       └── repositories/
│           └── title_repository_impl.py   # リポジトリ実装
├── application/
│   ├── schemas/
│   │   └── title_schemas.py               # DTO
│   └── use_cases/
│       └── title_usecase.py               # ユースケース
├── presentation/
│   ├── api/
│   │   └── title_api.py                   # 称号API
│   └── schemas/
│       └── title_schemas.py               # リクエスト/レスポンス
├── di/
│   └── title.py                           # 依存性注入
└── main.py                                # ルーター登録
```

## APIエンドポイント

### GET /api/v1/titles/{level}/holders

指定レベルの称号保持者一覧を取得。称号詳細モーダルで使用。

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `level` | int | 称号レベル (1-8) |

**認証:** JWT Cookie認証必須（🔐 認証済み）

**レスポンス例:**
```json
{
  "data": {
    "level": 5,
    "holders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "displayName": "山田太郎",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada",
        "achievedAt": "2024-06-20T00:00:00+00:00"
      }
    ],
    "total": 5
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `400`: 称号レベルが1-8の範囲外
- `401`: 未認証

### GET /api/v1/users/{userId}/title-achievements

ユーザーの称号実績を取得。タイトルページのユーザー進捗表示に使用。

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `userId` | UUID | ユーザーID |

**認証:** JWT Cookie認証必須（🔐 認証済み）

**レスポンス例:**
```json
{
  "data": {
    "currentTitleLevel": 5,
    "totalAttendanceDays": 134,
    "achievements": [
      {
        "titleLevel": 1,
        "achievedAt": "2024-01-01T00:00:00+00:00"
      },
      {
        "titleLevel": 2,
        "achievedAt": "2024-01-08T00:00:00+00:00"
      }
    ]
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `401`: 未認証
- `404`: ユーザーが見つからない

## 実装詳細

### Domain層

**データクラス:**
- `TitleHolder` - 称号保持者（id, display_name, avatar_url, achieved_at）
- `TitleHoldersResult` - 保持者一覧結果（level, holders, total）
- `UserTitleAchievement` - ユーザー称号実績（title_level, achieved_at）
- `UserTitleAchievementsResult` - 称号実績結果（current_title_level, total_attendance_days, achievements）

**リポジトリインターフェース:**
- `get_title_holders()` - 指定レベルの保持者一覧取得
- `get_user_title_achievements()` - ユーザーの称号実績取得

**ドメイン例外:**
- `TitleLevelInvalidError` - 称号レベルが1-8の範囲外

### Infrastructure層

**保持者一覧クエリ（3テーブル結合）:**
- title_achievements, users, user_metadata

```python
query = (
    self.session.query(TitleAchievementModel, UserModel, UserMetadataModel)
    .join(UserModel, TitleAchievementModel.user_id == UserModel.id)
    .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
    .filter(TitleAchievementModel.title_level == level)
    .order_by(TitleAchievementModel.achieved_at.asc())
)
```

**称号実績クエリ:**
- title_achievements テーブルから称号実績取得
- attendance_statistics テーブルから参加日数取得
- 現在の称号レベル = MAX(title_level)

### Application層

**DTO:**
- `TitleHolderDTO` - 称号保持者DTO
- `TitleHoldersListDTO` - 保持者一覧DTO
- `UserTitleAchievementDTO` - ユーザー称号実績DTO
- `UserTitleAchievementsDTO` - 称号実績一覧DTO

**Usecaseメソッド:**
- `get_title_holders()` - 指定レベルの保持者一覧取得
- `get_user_title_achievements()` - ユーザーの称号実績取得

### Presentation層

**ルーター構成:**
- `router` - `/titles` プレフィックス用（保持者一覧API）
- `users_title_router` - `/users` プレフィックス用（称号実績API）

**スキーマ:**
- `TitleHolderResponse` / `TitleHoldersAPIResponse` - 保持者一覧
- `UserTitleAchievementResponse` / `UserTitleAchievementsAPIResponse` - 称号実績

### DI層

- `get_title_usecase()` - TitleUsecaseの依存性注入

## DBテーブル

### title_achievements

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 実績ID |
| user_id | UUID | ユーザーID |
| title_level | INTEGER | 称号レベル (1-8) |
| achieved_at | TIMESTAMP WITH TIME ZONE | 獲得日時 |
| created_at | TIMESTAMP WITH TIME ZONE | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | 更新日時 |

**制約:**
- UNIQUE(user_id, title_level)
- CHECK(title_level >= 1 AND title_level <= 8)

### attendance_statistics

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 統計ID |
| user_id | UUID | ユーザーID |
| total_attendance_days | INTEGER | 総参加日数 |

## 設計ポイント

### 称号マスターデータの責務分離

| データ | 保持場所 | 理由 |
|--------|----------|------|
| 称号マスター（名前、説明、必要日数等） | **フロントエンド** | 静的データ、変更頻度低い |
| 誰が何を獲得したか（実績） | **バックエンド** | 動的データ、認証が必要 |
| 参加日数（称号計算の元データ） | **バックエンド** | Discord連携で自動記録 |

### 現在の称号の自動決定

- 現在の称号 = 獲得済みの最高レベル
- `is_current`カラムは不要（DBモデルには存在するが使用しない）
- 手動での称号変更機能は実装しない

## 関連ドキュメント

- `docs/tasks/public/plan/title-api-design.md` - API設計書
- `docs/requirements/11-db.md` - データベース設計
