"""目標エンティティ"""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class Goal(BaseModel):
    """目標エンティティ"""

    id: UUID = Field(..., description='目標ID')
    user_id: UUID = Field(..., description='ユーザーID')
    title: str = Field(..., description='目標タイトル', max_length=200)
    description: str | None = Field(None, description='目標詳細')
    started_at: date = Field(default_factory=date.today, description='目標開始日')
    ended_at: date | None = Field(None, description='目標終了日')
    is_active: bool = Field(default=True, description='目標の有効状態')
    is_public: bool = Field(default=False, description='外部公開設定')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
