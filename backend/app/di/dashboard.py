"""ダッシュボード関連の依存性注入"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.dashboard_usecase import DashboardUsecase
from app.infrastructure.db.repositories.dashboard_repository_impl import (
    DashboardRepositoryImpl,
)
from app.infrastructure.db.session import get_db


def get_dashboard_usecase(db: Session = Depends(get_db)) -> DashboardUsecase:
    """
    DashboardUsecaseの依存性を注入

    Args:
        db: SQLAlchemyセッション

    Returns:
        DashboardUsecase: ダッシュボードユースケース
    """
    dashboard_repository = DashboardRepositoryImpl(session=db)
    return DashboardUsecase(dashboard_repository=dashboard_repository)
