"""イベントリポジトリの実装"""

import calendar
from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.repositories.event_repository import (
    EventCreateData,
    EventCreator,
    EventDetail,
    EventListItem,
    EventParticipant,
    EventSearchFilter,
    EventUpdateData,
    IEventRepository,
    ParticipantResult,
)
from app.infrastructure.db.models.event_model import EventModel, EventParticipantModel
from app.infrastructure.db.models.user_model import UserMetadataModel, UserModel


class EventRepositoryImpl(IEventRepository):
    """イベントリポジトリの実装"""

    def __init__(self, session: Session):
        """
        コンストラクタ

        Args:
            session: SQLAlchemyのセッション
        """
        self.session = session

    def get_events_by_month(
        self, filter: EventSearchFilter
    ) -> list[EventListItem]:
        """
        月ベースでイベント一覧を取得
        """
        # 月初と月末を計算
        month_start = date(filter.year, filter.month, 1)
        _, last_day = calendar.monthrange(filter.year, filter.month)
        month_end = date(filter.year, filter.month, last_day)

        # 参加者数サブクエリ
        participant_count_subq = (
            select(func.count(EventParticipantModel.id))
            .where(
                EventParticipantModel.event_id == EventModel.id,
                EventParticipantModel.status == 'registered',
            )
            .correlate(EventModel)
            .scalar_subquery()
        )

        # 参加状態サブクエリ
        is_participating_subq = (
            select(func.count(EventParticipantModel.id) > 0)
            .where(
                EventParticipantModel.event_id == EventModel.id,
                EventParticipantModel.user_id == filter.current_user_id,
                EventParticipantModel.status == 'registered',
            )
            .correlate(EventModel)
            .scalar_subquery()
        )

        # JOINクエリ: events + users + user_metadata
        query = (
            self.session.query(
                EventModel,
                UserModel,
                UserMetadataModel,
                participant_count_subq.label('participant_count'),
                is_participating_subq.label('is_participating'),
            )
            .join(UserModel, EventModel.creator_id == UserModel.id)
            .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
            .filter(EventModel.is_active == True)
            .filter(
                EventModel.scheduled_date >= month_start,
                EventModel.scheduled_date <= month_end,
            )
        )

        # イベントタイプフィルター
        if filter.event_types:
            query = query.filter(EventModel.event_type.in_(filter.event_types))

        # 参加状態フィルター
        if filter.participated is not None:
            if filter.participated:
                # 参加済みのみ
                query = query.filter(is_participating_subq == True)
            else:
                # 未参加のみ
                query = query.filter(is_participating_subq == False)

        # 日付順 -> 開始時間順でソート
        results = query.order_by(
            EventModel.scheduled_date.asc(),
            EventModel.start_time.asc(),
        ).all()

        # EventListItemに変換
        events = [
            self._to_event_list_item(event, user, metadata, participant_count, is_participating)
            for event, user, metadata, participant_count, is_participating in results
        ]

        return events

    def get_event_by_id(
        self, event_id: UUID, current_user_id: UUID
    ) -> EventDetail | None:
        """
        IDでイベント詳細を取得
        """
        # 参加者数サブクエリ
        participant_count_subq = (
            select(func.count(EventParticipantModel.id))
            .where(
                EventParticipantModel.event_id == EventModel.id,
                EventParticipantModel.status == 'registered',
            )
            .correlate(EventModel)
            .scalar_subquery()
        )

        # 参加状態サブクエリ
        is_participating_subq = (
            select(func.count(EventParticipantModel.id) > 0)
            .where(
                EventParticipantModel.event_id == EventModel.id,
                EventParticipantModel.user_id == current_user_id,
                EventParticipantModel.status == 'registered',
            )
            .correlate(EventModel)
            .scalar_subquery()
        )

        result = (
            self.session.query(
                EventModel,
                UserModel,
                UserMetadataModel,
                participant_count_subq.label('participant_count'),
                is_participating_subq.label('is_participating'),
            )
            .join(UserModel, EventModel.creator_id == UserModel.id)
            .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
            .filter(EventModel.id == event_id)
            .filter(EventModel.is_active == True)
            .first()
        )

        if result is None:
            return None

        event, user, metadata, participant_count, is_participating = result

        # 参加者一覧を取得
        participants = self._get_participants(event_id)

        return self._to_event_detail(
            event,
            user,
            metadata,
            participant_count,
            participants,
            is_owner=(event.creator_id == current_user_id),
            is_participating=is_participating,
        )

    def create(self, data: EventCreateData) -> EventDetail:
        """イベントを作成"""
        event_model = EventModel(
            creator_id=data.creator_id,
            title=data.title,
            description=data.description,
            event_type=data.event_type,
            scheduled_date=data.scheduled_date,
            start_time=data.start_time,
            end_time=data.end_time,
            max_participants=data.max_participants,
            is_recurring=data.is_recurring,
            recurrence_pattern=data.recurrence_pattern,
        )
        self.session.add(event_model)
        self.session.flush()

        # 詳細を取得して返す
        return self.get_event_by_id(event_model.id, data.creator_id)

    def update(
        self, event_id: UUID, data: EventUpdateData, current_user_id: UUID
    ) -> EventDetail | None:
        """イベントを更新（部分更新対応）"""
        event_model = (
            self.session.query(EventModel)
            .filter(EventModel.id == event_id)
            .filter(EventModel.is_active == True)
            .first()
        )
        if event_model is None:
            return None

        # 部分更新
        if data.title is not None:
            event_model.title = data.title
        if data.description is not None:
            event_model.description = data.description
        if data.event_type is not None:
            event_model.event_type = data.event_type
        if data.scheduled_date is not None:
            event_model.scheduled_date = data.scheduled_date
        if data.start_time is not None:
            event_model.start_time = data.start_time
        if data.end_time is not None:
            event_model.end_time = data.end_time
        if data.max_participants is not None:
            event_model.max_participants = data.max_participants
        if data.is_recurring is not None:
            event_model.is_recurring = data.is_recurring
        if data.recurrence_pattern is not None:
            event_model.recurrence_pattern = data.recurrence_pattern

        self.session.flush()

        # 詳細を取得して返す
        return self.get_event_by_id(event_id, current_user_id)

    def delete(self, event_id: UUID) -> bool:
        """イベントを削除（論理削除）"""
        event_model = (
            self.session.query(EventModel)
            .filter(EventModel.id == event_id)
            .filter(EventModel.is_active == True)
            .first()
        )
        if event_model is None:
            return False

        event_model.is_active = False
        self.session.flush()
        return True

    def get_creator_id(self, event_id: UUID) -> UUID | None:
        """イベントの主催者IDを取得"""
        result = (
            self.session.query(EventModel.creator_id)
            .filter(EventModel.id == event_id)
            .filter(EventModel.is_active == True)
            .first()
        )
        return result[0] if result else None

    def get_participant_count(self, event_id: UUID) -> int:
        """イベントの参加者数を取得"""
        return (
            self.session.query(EventParticipantModel)
            .filter(EventParticipantModel.event_id == event_id)
            .filter(EventParticipantModel.status == 'registered')
            .count()
        )

    def get_max_participants(self, event_id: UUID) -> int | None:
        """イベントの定員を取得"""
        result = (
            self.session.query(EventModel.max_participants)
            .filter(EventModel.id == event_id)
            .filter(EventModel.is_active == True)
            .first()
        )
        return result[0] if result else None

    def is_participating(self, event_id: UUID, user_id: UUID) -> bool:
        """ユーザーがイベントに参加しているかチェック"""
        return (
            self.session.query(EventParticipantModel)
            .filter(EventParticipantModel.event_id == event_id)
            .filter(EventParticipantModel.user_id == user_id)
            .filter(EventParticipantModel.status == 'registered')
            .count()
            > 0
        )

    def add_participant(
        self, event_id: UUID, user_id: UUID
    ) -> ParticipantResult:
        """イベントに参加者を追加"""
        # 既存の参加レコードを確認（キャンセル済みも含む）
        existing = (
            self.session.query(EventParticipantModel)
            .filter(EventParticipantModel.event_id == event_id)
            .filter(EventParticipantModel.user_id == user_id)
            .first()
        )

        if existing:
            # キャンセル済みの場合は再登録
            existing.status = 'registered'
            self.session.flush()
            return ParticipantResult(
                event_id=event_id,
                user_id=user_id,
                status='registered',
                created_at=existing.created_at,
            )

        # 新規参加レコード作成
        participant = EventParticipantModel(
            event_id=event_id,
            user_id=user_id,
            status='registered',
        )
        self.session.add(participant)
        self.session.flush()

        return ParticipantResult(
            event_id=event_id,
            user_id=user_id,
            status='registered',
            created_at=participant.created_at,
        )

    def remove_participant(self, event_id: UUID, user_id: UUID) -> bool:
        """イベントから参加者を削除（ステータスをcancelledに変更）"""
        participant = (
            self.session.query(EventParticipantModel)
            .filter(EventParticipantModel.event_id == event_id)
            .filter(EventParticipantModel.user_id == user_id)
            .filter(EventParticipantModel.status == 'registered')
            .first()
        )

        if participant is None:
            return False

        participant.status = 'cancelled'
        self.session.flush()
        return True

    def _get_participants(self, event_id: UUID) -> list[EventParticipant]:
        """イベントの参加者一覧を取得"""
        results = (
            self.session.query(EventParticipantModel, UserModel, UserMetadataModel)
            .join(UserModel, EventParticipantModel.user_id == UserModel.id)
            .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
            .filter(EventParticipantModel.event_id == event_id)
            .filter(EventParticipantModel.status == 'registered')
            .order_by(EventParticipantModel.created_at.asc())
            .all()
        )

        return [
            EventParticipant(
                id=participant.id,
                user_id=participant.user_id,
                user_name=metadata.display_name if metadata else None,
                avatar_url=user.avatar_url,
                status=participant.status,
            )
            for participant, user, metadata in results
        ]

    def _to_event_list_item(
        self,
        event: EventModel,
        user: UserModel,
        metadata: UserMetadataModel | None,
        participant_count: int,
        is_participating: bool,
    ) -> EventListItem:
        """DBモデルをEventListItemに変換"""
        creator = EventCreator(
            id=user.id,
            display_name=metadata.display_name if metadata else None,
            avatar_url=user.avatar_url,
        )
        return EventListItem(
            id=event.id,
            title=event.title,
            event_type=event.event_type,
            scheduled_date=event.scheduled_date,
            start_time=event.start_time,
            end_time=event.end_time,
            max_participants=event.max_participants,
            participant_count=participant_count or 0,
            is_participating=bool(is_participating),
            is_recurring=event.is_recurring,
            creator=creator,
        )

    def _to_event_detail(
        self,
        event: EventModel,
        user: UserModel,
        metadata: UserMetadataModel | None,
        participant_count: int,
        participants: list[EventParticipant],
        is_owner: bool,
        is_participating: bool,
    ) -> EventDetail:
        """DBモデルをEventDetailに変換"""
        creator = EventCreator(
            id=user.id,
            display_name=metadata.display_name if metadata else None,
            avatar_url=user.avatar_url,
        )
        return EventDetail(
            id=event.id,
            title=event.title,
            description=event.description,
            event_type=event.event_type,
            scheduled_date=event.scheduled_date,
            start_time=event.start_time,
            end_time=event.end_time,
            max_participants=event.max_participants,
            participant_count=participant_count or 0,
            is_recurring=event.is_recurring,
            recurrence_pattern=event.recurrence_pattern,
            creator=creator,
            participants=participants,
            is_owner=is_owner,
            is_participating=bool(is_participating),
            created_at=event.created_at,
        )
