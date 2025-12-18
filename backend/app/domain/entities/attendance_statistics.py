"""参加統計エンティティ"""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AttendanceStatistics(BaseModel):
    """参加統計エンティティ"""

    id: UUID = Field(..., description='統計ID')
    user_id: UUID = Field(..., description='ユーザーID')
    total_attendance_days: int = Field(default=0, description='総参加日数')
    current_streak_days: int = Field(default=0, description='現在の連続参加日数')
    max_streak_days: int = Field(default=0, description='最大連続参加日数')
    last_attendance_date: date | None = Field(None, description='最後の参加日')
    first_attendance_date: date | None = Field(None, description='初回参加日')
    total_duration_minutes: int = Field(default=0, description='総参加時間(分)')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
