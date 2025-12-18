"""ユーザー関連の依存性注入"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.user_usecase import UserUsecase
from app.infrastructure.db.repositories.user_repository_impl import UserRepositoryImpl
from app.infrastructure.db.session import get_db
from app.infrastructure.security.security_service_impl import SecurityServiceImpl


def get_user_usecase(db: Session = Depends(get_db)) -> UserUsecase:
    """
    UserUsecaseの依存性を注入（ユーザー一覧・詳細用）

    Args:
        db: SQLAlchemyセッション

    Returns:
        UserUsecase: ユーザーユースケース
    """
    user_repository = UserRepositoryImpl(session=db)
    return UserUsecase(user_repository=user_repository)


def get_user_usecase_with_auth(db: Session = Depends(get_db)) -> UserUsecase:
    """
    UserUsecaseの依存性を注入（認証機能付き）

    Args:
        db: SQLAlchemyセッション

    Returns:
        UserUsecase: ユーザーユースケース（認証機能付き）
    """
    user_repository = UserRepositoryImpl(session=db)
    security_service = SecurityServiceImpl()
    return UserUsecase(
        user_repository=user_repository,
        security_service=security_service,
    )
