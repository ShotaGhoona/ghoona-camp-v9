import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RemovalPolicy } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';

/**
 * テスト用設定
 * 環境変数に依存せず、固定値を使用
 */
export const testConfig: EnvironmentConfig = {
  envName: 'test',
  account: '123456789012',
  region: 'ap-northeast-1',
  removalPolicy: RemovalPolicy.DESTROY,

  vpc: {
    cidr: '10.0.0.0/16',
    maxAzs: 2,
    natGateways: 1,
  },

  network: {
    cidr: '10.0.0.0/16',
    maxAzs: 2,
    natGateways: 1,
  },

  database: {
    // テスト環境: RDSがデフォルトで有効
    enableDynamo: false,
    enableAurora: false,
    enableRds: true,
    engine: 'postgres',
    instanceType: ec2.InstanceType.of(
      ec2.InstanceClass.T3,
      ec2.InstanceSize.SMALL
    ),
    multiAz: false,
    allocatedStorageGb: 20,
    readerCount: 0,
    backupRetentionDays: 3,
  },

  ecs: {
    backend: {
      cpu: 256,
      memory: 512,
      desiredCount: 1,
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
    type: 'amplify', // テスト環境もAmplifyをデフォルト
  },

  lambda: {
    memorySize: 256,
    timeout: 30,
    reservedConcurrency: 10,
  },

  tags: {
    Environment: 'test',
    Project: 'cdk-template',
    ManagedBy: 'CDK',
  },
};

