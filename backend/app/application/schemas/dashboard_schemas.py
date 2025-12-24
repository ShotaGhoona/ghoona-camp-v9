"""ダッシュボード関連のApplication層スキーマ（DTO）"""

from pydantic import BaseModel, Field


class DashboardBlockDTO(BaseModel):
    """ダッシュボードブロックDTO"""

    id: str
    type: str
    x: int
    y: int
    w: int
    h: int


class DashboardLayoutDTO(BaseModel):
    """ダッシュボードレイアウトDTO"""

    blocks: list[DashboardBlockDTO]


class UpdateDashboardLayoutInputDTO(BaseModel):
    """ダッシュボードレイアウト更新入力DTO"""

    blocks: list[DashboardBlockDTO] = Field(..., description='ブロック一覧')
