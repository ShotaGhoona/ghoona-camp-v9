# Alembic マイグレーション入門ガイド

## マイグレーションとは？

**データベースの「設計変更履歴」を管理する仕組み**です。

Gitがコードの変更履歴を管理するように、Alembicはデータベース構造の変更履歴を管理します。

```
コードの世界        →  Git でバージョン管理
データベースの世界  →  Alembic でバージョン管理
```

---

## なぜマイグレーションが必要？

### マイグレーションがない場合

```mermaid
flowchart LR
    A[開発者A] -->|直接SQL実行| DB[(データベース)]
    B[開発者B] -->|直接SQL実行| DB
    C[本番環境] -->|手動で同じSQLを実行...| DB2[(本番DB)]

    style DB fill:#f66,stroke:#333
    style DB2 fill:#f66,stroke:#333
```

**問題点:**
- 誰がいつ何を変更したか分からない
- 本番環境への反映漏れ
- チームでの共有が困難

### マイグレーションがある場合

```mermaid
flowchart LR
    A[開発者A] -->|コード変更| M[マイグレーションファイル]
    B[開発者B] -->|コード変更| M
    M -->|自動適用| DB[(開発DB)]
    M -->|同じファイルで自動適用| DB2[(本番DB)]

    style DB fill:#6f6,stroke:#333
    style DB2 fill:#6f6,stroke:#333
```

**解決:**
- 変更履歴がファイルとして残る
- Gitで共有できる
- どの環境でも同じ手順で適用できる

---

## 全体の流れ

```mermaid
flowchart TB
    subgraph Step1["Step 1: モデル定義"]
        A[user_model.py<br/>goal_model.py<br/>など]
    end

    subgraph Step2["Step 2: マイグレーション作成"]
        B[make db-migrate]
        C[マイグレーションファイル生成<br/>versions/xxx_create_all_tables.py]
    end

    subgraph Step3["Step 3: マイグレーション適用"]
        D[make db-upgrade]
        E[(PostgreSQL<br/>実際のテーブル作成)]
    end

    A --> B
    B --> C
    C --> D
    D --> E

    style A fill:#e1f5fe
    style C fill:#fff9c4
    style E fill:#c8e6c9
```

---

## 関連ファイルの構造

```
backend/
├── alembic/
│   ├── env.py              ← Alembicの設定ファイル（モデルを読み込む）
│   ├── versions/           ← マイグレーションファイルが生成される場所
│   │   └── xxx_create_all_tables.py  ← 実行後にここに作成される
│   └── script.py.mako      ← マイグレーションファイルのテンプレート
│
├── alembic.ini             ← Alembicの基本設定
│
└── app/
    └── infrastructure/
        └── db/
            └── models/     ← ここのモデル定義を元にマイグレーションが作られる
                ├── __init__.py
                ├── user_model.py
                ├── goal_model.py
                └── ...
```

---

## 各コマンドの詳細

### `make db-migrate msg='create all tables'`

```mermaid
sequenceDiagram
    participant You as あなた
    participant Alembic
    participant Models as DBモデル
    participant DB as PostgreSQL
    participant File as マイグレーションファイル

    You->>Alembic: make db-migrate 実行
    Alembic->>Models: モデル定義を読み込み
    Alembic->>DB: 現在のDB状態を確認
    Alembic->>Alembic: 差分を計算
    Alembic->>File: マイグレーションファイル生成
    Note over File: versions/xxx_create_all_tables.py
```

**何が起きる？**
1. `app/infrastructure/db/models/` のモデル定義を読み込む
2. 現在のデータベースの状態と比較
3. 差分を検出して、マイグレーションファイルを自動生成

**生成されるファイルの例:**
```python
# versions/abc123_create_all_tables.py

def upgrade():
    # DBをアップグレードする処理
    op.create_table('users',
        sa.Column('id', UUID(), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False),
        ...
    )

def downgrade():
    # 元に戻す処理（ロールバック用）
    op.drop_table('users')
```

---

### `make db-upgrade`

```mermaid
sequenceDiagram
    participant You as あなた
    participant Alembic
    participant File as マイグレーションファイル
    participant DB as PostgreSQL

    You->>Alembic: make db-upgrade 実行
    Alembic->>File: 未適用のマイグレーションを確認
    Alembic->>DB: upgrade()関数を実行
    DB->>DB: テーブル作成/変更
    Alembic->>DB: 適用済みとして記録
    Note over DB: alembic_versionテーブルに記録
```

**何が起きる？**
1. 未適用のマイグレーションファイルを探す
2. `upgrade()` 関数を実行
3. 実際にデータベースにテーブルが作成される
4. `alembic_version` テーブルに適用済みとして記録

---

## 今回の実行で何が起きるか

```mermaid
flowchart LR
    subgraph Before["実行前"]
        DB1[(PostgreSQL)]
        Note1[テーブルなし]
    end

    subgraph After["実行後"]
        DB2[(PostgreSQL)]
        T1[users]
        T2[user_metadata]
        T3[goals]
        T4[events]
        T5[...]
    end

    Before -->|make db-migrate<br/>make db-upgrade| After
    DB2 --- T1
    DB2 --- T2
    DB2 --- T3
    DB2 --- T4
    DB2 --- T5

    style DB1 fill:#ffcdd2
    style DB2 fill:#c8e6c9
```

**作成されるテーブル一覧:**
- `users` - ユーザー基本情報
- `user_metadata` - ユーザー詳細情報
- `user_visions` - ビジョン
- `user_social_links` - SNSリンク
- `user_rivals` - ライバル関係
- `goals` - 目標
- `events` - イベント
- `event_participants` - イベント参加者
- `title_achievements` - 称号実績
- `attendance_logs` - 参加ログ
- `attendance_summaries` - 参加サマリー
- `attendance_statistics` - 参加統計
- `notifications` - 通知
- `notification_settings` - 通知設定
- `alembic_version` - マイグレーション管理用

---

## よく使うコマンド

| コマンド | 説明 |
|---------|------|
| `make db-migrate msg='xxx'` | マイグレーションファイル作成 |
| `make db-upgrade` | マイグレーション適用 |
| `make db-downgrade` | 1つ前の状態に戻す |
| `make db-current` | 現在のバージョン確認 |
| `make db-history` | マイグレーション履歴確認 |

---

## まとめ

```mermaid
flowchart TB
    A[Pythonでモデル定義] -->|自動変換| B[マイグレーションファイル]
    B -->|自動実行| C[実際のDBテーブル]

    style A fill:#e3f2fd
    style B fill:#fff9c4
    style C fill:#e8f5e9
```

**ポイント:**
- SQLを直接書かなくてOK
- Pythonのモデル定義から自動でDB構造が作られる
- 変更履歴がファイルとして残り、チームで共有できる
- どの環境でも同じコマンドで同じ状態を再現できる
