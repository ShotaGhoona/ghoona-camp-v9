"""称号関連のPresentation層スキーマ（リクエスト/レスポンス）"""

from pydantic import BaseModel

from app.presentation.schemas.common import BaseAPIResponse


class TitleHolderResponse(BaseModel):
    """称号保持者レスポンス"""

    id: str
    displayName: str | None
    avatarUrl: str | None
    achievedAt: str


class TitleHoldersDataResponse(BaseModel):
    """称号保持者一覧データレスポンス"""

    level: int
    holders: list[TitleHolderResponse]
    total: int


class TitleHoldersAPIResponse(BaseAPIResponse[TitleHoldersDataResponse]):
    """称号保持者一覧APIレスポンス"""

    pass


# ========================================
# ユーザー称号実績
# ========================================


class UserTitleAchievementResponse(BaseModel):
    """ユーザー称号実績レスポンス"""

    titleLevel: int
    achievedAt: str


class UserTitleAchievementsDataResponse(BaseModel):
    """ユーザー称号実績データレスポンス"""

    currentTitleLevel: int
    totalAttendanceDays: int
    achievements: list[UserTitleAchievementResponse]


class UserTitleAchievementsAPIResponse(BaseAPIResponse[UserTitleAchievementsDataResponse]):
    """ユーザー称号実績APIレスポンス"""

    pass
