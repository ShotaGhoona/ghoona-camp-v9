"""ユーザービジョンエンティティ"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class UserVision(BaseModel):
    """ユーザービジョンエンティティ"""

    id: UUID = Field(..., description='ビジョンID')
    user_id: UUID = Field(..., description='ユーザーID')
    vision: str | None = Field(None, description='ビジョン・将来の目標')
    is_public: bool = Field(default=False, description='ビジョンの公開設定')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
