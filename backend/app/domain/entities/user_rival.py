"""ユーザーライバル関係エンティティ"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class UserRival(BaseModel):
    """ユーザーライバル関係エンティティ"""

    id: UUID = Field(..., description='関係ID')
    user_id: UUID = Field(..., description='ユーザーID')
    rival_user_id: UUID = Field(..., description='ライバルのユーザーID')
    created_at: datetime = Field(default_factory=datetime.now, description='設定日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    @model_validator(mode='after')
    def validate_not_self_rival(self) -> 'UserRival':
        """自分自身をライバルに設定できないことを検証"""
        if self.user_id == self.rival_user_id:
            raise ValueError('Cannot set yourself as a rival')
        return self

    class Config:
        """Pydantic設定"""

        from_attributes = True
