# デプロイガイド - 四層アーキテクチャ

## 📋 概要

このプロジェクトは四層アーキテクチャで構成されており、8つのスタックに分割されています。

### アーキテクチャ層

```
L1: AWS CloudFormation リソース (Cfn*)
    ↓
L2: AWS CDK L2 コンストラクト (ec2.Vpc, ecs.Cluster等)
    ↓
L3 (Resource層): L2を組み合わせた「機能単位」
    └─ lib/resource/
    ↓
L4 (Stack層): L3を組み合わせた「デプロイ単位」
    └─ lib/stack/
```

## 🗂️ スタック構成

### 1. FoundationStack（基盤層）
- **責任:** ネットワークインフラ
- **リソース:** VPC, Subnets, NAT Gateway
- **依存:** なし
- **デプロイ順:** 1番目

### 2. DataStorageStack（データベース層）
- **責任:** データベースストア
- **リソース:** DynamoDB（オプション）, RDS/Aurora
- **依存:** FoundationStack
- **デプロイ順:** 2番目

### 3. ObjectStorageStack（オブジェクトストレージ層）
- **責任:** オブジェクトストレージ
- **リソース:** S3バケット
- **依存:** なし
- **デプロイ順:** 2番目（並列可）

### 4. SecurityStack（セキュリティ層）
- **責任:** 認証・認可
- **リソース:** Cognito, Secrets Manager
- **依存:** FoundationStack
- **デプロイ順:** 3番目

### 5. BackendStack（バックエンドAPI層）
- **責任:** バックエンドAPI実行
- **リソース:** ECS, Lambda, API Gateway, ALB
- **依存:** Foundation, DataStorage, ObjectStorage, Security
- **デプロイ順:** 4番目

### 6. FrontendStack（フロントエンド層）
- **責任:** フロントエンド配信
- **リソース:** Amplify または S3 + CloudFront
- **依存:** BackendStack
- **デプロイ順:** 5番目

### 7. IntegrationStack（統合層）
- **責任:** メッセージング
- **リソース:** SNS, SQS
- **依存:** BackendStack
- **デプロイ順:** 6番目

### 8. ObservabilityStack（監視層）
- **責任:** 監視・可観測性
- **リソース:** CloudWatch Alarms, Dashboard
- **依存:** 全スタック
- **デプロイ順:** 7番目（最後）

## 🚀 デプロイ方法

### 事前準備

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# AWS CLIの設定確認
aws sts get-caller-identity
```

### 環境別デプロイ

#### 開発環境（dev）

```bash
# 全スタックをデプロイ
cdk deploy --all --context env=dev

# または個別にデプロイ
cdk deploy dev-FoundationStack --context env=dev
cdk deploy dev-DataStorageStack --context env=dev
cdk deploy dev-ObjectStorageStack --context env=dev
cdk deploy dev-SecurityStack --context env=dev
cdk deploy dev-BackendStack --context env=dev
cdk deploy dev-FrontendStack --context env=dev
cdk deploy dev-IntegrationStack --context env=dev
cdk deploy dev-ObservabilityStack --context env=dev
```

#### 本番環境（prod）

```bash
# 本番環境は慎重に
cdk deploy --all --context env=prod --require-approval broadening
```

### Bootstrap（初回のみ）

```bash
# 開発環境
cdk bootstrap --context env=dev

# 本番環境
cdk bootstrap --context env=prod
```

## 📦 スタック別デプロイ

### 特定のスタックのみデプロイ

```bash
# Foundation層のみ
cdk deploy dev-FoundationStack --context env=dev

# Data層のみ（Foundation層が必要）
cdk deploy dev-DataStack --context env=dev

# Application層のみ（Foundation, Data, Security層が必要）
cdk deploy dev-ApplicationStack --context env=dev
```

### スタックの更新確認

```bash
# 差分確認
cdk diff dev-ApplicationStack --context env=dev

# 全スタックの差分確認
cdk diff --all --context env=dev
```

## 🔄 更新戦略

### ローリングアップデート

変更頻度に応じた更新：

1. **低頻度（Foundation, Security）**
   - 計画的なメンテナンスウィンドウで更新
   - 影響範囲が大きいため事前テスト必須

2. **中頻度（Data, Integration, Observability）**
   - データベース: バックアップ後に更新
   - メッセージング: トラフィックの少ない時間帯
   - 監視: いつでも更新可能

3. **高頻度（Application）**
   - ECS: Blue/Greenデプロイメント
   - Lambda: エイリアスとバージョニング
   - API Gateway: ステージング経由

### ブルー/グリーンデプロイ

本番環境では、新しい環境を並行構築：

```bash
# 新しい環境（green）をデプロイ
cdk deploy --all --context env=prod-green

# テスト後、Route53でトラフィック切り替え

# 旧環境（blue）を削除
cdk destroy --all --context env=prod-blue
```

## 🔍 デプロイの検証

### デプロイ後の確認

```bash
# Stack一覧
cdk list --context env=dev

# Stack情報
aws cloudformation describe-stacks \
  --stack-name dev-ApplicationStack

# リソース一覧
aws cloudformation list-stack-resources \
  --stack-name dev-ApplicationStack
```

### ヘルスチェック

```bash
# ALBのヘルスチェック
ALB_URL=$(aws cloudformation describe-stacks \
  --stack-name dev-ApplicationStack \
  --query 'Stacks[0].Outputs[?OutputKey==`BackendAlbUrl`].OutputValue' \
  --output text)

curl $ALB_URL

# API Gatewayのテスト
API_URL=$(aws cloudformation describe-stacks \
  --stack-name dev-ApplicationStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text)

curl $API_URL
```

## 🗑️ スタックの削除

### 削除順序（逆順）

```bash
# 8. Observability Stack
cdk destroy dev-ObservabilityStack --context env=dev

# 7. Integration Stack
cdk destroy dev-IntegrationStack --context env=dev

# 6. Frontend Stack
cdk destroy dev-FrontendStack --context env=dev

# 5. Backend Stack
cdk destroy dev-BackendStack --context env=dev

# 4. Security Stack
cdk destroy dev-SecurityStack --context env=dev

# 3. ObjectStorage Stack
cdk destroy dev-ObjectStorageStack --context env=dev

# 2. DataStorage Stack（データ消失注意！）
cdk destroy dev-DataStorageStack --context env=dev

# 1. Foundation Stack
cdk destroy dev-FoundationStack --context env=dev

# または全削除（危険！）
cdk destroy --all --context env=dev
```

### データ保護

本番環境のData Stackは削除保護を有効化推奨：

```typescript
// config/prod.ts で設定
removalPolicy: RemovalPolicy.RETAIN
```

## 💡 トラブルシューティング

### デプロイが失敗した場合

```bash
# エラー詳細の確認
aws cloudformation describe-stack-events \
  --stack-name dev-ApplicationStack \
  --max-items 50

# ロールバック
cdk deploy dev-ApplicationStack --context env=dev --rollback
```

### スタックがROLLBACK_COMPLETEの場合

```bash
# 削除してから再デプロイ
cdk destroy dev-ApplicationStack --context env=dev
cdk deploy dev-ApplicationStack --context env=dev
```

### 依存関係エラー

Stack間の依存関係を確認：

```bash
# 依存しているStackから順にデプロイ
cdk deploy dev-FoundationStack --context env=dev
cdk deploy dev-DataStack --context env=dev
# ...
```

## 📊 コスト管理

### コスト見積もり

```bash
# AWS Cost Explorerで確認
# タグ別にフィルタリング: Environment=dev
```

### リソース削減

開発環境で不要時にリソース削減：

```bash
# ECS desired count を 0 に
aws ecs update-service \
  --cluster dev-backend-cluster \
  --service dev-backend-service \
  --desired-count 0

# RDS Auroraを停止
aws rds stop-db-cluster --db-cluster-identifier dev-cdk-study-db
```

## 🔐 セキュリティ

### デプロイ前のチェック

```bash
# Security Hub スキャン
cdk synth --context env=prod | cfn_nag_scan

# IAM ポリシーの確認
cdk synth --context env=prod > template.json
# AWS IAM Policy Simulatorでテスト
```

## 📝 ログとモニタリング

### CloudWatch Logs

```bash
# Lambda関数のログ
aws logs tail /aws/lambda/dev-cdk-study-api --follow

# ECS タスクのログ
aws logs tail /ecs/dev-backend-service --follow
```

### CloudWatch Dashboard

デプロイ後、ObservabilityStackの出力からDashboard URLにアクセス：

```bash
aws cloudformation describe-stacks \
  --stack-name dev-ObservabilityStack \
  --query 'Stacks[0].Outputs[?OutputKey==`DashboardUrl`].OutputValue' \
  --output text
```

## 🎯 ベストプラクティス

1. **環境分離**: dev/staging/prodで完全分離
2. **段階的デプロイ**: dev → staging → prod
3. **自動化**: CI/CDパイプラインで自動デプロイ
4. **バックアップ**: デプロイ前にRDSスナップショット
5. **ロールバック計画**: 失敗時の復旧手順を事前準備
6. **監視**: デプロイ後15分間はダッシュボードを監視
7. **変更管理**: 本番環境の変更は承認プロセス経由

---

**Created with AWS CDK Four-Layer Architecture** 🏗️

