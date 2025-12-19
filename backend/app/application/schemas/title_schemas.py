"""称号関連のApplication層スキーマ（DTO）"""

from pydantic import BaseModel, Field


class TitleHolderDTO(BaseModel):
    """称号保持者DTO"""

    id: str
    display_name: str | None = Field(alias='displayName')
    avatar_url: str | None = Field(alias='avatarUrl')
    achieved_at: str = Field(alias='achievedAt')

    class Config:
        populate_by_name = True


class TitleHoldersListDTO(BaseModel):
    """称号保持者一覧DTO"""

    level: int
    holders: list[TitleHolderDTO]
    total: int


class UserTitleAchievementDTO(BaseModel):
    """ユーザー称号実績DTO"""

    title_level: int = Field(alias='titleLevel')
    achieved_at: str = Field(alias='achievedAt')

    class Config:
        populate_by_name = True


class UserTitleAchievementsDTO(BaseModel):
    """ユーザー称号実績一覧DTO"""

    current_title_level: int = Field(alias='currentTitleLevel')
    total_attendance_days: int = Field(alias='totalAttendanceDays')
    achievements: list[UserTitleAchievementDTO]

    class Config:
        populate_by_name = True
