"""ランキング関連のApplication層スキーマ（DTO）"""

from pydantic import BaseModel, Field


class RankingUserDTO(BaseModel):
    """ランキング用ユーザーDTO"""

    id: str
    display_name: str | None = Field(alias='displayName')
    avatar_url: str | None = Field(alias='avatarUrl')
    tagline: str | None

    class Config:
        populate_by_name = True


class RankingEntryDTO(BaseModel):
    """ランキングエントリDTO"""

    rank: int
    user: RankingUserDTO
    current_title_level: int | None = Field(alias='currentTitleLevel')
    score: int

    class Config:
        populate_by_name = True


class RankingListDTO(BaseModel):
    """ランキング一覧DTO"""

    entries: list[RankingEntryDTO]
    total: int


class MonthlyRankingListDTO(BaseModel):
    """月間ランキングDTO"""

    year: int
    month: int
    entries: list[RankingEntryDTO]
    total: int


class CurrentUserRankingDTO(BaseModel):
    """自分のランキング情報DTO"""

    rank: int
    score: int


class CurrentUserRankingsDTO(BaseModel):
    """自分の全ランキング情報DTO"""

    monthly: CurrentUserRankingDTO
    total: CurrentUserRankingDTO
    streak: CurrentUserRankingDTO


class AllRankingsDTO(BaseModel):
    """全ランキングDTO"""

    monthly: MonthlyRankingListDTO
    total: RankingListDTO
    streak: RankingListDTO
    current_user: CurrentUserRankingsDTO = Field(alias='currentUser')

    class Config:
        populate_by_name = True
