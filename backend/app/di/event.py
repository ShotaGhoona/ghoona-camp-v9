"""イベント関連の依存性注入"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.use_cases.event_usecase import EventUsecase
from app.infrastructure.db.repositories.event_repository_impl import EventRepositoryImpl
from app.infrastructure.db.session import get_db


def get_event_usecase(db: Session = Depends(get_db)) -> EventUsecase:
    """
    EventUsecaseの依存性を注入

    Args:
        db: SQLAlchemyセッション

    Returns:
        EventUsecase: イベントユースケース
    """
    event_repository = EventRepositoryImpl(session=db)
    return EventUsecase(event_repository=event_repository)
