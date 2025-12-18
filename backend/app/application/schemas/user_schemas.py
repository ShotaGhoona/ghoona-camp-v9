"""ユーザー関連のApplication層スキーマ（DTO）"""

from pydantic import BaseModel, Field


class UserListItemDTO(BaseModel):
    """ユーザー一覧用DTO（軽量版）"""

    id: str
    avatar_url: str | None = Field(alias='avatarUrl')
    display_name: str | None = Field(alias='displayName')
    tagline: str | None
    current_title_level: int = Field(alias='currentTitleLevel')

    class Config:
        populate_by_name = True


class SocialLinkDTO(BaseModel):
    """ソーシャルリンクDTO"""

    id: str
    platform: str
    url: str
    title: str | None


class UserDetailDTO(BaseModel):
    """ユーザー詳細DTO"""

    id: str
    username: str | None
    avatar_url: str | None = Field(alias='avatarUrl')
    display_name: str | None = Field(alias='displayName')
    tagline: str | None
    bio: str | None
    skills: list[str]
    interests: list[str]
    vision: str | None
    is_vision_public: bool = Field(alias='isVisionPublic')
    social_links: list[SocialLinkDTO] = Field(alias='socialLinks')
    total_attendance_days: int = Field(alias='totalAttendanceDays')
    current_streak_days: int = Field(alias='currentStreakDays')
    max_streak_days: int = Field(alias='maxStreakDays')
    current_title_level: int = Field(alias='currentTitleLevel')
    joined_at: str = Field(alias='joinedAt')

    class Config:
        populate_by_name = True


class PaginationDTO(BaseModel):
    """ページネーションDTO"""

    total: int
    limit: int
    offset: int
    has_more: bool = Field(alias='hasMore')

    class Config:
        populate_by_name = True


class UsersListDTO(BaseModel):
    """ユーザー一覧DTO"""

    users: list[UserListItemDTO]
    pagination: PaginationDTO
