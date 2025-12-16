# GitHub Actions Workflows

このディレクトリにはCI/CDワークフローが含まれています。

## 📚 ドキュメント

詳細なドキュメントは [`../../docs/rules/operations`](../../docs/rules/operations) を参照してください。

- **[CI/CDガイド](../../docs/rules/operations/CI_CD_GUIDE.md)** - ワークフローの概要、デプロイフロー、使用方法
- **[CI/CDセットアップ](../../docs/rules/operations/CI_CD_SETUP.md)** - AWS OIDC設定、GitHub Secrets設定、環境設定

---

## 🚀 デプロイフロー

### ブランチベースのデプロイ

```
develop → Staging環境
main → Production環境
```

### デプロイ順序

```
1. 差分検出 (detect-changes)
   ↓
2. インフラデプロイ (CDK)
   ↓
3. バックエンドデプロイ (ECS)
   ↓
4. DBマイグレーション (Alembic)
```

---

## 📝 ワークフローファイル

### CI/テストワークフロー

| ファイル | 説明 | トリガー | 状態 |
|---------|------|---------|------|
| `backend-ci.yml` | バックエンドCI（Lint、アーキテクチャチェック、Dockerビルド） | PR to main | ✅ 有効 |
| `frontend-ci.yml` | フロントエンドCI（Jest、ビルドテスト） | PR/Push | ✅ 有効 |
| `update-swagger.yml` | Swagger自動更新 | 手動 | ✅ 有効 |

### デプロイワークフロー

| ファイル | 説明 | トリガー | 承認 | 状態 |
|---------|------|---------|------|------|
| `deploy-auto.yml` | 自動デプロイ | develop/main へのpush | 不要 | ✅ 有効 |
| `deploy-manual.yml` | 手動承認付きデプロイ | develop/main へのpush | 必要 | ✅ 有効 |

**注**: どちらか一方のデプロイワークフローを有効化してください。両方を同時に有効化すると、二重にデプロイが実行されます。

---

## 🎯 デプロイワークフローの選び方

### deploy-auto.yml（自動デプロイ）

**こんな場合に推奨:**
- 開発スピードを優先したい
- ブランチへのpushで即座にデプロイしたい
- チームが小規模で迅速な判断ができる

**特徴:**
- ✅ develop/main へのpush で自動デプロイ
- ✅ 手動実行で任意の環境・ブランチを選択可能
- ⚡ 高速なデプロイサイクル

### deploy-manual.yml（手動承認付きデプロイ）

**こんな場合に推奨:**
- 本番環境への変更を慎重に行いたい
- デプロイ前に必ず承認プロセスが必要
- コンプライアンス要件がある

**特徴:**
- 🔐 GitHub Environmentsの承認機能を使用
- ✅ インフラデプロイ前に承認が必要
- 🛡️ 本番環境への安全なデプロイ

---

## ⚙️ セットアップ

初回セットアップ手順は **[CI/CDセットアップ](../../docs/rules/operations/CI_CD_SETUP.md)** を参照してください。

### 必要な設定

1. **AWS OIDC プロバイダー** の作成
2. **IAMロール** の作成（環境別）
3. **GitHub Secrets** の設定
   - `AWS_ROLE_ARN_STG` - Staging環境用
   - `AWS_ROLE_ARN_PROD` - Production環境用
4. **GitHub Environments** の設定（deploy-manual.yml使用時）
   - `staging` 環境
   - `production` 環境（承認者設定が必要）
5. **AWS Secrets Manager** の設定
   - `stg-database-credentials`
   - `prod-database-credentials`
6. **CDK Bootstrap**（各環境で初回のみ）

---

## 🔄 デプロイワークフローの切り替え

### deploy-auto.yml を使用する場合

```bash
# deploy-manual.yml を無効化
git mv .github/workflows/deploy-manual.yml .github/workflows/deploy-manual.yml.disabled

git add .github/workflows/
git commit -m "chore: use auto deployment workflow"
git push
```

### deploy-manual.yml を使用する場合

```bash
# deploy-auto.yml を無効化
git mv .github/workflows/deploy-auto.yml .github/workflows/deploy-auto.yml.disabled

# GitHub Environments の設定も必要
# Settings → Environments → production → Required reviewers

git add .github/workflows/
git commit -m "chore: use manual approval deployment workflow"
git push
```

---

## 📖 関連ドキュメント

- **[CI/CDガイド](../../docs/rules/operations/CI_CD_GUIDE.md)** - ワークフローの詳細、使い方
- **[CI/CDセットアップ](../../docs/rules/operations/CI_CD_SETUP.md)** - セットアップ手順

---

**最終更新**: 2025-11-23
