# AI Solution Template

**Next.js 15 + FastAPI + AWS CDK** で構築されたエンタープライズグレードのフルスタックテンプレート

## 📖 プロジェクト概要

このリポジトリは、受託の新規プロジェクトを素早く立ち上げるための開発基盤テンプレートです。

### 🎯 このリポジトリの役割

- **フロントエンド**: Next.js 15 (App Router) + FSD アーキテクチャ
- **バックエンド**: FastAPI + オニオンアーキテクチャ
- **インフラ**: AWS CDK + 4層レイヤードアーキテクチャ
- **CI/CD**: GitHub Actions + AWS OIDC

### 技術スタック

#### Frontend
- **Next.js 15.3.2** (App Router) + **React 19.2.0** + **TypeScript 5.4.5**
- **shadcn/ui** + **Tailwind CSS 3.4.3**
- **Redux Toolkit 2.2.0** (グローバル状態管理)
- **TanStack React Query 5.28.0** (サーバー状態管理)
- **React Hook Form 7.51.0** + **Zod 3.22.4** (フォーム管理)

#### Backend
- **FastAPI** + **Python 3.11+**
- **PostgreSQL 15**
- **JWT 認証** (RS256)
- **SQLAlchemy** (ORM)

#### Infrastructure
- **Docker** + **Docker Compose**
- **AWS CDK** (TypeScript)
- **GitHub Actions**

---

## 🚀 クイックスタート

### セットアップ

```bash
# 1. このテンプレートリポジトリをクローン
git clone -b main git@github.com:starup-ai-pj/ai-solution-template.git
cd ai-solution-template

# 2. 新しいプロジェクト用のリポジトリを作成・設定
# GitHub等で新しいリポジトリを作成後、リモートURLを変更
git remote remove origin
git remote add origin <your-new-repo-url>

# 3. 新しいリポジトリにpush
git push -u origin main

# 4. 全サービスを起動
make up

# または
docker compose up -d
```

### アクセス

起動後、以下の URL にアクセスできます：

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050

---

## 📚 ドキュメント構成

ドキュメントは **3つの責務** で整理されています。

### 📐 アーキテクチャ設計 ([`docs/rules/architecture`](./docs/rules/architecture))

システムの設計思想と構造を理解するためのドキュメント

- **[フロントエンド](./docs/rules/architecture/FRONTEND.md)** - FSD アーキテクチャ、レイヤー構成
- **[バックエンド](./docs/rules/architecture/BACKEND.md)** - オニオンアーキテクチャ、依存関係ルール
- **[インフラ](./docs/rules/architecture/INFRASTRUCTURE.md)** - 4層レイヤードアーキテクチャ、スタック構成

### 💻 開発ガイド ([`docs/rules/development`](./docs/rules/development))

実装方法とコーディング規約のドキュメント

- **[フロントエンド開発](./docs/rules/development/FRONTEND.md)** - 環境構築、開発フロー、API連携
- **[バックエンド開発](./docs/rules/development/BACKEND.md)** - 実装済み機能、開発の流れ
- **[テスト](./docs/rules/development/TESTING.md)** - ユニットテスト、結合テスト

### ⚙️ 運用・セットアップ ([`docs/rules/operations`](./docs/rules/operations))

デプロイ、カスタマイズ、運用のドキュメント

- **[カスタマイズガイド](./docs/rules/operations/CUSTOMIZATION.md)** - 新規プロジェクト開始時必読
- **[デプロイガイド](./docs/rules/operations/DEPLOYMENT.md)** - CDKデプロイ手順
- **[クイックスタート](./docs/rules/operations/QUICK_START.md)** - インフラ構成の選択
- **[PoCセットアップ](./docs/rules/operations/POC_SETUP_GUIDE.md)** - PoC Stack構成
- **[CI/CDガイド](./docs/rules/operations/CI_CD_GUIDE.md)** - GitHub Actionsワークフロー
- **[CI/CDセットアップ](./docs/rules/operations/CI_CD_SETUP.md)** - AWS OIDC設定

---

## 📂 ディレクトリ構成

```
ai-solution-template/
├── frontend/          # Next.js フロントエンド
│   └── README.md      # フロントエンド固有のドキュメント
├── backend/           # FastAPI バックエンド
│   └── README.md      # バックエンド固有のドキュメント
├── infra/             # AWS CDK インフラ定義
│   └── README.md      # インフラ固有のドキュメント
├── .github/
│   └── workflows/     # GitHub Actions ワークフロー
│       └── README.md  # CI/CD固有のドキュメント
├── docs/              # プロジェクト全体のドキュメント
│   └── rules/         # ルール・ガイドライン
│       ├── architecture/  # アーキテクチャ設計
│       ├── development/   # 開発ガイド
│       └── operations/    # 運用・セットアップ
└── README.md          # このファイル
```

各ディレクトリの詳細は、それぞれのREADME.mdを参照してください：

- **[frontend/README.md](./frontend/README.md)** - フロントエンド開発
- **[backend/README.md](./backend/README.md)** - バックエンド開発
- **[infra/README.md](./infra/README.md)** - インフラ管理
- **[.github/workflows/README.md](./.github/workflows/README.md)** - CI/CD設定

---

## 💻 開発コマンド（Makefile）

プロジェクトルートで `make help` を実行すると全コマンドを確認できます。

### Docker Compose

| コマンド | 説明 |
|---------|------|
| `make up` | 全サービスをバックグラウンドで起動 |
| `make down` | 全サービスを停止 |
| `make build` | Dockerイメージをビルド |
| `make logs` | ログをリアルタイム表示 |
| `make restart` | 全サービスを再起動 |
| `make shell` | backendコンテナにシェルで入る |

### データベース（Alembic）

| コマンド | 説明 |
|---------|------|
| `make db-init` | 初回マイグレーションファイルを作成 |
| `make db-migrate msg='message'` | マイグレーションファイルを作成（autogenerate） |
| `make db-upgrade` | マイグレーションを適用（最新まで） |
| `make db-downgrade` | マイグレーションを1つロールバック |
| `make db-history` | マイグレーション履歴を表示 |
| `make db-current` | 現在のリビジョンを表示 |

### コード品質（Backend）

| コマンド | 説明 |
|---------|------|
| `make lint` | Ruffでコードをチェック |
| `make fix` | Ruffで自動修正可能なエラーを修正 |
| `make format` | Ruffでコードをフォーマット |
| `make lint-all` | fix + format を実行 |
| `make onion-check` | オニオンアーキテクチャの依存関係チェック |
| `make test` | Pytestでテストを実行 |

### セキュリティ・ドキュメント

| コマンド | 説明 |
|---------|------|
| `make generate-rsa-keys` | JWT用のRSA鍵ペアを生成 |
| `make export-swagger` | SwaggerドキュメントをHTMLとして生成 |

### インフラストラクチャ（CDK）

| コマンド | 説明 |
|---------|------|
| `make install` | infra/ の npm 依存関係をインストール |
| `make snapshot` | CDKスナップショットテストを実行 |
| `make snapshot/update` | スナップショットを更新 |
| `make infra/lint` | Biomeでインフラコードをチェック |
| `make infra/format` | Biomeでインフラコードをフォーマット |

### フロントエンド

```bash
cd frontend

npm run dev           # 開発サーバー起動
npm run build         # 本番ビルド
npm run lint          # ESLint実行（FSD境界チェック含む）
npm run format        # Prettier実行
npm run test          # Jestテスト実行
npm run type-check    # TypeScript型チェック
```

### CDK デプロイ

```bash
cd infra

cdk list --context env=dev    # スタック一覧
cdk synth --context env=dev   # CloudFormationテンプレート生成
cdk deploy --all --context env=dev  # 全スタックデプロイ
```

---

## 🎨 このテンプレートをカスタマイズする

新しいプロジェクトを開始する際は、以下のドキュメントを参照してください：

**[カスタマイズガイド](./docs/rules/operations/CUSTOMIZATION.md)**

---

## 📦 デプロイ

### ローカル開発環境

```bash
make up
```

### AWS環境

```bash
cd infra
cdk deploy --all --context env=prod
```

詳細は **[デプロイガイド](./docs/rules/operations/DEPLOYMENT.md)** を参照してください。

---

## 📖 API仕様

- **Swagger UI**: http://localhost:8000/docs
- **OpenAPI 仕様書**: [openapi.json](./backend/documents/api/openapi.json)
- **Swagger HTML**: [swagger.html](./backend/documents/api/swagger.html)

main ブランチへの push 時、`backend/app/presentation/`配下のファイルが変更されると、GitHub Actions によって自動的にドキュメントが更新されます。

---

**最終更新**: 2025-11-21
**バージョン**: 2.0.0
