from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class User(BaseModel):
    """ユーザーエンティティ (Ghoona Camp)"""

    id: UUID = Field(..., description='ユーザーID (UUID)')
    email: str = Field(..., description='メールアドレス')
    password_hash: str = Field(..., description='ハッシュ化されたパスワード (bcrypt)')
    username: str | None = Field(None, description='ユーザー名')
    avatar_url: str | None = Field(None, description='アバター画像URL')
    discord_id: str | None = Field(None, description='Discord User ID')
    is_active: bool = Field(default=True, description='アカウント有効状態')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True  # SQLAlchemyモデルから変換可能にする
