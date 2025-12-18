"""参加サマリーエンティティ"""

from datetime import date as date_type
from datetime import datetime
from datetime import time as time_type
from uuid import UUID

from pydantic import BaseModel, Field


class AttendanceSummary(BaseModel):
    """参加サマリーエンティティ（日単位）"""

    id: UUID = Field(..., description='サマリーID')
    user_id: UUID = Field(..., description='ユーザーID')
    date: date_type = Field(..., description='参加日')
    total_duration_minutes: int = Field(default=0, description='1日の総参加時間(分)')
    session_count: int = Field(default=0, description='参加セッション数')
    first_join_time: time_type | None = Field(None, description='最初の参加時刻')
    last_leave_time: time_type | None = Field(None, description='最後の退出時刻')
    is_morning_active: bool = Field(default=False, description='朝活時間帯(6-7時)の参加有無')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
