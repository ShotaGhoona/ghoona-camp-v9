"""ユーザー関連の依存性注入"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.user_usecase import UserUsecase
from app.infrastructure.db.repositories.user_repository_impl import UserRepositoryImpl
from app.infrastructure.db.session import get_db


def get_user_usecase(db: Session = Depends(get_db)) -> UserUsecase:
    """
    UserUsecaseの依存性を注入

    Args:
        db: SQLAlchemyセッション

    Returns:
        UserUsecase: ユーザーユースケース
    """
    user_repository = UserRepositoryImpl(session=db)
    return UserUsecase(user_repository=user_repository)
