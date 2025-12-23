import logging

from app.application.interfaces.storage_service import IStorageService
from app.application.schemas.upload_schemas import UploadUrlDTO

logger = logging.getLogger(__name__)

# 許可するContent-Type
ALLOWED_CONTENT_TYPES = {'image/png', 'image/jpeg', 'image/gif', 'image/webp'}

# 最大ファイルサイズ（5MB）
MAX_FILE_SIZE = 5 * 1024 * 1024


class UploadUsecase:
    """ファイルアップロードのユースケース"""

    def __init__(self, storage_service: IStorageService):
        self.storage_service = storage_service

    def generate_avatar_upload_url(
        self,
        file_name: str,
        content_type: str,
        file_size: int,
    ) -> UploadUrlDTO:
        """
        アバター画像用の署名付きアップロードURLを生成

        Args:
            file_name: ファイル名
            content_type: MIMEタイプ
            file_size: ファイルサイズ（バイト）

        Returns:
            UploadUrlDTO: アップロードURL情報

        Raises:
            ValueError: バリデーションエラー
        """
        # Content-Typeのバリデーション
        if content_type not in ALLOWED_CONTENT_TYPES:
            allowed = ', '.join(ALLOWED_CONTENT_TYPES)
            raise ValueError(f'許可されていないファイル形式です。許可: {allowed}')

        # ファイルサイズのバリデーション
        if file_size > MAX_FILE_SIZE:
            max_mb = MAX_FILE_SIZE / (1024 * 1024)
            raise ValueError(f'ファイルサイズが大きすぎます（最大{max_mb:.0f}MB）')

        if file_size <= 0:
            raise ValueError('ファイルサイズが不正です')

        # 署名付きURLを生成
        upload_url, public_url = self.storage_service.generate_upload_url(
            file_name=file_name,
            content_type=content_type,
            folder='avatars',
        )

        logger.info(f'Generated upload URL for avatar: {file_name}')

        return UploadUrlDTO(
            upload_url=upload_url,
            public_url=public_url,
        )
