"""ユーザー関連のPresentation層スキーマ（リクエスト/レスポンス）"""

from pydantic import BaseModel, Field

from app.presentation.schemas.common import BaseAPIResponse, ErrorResponse

# ErrorResponseを再エクスポート（後方互換性のため）
__all__ = ['ErrorResponse']


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


class UsersListResponse(BaseAPIResponse[UsersListDataResponse]):
    """ユーザー一覧APIレスポンス"""

    pass


class UserDetailDataResponse(BaseModel):
    """ユーザー詳細データレスポンス"""

    user: UserDetailResponse


class UserDetailAPIResponse(BaseAPIResponse[UserDetailDataResponse]):
    """ユーザー詳細APIレスポンス"""

    pass


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


class UpdateUserProfileAPIResponse(BaseAPIResponse[UserDetailDataResponse]):
    """プロフィール更新APIレスポンス"""

    message: str = 'プロフィールを更新しました'


# ========================================
# ライバル関連
# ========================================


class RivalUserResponse(BaseModel):
    """ライバルユーザーレスポンス（比較表示用）"""

    id: str
    username: str | None
    avatarUrl: str | None
    displayName: str | None
    tagline: str | None
    totalAttendanceDays: int
    currentStreakDays: int
    maxStreakDays: int
    currentTitleLevel: int


class RivalResponse(BaseModel):
    """ライバルレスポンス"""

    id: str
    rivalUser: RivalUserResponse
    createdAt: str


class RivalsListDataResponse(BaseModel):
    """ライバル一覧データレスポンス"""

    rivals: list[RivalResponse]
    maxRivals: int
    remainingSlots: int


class RivalsListAPIResponse(BaseAPIResponse[RivalsListDataResponse]):
    """ライバル一覧APIレスポンス"""

    pass


class AddRivalRequest(BaseModel):
    """ライバル追加リクエスト"""

    rivalUserId: str = Field(..., description='ライバルに設定するユーザーID')


class AddRivalDataResponse(BaseModel):
    """ライバル追加データレスポンス"""

    rival: RivalResponse
    remainingSlots: int


class AddRivalAPIResponse(BaseAPIResponse[AddRivalDataResponse]):
    """ライバル追加APIレスポンス"""

    message: str = 'ライバルを追加しました'


class DeleteRivalDataResponse(BaseModel):
    """ライバル削除データレスポンス"""

    remainingSlots: int


class DeleteRivalAPIResponse(BaseAPIResponse[DeleteRivalDataResponse]):
    """ライバル削除APIレスポンス"""

    message: str = 'ライバルを解除しました'


# ========================================
# スキル・興味一覧
# ========================================


class SkillsListDataResponse(BaseModel):
    """スキル一覧データレスポンス"""

    skills: list[str]


class SkillsListAPIResponse(BaseAPIResponse[SkillsListDataResponse]):
    """スキル一覧APIレスポンス"""

    pass


class InterestsListDataResponse(BaseModel):
    """興味・関心一覧データレスポンス"""

    interests: list[str]


class InterestsListAPIResponse(BaseAPIResponse[InterestsListDataResponse]):
    """興味・関心一覧APIレスポンス"""

    pass
