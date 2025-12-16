import { Construct } from 'constructs';
import { S3Construct } from '../construct/datastore/s3-construct';
import { CloudFrontConstruct } from '../construct/api/cloudfront-construct';
import { AmplifyConstruct } from '../construct/hosting/amplify-construct';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface FrontendResourceProps {
  /**
   * フロントエンドタイプ
   * - 'amplify': AWS Amplify Hosting
   * - 's3-cloudfront': S3 + CloudFront
   */
  type: 'amplify' | 's3-cloudfront';
  /**
   * S3バケット名（S3+CloudFront使用時）
   */
  bucketName?: string;
  /**
   * Amplifyアプリ名（Amplify使用時）
   */
  amplifyAppName?: string;
  /**
   * GitHubリポジトリ（Amplify使用時）
   * 形式: "owner/repo-name"
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
  /**
   * CloudFrontコメント（S3+CloudFront使用時）
   */
  comment?: string;
  /**
   * SPA対応
   * @default true
   */
  spaMode?: boolean;
  /**
   * 削除ポリシー
   * @default DESTROY（開発環境）
   */
  removalPolicy?: RemovalPolicy;
  /**
   * 環境変数（Amplify使用時）
   */
  environmentVariables?: { [key: string]: string };
}

/**
 * レイヤー2: フロントエンドResource（機能単位）
 * 
 * 責務: フロントエンド配信基盤全体を提供
 * 
 * 2つのデプロイ方式をサポート:
 * 1. Amplify（デフォルト）
 *    - Git連携による自動デプロイ
 *    - ビルド・デプロイパイプライン内蔵
 *    - 簡単セットアップ
 * 
 * 2. S3 + CloudFront
 *    - カスタマイズ性が高い
 *    - 手動デプロイ
 *    - 細かい制御が可能
 * 
 * 含まれるConstruct: AmplifyConstruct または S3Construct + CloudFrontConstruct
 * 
 * 変更頻度: 日次変更（フロントエンドデプロイ）
 */
export class FrontendResource extends Construct {
  public readonly bucket?: s3.Bucket;
  public readonly distribution?: cloudfront.Distribution;
  public readonly amplifyApp?: amplify.CfnApp;
  public readonly amplifyBranch?: amplify.CfnBranch;

  constructor(scope: Construct, id: string, props: FrontendResourceProps) {
    super(scope, id);

    if (props.type === 'amplify') {
      // Amplify Hostingを使用
      if (!props.amplifyAppName) {
        throw new Error('amplifyAppName is required when type is "amplify"');
      }

      const amplifyConstruct = new AmplifyConstruct(this, 'AmplifyConstruct', {
        appName: props.amplifyAppName,
        githubRepo: props.githubRepo,
        githubBranch: props.githubBranch,
        monorepoAppRoot: props.monorepoAppRoot,
        environmentVariables: props.environmentVariables,
      });

      this.amplifyApp = amplifyConstruct.app;
      this.amplifyBranch = amplifyConstruct.branch;

      console.log(`✅ Amplify Hosting created: ${props.amplifyAppName}`);
      if (props.githubRepo) {
        console.log(`   GitHub: ${props.githubRepo} (${props.githubBranch || 'main'})`);
      }
    } else {
      // S3 + CloudFront を使用
      if (!props.bucketName) {
        throw new Error('bucketName is required when type is "s3-cloudfront"');
      }

    // S3バケットの作成
    const s3Construct = new S3Construct(this, 'S3Construct', {
      bucketName: props.bucketName,
      removalPolicy: props.removalPolicy || RemovalPolicy.DESTROY,
      publicReadAccess: true, // CloudFront経由でパブリックアクセス
    });
    this.bucket = s3Construct.bucket;

    // CloudFront Distributionの作成
    const cloudfrontConstruct = new CloudFrontConstruct(this, 'CloudFrontConstruct', {
      originBucket: this.bucket,
      comment: props.comment,
      spaMode: props.spaMode,
    });
    this.distribution = cloudfrontConstruct.distribution;

      console.log(`✅ S3 + CloudFront created: ${props.bucketName}`);
    }
  }
}

