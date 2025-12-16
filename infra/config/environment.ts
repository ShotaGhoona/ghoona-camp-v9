import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RemovalPolicy } from 'aws-cdk-lib';

/**
 * 環境設定インターフェース
 */
export interface EnvironmentConfig {
  /**
   * 環境名 (dev, staging, prod)
   */
  envName: string;

  /**
   * AWSアカウントID
   */
  account: string;

  /**
   * AWSリージョン
   */
  region: string;

  /**
   * 削除ポリシー
   */
  removalPolicy: RemovalPolicy;

  /**
   * VPC設定（networkエイリアス）
   */
  vpc: {
    cidr: string;
    maxAzs: number;
    natGateways: number;
  };

  /**
   * VPC設定（vpcエイリアス）
   */
  network: {
    cidr: string;
    maxAzs: number;
    natGateways: number;
  };

  /**
   * データベース設定
   */
  database: {
    /**
     * DynamoDBを有効化するか
     * @default false
     */
    enableDynamo?: boolean;
    /**
     * Auroraを有効化するか（enableRdsとは排他）
     * @default false
     */
    enableAurora?: boolean;
    /**
     * RDSを有効化するか（enableAuroraとは排他）
     * @default true
     */
    enableRds?: boolean;
    /**
     * エンジンタイプ（RDS/Aurora共通）
     */
    engine: 'postgres' | 'mysql';
    /**
     * インスタンスタイプ
     */
    instanceType: ec2.InstanceType;
    /**
     * マルチAZ配置（RDSのみ有効）
     * @default true
     */
    multiAz: boolean;
    /**
     * ストレージサイズ（GB、RDSのみ有効）
     * @default 100
     */
    allocatedStorageGb: number;
    /**
     * Readerインスタンス数（Auroraのみ有効）
     */
    readerCount: number;
    /**
     * バックアップ保持期間（日）
     */
    backupRetentionDays: number;
  };

  /**
   * ECS設定
   */
  ecs: {
    backend: {
      cpu: number;
      memory: number;
      desiredCount: number;
      minCount: number;
      maxCount: number;
    };
    frontend: {
      cpu: number;
      memory: number;
      desiredCount: number;
      minCount: number;
      maxCount: number;
    };
  };

  /**
   * フロントエンド設定
   */
  frontend: {
    /**
     * フロントエンドデプロイ方式
     * - 'amplify': AWS Amplify Hosting（デフォルト、簡単）
     * - 's3-cloudfront': S3 + CloudFront（カスタマイズ性高）
     */
    type: 'amplify' | 's3-cloudfront';
    /**
     * GitHubリポジトリ（Amplify使用時）
     */
    githubRepo?: string;
    /**
     * GitHubブランチ（Amplify使用時）
     * @default 'main'
     */
    githubBranch?: string;
    /**
     * モノレポのフロントエンドディレクトリ（Amplify使用時）
     * 例: 'frontend', 'apps/web'
     * @default undefined（リポジトリルート）
     */
    monorepoAppRoot?: string;
  };

  /**
   * Lambda設定
   * undefinedの場合、Lambdaは作成されません
   */
  lambda?: {
    memorySize: number;
    timeout: number;
    reservedConcurrency: number;
  };

  /**
   * タグ設定
   */
  tags: {
    [key: string]: string;
  };
}

