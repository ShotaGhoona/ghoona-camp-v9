"""ユーザー関連のPresentation層スキーマ（リクエスト/レスポンス）"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class UserListItemResponse(BaseModel):
    """ユーザー一覧用レスポンス（軽量版）"""

    id: str
    avatarUrl: str | None
    displayName: str | None
    tagline: str | None
    currentTitleLevel: int


class SocialLinkResponse(BaseModel):
    """ソーシャルリンクレスポンス"""

    id: str
    platform: str
    url: str
    title: str | None


class UserDetailResponse(BaseModel):
    """ユーザー詳細レスポンス"""

    id: str
    username: str | None
    avatarUrl: str | None
    displayName: str | None
    tagline: str | None
    bio: str | None
    skills: list[str]
    interests: list[str]
    vision: str | None
    isVisionPublic: bool
    socialLinks: list[SocialLinkResponse]
    totalAttendanceDays: int
    currentStreakDays: int
    maxStreakDays: int
    currentTitleLevel: int
    joinedAt: str


class PaginationResponse(BaseModel):
    """ページネーションレスポンス"""

    total: int
    limit: int
    offset: int
    hasMore: bool


class UsersListDataResponse(BaseModel):
    """ユーザー一覧データレスポンス"""

    users: list[UserListItemResponse]
    pagination: PaginationResponse


class UsersListResponse(BaseModel):
    """ユーザー一覧APIレスポンス"""

    data: UsersListDataResponse
    message: str = 'success'
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class UserDetailDataResponse(BaseModel):
    """ユーザー詳細データレスポンス"""

    user: UserDetailResponse


class UserDetailAPIResponse(BaseModel):
    """ユーザー詳細APIレスポンス"""

    data: UserDetailDataResponse
    message: str = 'success'
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class ErrorDetail(BaseModel):
    """エラー詳細"""

    code: str
    message: str
    details: dict[str, Any] | None = None


class ErrorResponse(BaseModel):
    """エラーレスポンス"""

    error: ErrorDetail
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


# ========================================
# プロフィール更新
# ========================================


class SocialLinkRequest(BaseModel):
    """ソーシャルリンクリクエスト"""

    platform: str = Field(
        ...,
        description='プラットフォーム種別',
        pattern='^(twitter|instagram|github|linkedin|website|blog|note)$',
    )
    url: str = Field(..., description='リンクURL', max_length=2000)
    title: str | None = Field(None, description='リンクのタイトル', max_length=100)


class UpdateUserProfileRequest(BaseModel):
    """プロフィール更新リクエスト"""

    username: str | None = Field(
        None,
        description='ユーザー名',
        max_length=100,
        pattern='^[a-zA-Z0-9_]+$',
    )
    avatarUrl: str | None = Field(None, description='アバター画像URL', max_length=2000)
    displayName: str | None = Field(None, description='表示名', max_length=100)
    tagline: str | None = Field(None, description='一言プロフィール', max_length=150)
    bio: str | None = Field(None, description='自己紹介文', max_length=1000)
    skills: list[str] | None = Field(None, description='スキル一覧', max_length=20)
    interests: list[str] | None = Field(None, description='興味・関心一覧', max_length=20)
    vision: str | None = Field(None, description='ビジョン・将来の目標', max_length=500)
    isVisionPublic: bool | None = Field(None, description='ビジョンの公開設定')
    socialLinks: list[SocialLinkRequest] | None = Field(
        None, description='SNSリンク一覧', max_length=10
    )


class UpdateUserProfileAPIResponse(BaseModel):
    """プロフィール更新APIレスポンス"""

    data: UserDetailDataResponse
    message: str = 'プロフィールを更新しました'
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
