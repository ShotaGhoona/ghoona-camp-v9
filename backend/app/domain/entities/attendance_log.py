"""参加ログエンティティ"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AttendanceLog(BaseModel):
    """参加ログエンティティ"""

    id: UUID = Field(..., description='ログID')
    user_id: UUID = Field(..., description='ユーザーID')
    event_id: UUID | None = Field(None, description='関連イベントID')
    discord_channel_id: str = Field(..., description='参加したDiscordチャンネルID')
    joined_at: datetime = Field(..., description='Discord参加開始時刻')
    left_at: datetime | None = Field(None, description='Discord退出時刻')
    duration_minutes: int | None = Field(None, description='参加時間(分)')
    is_valid: bool = Field(default=True, description='有効な参加かどうか')
    created_at: datetime = Field(default_factory=datetime.now, description='記録作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
