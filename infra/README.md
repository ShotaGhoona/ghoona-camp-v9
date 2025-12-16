# Infrastructure

AWS CDK (TypeScript) を使用したインフラストラクチャ定義です。

**4層レイヤードアーキテクチャ**を採用し、再利用性と保守性に優れた設計になっています。

## 📚 ドキュメント

詳細なドキュメントは [`../docs/rules`](../docs/rules) を参照してください。

### アーキテクチャ
- **[アーキテクチャ設計](../docs/rules/architecture/INFRASTRUCTURE.md)** - 4層レイヤードアーキテクチャ、スタック構成

### 運用ガイド
- **[デプロイガイド](../docs/rules/operations/DEPLOYMENT.md)** - デプロイ手順、環境別設定
- **[クイックスタート](../docs/rules/operations/QUICK_START.md)** - どの構成を選ぶか、初期セットアップ
- **[PoCセットアップ](../docs/rules/operations/POC_SETUP_GUIDE.md)** - PoC Stack（AllInOne構成）

---

## ⚡ クイックスタート

### 🔧 前提条件

- **Node.js 18+**
- **AWS CLI** 設定済み
- **AWS CDK CLI** インストール済み

```bash
npm install -g aws-cdk
```

### 🚀 セットアップ

```bash
# 1. 依存関係のインストール
npm install

# 2. ビルド
npm run build

# 3. CDKブートストラップ（初回のみ）
cdk bootstrap
```

### デプロイ

#### 開発環境（dev）

```bash
# 全スタックを確認
cdk list --context env=dev

# CloudFormationテンプレートを生成
cdk synth --context env=dev

# 全スタックをデプロイ
cdk deploy --all --context env=dev

# 特定のスタックのみデプロイ
cdk deploy dev-ApplicationStack --context env=dev
```

#### 本番環境（prod）

```bash
cdk deploy --all --context env=prod
```

詳細は **[デプロイガイド](../docs/rules/operations/DEPLOYMENT.md)** を参照してください。

---

## 💻 開発コマンド

```bash
# スタック一覧を表示
cdk list --context env=dev

# CloudFormationテンプレートを表示
cdk synth --context env=dev

# デプロイ前の差分確認
cdk diff dev-BackendStack --context env=dev

# 特定スタックを削除
cdk destroy dev-BackendStack --context env=dev

# ビルド
npm run build

# ウォッチモード（コード変更を監視）
npm run watch

# テスト
npm test
```

---

## 📁 プロジェクト構造

**4層レイヤードアーキテクチャ**

```
infra/
├── bin/              # レイヤー4: プロジェクト構成
├── lib/
│   ├── construct/    # レイヤー1: 単一AWSリソースの抽象化
│   ├── resource/     # レイヤー2: 機能単位の組み合わせ
│   └── stack/        # レイヤー3: デプロイ単位
├── config/           # 環境別設定
└── lambda/           # Lambda関数コード
```

詳細は **[アーキテクチャ設計](../docs/rules/architecture/INFRASTRUCTURE.md)** を参照してください。

---

## 💾 データベース設定

### デフォルトDB構成（v2.1.0〜）

| 環境 | DB種類 | インスタンス | マルチAZ | 月額コスト目安 |
|------|--------|------------|----------|--------------|
| **dev** | RDS PostgreSQL | t3.micro | ❌ | $10〜20 |
| **stg** | RDS PostgreSQL | t3.medium | ✅ | $60〜80 |
| **prod** | Aurora PostgreSQL | r6g.large + Reader 2台 | ✅ | $300〜500 |

### データベースタイプの選択

各環境の設定ファイル（`config/dev.ts`、`config/stg.ts`、`config/prod.ts`）で、使用するデータベースを選択できます。

#### オプション

1. **RDS** - コスト効率的、小〜中規模向け（デフォルト）
   ```typescript
   database: {
     enableRds: true,      // デフォルト: true
     enableAurora: false,
     enableDynamo: false,  // DynamoDBが必要な場合はtrue
     engine: 'postgres',   // または 'mysql'
     instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
     multiAz: false,
     allocatedStorageGb: 20,
     backupRetentionDays: 3,
   }
   ```

2. **Aurora** - 高可用性、大規模向け
   ```typescript
   database: {
     enableAurora: true,   // Auroraを有効化
     enableRds: false,     // RDSは無効化（排他）
     enableDynamo: false,
     engine: 'postgres',
     instanceType: ec2.InstanceType.of(ec2.InstanceClass.R6G, ec2.InstanceSize.LARGE),
     readerCount: 2,
     backupRetentionDays: 30,
   }
   ```

3. **DynamoDB + RDS** - NoSQLとRDBの併用
   ```typescript
   database: {
     enableDynamo: true,   // DynamoDBを追加
     enableRds: true,
     enableAurora: false,
     engine: 'postgres',
     // ...
   }
   ```

4. **DynamoDBのみ** - RDBを使用しない
   ```typescript
   database: {
     enableDynamo: true,
     enableRds: false,
     enableAurora: false,
     engine: 'postgres',   // 使われないが必須
     // ...
   }
   ```

### 詳細ガイド

- **[変更ログ](./CHANGELOG_DATABASE.md)** - v2.0.0での変更内容

---

## 📖 関連ドキュメント

詳細は [`../docs/rules`](../docs/rules) を参照してください。

- **[アーキテクチャ](../docs/rules/architecture/INFRASTRUCTURE.md)** - システム設計
- **[デプロイガイド](../docs/rules/operations/DEPLOYMENT.md)** - デプロイ手順
- **[クイックスタート](../docs/rules/operations/QUICK_START.md)** - 初期セットアップ
- **[変更ログ](./CHANGELOG_DATABASE.md)** - データベース設定の変更履歴

---

**最終更新**: 2025-12-01
**バージョン**: 2.2.0 (データベース設定形式変更: enableRds/enableAurora/enableDynamo)
