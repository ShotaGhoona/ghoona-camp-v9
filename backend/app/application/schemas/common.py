"""共通のApplication層スキーマ（DTO）"""

from pydantic import BaseModel, Field


class PaginationDTO(BaseModel):
    """ページネーションDTO"""

    total: int
    limit: int
    offset: int
    has_more: bool = Field(alias='hasMore')

    class Config:
        populate_by_name = True
