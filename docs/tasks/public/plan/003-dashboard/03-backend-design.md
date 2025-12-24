# ダッシュボード バックエンド設計

## 概要

ユーザーごとにカスタマイズ可能なダッシュボードのレイアウト情報を永続化する。

---

## 既存実装との整合性チェック

既存バックエンド（User/Goal/Title Domain）と比較した設計方針:

| 項目 | 既存パターン | 本設計への適用 |
|------|-------------|---------------|
| APIプレフィックス | `/api/v1/...` | `/api/v1/dashboard/layout` |
| レスポンス形式 | `{ data, message, timestamp }` | 同形式を採用 |
| アーキテクチャ | オニオンアーキテクチャ | 同構造を採用 |
| 認証 | JWT Cookie認証 | 同方式を採用 |
| 命名規則 | DB: snake_case / Response: camelCase | 同規則を採用 |

---

## 1. 保存が必要なデータ

### 1.1 ダッシュボードレイアウト

各ユーザーのダッシュボード構成を保存する。

| データ | 説明 |
|--------|------|
| ユーザーID | レイアウトの所有者 |
| ブロック一覧 | 配置されているブロックのリスト |

### 1.2 各ブロックの情報

| データ | 型 | 説明 |
|--------|-----|------|
| block_type | string | ブロックの種類（`current-title`, `ranking` など） |
| position_x | int | グリッド上のX座標（0-11） |
| position_y | int | グリッド上のY座標（0以上） |
| width | int | グリッド上の幅（1-12） |
| height | int | グリッド上の高さ（1以上） |
| sort_order | int | 並び順（オプション、Y座標でソート可能なら不要） |

---

## 2. DB設計

### 2.1 テーブル設計

#### Option A: 単一テーブル（JSON列）

```sql
CREATE TABLE dashboard_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocks JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_dashboard_layouts_user_id UNIQUE (user_id)
);

CREATE INDEX idx_dashboard_layouts_user_id ON dashboard_layouts(user_id);
```

**blocks の JSON 構造:**
```json
[
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
```

#### Option B: 正規化テーブル（リレーション）

```sql
-- ダッシュボード（ユーザーごとに1つ）
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_dashboards_user_id UNIQUE (user_id)
);

-- ダッシュボードブロック（1対多）
CREATE TABLE dashboard_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    block_type VARCHAR(50) NOT NULL,
    position_x INT NOT NULL DEFAULT 0,
    position_y INT NOT NULL DEFAULT 0,
    width INT NOT NULL DEFAULT 2,
    height INT NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dashboard_blocks_dashboard_id ON dashboard_blocks(dashboard_id);
```

### 2.2 推奨: Option A（JSON列）

**理由:**
- レイアウトは常に一括で取得・更新される
- ブロック単体の検索・集計は不要
- フロントエンドのデータ構造と1:1でマッピング
- 更新時のトランザクション管理がシンプル
- 将来的なブロック設定の拡張が容易

---

## 3. API設計

### 3.1 エンドポイント一覧

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| GET | `/api/v1/dashboard/layout` | 自分のレイアウトを取得 | 👤 本人のみ |
| PUT | `/api/v1/dashboard/layout` | レイアウトを更新（全体置換） | 👤 本人のみ |

### 3.2 GET /api/v1/dashboard/layout

自分のダッシュボードレイアウトを取得。

**認証:** JWT Cookie認証必須（👤 本人のみ）

**レスポンス:**
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
        "type": "user-stats",
        "x": 3,
        "y": 0,
        "w": 2,
        "h": 3
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

### 3.3 PUT /api/v1/dashboard/layout

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
- `blocks`: 配列（空配列も許可）
- `blocks[].id`: 必須、文字列
- `blocks[].type`: 必須、許可されたブロックタイプのいずれか
- `blocks[].x`: 必須、0-11の整数
- `blocks[].y`: 必須、0以上の整数
- `blocks[].w`: 必須、1-12の整数
- `blocks[].h`: 必須、1以上の整数

**レスポンス（成功時）:**
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

---

## 4. ブロックタイプ定義

### 4.1 許可されるブロックタイプ

```typescript
type DashboardBlockType =
  | 'current-title'     // 現在の称号
  | 'title-journey'     // 称号ジャーニー
  | 'user-stats'        // あなたの記録
  | 'activity-calendar' // 参加カレンダー
  | 'events-calendar'   // イベントカレンダー
  | 'ranking'           // ランキング
  | 'goals-sidebar'     // 目標一覧
  | 'goals-timeline';   // 目標タイムライン
```

### 4.2 各ブロックのサイズ制約（フロントエンド管理）

| type | minW | maxW | minH | maxH | defaultW | defaultH |
|------|------|------|------|------|----------|----------|
| current-title | 2 | 4 | 2 | 3 | 3 | 2 |
| title-journey | 4 | 12 | 2 | 3 | 6 | 2 |
| user-stats | 2 | 4 | 2 | 4 | 2 | 3 |
| activity-calendar | 5 | 12 | 9 | 9 | 7 | 9 |
| events-calendar | 5 | 12 | 9 | 9 | 7 | 9 |
| ranking | 3 | 6 | 4 | 8 | 4 | 6 |
| goals-sidebar | 3 | 6 | 4 | 8 | 4 | 6 |
| goals-timeline | 6 | 12 | 4 | 8 | 8 | 5 |

※ サイズ制約のバリデーションはフロントエンドで行う（バックエンドは基本的な範囲チェックのみ）

---

## 5. データフロー

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend                                │
├─────────────────────────────────────────────────────────────┤
│  1. 初回ロード                                               │
│     GET /api/dashboard/layout                               │
│     └─→ 空なら DEFAULT_LAYOUTS を使用                        │
│                                                              │
│  2. レイアウト変更時（ドラッグ/リサイズ/追加/削除）            │
│     └─→ ローカル state を更新                                │
│     └─→ デバウンス後に PUT /api/dashboard/layout            │
│                                                              │
│  3. 編集モード終了時                                          │
│     └─→ PUT /api/dashboard/layout（未保存の変更があれば）    │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. エラーハンドリング

| ステータス | 状況 | レスポンス |
|-----------|------|-----------|
| 401 | 未認証 | `{ "error": { "code": "UNAUTHORIZED" } }` |
| 400 | バリデーションエラー | `{ "error": { "code": "VALIDATION_ERROR", "details": [...] } }` |
| 500 | サーバーエラー | `{ "error": { "code": "INTERNAL_ERROR" } }` |

---

## 7. 将来の拡張

### 7.1 ブロック固有設定

各ブロックに設定を持たせる場合:

```json
{
  "id": "block-1",
  "type": "ranking",
  "x": 0,
  "y": 0,
  "w": 4,
  "h": 6,
  "settings": {
    "rankingType": "monthly"
  }
}
```

### 7.2 複数ダッシュボード

将来的に複数のダッシュボードをサポートする場合:

```sql
ALTER TABLE dashboard_layouts
ADD COLUMN name VARCHAR(100) DEFAULT 'Default',
ADD COLUMN is_default BOOLEAN DEFAULT true;

-- ユニーク制約を変更
ALTER TABLE dashboard_layouts
DROP CONSTRAINT uq_dashboard_layouts_user_id;

ALTER TABLE dashboard_layouts
ADD CONSTRAINT uq_dashboard_layouts_user_id_name UNIQUE (user_id, name);
```

---

## 8. 実装ファイル構成

既存のオニオンアーキテクチャに従った構成:

```
backend/app/
├── domain/
│   ├── repositories/
│   │   └── dashboard_repository.py       # リポジトリI/F・データクラス
│   └── exceptions/
│       └── dashboard.py                  # ダッシュボード例外（必要に応じて）
├── infrastructure/
│   └── db/
│       └── repositories/
│           └── dashboard_repository_impl.py  # リポジトリ実装
├── application/
│   ├── schemas/
│   │   └── dashboard_schemas.py          # DTO
│   └── use_cases/
│       └── dashboard_usecase.py          # ユースケース
├── presentation/
│   ├── api/
│   │   └── dashboard_api.py              # ダッシュボードAPI
│   └── schemas/
│       └── dashboard_schemas.py          # リクエスト/レスポンス
├── di/
│   └── dashboard.py                      # 依存性注入
└── main.py                               # ルーター登録
```

---

## 9. 実装詳細

### Domain層

**データクラス:**
- `DashboardBlock` - ブロック情報（id, block_type, x, y, w, h）
- `DashboardLayout` - レイアウト情報（user_id, blocks）

**リポジトリインターフェース:**
```python
class DashboardRepository(ABC):
    @abstractmethod
    def get_layout(self, user_id: str) -> DashboardLayout | None:
        """ユーザーのレイアウトを取得"""
        pass

    @abstractmethod
    def upsert_layout(self, user_id: str, blocks: list[DashboardBlock]) -> DashboardLayout:
        """レイアウトを作成/更新"""
        pass
```

### Infrastructure層

**UPSERT処理:**
- 既存レコードがあれば `blocks` を更新
- なければ新規作成
- `updated_at` を更新

### Application層

**DTO:**
- `DashboardBlockDTO` - ブロック情報DTO
- `DashboardLayoutDTO` - レイアウトDTO
- `UpdateLayoutInputDTO` - レイアウト更新入力

**Usecaseメソッド:**
- `get_layout()` - レイアウト取得
- `update_layout()` - レイアウト更新

### Presentation層

**スキーマ:**
- `DashboardBlockResponse` - ブロックレスポンス
- `DashboardLayoutAPIResponse` - レイアウト取得レスポンス
- `UpdateDashboardLayoutRequest` - レイアウト更新リクエスト
- `UpdateDashboardLayoutAPIResponse` - レイアウト更新レスポンス

**共通スキーマ活用:**
- `BaseAPIResponse[T]` - 共通レスポンス形式

### DI層

- `get_dashboard_usecase()` - DashboardUsecaseの依存性注入

---

## 10. 実装チェックリスト

### Backend
- [ ] マイグレーション: `dashboard_layouts` テーブル作成
- [ ] Domain: `DashboardBlock`, `DashboardLayout` データクラス
- [ ] Domain: `DashboardRepository` インターフェース
- [ ] Infrastructure: `DashboardRepositoryImpl` 実装
- [ ] Application: `DashboardBlockDTO`, `DashboardLayoutDTO`
- [ ] Application: `DashboardUsecase` 実装
- [ ] Presentation: リクエスト/レスポンススキーマ
- [ ] Presentation: `dashboard_api.py` エンドポイント
- [ ] DI: `get_dashboard_usecase()` 依存性注入
- [ ] main.py: ルーター登録

### Frontend
- [ ] API Client: `dashboardApi.getLayout()`, `dashboardApi.updateLayout()`
- [ ] Hook: `useDashboardLayout()` をAPI連携に対応
- [ ] デバウンス: レイアウト変更時の自動保存
- [ ] ローディング/エラー状態の表示
