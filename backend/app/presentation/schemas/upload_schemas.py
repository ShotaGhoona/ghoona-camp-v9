from pydantic import BaseModel, Field


class GetUploadUrlRequest(BaseModel):
    """署名付きURL取得リクエスト"""

    file_name: str = Field(
        ...,
        description='ファイル名',
        max_length=255,
        alias='fileName',
    )
    content_type: str = Field(
        ...,
        description='MIMEタイプ（image/png, image/jpeg など）',
        max_length=50,
        alias='contentType',
    )
    file_size: int = Field(
        ...,
        description='ファイルサイズ（バイト）',
        gt=0,
        alias='fileSize',
    )

    class Config:
        populate_by_name = True


class GetUploadUrlResponse(BaseModel):
    """署名付きURL取得レスポンス"""

    upload_url: str = Field(
        ...,
        description='署名付きアップロードURL（5分間有効）',
        alias='uploadUrl',
    )
    public_url: str = Field(
        ...,
        description='アップロード後の公開URL',
        alias='publicUrl',
    )

    class Config:
        populate_by_name = True


class ErrorResponse(BaseModel):
    """エラーレスポンス"""

    detail: str = Field(..., description='エラーメッセージ')
