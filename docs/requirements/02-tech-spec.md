# Ghoona Camp - 技術仕様書

## システム構成

### Frontend
- **フレームワーク**: Next.js 15.3.2 (App Router) + React 19.2.0
- **言語**: TypeScript 5.4.5
- **アーキテクチャ**: FSD (Feature-Sliced Design)
- **UIライブラリ**: shadcn/ui (Radix UI 2.x ベース)
- **状態管理**: Redux Toolkit 2.2.0（グローバル状態）+ TanStack React Query 5.28.0（サーバー状態）
- **フォーム**: React Hook Form 7.51.0 + Zod 3.22.4
- **HTTP通信**: Axios 1.6.8
- **スタイリング**: Tailwind CSS 3.4.3

### Backend
- **言語**: Python 3.11+
- **フレームワーク**: FastAPI
- **アーキテクチャ**: オニオンアーキテクチャ
- **ORM**: SQLAlchemy
- **認証**: JWT (RS256) + Cookie-based認証

### Database
- **RDBMS**: PostgreSQL 15
- **マイグレーション**: Alembic
- **オプション**: Aurora PostgreSQL（本番環境）

### Infrastructure
- **クラウド**: AWS
- **IaC**: AWS CDK（TypeScript）- 4層レイヤードアーキテクチャ
- **CI/CD**: GitHub Actions + AWS OIDC
- **コンテナ**: Docker + Docker Compose
- **コンピュート**: ECS Fargate
- **配信**: CloudFront / Amplify

## アーキテクチャ設計

### Frontend (FSD)
```
frontend/src/
├── app/                    # Next.js App Router + グローバル設定
├── page-components/        # ページレベルコンポーネント
├── widgets/                # 複合UIブロック（複数Featuresの組み合わせ）
├── features/               # ビジネスユースケース、React Hooks
├── entities/               # ドメインモデル、API通信
├── shared/                 # 共有UI、ユーティリティ、HTTPクライアント
└── store/                  # Redux store
```

**FSD依存関係ルール**: 上位レイヤー → 下位レイヤーのみ（App → Shared）

### Backend (オニオンアーキテクチャ)
```
backend/app/
├── domain/                 # エンティティ、値オブジェクト、リポジトリIF
├── application/            # ユースケース、DTO
├── infrastructure/         # リポジトリ実装、DBモデル、外部サービス
├── presentation/           # APIエンドポイント、スキーマ
└── di/                     # 依存性注入
```

**依存関係ルール**: 外側 → 内側のみ（Presentation → Domain）

### Infrastructure (4層レイヤード)
```
infra/
├── bin/                    # レイヤー4: アプリケーションエントリーポイント
├── lib/
│   ├── construct/          # レイヤー1: 単一AWSリソースの抽象化
│   ├── resource/           # レイヤー2: 機能単位の組み合わせ
│   └── stack/              # レイヤー3: デプロイ単位
└── config/                 # 環境別設定（dev/prod）
```

## 主要スタック構成（CDK）

| スタック | 役割 |
|---------|------|
| FoundationStack | VPC、サブネット、NAT Gateway |
| DataStorageStack | RDS/Aurora PostgreSQL、DynamoDB（オプション） |
| ObjectStorageStack | S3バケット |
| SecurityStack | Cognito、Secrets Manager |
| BackendStack | ECS Fargate、ALB、API Gateway（オプション） |
| FrontendStack | CloudFront / Amplify |
| IntegrationStack | SNS、SQS |
| ObservabilityStack | CloudWatch Alarms、Dashboard |

## Ghoona Camp 固有機能

### 参加ログ管理
- **記録対象**: Discord参加時間、継続時間
- **自動化**: Discord Bot経由での自動記録（スコープ外）
- **可視化**: 参加履歴ダッシュボード

### 認証フロー
- Cookie-based JWT認証（httpOnly, secure, sameSite）
- Next.js Middleware による保護ルート制御
- Redux で認証状態管理

## 開発環境

### 必須ツール
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- AWS CLI & CDK

### 品質管理
- **Frontend**
  - Linting: ESLint + eslint-plugin-boundaries（FSD依存チェック）
  - Formatting: Prettier
  - Testing: Jest
- **Backend**
  - Linting: Ruff
  - Testing: Pytest
  - アーキテクチャ検証: `make onion-check`
- **Infrastructure**
  - Linting: Biome
  - Testing: CDKスナップショットテスト

## セキュリティ

- JWT認証（RS256）+ httpOnly Cookie
- CORS設定
- API rate limiting
- 環境変数による秘匿情報管理（Secrets Manager）
- S3パブリックアクセス完全ブロック
- VPCプライベートサブネット配置