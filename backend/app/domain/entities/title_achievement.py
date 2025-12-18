"""称号実績エンティティ"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TitleAchievement(BaseModel):
    """称号実績エンティティ"""

    id: UUID = Field(..., description='実績ID')
    user_id: UUID = Field(..., description='ユーザーID')
    title_level: int = Field(..., description='称号レベル (1-8)')
    achieved_at: datetime = Field(default_factory=datetime.now, description='獲得日時')
    is_current: bool = Field(default=False, description='現在設定中の称号かどうか')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    @field_validator('title_level')
    @classmethod
    def validate_title_level(cls, v: int) -> int:
        """称号レベルは1-8の範囲"""
        if not 1 <= v <= 8:
            raise ValueError('title_level must be between 1 and 8')
        return v

    class Config:
        """Pydantic設定"""

        from_attributes = True
