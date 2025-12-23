from abc import ABC, abstractmethod


class IStorageService(ABC):
    """ストレージサービスのインターフェース"""

    @abstractmethod
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
        pass

    @abstractmethod
    def delete_file(self, file_url: str) -> bool:
        """
        ファイルを削除

        Args:
            file_url: ファイルのURL

        Returns:
            bool: 削除成功したかどうか
        """
        pass
