"""ユーザーメタデータエンティティ"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class UserMetadata(BaseModel):
    """ユーザー詳細情報エンティティ"""

    id: UUID = Field(..., description='メタデータID')
    user_id: UUID = Field(..., description='ユーザーID')
    display_name: str | None = Field(None, description='表示名')
    tagline: str | None = Field(None, description='一言プロフィール')
    bio: str | None = Field(None, description='自己紹介文章')
    skills: list[str] = Field(default_factory=list, description='スキル')
    interests: list[str] = Field(default_factory=list, description='興味・関心')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
