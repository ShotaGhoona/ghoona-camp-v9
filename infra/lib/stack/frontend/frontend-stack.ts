import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../../../config/environment';
import { FrontendResource } from '../../resource/frontend-resource';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as amplify from 'aws-cdk-lib/aws-amplify';

export interface FrontendStackProps extends cdk.StackProps {
  /**
   * バックエンドAPI URL（オプション）
   * フロントエンドの環境変数として使用
   */
  backendApiUrl?: string;
}

/**
 * レイヤー3: Frontend Stack（フロントエンドスタック）
 * 
 * 責務: フロントエンド配信環境の提供
 * 
 * 2つのデプロイ方式をサポート:
 * 1. Amplify（デフォルト）
 *    - Git連携による自動デプロイ
 *    - ビルドパイプライン内蔵
 *    - 簡単セットアップ
 * 
 * 2. S3 + CloudFront
 *    - カスタマイズ性が高い
 *    - 手動デプロイ
 *    - 細かい制御が可能
 * 
 * 含まれるResource: FrontendResource
 * 
 * 変更頻度: 日次変更（フロントエンドデプロイ）
 * デプロイ時間: 約3-5分
 * 
 * 分離理由:
 * - フロントエンド開発の高頻度デプロイに対応
 * - バックエンドへの影響ゼロでデプロイ可能
 * - フロントエンドチームが独立して作業可能
 */
export class FrontendStack extends cdk.Stack {
  public readonly bucket?: s3.Bucket;
  public readonly distribution?: cloudfront.Distribution;
  public readonly amplifyApp?: amplify.CfnApp;

  constructor(
    scope: Construct,
    id: string,
    config: EnvironmentConfig,
    props?: FrontendStackProps
  ) {
    super(scope, id, props);

    // 環境変数の準備
    const envVars = props?.backendApiUrl
      ? { VITE_API_URL: props.backendApiUrl }
      : undefined;

    if (config.frontend.type === 'amplify') {
      // Amplify Hosting を使用
      const frontendResource = new FrontendResource(this, 'FrontendResource', {
        type: 'amplify',
        amplifyAppName: `${config.envName}-cdk-template`,
        githubRepo: config.frontend.githubRepo,
        githubBranch: config.frontend.githubBranch,
        monorepoAppRoot: config.frontend.monorepoAppRoot, // モノレポ対応
        environmentVariables: envVars,
        removalPolicy: config.removalPolicy,
      });

      this.amplifyApp = frontendResource.amplifyApp;

      // Outputs
      if (this.amplifyApp) {
        new cdk.CfnOutput(this, 'FrontendUrl', {
          value: `https://${config.frontend.githubBranch || 'main'}.${this.amplifyApp.attrDefaultDomain}`,
          description: 'Frontend Amplify URL',
          exportName: `${config.envName}-FrontendUrl`,
        });

        new cdk.CfnOutput(this, 'AmplifyAppId', {
          value: this.amplifyApp.attrAppId,
          description: 'Amplify App ID',
          exportName: `${config.envName}-AmplifyAppId`,
        });
      }
    } else {
      // S3 + CloudFront を使用
      const bucketPrefix = `${config.envName}-cdk-template-frontend`;

    const frontendResource = new FrontendResource(this, 'FrontendResource', {
        type: 's3-cloudfront',
        bucketName: bucketPrefix,
      comment: `${config.envName} CDK Template Frontend`,
        spaMode: true,
      removalPolicy: config.removalPolicy,
    });

    this.bucket = frontendResource.bucket;
    this.distribution = frontendResource.distribution;

      // Outputs
      if (this.distribution) {
        new cdk.CfnOutput(this, 'FrontendUrl', {
          value: `https://${this.distribution.distributionDomainName}`,
          description: 'Frontend CloudFront URL',
          exportName: `${config.envName}-FrontendUrl`,
        });

        new cdk.CfnOutput(this, 'DistributionId', {
          value: this.distribution.distributionId,
          description: 'CloudFront Distribution ID',
          exportName: `${config.envName}-DistributionId`,
        });
      }

      if (this.bucket) {
        new cdk.CfnOutput(this, 'FrontendBucketName', {
          value: this.bucket.bucketName,
          description: 'Frontend S3 Bucket Name',
          exportName: `${config.envName}-FrontendBucketName`,
        });
      }
    }

    // バックエンドAPI URL（共通）
    if (props?.backendApiUrl) {
      new cdk.CfnOutput(this, 'BackendApiUrl', {
        value: props.backendApiUrl,
        description: 'Backend API URL for Frontend',
      });
    }

    // タグ付け
    cdk.Tags.of(this).add('Environment', config.envName);
    cdk.Tags.of(this).add('Project', config.tags.Project);
    cdk.Tags.of(this).add('ManagedBy', config.tags.ManagedBy);
    cdk.Tags.of(this).add('Layer', 'Frontend');
    cdk.Tags.of(this).add('FrontendType', config.frontend.type);
  }
}

