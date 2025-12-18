"""目標関連のApplication層スキーマ（DTO）"""

from pydantic import BaseModel, Field


class GoalCreatorDTO(BaseModel):
    """目標作成者DTO"""

    id: str
    display_name: str | None = Field(alias='displayName')
    avatar_url: str | None = Field(alias='avatarUrl')

    class Config:
        populate_by_name = True


class GoalItemDTO(BaseModel):
    """目標アイテムDTO"""

    id: str
    user_id: str = Field(alias='userId')
    title: str
    description: str | None
    started_at: str = Field(alias='startedAt')
    ended_at: str | None = Field(alias='endedAt')
    is_active: bool = Field(alias='isActive')
    is_public: bool = Field(alias='isPublic')
    created_at: str = Field(alias='createdAt')
    updated_at: str = Field(alias='updatedAt')
    creator: GoalCreatorDTO

    class Config:
        populate_by_name = True


class MyGoalsListDTO(BaseModel):
    """自分の目標一覧DTO"""

    goals: list[GoalItemDTO]
    total: int


class CreateGoalInputDTO(BaseModel):
    """目標作成入力DTO"""

    title: str = Field(..., description='目標タイトル', max_length=200)
    description: str | None = Field(None, description='目標詳細')
    started_at: str | None = Field(None, alias='startedAt', description='開始日 (YYYY-MM-DD)')
    ended_at: str | None = Field(None, alias='endedAt', description='終了日 (YYYY-MM-DD)')
    is_public: bool = Field(False, alias='isPublic', description='公開設定')

    class Config:
        populate_by_name = True


class UpdateGoalInputDTO(BaseModel):
    """目標更新入力DTO（部分更新用）"""

    title: str | None = Field(None, description='目標タイトル', max_length=200)
    description: str | None = Field(None, description='目標詳細')
    started_at: str | None = Field(None, alias='startedAt', description='開始日 (YYYY-MM-DD)')
    ended_at: str | None = Field(None, alias='endedAt', description='終了日 (YYYY-MM-DD)')
    is_public: bool | None = Field(None, alias='isPublic', description='公開設定')

    class Config:
        populate_by_name = True


class PublicGoalsListDTO(BaseModel):
    """公開目標一覧DTO"""

    goals: list[GoalItemDTO]
    total: int
