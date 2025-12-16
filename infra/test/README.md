# CDK Template - Test Suite

このディレクトリには、CDK Template プロジェクトの包括的なテストスイートが含まれています。

## 📁 ディレクトリ構造

```
test/
├── stack/              # L3: スタック層のテスト
│   ├── foundation-stack.test.ts
│   ├── data-stack.test.ts
│   ├── security-stack.test.ts
│   ├── backend-stack.test.ts
│   ├── frontend-stack.test.ts
│   ├── integration-stack.test.ts
│   ├── observability-stack.test.ts
│   └── poc-stack.test.ts
├── resource/           # L2: リソース層のテスト
│   ├── network-resource.test.ts
│   ├── database-resource.test.ts
│   ├── security-resource.test.ts
│   └── messaging-resource.test.ts
└── README.md          # このファイル
```

## 🧪 テストの種類

### 1. Stack Tests (スタックテスト)
各スタックが正しく構成され、期待されるAWSリソースを作成することを検証します。

- **Foundation Stack**: VPC、サブネット、NAT Gateway、Internet Gatewayのテスト
- **Data Stack**: DynamoDB、Aurora、S3バケットのテスト
- **Security Stack**: Cognito User Pool、Secrets Managerのテスト
- **Backend Stack**: Lambda、ECS、ALB、API Gatewayのテスト
- **Frontend Stack**: S3、CloudFront、OAIのテスト
- **Integration Stack**: SNS、SQS、DLQのテスト
- **Observability Stack**: CloudWatch Alarms、Dashboardのテスト
- **PoC Stack**: All-in-Oneスタックのテスト

### 2. Resource Tests (リソーステスト)
複数のコンストラクトを組み合わせたリソース層の単体テストです。

- **Network Resource**: VPC、サブネット、ゲートウェイの統合テスト
- **Database Resource**: データストア（DynamoDB、Aurora、S3）の統合テスト
- **Security Resource**: 認証・認可リソースの統合テスト
- **Messaging Resource**: メッセージングリソース（SNS/SQS）の統合テスト

## 🚀 テストの実行

### 全テストの実行
```bash
npm test
```

### 特定のテストファイルを実行
```bash
npm test -- foundation-stack.test.ts
```

### 監視モードでテストを実行
```bash
npm test -- --watch
```

### カバレッジレポート付きで実行
```bash
npm test -- --coverage
```

### 特定のテストケースのみ実行
```bash
npm test -- -t "should create a VPC"
```

## 📝 テストの書き方

### 基本構造

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { YourStack } from '../../lib/stack/your-stack';

describe('YourStack', () => {
  let app: cdk.App;
  let stack: YourStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new YourStack(app, 'TestStack', {
      // props
    });
    template = Template.fromStack(stack);
  });

  it('should create expected resources', () => {
    template.resourceCountIs('AWS::Service::Resource', 1);
  });
});
```

### 主要なアサーションメソッド

#### リソース数の検証
```typescript
template.resourceCountIs('AWS::S3::Bucket', 1);
```

#### リソースプロパティの検証
```typescript
template.hasResourceProperties('AWS::S3::Bucket', {
  VersioningConfiguration: {
    Status: 'Enabled',
  },
});
```

#### 出力の検証
```typescript
const outputs = template.findOutputs('*');
expect(Object.keys(outputs)).toContain('BucketName');
```

#### 部分的なマッチング
```typescript
template.hasResourceProperties('AWS::IAM::Policy', {
  PolicyDocument: {
    Statement: cdk.Match.arrayWith([
      cdk.Match.objectLike({
        Action: 'dynamodb:GetItem',
        Effect: 'Allow',
      }),
    ]),
  },
});
```

## ✅ テストのベストプラクティス

### 1. 独立性
各テストは独立して実行可能であること。

### 2. 明確な命名
テストケース名は、何をテストしているか明確にする。
```typescript
// Good
it('should create a VPC with correct CIDR block', () => {});

// Bad
it('test VPC', () => {});
```

### 3. AAA パターン
- **Arrange**: テストデータとスタックをセットアップ
- **Act**: テスト対象を実行
- **Assert**: 結果を検証

```typescript
it('should grant read access to Lambda', () => {
  // Arrange
  const stack = new MyStack(app, 'Test');
  
  // Act
  const template = Template.fromStack(stack);
  
  // Assert
  template.hasResourceProperties('AWS::IAM::Policy', {
    // ...
  });
});
```

### 4. テストスコープ
- **Stack Tests**: スタック全体の統合テスト
- **Resource Tests**: リソース層の単体テスト
- **Construct Tests**: 個別のコンストラクトの単体テスト

### 5. モックの使用
依存関係が複雑な場合、モックリソースを使用する。

```typescript
const mockVpc = ec2.Vpc.fromLookup(stack, 'MockVpc', {
  vpcId: 'vpc-12345',
});
```

## 🔍 テストカバレッジ

### 重点的にテストすべき項目

1. **リソースの存在確認**
   - 期待されるAWSリソースが作成されるか

2. **リソース設定の検証**
   - セキュリティ設定（暗号化、アクセス制御）
   - パフォーマンス設定（CPU、メモリ）
   - 可用性設定（Multi-AZ、バックアップ）

3. **IAM権限の検証**
   - 必要最小限の権限が付与されているか
   - 不要な権限が付与されていないか

4. **ネットワーク設定の検証**
   - セキュリティグループのルール
   - サブネット配置
   - ルーティング設定

5. **クロススタック参照**
   - 依存関係が正しく設定されているか
   - 出力値が正しくエクスポートされているか

6. **環境固有の設定**
   - dev/prodで異なる設定が正しく適用されるか
   - タグが正しく付与されているか

## 🐛 トラブルシューティング

### よくあるエラーと解決方法

#### 1. `Error: No stack could be synthesized`
```typescript
// 原因: スタックが正しくインスタンス化されていない
// 解決: beforeEach でスタックを正しく作成

beforeEach(() => {
  app = new cdk.App();
  stack = new YourStack(app, 'TestStack', {
    env: { account: '123456789012', region: 'ap-northeast-1' },
  });
});
```

#### 2. `Template does not contain expected resource`
```typescript
// 原因: リソースタイプが間違っている
// 解決: AWSのドキュメントで正しいリソースタイプを確認

// 間違い
template.resourceCountIs('AWS::S3::Buckets', 1);

// 正しい
template.resourceCountIs('AWS::S3::Bucket', 1);
```

#### 3. `Expected property not found`
```typescript
// 原因: プロパティパスが間違っている
// 解決: template.toJSON() で実際の構造を確認

const json = template.toJSON();
console.log(JSON.stringify(json, null, 2));
```

## 📚 参考資料

- [AWS CDK Assertions](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.assertions-readme.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [CDK Testing Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/testing.html)

## 🔄 CI/CD統合

このテストスイートは、CI/CDパイプラインで自動実行されることを想定しています。

### GitHub Actions の例
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## 📊 テストメトリクス

定期的にテストカバレッジを確認し、以下の目標を維持します：

- **Line Coverage**: 80%以上
- **Branch Coverage**: 75%以上
- **Function Coverage**: 85%以上
- **Statement Coverage**: 80%以上

```bash
npm test -- --coverage --coverageReporters=text-summary
```

