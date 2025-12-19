"""ランキング関連の依存性注入"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.attendance_usecase import RankingUsecase
from app.infrastructure.db.repositories.attendance_repository_impl import (
    RankingRepositoryImpl,
)
from app.infrastructure.db.session import get_db


def get_ranking_usecase(db: Session = Depends(get_db)) -> RankingUsecase:
    """
    RankingUsecaseの依存性を注入

    Args:
        db: SQLAlchemyセッション

    Returns:
        RankingUsecase: ランキングユースケース
    """
    ranking_repository = RankingRepositoryImpl(session=db)
    return RankingUsecase(ranking_repository=ranking_repository)
