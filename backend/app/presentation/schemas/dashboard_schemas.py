"""ダッシュボード関連のPresentation層スキーマ（リクエスト/レスポンス）"""

from pydantic import BaseModel, Field

from app.presentation.schemas.common import BaseAPIResponse


class DashboardBlockResponse(BaseModel):
    """ダッシュボードブロックレスポンス"""

    id: str
    type: str
    x: int
    y: int
    w: int
    h: int


class DashboardLayoutDataResponse(BaseModel):
    """ダッシュボードレイアウトデータレスポンス"""

    blocks: list[DashboardBlockResponse]


class DashboardLayoutAPIResponse(BaseAPIResponse[DashboardLayoutDataResponse]):
    """ダッシュボードレイアウト取得APIレスポンス"""

    pass


# ========================================
# レイアウト更新
# ========================================


class DashboardBlockRequest(BaseModel):
    """ダッシュボードブロックリクエスト"""

    id: str = Field(..., description='ブロックID')
    type: str = Field(..., description='ブロックタイプ')
    x: int = Field(..., ge=0, le=11, description='X座標（0-11）')
    y: int = Field(..., ge=0, description='Y座標（0以上）')
    w: int = Field(..., ge=1, le=12, description='幅（1-12）')
    h: int = Field(..., ge=1, description='高さ（1以上）')


class UpdateDashboardLayoutRequest(BaseModel):
    """ダッシュボードレイアウト更新リクエスト"""

    blocks: list[DashboardBlockRequest] = Field(..., description='ブロック一覧')


class UpdateDashboardLayoutAPIResponse(BaseAPIResponse[DashboardLayoutDataResponse]):
    """ダッシュボードレイアウト更新APIレスポンス"""

    message: str = 'レイアウトを更新しました'
