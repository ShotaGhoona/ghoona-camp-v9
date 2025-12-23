import logging
from uuid import uuid4

import boto3
from botocore.exceptions import ClientError

from app.application.interfaces.storage_service import IStorageService
from app.config import get_settings

logger = logging.getLogger(__name__)


class S3ServiceImpl(IStorageService):
    """S3ストレージサービスの実装"""

    def __init__(self):
        settings = get_settings()
        self.bucket_name = settings.s3_bucket_name
        self.region = settings.aws_region

        # boto3クライアントを初期化
        # 環境変数 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY が設定されていれば自動で使用
        # ECS/Lambda等のIAMロールがあればそちらを優先
        self.s3_client = boto3.client(
            's3',
            region_name=self.region,
        )

    def generate_upload_url(
        self,
        file_name: str,
        content_type: str,
        folder: str = 'avatars',
    ) -> tuple[str, str]:
        """
        署名付きアップロードURLを生成

        Args:
            file_name: ファイル名
            content_type: MIMEタイプ（image/png など）
            folder: 保存先フォルダ

        Returns:
            tuple[str, str]: (署名付きアップロードURL, 公開URL)
        """
        # ファイル拡張子を取得
        ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else 'png'

        # ユニークなキーを生成
        key = f'{folder}/{uuid4()}.{ext}'

        try:
            # 署名付きURLを生成（5分間有効）
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key,
                    'ContentType': content_type,
                },
                ExpiresIn=300,  # 5分
            )

            # 公開URL
            public_url = (
                f'https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{key}'
            )

            logger.info(f'Generated presigned URL for key: {key}')
            return presigned_url, public_url

        except ClientError as e:
            logger.error(f'Failed to generate presigned URL: {e}')
            raise

    def delete_file(self, file_url: str) -> bool:
        """
        ファイルを削除

        Args:
            file_url: ファイルのURL

        Returns:
            bool: 削除成功したかどうか
        """
        try:
            # URLからキーを抽出
            # https://bucket.s3.region.amazonaws.com/folder/file.ext
            key = file_url.split('.amazonaws.com/')[-1]

            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key,
            )
            logger.info(f'Deleted file: {key}')
            return True

        except ClientError as e:
            logger.error(f'Failed to delete file: {e}')
            return False
