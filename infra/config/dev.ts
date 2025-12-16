import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RemovalPolicy } from 'aws-cdk-lib';
import { EnvironmentConfig } from './environment';

/**
 * 開発環境設定
 */
export const devConfig: EnvironmentConfig = {
  envName: 'dev',
  account: process.env.CDK_DEFAULT_ACCOUNT || '',
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
  removalPolicy: RemovalPolicy.DESTROY, // 開発環境は削除可能

  vpc: {
    cidr: '10.0.0.0/16',
    maxAzs: 2,
    natGateways: 1, // コスト削減
  },

  network: {
    cidr: '10.0.0.0/16',
    maxAzs: 2,
    natGateways: 1, // コスト削減
  },

  database: {
    // 💡 開発環境: RDSがデフォルトで有効
    enableDynamo: false, // DynamoDBが必要な場合はtrue
    enableAurora: false, // Auroraが必要な場合はtrue（enableRdsはfalseに）
    enableRds: true, // デフォルト: RDSを使用
    engine: 'postgres',
    instanceType: ec2.InstanceType.of(
      ec2.InstanceClass.T3,
      ec2.InstanceSize.MICRO // 開発環境は最小構成
    ),
    multiAz: false, // 開発環境はシングルAZでコスト削減
    allocatedStorageGb: 20, // 開発環境は最小ストレージ
    readerCount: 0, // 開発環境はWriterのみ
    backupRetentionDays: 3,
  },

  ecs: {
    backend: {
      cpu: 256,
      memory: 512,
      desiredCount: 1, // 開発環境は最小構成
      minCount: 1,
      maxCount: 2,
    },
    frontend: {
      cpu: 256,
      memory: 512,
      desiredCount: 1,
      minCount: 1,
      maxCount: 2,
    },
  },

  frontend: {
    type: 'amplify', // 💡 開発環境: Amplifyで簡単デプロイ
    // GitHubリポジトリを設定する場合はコメントを外す
    // githubRepo: 'owner/repo-name',
    // githubBranch: 'develop',
    // 📁 モノレポの場合はフロントエンドディレクトリを指定
    // monorepoAppRoot: 'frontend',
  },

  // 💡 開発環境ではLambdaを無効化（コスト削減）
  // Lambda: undefined,

  tags: {
    Environment: 'dev',
    Project: 'cdk-template',
    ManagedBy: 'CDK',
  },
};

