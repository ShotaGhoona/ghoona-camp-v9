"""イベント関連のユースケース"""

import logging
from datetime import date, time
from uuid import UUID

from app.application.schemas.event_schemas import (
    CreateEventInputDTO,
    EventCreatorDTO,
    EventDetailDTO,
    EventListDTO,
    EventListItemDTO,
    EventParticipantDTO,
    MyEventItemDTO,
    MyEventsListDTO,
    ParticipantResultDTO,
    UpdateEventInputDTO,
)
from app.domain.exceptions.event import (
    AlreadyParticipatingError,
    EventForbiddenError,
    EventFullError,
    EventNotFoundError,
    InvalidEventTypeError,
    InvalidMonthError,
    NotParticipatingError,
)
from app.domain.repositories.event_repository import (
    VALID_EVENT_TYPES,
    VALID_RECURRENCE_PATTERNS,
    EventCreateData,
    EventDetail,
    EventListItem,
    EventParticipant,
    EventSearchFilter,
    EventUpdateData,
    IEventRepository,
    MyEventItem,
    MyEventsFilter,
)

logger = logging.getLogger(__name__)


class EventUsecase:
    """イベント関連のユースケース"""

    def __init__(self, event_repository: IEventRepository):
        """
        コンストラクタ

        Args:
            event_repository: イベントリポジトリ
        """
        self.event_repository = event_repository

    def get_events_by_month(
        self,
        current_user_id: str,
        year: int,
        month: int,
        event_types: list[str] | None = None,
        participated: bool | None = None,
    ) -> EventListDTO:
        """
        月ベースでイベント一覧を取得

        Args:
            current_user_id: 現在のユーザーID
            year: 対象年
            month: 対象月
            event_types: イベントタイプフィルター
            participated: 参加状態フィルター

        Returns:
            EventListDTO: イベント一覧DTO
        """
        # バリデーション
        if month < 1 or month > 12:
            raise InvalidMonthError(month)

        # イベントタイプのバリデーション
        if event_types:
            for et in event_types:
                if et not in VALID_EVENT_TYPES:
                    raise InvalidEventTypeError(et)

        # フィルター作成
        filter = EventSearchFilter(
            year=year,
            month=month,
            current_user_id=UUID(current_user_id),
            event_types=event_types,
            participated=participated,
        )

        # リポジトリからデータ取得
        events = self.event_repository.get_events_by_month(filter)

        # DTOに変換
        events_dto = [self._to_event_list_item_dto(event) for event in events]

        logger.info(
            'イベント一覧取得: user_id=%s, year=%d, month=%d, count=%d',
            current_user_id,
            year,
            month,
            len(events),
        )

        return EventListDTO(events=events_dto)

    def get_event_detail(
        self,
        event_id: str,
        current_user_id: str,
    ) -> EventDetailDTO:
        """
        イベント詳細を取得

        Args:
            event_id: イベントID
            current_user_id: 現在のユーザーID

        Returns:
            EventDetailDTO: イベント詳細DTO
        """
        event = self.event_repository.get_event_by_id(
            UUID(event_id),
            UUID(current_user_id),
        )
        if event is None:
            raise EventNotFoundError()

        logger.info(
            'イベント詳細取得: user_id=%s, event_id=%s',
            current_user_id,
            event_id,
        )

        return self._to_event_detail_dto(event)

    def create_event(
        self,
        current_user_id: str,
        input_dto: CreateEventInputDTO,
    ) -> EventDetailDTO:
        """
        イベントを作成

        Args:
            current_user_id: 現在のユーザーID
            input_dto: イベント作成入力DTO

        Returns:
            EventDetailDTO: 作成されたイベントDTO
        """
        # イベントタイプのバリデーション
        if input_dto.event_type not in VALID_EVENT_TYPES:
            raise InvalidEventTypeError(input_dto.event_type)

        # 繰り返しパターンのバリデーション
        if input_dto.is_recurring and input_dto.recurrence_pattern:
            if input_dto.recurrence_pattern not in VALID_RECURRENCE_PATTERNS:
                raise ValueError(f'無効な繰り返しパターン: {input_dto.recurrence_pattern}')

        # 日付・時間のパース
        scheduled_date = date.fromisoformat(input_dto.scheduled_date)
        start_time = time.fromisoformat(input_dto.start_time)
        end_time = time.fromisoformat(input_dto.end_time)

        # 作成データ
        create_data = EventCreateData(
            creator_id=UUID(current_user_id),
            title=input_dto.title,
            description=input_dto.description,
            event_type=input_dto.event_type,
            scheduled_date=scheduled_date,
            start_time=start_time,
            end_time=end_time,
            max_participants=input_dto.max_participants,
            is_recurring=input_dto.is_recurring,
            recurrence_pattern=input_dto.recurrence_pattern if input_dto.is_recurring else None,
        )

        # リポジトリで作成
        event = self.event_repository.create(create_data)

        logger.info(
            'イベント作成: user_id=%s, event_id=%s, title=%s',
            current_user_id,
            event.id,
            event.title,
        )

        return self._to_event_detail_dto(event)

    def update_event(
        self,
        event_id: str,
        current_user_id: str,
        input_dto: UpdateEventInputDTO,
    ) -> EventDetailDTO:
        """
        イベントを更新

        Args:
            event_id: イベントID
            current_user_id: 現在のユーザーID
            input_dto: イベント更新入力DTO

        Returns:
            EventDetailDTO: 更新されたイベントDTO
        """
        # イベントの存在確認と権限チェック
        creator_id = self.event_repository.get_creator_id(UUID(event_id))
        if creator_id is None:
            raise EventNotFoundError()

        if str(creator_id) != current_user_id:
            logger.warning(
                'イベント更新権限エラー: event_id=%s, owner_id=%s, current_user_id=%s',
                event_id,
                creator_id,
                current_user_id,
            )
            raise EventForbiddenError()

        # イベントタイプのバリデーション
        if input_dto.event_type and input_dto.event_type not in VALID_EVENT_TYPES:
            raise InvalidEventTypeError(input_dto.event_type)

        # 繰り返しパターンのバリデーション
        if input_dto.recurrence_pattern and input_dto.recurrence_pattern not in VALID_RECURRENCE_PATTERNS:
            raise ValueError(f'無効な繰り返しパターン: {input_dto.recurrence_pattern}')

        # 日付・時間のパース
        scheduled_date = None
        if input_dto.scheduled_date:
            scheduled_date = date.fromisoformat(input_dto.scheduled_date)

        start_time = None
        if input_dto.start_time:
            start_time = time.fromisoformat(input_dto.start_time)

        end_time = None
        if input_dto.end_time:
            end_time = time.fromisoformat(input_dto.end_time)

        # 更新データ
        update_data = EventUpdateData(
            title=input_dto.title,
            description=input_dto.description,
            event_type=input_dto.event_type,
            scheduled_date=scheduled_date,
            start_time=start_time,
            end_time=end_time,
            max_participants=input_dto.max_participants,
            is_recurring=input_dto.is_recurring,
            recurrence_pattern=input_dto.recurrence_pattern,
        )

        # リポジトリで更新
        event = self.event_repository.update(
            UUID(event_id),
            update_data,
            UUID(current_user_id),
        )
        if event is None:
            raise EventNotFoundError()

        logger.info(
            'イベント更新: user_id=%s, event_id=%s',
            current_user_id,
            event_id,
        )

        return self._to_event_detail_dto(event)

    def delete_event(
        self,
        event_id: str,
        current_user_id: str,
    ) -> bool:
        """
        イベントを削除

        Args:
            event_id: イベントID
            current_user_id: 現在のユーザーID

        Returns:
            bool: 削除成功の場合True
        """
        # イベントの存在確認と権限チェック
        creator_id = self.event_repository.get_creator_id(UUID(event_id))
        if creator_id is None:
            raise EventNotFoundError()

        if str(creator_id) != current_user_id:
            logger.warning(
                'イベント削除権限エラー: event_id=%s, owner_id=%s, current_user_id=%s',
                event_id,
                creator_id,
                current_user_id,
            )
            raise EventForbiddenError()

        # リポジトリで削除
        deleted = self.event_repository.delete(UUID(event_id))
        if not deleted:
            raise EventNotFoundError()

        logger.info(
            'イベント削除: user_id=%s, event_id=%s',
            current_user_id,
            event_id,
        )

        return True

    def join_event(
        self,
        event_id: str,
        current_user_id: str,
    ) -> ParticipantResultDTO:
        """
        イベントに参加

        Args:
            event_id: イベントID
            current_user_id: 現在のユーザーID

        Returns:
            ParticipantResultDTO: 参加結果DTO
        """
        event_uuid = UUID(event_id)
        user_uuid = UUID(current_user_id)

        # イベントの存在確認
        creator_id = self.event_repository.get_creator_id(event_uuid)
        if creator_id is None:
            raise EventNotFoundError()

        # 既に参加しているかチェック
        if self.event_repository.is_participating(event_uuid, user_uuid):
            raise AlreadyParticipatingError()

        # 定員チェック
        max_participants = self.event_repository.get_max_participants(event_uuid)
        if max_participants is not None:
            current_count = self.event_repository.get_participant_count(event_uuid)
            if current_count >= max_participants:
                raise EventFullError(event_id, max_participants)

        # 参加
        result = self.event_repository.add_participant(event_uuid, user_uuid)

        logger.info(
            'イベント参加: user_id=%s, event_id=%s',
            current_user_id,
            event_id,
        )

        return ParticipantResultDTO(
            eventId=str(result.event_id),
            userId=str(result.user_id),
            status=result.status,
            createdAt=result.created_at.isoformat(),
        )

    def leave_event(
        self,
        event_id: str,
        current_user_id: str,
    ) -> bool:
        """
        イベント参加をキャンセル

        Args:
            event_id: イベントID
            current_user_id: 現在のユーザーID

        Returns:
            bool: キャンセル成功の場合True
        """
        event_uuid = UUID(event_id)
        user_uuid = UUID(current_user_id)

        # イベントの存在確認
        creator_id = self.event_repository.get_creator_id(event_uuid)
        if creator_id is None:
            raise EventNotFoundError()

        # 参加しているかチェック
        if not self.event_repository.is_participating(event_uuid, user_uuid):
            raise NotParticipatingError()

        # 参加キャンセル
        removed = self.event_repository.remove_participant(event_uuid, user_uuid)
        if not removed:
            raise NotParticipatingError()

        logger.info(
            'イベント参加キャンセル: user_id=%s, event_id=%s',
            current_user_id,
            event_id,
        )

        return True

    def _to_event_list_item_dto(self, event: EventListItem) -> EventListItemDTO:
        """EventListItemをEventListItemDTOに変換"""
        creator_dto = EventCreatorDTO(
            id=str(event.creator.id),
            displayName=event.creator.display_name,
            avatarUrl=event.creator.avatar_url,
        )
        return EventListItemDTO(
            id=str(event.id),
            title=event.title,
            eventType=event.event_type,
            scheduledDate=event.scheduled_date.isoformat(),
            startTime=event.start_time.strftime('%H:%M'),
            endTime=event.end_time.strftime('%H:%M'),
            maxParticipants=event.max_participants,
            participantCount=event.participant_count,
            isParticipating=event.is_participating,
            isRecurring=event.is_recurring,
            creator=creator_dto,
        )

    def _to_event_detail_dto(self, event: EventDetail) -> EventDetailDTO:
        """EventDetailをEventDetailDTOに変換"""
        creator_dto = EventCreatorDTO(
            id=str(event.creator.id),
            displayName=event.creator.display_name,
            avatarUrl=event.creator.avatar_url,
        )
        participants_dto = [
            self._to_event_participant_dto(p) for p in event.participants
        ]
        return EventDetailDTO(
            id=str(event.id),
            title=event.title,
            description=event.description,
            eventType=event.event_type,
            scheduledDate=event.scheduled_date.isoformat(),
            startTime=event.start_time.strftime('%H:%M'),
            endTime=event.end_time.strftime('%H:%M'),
            maxParticipants=event.max_participants,
            participantCount=event.participant_count,
            isRecurring=event.is_recurring,
            recurrencePattern=event.recurrence_pattern,
            creator=creator_dto,
            participants=participants_dto,
            isOwner=event.is_owner,
            isParticipating=event.is_participating,
            createdAt=event.created_at.isoformat(),
        )

    def _to_event_participant_dto(self, participant: EventParticipant) -> EventParticipantDTO:
        """EventParticipantをEventParticipantDTOに変換"""
        return EventParticipantDTO(
            id=str(participant.id),
            userId=str(participant.user_id),
            userName=participant.user_name,
            avatarUrl=participant.avatar_url,
            status=participant.status,
        )

    def get_my_events(
        self,
        current_user_id: str,
        year: int,
        month: int,
    ) -> MyEventsListDTO:
        """
        自分が参加登録または主催しているイベント一覧を取得

        Args:
            current_user_id: 現在のユーザーID
            year: 対象年
            month: 対象月

        Returns:
            MyEventsListDTO: 自分のイベント一覧DTO
        """
        # バリデーション
        if month < 1 or month > 12:
            raise InvalidMonthError(month)

        # フィルター作成
        filter = MyEventsFilter(
            year=year,
            month=month,
            user_id=UUID(current_user_id),
        )

        # リポジトリからデータ取得
        events = self.event_repository.get_my_events(filter)

        # DTOに変換
        events_dto = [self._to_my_event_item_dto(event) for event in events]

        logger.info(
            '自分のイベント一覧取得: user_id=%s, year=%d, month=%d, count=%d',
            current_user_id,
            year,
            month,
            len(events),
        )

        return MyEventsListDTO(events=events_dto)

    def _to_my_event_item_dto(self, event: MyEventItem) -> MyEventItemDTO:
        """MyEventItemをMyEventItemDTOに変換"""
        return MyEventItemDTO(
            id=str(event.id),
            title=event.title,
            eventType=event.event_type,
            scheduledDate=event.scheduled_date.isoformat(),
            startTime=event.start_time.strftime('%H:%M'),
            endTime=event.end_time.strftime('%H:%M'),
            role=event.role,
            maxParticipants=event.max_participants,
            participantCount=event.participant_count,
        )
