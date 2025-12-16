# インフラストラクチャアーキテクチャ設計書

## 目次

1. [概要](#概要)
2. [4層レイヤードアーキテクチャ](#4層レイヤードアーキテクチャ)
3. [プロジェクト構造](#プロジェクト構造)
4. [スタック構成](#スタック構成)
5. [各レイヤーの詳細](#各レイヤーの詳細)
6. [セキュリティベストプラクティス](#セキュリティベストプラクティス)

---

## 概要

AWS CDK（Cloud Development Kit）を使用した、**完全な4層レイヤードアーキテクチャ**のインフラストラクチャ設計です。

### プロジェクトの特徴

- ✅ **完全な4層構造**: Construct層 → Resource層 → Stack層 → bin/層
- ✅ **L2コンストラクトのみ使用**: AWSベストプラクティスに準拠
- ✅ **セキュアバイデフォルト**: すべてのリソースにセキュアな設定を適用
- ✅ **環境別設定**: dev/prod環境を簡単に切り替え可能
- ✅ **スケーラブル**: 小規模から大規模プロジェクトまで対応

---

## 4層レイヤードアーキテクチャ

### アーキテクチャ概要

```
レイヤー4: bin/app.ts                    ← どのスタックを使うか選択
    ↓
レイヤー3: lib/stack/                    ← デプロイ単位（CloudFormation Stack）
    ↓
レイヤー2: lib/resource/                 ← 機能単位（複数AWSサービスの組み合わせ）
    ↓
レイヤー1: lib/construct/                ← 単一AWSリソースの抽象化
    ↓
レイヤー0: aws-cdk-lib                   ← AWS公式CDKライブラリ
```

---

## プロジェクト構造

```
infra/
├── bin/
│   └── app.ts                           # レイヤー4: アプリケーションエントリーポイント
│
├── lib/
│   ├── construct/                       # レイヤー1: 単一AWSリソースの抽象化
│   │   ├── compute/
│   │   │   ├── lambda-construct.ts     # Lambda関数
│   │   │   └── ecs-construct.ts        # ECSクラスター、Fargateサービス
│   │   ├── datastore/
│   │   │   ├── dynamodb-construct.ts   # DynamoDB
│   │   │   ├── aurora-construct.ts     # Aurora PostgreSQL
│   │   │   └── s3-construct.ts         # S3バケット
│   │   ├── networking/
│   │   │   ├── vpc-construct.ts        # VPC
│   │   │   ├── alb-construct.ts        # ALB
│   │   │   └── security-group-construct.ts # セキュリティグループ
│   │   ├── messaging/
│   │   │   ├── sns-construct.ts        # SNS
│   │   │   └── sqs-construct.ts        # SQS
│   │   ├── security/
│   │   │   ├── cognito-construct.ts    # Cognito
│   │   │   └── secrets-manager-construct.ts # Secrets Manager
│   │   └── api/
│   │       ├── api-gateway-construct.ts # API Gateway
│   │       └── cloudfront-construct.ts  # CloudFront
│   │
│   ├── resource/                        # レイヤー2: 機能単位の組み合わせ
│   │   ├── network-resource.ts         # ネットワーク基盤
│   │   ├── database-resource.ts        # データストア
│   │   ├── api-resource.ts             # API基盤
│   │   ├── frontend-resource.ts        # フロントエンド
│   │   ├── messaging-resource.ts       # メッセージング
│   │   └── security-resource.ts        # セキュリティ
│   │
│   └── stack/                           # レイヤー3: デプロイ単位
│       ├── foundation/
│       │   └── foundation-stack.ts     # ネットワーク基盤スタック
│       ├── data/
│       │   └── data-stack.ts           # データストアスタック
│       ├── security/
│       │   └── security-stack.ts       # セキュリティスタック
│       ├── application/
│       │   └── application-stack.ts    # アプリケーションスタック
│       ├── integration/
│       │   └── integration-stack.ts    # 統合スタック
│       └── observability/
│           └── observability-stack.ts  # 監視スタック
│
├── config/                              # 環境別設定
│   ├── environment.ts                   # 環境設定インターフェース
│   ├── dev.ts                           # 開発環境設定
│   ├── prod.ts                          # 本番環境設定
│   └── index.ts                         # 設定エクスポート
│
└── lambda/                              # Lambda関数コード
    └── index.js
```

---

## スタック構成

### 実装されているスタック（8スタック）

#### 1. FoundationStack（基盤）

**責務**: ネットワーク基盤の提供

- VPC（マルチAZ）
- パブリック/プライベートサブネット
- インターネットゲートウェイ
- NATゲートウェイ

**変更頻度**: 年1回以下
**デプロイ時間**: 約3-5分

---

#### 2. DataStorageStack（データベース）

**責務**: データベースストレージの提供

- DynamoDB（オプション、`enableDynamo: true`で有効化）
- RDS PostgreSQL/MySQL（デフォルト、`enableRds: true`）
- Aurora PostgreSQL/MySQL（オプション、`enableAurora: true`で有効化）

**変更頻度**: 月1回
**デプロイ時間**: 約5-10分（RDS: 5-7分、Aurora: 7-10分）

---

#### 3. ObjectStorageStack（オブジェクトストレージ）

**責務**: オブジェクトストレージの提供

- S3バケット（データバケット、パブリックアクセスブロック）

**変更頻度**: 低頻度（バケット追加時のみ）
**デプロイ時間**: 約1-2分

---

#### 4. SecurityStack（セキュリティ）

**責務**: 認証・認可・シークレット管理

- Cognito User Pool（ユーザー認証）
- User Pool Client
- Secrets Manager（シークレット管理）

**変更頻度**: 月1回
**デプロイ時間**: 約3-5分

---

#### 5. BackendStack（バックエンドAPI）

**責務**: バックエンドAPI実行環境の提供

- Lambda関数（軽量API、オプション）
- API Gateway（Lambda統合、REST API）
- ECSクラスター（コンテナAPI）
- Fargate Service
- Application Load Balancer（ECS統合）

**変更頻度**: 週1-2回（API機能追加・修正）
**デプロイ時間**: 約5-7分

**分離理由**: バックエンドチームが独立して作業できるように

---

#### 6. FrontendStack（フロントエンド配信）

**責務**: フロントエンド配信環境の提供

2つのデプロイ方式をサポート:
- **Amplify**（デフォルト）: Git連携自動デプロイ、ビルドパイプライン内蔵
- **S3 + CloudFront**: カスタマイズ性が高い、手動デプロイ

**変更頻度**: 日次変更（フロントエンドデプロイ）
**デプロイ時間**: 約3-5分

**分離理由**: フロントエンド更新時のデプロイ時間を短縮

---

#### 7. IntegrationStack（統合）

**責務**: システム間連携の提供

- SNS Topic（イベント通知）
- SQS Queue（メッセージキュー）
- Dead Letter Queue（失敗メッセージ処理）

**変更頻度**: 月1回
**デプロイ時間**: 約2-3分

---

#### 8. ObservabilityStack（監視）

**責務**: システム監視・運用の提供

- CloudWatch Alarms（アラート）
- CloudWatch Dashboard（可視化）
- メトリクス監視（ECS、RDS、Lambda、ALB）

**変更頻度**: 月1回
**デプロイ時間**: 約2-3分

---

### デプロイ時間の目安

| スタック | 初回デプロイ | 更新デプロイ | 変更頻度 |
|---------|------------|------------|----------|
| FoundationStack | 3-5分 | 3-5分 | 年1回以下 |
| DataStorageStack | 5-10分 | 5-7分 | 月1回 |
| ObjectStorageStack | 1-2分 | 1-2分 | 低頻度 |
| SecurityStack | 3-5分 | 2-3分 | 月1回 |
| BackendStack | 5-7分 | 3-5分 | 週1-2回 |
| FrontendStack | 3-5分 | 3-5分 | 日次 |
| IntegrationStack | 2-3分 | 1-2分 | 月1回 |
| ObservabilityStack | 2-3分 | 1-2分 | 月1回 |
| **全体** | **25-40分** | **20-30分** | - |

### 分離のメリット

- ✅ **データベースとS3を独立管理**: 変更頻度・削除ポリシーが異なるリソースを分離
- ✅ **フロントエンド更新が高速**: 3-5分
- ✅ **バックエンド変更の影響なし**: API更新時にフロントエンドは影響を受けない
- ✅ **独立デプロイ**: 各チームが並行作業可能

---

## 各レイヤーの詳細

### レイヤー1: Construct層（単一リソース）

**目的**: 単一のAWSリソースをセキュアなデフォルト設定で抽象化

**例**: DynamoDBテーブルを作成

```typescript
import { DynamoDbConstruct } from '../construct/datastore/dynamodb-construct';

const dynamo = new DynamoDbConstruct(this, 'MyTable', {
  tableName: 'my-table',
  // デフォルトで暗号化、バックアップ、オンデマンド課金が有効
});
```

**特徴**:
- セキュアバイデフォルト
- 変更頻度: ほぼなし
- 全プロジェクトで再利用可能

---

### レイヤー2: Resource層（機能単位）

**目的**: 複数のConstructを組み合わせて1つの機能を提供

**例**: データベース基盤を構築

```typescript
import { DatabaseResource } from '../resource/database-resource';

const database = new DatabaseResource(this, 'Database', {
  dynamoTableName: 'my-table',
  auroraClusterName: 'my-cluster',
  s3BucketName: 'my-bucket',
  vpc: props.vpc,
});
```

**特徴**:
- 機能が完結
- 変更頻度: まれ
- StarUPでよく使う構築パターンを定義

---

### レイヤー3: Stack層（デプロイ単位）

**目的**: CloudFormationスタック単位でデプロイ

**例**: データスタックを定義

```typescript
import { DataStack } from '../lib/stack/data/data-stack';

const dataStack = new DataStack(app, 'dev-DataStack', config, {
  vpc: foundationStack.vpc,
});
```

**特徴**:
- 変更頻度に応じた分離
- 影響範囲の最小化
- 個別デプロイ可能

---

### レイヤー4: bin/層（プロジェクト構成）

**目的**: このプロジェクトで使用するスタックを選択

**例**: プロジェクト全体の構成を宣言

```typescript
const foundationStack = new FoundationStack(app, 'dev-FoundationStack', config);
const dataStack = new DataStack(app, 'dev-DataStack', config, {
  vpc: foundationStack.vpc,
});
// ...
```

**特徴**:
- プロジェクト固有
- 段階的成長に対応
- 宣言的な構成

---

## 環境別設定

環境ごとに異なる設定は `config/` で管理します。

### 開発環境（dev）

```typescript
// config/dev.ts
export const devConfig: EnvironmentConfig = {
  envName: 'dev',
  removalPolicy: RemovalPolicy.DESTROY, // リソース削除可能
  network: {
    maxAzs: 2,              // 2AZ
    natGateways: 1,         // NATゲートウェイ1台（コスト削減）
  },
  ecs: {
    backend: {
      desiredCount: 1,      // 最小構成
      cpu: 256,
      memory: 512,
    },
  },
};
```

### 本番環境（prod）

```typescript
// config/prod.ts
export const prodConfig: EnvironmentConfig = {
  envName: 'prod',
  removalPolicy: RemovalPolicy.RETAIN, // リソース保持
  network: {
    maxAzs: 3,              // 3AZ（高可用性）
    natGateways: 3,         // AZごとにNATゲートウェイ
  },
  ecs: {
    backend: {
      desiredCount: 4,      // 冗長構成
      cpu: 1024,
      memory: 2048,
    },
  },
};
```

---

## セキュリティベストプラクティス

すべてのConstruct層でセキュアバイデフォルトを実装:

### S3
- ✅ パブリックアクセス完全ブロック
- ✅ サーバーサイド暗号化強制
- ✅ HTTPS接続強制

### DynamoDB
- ✅ 暗号化有効
- ✅ Point-in-Time Recovery有効
- ✅ オンデマンド課金

### Aurora
- ✅ ストレージ暗号化
- ✅ VPCプライベートサブネット配置
- ✅ 自動バックアップ有効

### Lambda/ECS
- ✅ VPC内配置
- ✅ プライベートサブネット配置
- ✅ CloudWatch Logs自動設定

### Cognito
- ✅ MFA対応
- ✅ セキュアなパスワードポリシー
- ✅ メール検証

---

**最終更新日**: 2025-12-01
**バージョン**: 2.2.0
