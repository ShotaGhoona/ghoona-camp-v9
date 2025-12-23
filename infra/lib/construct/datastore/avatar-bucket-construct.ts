import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface AvatarBucketConstructProps {
  /**
   * バケット名
   */
  bucketName: string;
  /**
   * 削除ポリシー
   * @default RETAIN（本番環境推奨）
   */
  removalPolicy?: RemovalPolicy;
  /**
   * CORS許可オリジン
   * @default ['http://localhost:3004']
   */
  allowedOrigins?: string[];
}

/**
 * レイヤー1: アバター画像用S3バケットConstruct
 *
 * 責務: アバター画像アップロード用のS3バケット
 * - CORS設定（ブラウザから直接アップロード可能）
 * - avatarsフォルダのみ公開読み取り可能
 * - サーバーサイド暗号化
 *
 * 変更頻度: ほぼなし
 */
export class AvatarBucketConstruct extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: AvatarBucketConstructProps) {
    super(scope, id);

    const allowedOrigins = props.allowedOrigins || [
      'http://localhost:3004',
      'http://127.0.0.1:3004',
    ];

    // S3 Bucket
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
      // セキュリティ設定
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      // パブリックアクセス設定（バケットポリシーでのアクセスを許可）
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false, // バケットポリシーを許可
        restrictPublicBuckets: false,
      }),
      // 削除設定
      removalPolicy: props.removalPolicy || RemovalPolicy.RETAIN,
      autoDeleteObjects: props.removalPolicy === RemovalPolicy.DESTROY,
      // CORS設定（ブラウザからの直接アップロード用）
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            s3.HttpMethods.PUT,
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: allowedOrigins,
          exposedHeaders: ['ETag'],
          maxAge: 3600,
        },
      ],
    });

    // バケットポリシー: avatarsフォルダの公開読み取りを許可
    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'PublicReadAvatars',
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${this.bucket.bucketArn}/avatars/*`],
      })
    );
  }
}
