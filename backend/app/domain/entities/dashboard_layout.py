"""ダッシュボードレイアウトエンティティ"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DashboardBlock(BaseModel):
    """ダッシュボードブロック"""

    id: str = Field(..., description='ブロックID')
    block_type: str = Field(..., description='ブロックタイプ')
    x: int = Field(..., ge=0, le=11, description='X座標')
    y: int = Field(..., ge=0, description='Y座標')
    w: int = Field(..., ge=1, le=12, description='幅')
    h: int = Field(..., ge=1, description='高さ')


class DashboardLayout(BaseModel):
    """ダッシュボードレイアウトエンティティ"""

    id: UUID = Field(..., description='レイアウトID')
    user_id: UUID = Field(..., description='ユーザーID')
    blocks: list[DashboardBlock] = Field(default_factory=list, description='ブロック一覧')
    created_at: datetime = Field(default_factory=datetime.now, description='作成日時')
    updated_at: datetime = Field(default_factory=datetime.now, description='更新日時')

    class Config:
        """Pydantic設定"""

        from_attributes = True
