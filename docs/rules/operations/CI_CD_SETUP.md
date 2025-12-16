# デプロイワークフロー セットアップガイド

このガイドでは、ブランチベースのデプロイワークフローのセットアップ手順を説明します。

## 目次

1. [前提条件](#前提条件)
2. [共通セットアップ](#共通セットアップ)
3. [ワークフローの選択](#ワークフローの選択)
4. [動作確認](#動作確認)
5. [トラブルシューティング](#トラブルシューティング)

## 前提条件

### 必要なもの

- [ ] AWSアカウント
- [ ] GitHub リポジトリの管理者権限
- [ ] AWS CLI がインストール済み
- [ ] Node.js 18以上

### 事前準備

```bash
# AWS CLIの認証設定
aws configure

# リポジトリのクローン
git clone <your-repo-url>
cd ai-solution-template
```

## 共通セットアップ

すべてのデプロイワークフローで共通して必要なセットアップです。

### ステップ1: AWS OIDCプロバイダーの作成

```bash
# OIDCプロバイダーを作成（1度だけ）
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### ステップ2: IAMロールの作成

#### 2.1 STG用ロール

```bash
# 信頼ポリシーを作成
cat > trust-policy-stg.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:ref:refs/heads/develop"
        }
      }
    }
  ]
}
EOF

# ロールを作成
aws iam create-role \
  --role-name github-actions-stg-role \
  --assume-role-policy-document file://trust-policy-stg.json

# 権限を付与
aws iam attach-role-policy \
  --role-name github-actions-stg-role \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

#### 2.2 PROD用ロール

```bash
# 信頼ポリシーを作成
cat > trust-policy-prod.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:ref:refs/heads/main"
        }
      }
    }
  ]
}
EOF

# ロールを作成
aws iam create-role \
  --role-name github-actions-prod-role \
  --assume-role-policy-document file://trust-policy-prod.json

# 権限を付与（本番環境は慎重に）
aws iam attach-role-policy \
  --role-name github-actions-prod-role \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

### ステップ3: GitHub Secretsの設定

GitHubリポジトリで以下を実行：

1. Settings → Secrets and variables → Actions
2. 以下のSecretを追加：

```
AWS_ROLE_ARN_STG  = arn:aws:iam::YOUR_ACCOUNT_ID:role/github-actions-stg-role
AWS_ROLE_ARN_PROD = arn:aws:iam::YOUR_ACCOUNT_ID:role/github-actions-prod-role
```

### ステップ4: GitHub Environmentsの設定

1. Settings → Environments
2. 以下の環境を作成：

#### **staging** 環境
- Environment name: `staging`
- Protection rules: なし
- Environment secrets: なし

#### **production** 環境
- Environment name: `production`
- Protection rules:
  - ✅ Required reviewers: 1-2名を指定
  - ✅ (オプション) Wait timer: 5 minutes
- Environment secrets: なし

### ステップ5: AWS Secrets Managerの設定

各環境のデータベース認証情報を保存します：

```bash
# STG環境
aws secretsmanager create-secret \
  --name stg-database-credentials \
  --secret-string '{"username":"your_db_user","password":"your_db_password"}'

# PROD環境
aws secretsmanager create-secret \
  --name prod-database-credentials \
  --secret-string '{"username":"your_db_user","password":"your_db_password"}'
```

### ステップ6: CDK Bootstrap

```bash
cd infra
npm install

# 各環境でBootstrap
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/ap-northeast-1 --context envName=stg
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/ap-northeast-1 --context envName=prod
```

---

## ワークフローの選択

### deploy-auto.yml（自動デプロイ）を使用する場合

**特徴:**
- develop/mainへのpushで自動デプロイ
- 承認プロセスなし
- 迅速な開発サイクル

**セットアップ:**

```bash
# deploy-manual.ymlを無効化
git mv .github/workflows/deploy-manual.yml .github/workflows/deploy-manual.yml.disabled

git add .github/workflows/
git commit -m "chore: use auto deployment workflow"
git push
```

### deploy-manual.yml（手動承認付きデプロイ）を使用する場合

**特徴:**
- develop/mainへのpushでトリガー
- Production環境デプロイ前に承認が必要
- 安全性重視

**セットアップ:**

1. GitHub Environmentsで承認者を設定（上記ステップ4を確認）
2. ワークフローを有効化：

```bash
# deploy-auto.ymlを無効化
git mv .github/workflows/deploy-auto.yml .github/workflows/deploy-auto.yml.disabled

git add .github/workflows/
git commit -m "chore: use manual approval deployment workflow"
git push
```

### ワークフローの切り替え

後からワークフローを切り替える場合：

```bash
# Auto → Manual
git mv .github/workflows/deploy-auto.yml .github/workflows/deploy-auto.yml.disabled
git mv .github/workflows/deploy-manual.yml.disabled .github/workflows/deploy-manual.yml

# Manual → Auto
git mv .github/workflows/deploy-manual.yml .github/workflows/deploy-manual.yml.disabled
git mv .github/workflows/deploy-auto.yml.disabled .github/workflows/deploy-auto.yml

git add .github/workflows/
git commit -m "chore: switch deployment workflow"
git push
```

---

## 動作確認

### 1. STG環境のデプロイテスト

```bash
# developブランチで変更
git checkout develop
echo "# Test" >> README.md
git add README.md
git commit -m "test: STG deployment test"
git push origin develop

# GitHub Actionsで確認
# Actions → Deploy (Auto/Manual) → ワークフローの実行を確認
```

### 2. PROD環境のデプロイテスト

#### deploy-auto.ymlの場合

```bash
# mainへのpushで自動実行
git checkout main
git merge develop
git push origin main

# GitHub Actionsで自動デプロイを確認
```

#### deploy-manual.ymlの場合

```bash
# mainへのpushでトリガー
git checkout main
git merge develop
git push origin main

# 承認者が承認
# GitHub Actionsでデプロイを確認
```

### 3. 手動デプロイのテスト

```bash
# GitHub Actionsタブで手動実行
# Actions → Deploy (Auto/Manual) → Run workflow
# - Branch: develop or main を選択
# - environment: stg or prod を選択
# Run workflow をクリック
```

---

## トラブルシューティング

### エラー: "Could not assume role"

**原因:** IAMロールの信頼ポリシーが正しくない

**解決策:**
```bash
# ロールの信頼ポリシーを確認
aws iam get-role --role-name github-actions-dev-role

# 必要に応じて更新
aws iam update-assume-role-policy \
  --role-name github-actions-dev-role \
  --policy-document file://trust-policy-dev.json
```

### エラー: "Environment not found"

**原因:** GitHub Environmentsが作成されていない

**解決策:**
1. Settings → Environments
2. 必要な環境を作成
3. Protection rulesを設定

### エラー: "CDK Bootstrap required"

**原因:** CDK Bootstrapが実行されていない

**解決策:**
```bash
cd infra
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/REGION --context envName=dev
```

### エラー: "Module not found: stg"

**原因:** STG環境の設定ファイルが存在しない

**解決策:**
```bash
# infra/config/stg.tsが存在するか確認
ls infra/config/stg.ts

# 存在しない場合は作成済みのファイルがあるはず
```

### エラー: "Database migration failed"

**原因:** データベース接続情報が正しくない、またはマイグレーションスクリプトにエラーがある

**解決策:**
```bash
# Secrets Managerの認証情報を確認
aws secretsmanager get-secret-value --secret-id stg-database-credentials

# マイグレーションをローカルでテスト
cd backend
alembic upgrade head
```

---

## チェックリスト

### 共通セットアップのチェックリスト

- [ ] AWS OIDCプロバイダーを作成
- [ ] IAMロール作成（STG、PROD）
- [ ] GitHub Secretsを設定（AWS_ROLE_ARN_STG、AWS_ROLE_ARN_PROD）
- [ ] GitHub Environmentsを作成（staging、production）
- [ ] Production環境に承認者を設定（deploy-manual.yml使用時）
- [ ] AWS Secrets Managerにデータベース認証情報を設定
- [ ] CDK Bootstrapを2環境で実行（STG、PROD）

### deploy-auto.yml使用時のチェックリスト

- [ ] 共通セットアップを完了
- [ ] deploy-manual.ymlを無効化
- [ ] developブランチでSTGデプロイテスト
- [ ] mainブランチでPRODデプロイテスト

### deploy-manual.yml使用時のチェックリスト

- [ ] 共通セットアップを完了
- [ ] Production環境に承認者を設定
- [ ] deploy-auto.ymlを無効化
- [ ] developブランチでSTGデプロイテスト
- [ ] mainブランチでPROD承認フローをテスト

---

## 参考コマンド集

```bash
# AWS アカウントIDを取得
aws sts get-caller-identity --query Account --output text

# IAMロール一覧を表示
aws iam list-roles --query 'Roles[?starts_with(RoleName, `github-actions`)].RoleName'

# CDKスタック一覧を表示
cd infra
npx cdk list --context envName=dev

# CDK Diffを確認
npx cdk diff --all --context envName=dev

# ワークフローの状態を確認
ls -la .github/workflows/

# Gitブランチを確認
git branch -a
```

---

## サポート

問題が発生した場合は、以下を確認してください：

1. [README.md](./.README.md) - 詳細なドキュメント
2. [DEPLOYMENT_FLOW.md](./DEPLOYMENT_FLOW.md) - デプロイフロー図
3. GitHub Actionsのログ
4. AWS CloudFormationのイベント

それでも解決しない場合は、チームに相談してください。

