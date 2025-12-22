"""イベントリポジトリインターフェース"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, datetime, time
from uuid import UUID

# =============================================================================
# イベントタイプ定義
# =============================================================================
VALID_EVENT_TYPES = {'study', 'exercise', 'meditation', 'reading', 'general'}
VALID_RECURRENCE_PATTERNS = {'daily', 'weekly', 'monthly'}


# =============================================================================
# データクラス: 検索フィルター
# =============================================================================
@dataclass
class EventSearchFilter:
    """イベント検索フィルター"""

    year: int
    month: int
    current_user_id: UUID
    event_types: list[str] | None = None
    participated: bool | None = None


# =============================================================================
# データクラス: イベント関連
# =============================================================================
@dataclass
class EventCreator:
    """イベント主催者情報"""

    id: UUID
    display_name: str | None
    avatar_url: str | None


@dataclass
class EventParticipant:
    """イベント参加者情報"""

    id: UUID
    user_id: UUID
    user_name: str | None
    avatar_url: str | None
    status: str


@dataclass
class EventListItem:
    """イベント一覧アイテム"""

    id: UUID
    title: str
    event_type: str
    scheduled_date: date
    start_time: time
    end_time: time
    max_participants: int | None
    participant_count: int
    is_participating: bool
    is_recurring: bool
    creator: EventCreator


@dataclass
class EventDetail:
    """イベント詳細"""

    id: UUID
    title: str
    description: str | None
    event_type: str
    scheduled_date: date
    start_time: time
    end_time: time
    max_participants: int | None
    participant_count: int
    is_recurring: bool
    recurrence_pattern: str | None
    creator: EventCreator
    participants: list[EventParticipant]
    is_owner: bool
    is_participating: bool
    created_at: datetime


# =============================================================================
# データクラス: 作成・更新
# =============================================================================
@dataclass
class EventCreateData:
    """イベント作成データ"""

    creator_id: UUID
    title: str
    event_type: str
    scheduled_date: date
    start_time: time
    end_time: time
    description: str | None = None
    max_participants: int | None = None
    is_recurring: bool = False
    recurrence_pattern: str | None = None


@dataclass
class EventUpdateData:
    """イベント更新データ（部分更新用）"""

    title: str | None = None
    description: str | None = None
    event_type: str | None = None
    scheduled_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    max_participants: int | None = None
    is_recurring: bool | None = None
    recurrence_pattern: str | None = None


# =============================================================================
# データクラス: 参加者関連
# =============================================================================
@dataclass
class ParticipantResult:
    """参加者操作結果"""

    event_id: UUID
    user_id: UUID
    status: str
    created_at: datetime


# =============================================================================
# リポジトリインターフェース
# =============================================================================
class IEventRepository(ABC):
    """イベントリポジトリのインターフェース"""

    @abstractmethod
    def get_events_by_month(
        self, filter: EventSearchFilter
    ) -> list[EventListItem]:
        """
        月ベースでイベント一覧を取得

        Args:
            filter: 検索フィルター条件

        Returns:
            list[EventListItem]: イベント一覧
        """
        pass

    @abstractmethod
    def get_event_by_id(
        self, event_id: UUID, current_user_id: UUID
    ) -> EventDetail | None:
        """
        IDでイベント詳細を取得

        Args:
            event_id: イベントID
            current_user_id: 現在のユーザーID（isOwner, isParticipating判定用）

        Returns:
            EventDetail | None: イベント詳細（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def create(self, data: EventCreateData) -> EventDetail:
        """
        イベントを作成

        Args:
            data: イベント作成データ

        Returns:
            EventDetail: 作成されたイベント
        """
        pass

    @abstractmethod
    def update(
        self, event_id: UUID, data: EventUpdateData, current_user_id: UUID
    ) -> EventDetail | None:
        """
        イベントを更新（部分更新対応）

        Args:
            event_id: イベントID
            data: 更新データ
            current_user_id: 現在のユーザーID

        Returns:
            EventDetail | None: 更新後のイベント（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def delete(self, event_id: UUID) -> bool:
        """
        イベントを削除

        Args:
            event_id: イベントID

        Returns:
            bool: 削除成功の場合True
        """
        pass

    @abstractmethod
    def get_creator_id(self, event_id: UUID) -> UUID | None:
        """
        イベントの主催者IDを取得

        Args:
            event_id: イベントID

        Returns:
            UUID | None: 主催者ID（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def get_participant_count(self, event_id: UUID) -> int:
        """
        イベントの参加者数を取得

        Args:
            event_id: イベントID

        Returns:
            int: 参加者数
        """
        pass

    @abstractmethod
    def get_max_participants(self, event_id: UUID) -> int | None:
        """
        イベントの定員を取得

        Args:
            event_id: イベントID

        Returns:
            int | None: 定員（無制限の場合はNone）
        """
        pass

    @abstractmethod
    def is_participating(self, event_id: UUID, user_id: UUID) -> bool:
        """
        ユーザーがイベントに参加しているかチェック

        Args:
            event_id: イベントID
            user_id: ユーザーID

        Returns:
            bool: 参加中の場合True
        """
        pass

    @abstractmethod
    def add_participant(
        self, event_id: UUID, user_id: UUID
    ) -> ParticipantResult:
        """
        イベントに参加者を追加

        Args:
            event_id: イベントID
            user_id: ユーザーID

        Returns:
            ParticipantResult: 参加結果
        """
        pass

    @abstractmethod
    def remove_participant(self, event_id: UUID, user_id: UUID) -> bool:
        """
        イベントから参加者を削除

        Args:
            event_id: イベントID
            user_id: ユーザーID

        Returns:
            bool: 削除成功の場合True
        """
        pass
