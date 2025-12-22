"""イベント関連のApplication層スキーマ（DTO）"""

from pydantic import BaseModel, Field


class EventCreatorDTO(BaseModel):
    """イベント主催者DTO"""

    id: str
    display_name: str | None = Field(alias='displayName')
    avatar_url: str | None = Field(alias='avatarUrl')

    class Config:
        populate_by_name = True


class EventParticipantDTO(BaseModel):
    """イベント参加者DTO"""

    id: str
    user_id: str = Field(alias='userId')
    user_name: str | None = Field(alias='userName')
    avatar_url: str | None = Field(alias='avatarUrl')
    status: str

    class Config:
        populate_by_name = True


class EventListItemDTO(BaseModel):
    """イベント一覧アイテムDTO"""

    id: str
    title: str
    event_type: str = Field(alias='eventType')
    scheduled_date: str = Field(alias='scheduledDate')
    start_time: str = Field(alias='startTime')
    end_time: str = Field(alias='endTime')
    max_participants: int | None = Field(alias='maxParticipants')
    participant_count: int = Field(alias='participantCount')
    is_participating: bool = Field(alias='isParticipating')
    is_recurring: bool = Field(alias='isRecurring')
    creator: EventCreatorDTO

    class Config:
        populate_by_name = True


class EventDetailDTO(BaseModel):
    """イベント詳細DTO"""

    id: str
    title: str
    description: str | None
    event_type: str = Field(alias='eventType')
    scheduled_date: str = Field(alias='scheduledDate')
    start_time: str = Field(alias='startTime')
    end_time: str = Field(alias='endTime')
    max_participants: int | None = Field(alias='maxParticipants')
    participant_count: int = Field(alias='participantCount')
    is_recurring: bool = Field(alias='isRecurring')
    recurrence_pattern: str | None = Field(alias='recurrencePattern')
    creator: EventCreatorDTO
    participants: list[EventParticipantDTO]
    is_owner: bool = Field(alias='isOwner')
    is_participating: bool = Field(alias='isParticipating')
    created_at: str = Field(alias='createdAt')

    class Config:
        populate_by_name = True


class EventListDTO(BaseModel):
    """イベント一覧DTO"""

    events: list[EventListItemDTO]


class CreateEventInputDTO(BaseModel):
    """イベント作成入力DTO"""

    title: str = Field(..., description='イベント名', max_length=200)
    description: str | None = Field(None, description='説明文')
    event_type: str = Field(..., alias='eventType', description='イベントタイプ')
    scheduled_date: str = Field(..., alias='scheduledDate', description='開催日 (YYYY-MM-DD)')
    start_time: str = Field(..., alias='startTime', description='開始時間 (HH:MM)')
    end_time: str = Field(..., alias='endTime', description='終了時間 (HH:MM)')
    max_participants: int | None = Field(None, alias='maxParticipants', description='定員')
    is_recurring: bool = Field(False, alias='isRecurring', description='定期開催フラグ')
    recurrence_pattern: str | None = Field(None, alias='recurrencePattern', description='繰り返しパターン')

    class Config:
        populate_by_name = True


class UpdateEventInputDTO(BaseModel):
    """イベント更新入力DTO（部分更新用）"""

    title: str | None = Field(None, description='イベント名', max_length=200)
    description: str | None = Field(None, description='説明文')
    event_type: str | None = Field(None, alias='eventType', description='イベントタイプ')
    scheduled_date: str | None = Field(None, alias='scheduledDate', description='開催日 (YYYY-MM-DD)')
    start_time: str | None = Field(None, alias='startTime', description='開始時間 (HH:MM)')
    end_time: str | None = Field(None, alias='endTime', description='終了時間 (HH:MM)')
    max_participants: int | None = Field(None, alias='maxParticipants', description='定員')
    is_recurring: bool | None = Field(None, alias='isRecurring', description='定期開催フラグ')
    recurrence_pattern: str | None = Field(None, alias='recurrencePattern', description='繰り返しパターン')

    class Config:
        populate_by_name = True


class ParticipantResultDTO(BaseModel):
    """参加結果DTO"""

    event_id: str = Field(alias='eventId')
    user_id: str = Field(alias='userId')
    status: str
    created_at: str = Field(alias='createdAt')

    class Config:
        populate_by_name = True


class MyEventItemDTO(BaseModel):
    """自分のイベントアイテムDTO"""

    id: str
    title: str
    event_type: str = Field(alias='eventType')
    scheduled_date: str = Field(alias='scheduledDate')
    start_time: str = Field(alias='startTime')
    end_time: str = Field(alias='endTime')
    role: str  # 'participant' or 'organizer'
    max_participants: int | None = Field(alias='maxParticipants')
    participant_count: int = Field(alias='participantCount')

    class Config:
        populate_by_name = True


class MyEventsListDTO(BaseModel):
    """自分のイベント一覧DTO"""

    events: list[MyEventItemDTO]
