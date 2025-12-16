# Ghoona Camp - 技術仕様書

## システム構成

### Frontend
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **アーキテクチャ**: FSD (Feature-Sliced Design)
- **UIライブラリ**: shadcn/ui
- **状態管理**: React Query + Zustand
- **スタイリング**: Tailwind CSS

### Backend
- **言語**: Go 1.23
- **アーキテクチャ**: DDD × Onion Architecture
- **フレームワーク**: Gin
- **ORM**: GORM
- **認証**: Clerk

### Database
- **プラットフォーム**: Supabase
- **RDBMS**: PostgreSQL
- **機能**: Authentication, Real-time, Storage

### Infrastructure
- **クラウド**: AWS
- **IaC**: AWS CDK
- **CI/CD**: GitHub Actions
- **コンテナ**: Docker

## アーキテクチャ設計

### Frontend (FSD)
```
src/
├── app/                    # Next.js App Router + global設定
├── page-components/        # ページ固有コンテナ
├── widgets/               # 複合UIブロック
├── features/              # 独立した機能単位
├── entities/              # ビジネスエンティティ
└── shared/                # 共有リソース
```

### Backend (DDD × Onion)
```
internal/
├── domain/               # ビジネスロジック
├── application/          # ユースケース
├── infrastructure/       # 外部連携
└── presentation/         # HTTP層
```

## 主要技術選定理由


### 参加ログ管理
- **記録対象**: Discord参加時間、継続時間
- **自動化**: Discord Bot経由での自動記録（スコープ外）
- **可視化**: 参加履歴ダッシュボード

### リアルタイム機能
- **技術**: Supabase Real-time
- **用途**: 参加状況の即座反映、チャット機能

## 開発環境

### 必須ツール
- Node.js 20+
- Go 1.23+
- Docker & Docker Compose
- AWS CLI & CDK

### 品質管理
- **Linting**: ESLint (Frontend), golangci-lint (Backend)
- **Formatting**: Prettier, gofmt
- **Testing**: Jest, Vitest, Go testing
- **Type Check**: TypeScript, Go static analysis

## セキュリティ

- Clerk認証システム
- JWT token管理（Clerk発行）
- API rate limiting
- CORS設定
- 環境変数による秘匿情報管理