"""イベントエンティティ"""

from datetime import date, datetime, time
from uuid import UUID

from pydantic import BaseModel, Field


class Event(BaseModel):
    """朝活イベントエンティティ"""

    id: UUID = Field(..., description='イベントID')
    creator_id: UUID = Field(..., description='作成者ID')
    title: str = Field(..., description='イベント名', max_length=200)
    description: str | None = Field(None, description='イベント詳細')
    event_type: str = Field(default='general', description='イベントタイプ')
    scheduled_date: date = Field(..., description='開催日')
    start_time: time = Field(..., description='開始時間')
    end_time: time = Field(..., description='終了時間')
    max_participants: int | None = Field(None, description='最大参加者数')
    is_recurring: bool = Field(default=False, description='定期開催かどうか')
    recurrence_pattern: str | None = Field(None, description='繰り返しパターン')
    discord_channel_id: str | None = Field(None, description='DiscordチャンネルID')
    is_active: bool = Field(default=True, description='イベント有効状態')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True


class EventParticipant(BaseModel):
    """イベント参加者エンティティ"""

    id: UUID = Field(..., description='参加ID')
    event_id: UUID = Field(..., description='イベントID')
    user_id: UUID = Field(..., description='参加者ID')
    status: str = Field(default='registered', description='参加状態')
    created_at: datetime = Field(default_factory=datetime.now, description='登録日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
