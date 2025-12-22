"""参加関連の依存性注入"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.attendance_usecase import AttendanceUsecase, RankingUsecase
from app.infrastructure.db.repositories.attendance_repository_impl import (
    AttendanceRepositoryImpl,
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


def get_attendance_usecase(db: Session = Depends(get_db)) -> AttendanceUsecase:
    """
    AttendanceUsecaseの依存性を注入

    Args:
        db: SQLAlchemyセッション

    Returns:
        AttendanceUsecase: 参加ユースケース
    """
    attendance_repository = AttendanceRepositoryImpl(session=db)
    return AttendanceUsecase(attendance_repository=attendance_repository)
