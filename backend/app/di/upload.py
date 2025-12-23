from app.application.use_cases.upload_usecase import UploadUsecase
from app.infrastructure.storage.s3_service_impl import S3ServiceImpl


def get_upload_usecase() -> UploadUsecase:
    """
    UploadUsecaseの依存性注入

    S3ServiceImplを注入したUploadUsecaseを返す
    """
    storage_service = S3ServiceImpl()
    return UploadUsecase(storage_service=storage_service)
