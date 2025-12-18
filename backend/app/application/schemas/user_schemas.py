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


# ========================================
# 認証関連DTO
# ========================================


class LoginInputDTO(BaseModel):
    """ログイン入力DTO"""

    email: str = Field(..., description='メールアドレス')
    password: str = Field(..., description='パスワード')


class LoginOutputDTO(BaseModel):
    """ログイン出力DTO"""

    access_token: str = Field(..., description='アクセストークン')
    user_id: str = Field(..., description='ユーザーID (UUID)')


class LogoutOutputDTO(BaseModel):
    """ログアウト出力DTO"""

    message: str = Field(..., description='メッセージ')


class MeOutputDTO(BaseModel):
    """現在のユーザー情報出力DTO"""

    id: str = Field(..., description='ユーザーID (UUID)')
    email: str = Field(..., description='メールアドレス')
    username: str | None = Field(None, description='ユーザー名')
    avatar_url: str | None = Field(None, description='アバター画像URL')
    discord_id: str | None = Field(None, description='Discord User ID')
    is_active: bool = Field(..., description='アカウント有効状態')
