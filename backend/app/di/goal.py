"""目標関連の依存性注入"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.goal_usecase import GoalUsecase
from app.infrastructure.db.repositories.goal_repository_impl import GoalRepositoryImpl
from app.infrastructure.db.session import get_db


def get_goal_usecase(db: Session = Depends(get_db)) -> GoalUsecase:
    """
    GoalUsecaseの依存性を注入

    Args:
        db: SQLAlchemyセッション

    Returns:
        GoalUsecase: 目標ユースケース
    """
    goal_repository = GoalRepositoryImpl(session=db)
    return GoalUsecase(goal_repository=goal_repository)
