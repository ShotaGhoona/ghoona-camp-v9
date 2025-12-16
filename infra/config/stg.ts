import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RemovalPolicy } from 'aws-cdk-lib';
import { EnvironmentConfig } from './environment';

/**
 * ステージング環境設定
 */
export const stgConfig: EnvironmentConfig = {
  envName: 'stg',
  account: process.env.CDK_DEFAULT_ACCOUNT || '',
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
  removalPolicy: RemovalPolicy.SNAPSHOT, // STGはスナップショット保持

  vpc: {
    cidr: '10.2.0.0/16',
    maxAzs: 2, // STGは2AZ
    natGateways: 2,
  },

  network: {
    cidr: '10.2.0.0/16',
    maxAzs: 2,
    natGateways: 2,
  },

  database: {
    // 💡 ステージング: RDSがデフォルトで有効
    enableDynamo: false, // DynamoDBが必要な場合はtrue
    enableAurora: false, // Auroraが必要な場合はtrue（enableRdsはfalseに）
    enableRds: true, // デフォルト: RDSを使用
    engine: 'postgres',
    instanceType: ec2.InstanceType.of(
      ec2.InstanceClass.T3,
      ec2.InstanceSize.MEDIUM // STGはMedium
    ),
    multiAz: true, // STGは本番同様の構成でテスト
    allocatedStorageGb: 100, // 標準ストレージ
    readerCount: 0, // STGではReaderなし（RDSはMultiAZ構成で冗長化）
    backupRetentionDays: 7,
  },

  ecs: {
    backend: {
      cpu: 512,
      memory: 1024,
      desiredCount: 2, // STGは2台構成
      minCount: 2,
      maxCount: 4,
    },
    frontend: {
      cpu: 512,
      memory: 1024,
      desiredCount: 2,
      minCount: 2,
      maxCount: 4,
    },
  },

  frontend: {
    type: 'amplify', // 💡 ステージング: Amplifyで自動デプロイ
    // GitHubリポジトリを設定する場合はコメントを外す
    // githubRepo: 'owner/repo-name',
    // githubBranch: 'staging',
  },

  // 💡 ステージング環境でもLambdaを無効化（コスト削減、ECSで十分）
  // lambda: {
  //   memorySize: 512,
  //   timeout: 60,
  //   reservedConcurrency: 50,
  // },

  tags: {
    Environment: 'stg',
    Project: 'cdk-template',
    ManagedBy: 'CDK',
    CostCenter: 'staging',
  },
};

