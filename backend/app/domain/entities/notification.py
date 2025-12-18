"""通知エンティティ"""

from datetime import datetime, time
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class Notification(BaseModel):
    """通知エンティティ"""

    id: UUID = Field(..., description='通知ID')
    user_id: UUID = Field(..., description='通知対象ユーザーID')
    type: str = Field(..., description='通知タイプ')
    title: str = Field(..., description='通知タイトル', max_length=100)
    message: str = Field(..., description='通知メッセージ')
    data: dict[str, Any] | None = Field(None, description='関連データ')
    is_read: bool = Field(default=False, description='既読状態')
    scheduled_at: datetime | None = Field(None, description='送信予定時刻')
    sent_at: datetime | None = Field(None, description='実際の送信時刻')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True


class NotificationSettings(BaseModel):
    """通知設定エンティティ"""

    id: UUID = Field(..., description='設定ID')
    user_id: UUID = Field(..., description='ユーザーID')
    achievement_enabled: bool = Field(default=True, description='称号獲得通知の有効/無効')
    reminder_enabled: bool = Field(default=True, description='リマインダー通知の有効/無効')
    rival_update_enabled: bool = Field(default=True, description='ライバル更新通知の有効/無効')
    event_reminder_enabled: bool = Field(default=True, description='イベントリマインダーの有効/無効')
    reminder_time: time = Field(default=time(21, 0), description='リマインダー送信時刻')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
