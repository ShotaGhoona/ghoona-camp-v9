import { Construct } from 'constructs';
import { AvatarBucketConstruct } from '../construct/datastore/avatar-bucket-construct';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface AvatarStorageResourceProps {
  /**
   * S3バケット名
   */
  bucketName: string;
  /**
   * 削除ポリシー
   * @default RETAIN
   */
  removalPolicy?: RemovalPolicy;
  /**
   * CORS許可オリジン
   */
  allowedOrigins?: string[];
}

/**
 * レイヤー2: アバターストレージResource（機能単位）
 *
 * 責務: アバター画像アップロード機能の提供
 * - CORS設定済みS3バケット
 * - 署名付きURLでのアップロード対応
 * - avatarsフォルダの公開読み取り
 *
 * 含まれるConstruct: AvatarBucketConstruct
 *
 * 変更頻度: まれ
 */
export class AvatarStorageResource extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(
    scope: Construct,
    id: string,
    props: AvatarStorageResourceProps
  ) {
    super(scope, id);

    // アバターバケットの作成
    const avatarBucket = new AvatarBucketConstruct(this, 'AvatarBucket', {
      bucketName: props.bucketName,
      removalPolicy: props.removalPolicy,
      allowedOrigins: props.allowedOrigins,
    });

    this.bucket = avatarBucket.bucket;

    console.log(`✅ Avatar S3 bucket created: ${props.bucketName}`);
  }
}
