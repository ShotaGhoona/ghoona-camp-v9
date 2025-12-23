import logging

from fastapi import APIRouter, Depends, HTTPException

from app.application.use_cases.upload_usecase import UploadUsecase
from app.di.upload import get_upload_usecase
from app.domain.entities.user import User
from app.presentation.api.auth_api import get_current_user_from_cookie
from app.presentation.schemas.upload_schemas import (
    ErrorResponse,
    GetUploadUrlRequest,
    GetUploadUrlResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix='/upload',
    tags=['upload'],
)


@router.post(
    '/url',
    response_model=GetUploadUrlResponse,
    responses={
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        500: {'model': ErrorResponse, 'description': 'サーバーエラー'},
    },
    summary='署名付きアップロードURLを取得',
    description='S3への直接アップロード用の署名付きURLを生成します。URLは5分間有効です。',
)
def get_upload_url(
    request: GetUploadUrlRequest,
    upload_usecase: UploadUsecase = Depends(get_upload_usecase),
    current_user: User = Depends(get_current_user_from_cookie),
) -> GetUploadUrlResponse:
    """
    署名付きアップロードURLを取得

    - 認証済みユーザーのみ利用可能
    - 許可されるファイル形式: image/png, image/jpeg, image/gif, image/webp
    - 最大ファイルサイズ: 5MB
    """
    try:
        result = upload_usecase.generate_avatar_upload_url(
            file_name=request.file_name,
            content_type=request.content_type,
            file_size=request.file_size,
        )

        logger.info(f'Upload URL generated for user: {current_user.id}')

        return GetUploadUrlResponse(
            upload_url=result.upload_url,
            public_url=result.public_url,
        )

    except ValueError as e:
        logger.warning(f'Validation error: {e}')
        raise HTTPException(status_code=400, detail=str(e)) from None

    except Exception as e:
        logger.error(f'Failed to generate upload URL: {e}')
        raise HTTPException(
            status_code=500,
            detail='アップロードURLの生成に失敗しました',
        ) from None
