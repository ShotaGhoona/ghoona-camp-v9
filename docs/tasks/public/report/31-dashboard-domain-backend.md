# Dashboard Domain バックエンド実装レポート

## 概要

ダッシュボードドメインのバックエンドAPI（レイアウト永続化機能）をオニオンアーキテクチャに従って実装。

**エンドポイント一覧:**
- `GET /dashboard/layout` - ダッシュボードレイアウト取得
- `PUT /dashboard/layout` - ダッシュボードレイアウト更新

ユーザーごとにカスタマイズ可能なダッシュボードのブロック配置情報を永続化。

## 変更ファイル

```
backend/app/
├── domain/
│   ├── repositories/
│   │   └── dashboard_repository.py            # リポジトリI/F・データクラス
│   └── exceptions/
│       └── dashboard.py                       # ダッシュボード例外
├── infrastructure/
│   └── db/
│       ├── models/
│       │   └── dashboard_model.py             # DBモデル
│       └── repositories/
│           └── dashboard_repository_impl.py   # リポジトリ実装
├── application/
│   ├── schemas/
│   │   └── dashboard_schemas.py               # DTO
│   └── use_cases/
│       └── dashboard_usecase.py               # ユースケース
├── presentation/
│   ├── api/
│   │   └── dashboard_api.py                   # ダッシュボードAPI
│   └── schemas/
│       └── dashboard_schemas.py               # リクエスト/レスポンス
├── di/
│   └── dashboard.py                           # 依存性注入
└── main.py                                    # ルーター登録
```

## APIエンドポイント

### GET /api/v1/dashboard/layout

自分のダッシュボードレイアウトを取得。

**認証:** JWT Cookie認証必須（👤 本人のみ）

**レスポンス例:**
```json
{
  "data": {
    "blocks": [
      {
        "id": "block-1",
        "type": "current-title",
        "x": 0,
        "y": 0,
        "w": 3,
        "h": 2
      },
      {
        "id": "block-2",
        "type": "ranking",
        "x": 3,
        "y": 0,
        "w": 4,
        "h": 6
      }
    ]
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**未設定時（初回アクセス）:**
```json
{
  "data": {
    "blocks": []
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

※ フロントエンドでデフォルトレイアウトを適用

**エラーレスポンス:**
- `401`: 未認証

---

### PUT /api/v1/dashboard/layout

ダッシュボードレイアウトを更新（全体置換）。

**認証:** JWT Cookie認証必須（👤 本人のみ）

**リクエストボディ:**
```json
{
  "blocks": [
    {
      "id": "block-1",
      "type": "current-title",
      "x": 0,
      "y": 0,
      "w": 3,
      "h": 2
    },
    {
      "id": "block-2",
      "type": "ranking",
      "x": 3,
      "y": 0,
      "w": 4,
      "h": 6
    }
  ]
}
```

**バリデーション:**

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `blocks` | array | ○ | 空配列も許可 |
| `blocks[].id` | string | ○ | ブロックID |
| `blocks[].type` | string | ○ | ブロックタイプ |
| `blocks[].x` | int | ○ | 0-11（グリッドX座標） |
| `blocks[].y` | int | ○ | 0以上（グリッドY座標） |
| `blocks[].w` | int | ○ | 1-12（グリッド幅） |
| `blocks[].h` | int | ○ | 1以上（グリッド高さ） |

**レスポンス例（成功時）:**
```json
{
  "data": {
    "blocks": [...]
  },
  "message": "レイアウトを更新しました",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `400`: バリデーションエラー
- `401`: 未認証

## 実装詳細

### Domain層

**データクラス:**
- `DashboardBlock` - ブロック情報（id, block_type, x, y, w, h）
- `DashboardLayout` - レイアウト情報（user_id, blocks, created_at, updated_at）
- `DashboardLayoutCreateData` - レイアウト作成データ（user_id, blocks）
- `DashboardLayoutUpdateData` - レイアウト更新データ（blocks）

**リポジトリインターフェース（IDashboardRepository）:**
- `get_layout()` - ユーザーのレイアウト取得
- `create()` - レイアウト作成
- `update()` - レイアウト更新

**ドメイン例外:**
- `DashboardLayoutNotFoundError` - レイアウトが見つからない

### Infrastructure層

**DBモデル（DashboardLayoutModel）:**
- JSONB列でブロック配列を保存
- ユーザーごとに1レコード（user_id UNIQUE）

**リポジトリ実装:**
- `get_layout()` - user_idでSELECT
- `create()` - 新規INSERT
- `update()` - user_idでUPDATE（SQLAlchemyのonupdateでtimestamp自動更新）

**ブロックJSON構造:**
```json
[
  {
    "id": "block-1",
    "type": "current-title",
    "x": 0,
    "y": 0,
    "w": 3,
    "h": 2
  }
]
```

### Application層

**DTO:**
- `DashboardBlockDTO` - ブロック情報DTO
- `DashboardLayoutDTO` - レイアウトDTO
- `UpdateDashboardLayoutInputDTO` - レイアウト更新入力DTO

**Usecaseメソッド:**
- `get_layout()` - レイアウト取得（未設定時は空配列を返す）
- `update_layout()` - レイアウト更新（存在しない場合は作成）

### Presentation層

**スキーマ:**
- `DashboardBlockResponse` - ブロックレスポンス
- `DashboardLayoutDataResponse` - レイアウトデータレスポンス
- `DashboardLayoutAPIResponse` - レイアウト取得APIレスポンス
- `DashboardBlockRequest` - ブロックリクエスト（バリデーション付き）
- `UpdateDashboardLayoutRequest` - レイアウト更新リクエスト
- `UpdateDashboardLayoutAPIResponse` - レイアウト更新APIレスポンス

### DI層

- `get_dashboard_usecase()` - DashboardUsecaseの依存性注入

## DBテーブル

### dashboard_layouts

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | レイアウトID |
| user_id | UUID | ユーザーID（UNIQUE） |
| blocks | JSONB | ブロック配列 |
| created_at | TIMESTAMP WITH TIME ZONE | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | 更新日時 |

**インデックス:**
- `user_id` - UNIQUE + INDEX

## ブロックタイプ定義

フロントエンドで定義されるブロックタイプ:

| type | 説明 | defaultW | defaultH |
|------|------|----------|----------|
| `current-title` | 現在の称号 | 3 | 2 |
| `title-journey` | 称号ジャーニー | 6 | 2 |
| `user-stats` | あなたの記録 | 2 | 3 |
| `activity-calendar` | 参加カレンダー | 7 | 9 |
| `events-calendar` | イベントカレンダー | 7 | 9 |
| `ranking` | ランキング | 4 | 6 |
| `goals-sidebar` | 目標一覧 | 4 | 6 |
| `goals-timeline` | 目標タイムライン | 8 | 5 |

※ サイズ制約のバリデーションはフロントエンドで実施

## 設計ポイント

### JSON列によるシンプルな設計

- レイアウトは常に一括で取得・更新されるため、JSONB列で保存
- ブロック単体の検索・集計は不要
- フロントエンドのデータ構造と1:1でマッピング
- 将来的なブロック設定（settings）の拡張が容易

### 未設定時のハンドリング

- 初回アクセス時は空配列を返す（404ではない）
- フロントエンドでデフォルトレイアウトを適用
- 初回保存時にレコードが自動作成される

### CRUD分離

既存パターンに合わせて `create` と `update` を分離:
- Usecase層で存在確認 → create/update を判断
- リポジトリはシンプルな単一責務

## 関連ドキュメント

- `docs/tasks/public/plan/003-dashboard/03-backend-design.md` - バックエンド設計書
