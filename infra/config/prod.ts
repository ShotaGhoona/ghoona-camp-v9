import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RemovalPolicy } from 'aws-cdk-lib';
import { EnvironmentConfig } from './environment';

/**
 * 本番環境設定
 */
export const prodConfig: EnvironmentConfig = {
  envName: 'prod',
  account: process.env.CDK_DEFAULT_ACCOUNT || '',
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
  removalPolicy: RemovalPolicy.RETAIN, // 本番環境は保持

  vpc: {
    cidr: '10.1.0.0/16',
    maxAzs: 3, // 本番環境は3AZ
    natGateways: 3, // AZごとにNAT Gateway
  },

  network: {
    cidr: '10.1.0.0/16',
    maxAzs: 3, // 本番環境は3AZ
    natGateways: 3, // AZごとにNAT Gateway
  },

  database: {
    // 💡 本番環境: Auroraを使用（高可用性）
    enableDynamo: false, // DynamoDBが必要な場合はtrue
    enableAurora: true, // 本番: Auroraを使用
    enableRds: false, // Auroraを使うのでRDSは無効
    engine: 'postgres',
    instanceType: ec2.InstanceType.of(
      ec2.InstanceClass.R6G,
      ec2.InstanceSize.LARGE // 本番環境は高性能
    ),
    multiAz: true, // 本番環境はマルチAZ
    allocatedStorageGb: 500, // 本番環境は大容量
    readerCount: 2, // Reader 2台（Auroraのみ）
    backupRetentionDays: 30,
  },

  ecs: {
    backend: {
      cpu: 1024,
      memory: 2048,
      desiredCount: 4, // 本番環境は冗長構成
      minCount: 2,
      maxCount: 10,
    },
    frontend: {
      cpu: 512,
      memory: 1024,
      desiredCount: 4,
      minCount: 2,
      maxCount: 10,
    },
  },

  frontend: {
    type: 'amplify', // 💡 本番: Amplifyで簡単運用
    // GitHubリポジトリを設定する場合はコメントを外す
    // githubRepo: 'owner/repo-name',
    // githubBranch: 'main',
  },

  // 💡 本番環境でもLambdaを無効化（ECSで統一）
  // Lambda が必要な場合は、この設定を有効化してください
  // lambda: {
  //   memorySize: 512,
  //   timeout: 60,
  //   reservedConcurrency: 100,
  // },

  tags: {
    Environment: 'prod',
    Project: 'cdk-template',
    ManagedBy: 'CDK',
    CostCenter: 'production',
  },
};

