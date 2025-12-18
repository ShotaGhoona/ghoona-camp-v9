"""目標関連のPresentation層スキーマ（リクエスト/レスポンス）"""

from pydantic import BaseModel, Field

from app.presentation.schemas.common import BaseAPIResponse, ErrorResponse

# ErrorResponseを再エクスポート（後方互換性のため）
__all__ = ['ErrorResponse']


class GoalCreatorResponse(BaseModel):
    """目標作成者レスポンス"""

    id: str
    displayName: str | None
    avatarUrl: str | None


class GoalItemResponse(BaseModel):
    """目標アイテムレスポンス"""

    id: str
    userId: str
    title: str
    description: str | None
    startedAt: str
    endedAt: str | None
    isActive: bool
    isPublic: bool
    createdAt: str
    updatedAt: str
    creator: GoalCreatorResponse


class MyGoalsListDataResponse(BaseModel):
    """自分の目標一覧データレスポンス"""

    goals: list[GoalItemResponse]
    total: int


class MyGoalsListAPIResponse(BaseAPIResponse[MyGoalsListDataResponse]):
    """自分の目標一覧APIレスポンス"""

    pass


# ========================================
# 目標作成
# ========================================


class CreateGoalRequest(BaseModel):
    """目標作成リクエスト"""

    title: str = Field(..., description='目標タイトル', max_length=200)
    description: str | None = Field(None, description='目標詳細')
    startedAt: str | None = Field(None, description='開始日 (YYYY-MM-DD)')
    endedAt: str | None = Field(None, description='終了日 (YYYY-MM-DD)')
    isPublic: bool = Field(False, description='公開設定')


class CreateGoalDataResponse(BaseModel):
    """目標作成データレスポンス"""

    goal: GoalItemResponse


class CreateGoalAPIResponse(BaseAPIResponse[CreateGoalDataResponse]):
    """目標作成APIレスポンス"""

    message: str = '目標を作成しました'


# ========================================
# 公開目標一覧
# ========================================


class PublicGoalsListDataResponse(BaseModel):
    """公開目標一覧データレスポンス"""

    goals: list[GoalItemResponse]
    total: int


class PublicGoalsListAPIResponse(BaseAPIResponse[PublicGoalsListDataResponse]):
    """公開目標一覧APIレスポンス"""

    pass


# ========================================
# 目標更新
# ========================================


class UpdateGoalRequest(BaseModel):
    """目標更新リクエスト（部分更新）"""

    title: str | None = Field(None, description='目標タイトル', max_length=200)
    description: str | None = Field(None, description='目標詳細')
    startedAt: str | None = Field(None, description='開始日 (YYYY-MM-DD)')
    endedAt: str | None = Field(None, description='終了日 (YYYY-MM-DD)')
    isPublic: bool | None = Field(None, description='公開設定')


class UpdateGoalDataResponse(BaseModel):
    """目標更新データレスポンス"""

    goal: GoalItemResponse


class UpdateGoalAPIResponse(BaseAPIResponse[UpdateGoalDataResponse]):
    """目標更新APIレスポンス"""

    message: str = '目標を更新しました'


# ========================================
# 目標削除
# ========================================


class DeleteGoalDataResponse(BaseModel):
    """目標削除データレスポンス"""

    pass


class DeleteGoalAPIResponse(BaseAPIResponse[DeleteGoalDataResponse]):
    """目標削除APIレスポンス"""

    message: str = '目標を削除しました'
