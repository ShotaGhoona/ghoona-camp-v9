"""ユーザー外部リンクエンティティ"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class UserSocialLink(BaseModel):
    """ユーザー外部リンクエンティティ"""

    id: UUID = Field(..., description='リンクID')
    user_id: UUID = Field(..., description='ユーザーID')
    platform: str = Field(..., description='プラットフォーム (twitter, instagram, github等)')
    url: str = Field(..., description='リンクURL')
    title: str | None = Field(None, description='リンクのタイトル・説明')
    is_public: bool = Field(default=True, description='公開設定')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
