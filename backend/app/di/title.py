"""称号関連の依存性注入"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.title_usecase import TitleUsecase
from app.infrastructure.db.repositories.title_repository_impl import TitleRepositoryImpl
from app.infrastructure.db.session import get_db


def get_title_usecase(db: Session = Depends(get_db)) -> TitleUsecase:
    """
    TitleUsecaseの依存性を注入

    Args:
        db: SQLAlchemyセッション

    Returns:
        TitleUsecase: 称号ユースケース
    """
    title_repository = TitleRepositoryImpl(session=db)
    return TitleUsecase(title_repository=title_repository)
