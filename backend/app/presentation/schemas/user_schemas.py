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
