"""ダッシュボード関連のAPIエンドポイント"""

from fastapi import APIRouter, Depends

from app.application.schemas.dashboard_schemas import (
    DashboardBlockDTO,
    UpdateDashboardLayoutInputDTO,
)
from app.application.use_cases.dashboard_usecase import DashboardUsecase
from app.di.dashboard import get_dashboard_usecase
from app.infrastructure.security.security_service_impl import (
    User,
    get_current_user_from_cookie,
)
from app.presentation.schemas.common import ErrorResponse
from app.presentation.schemas.dashboard_schemas import (
    DashboardBlockResponse,
    DashboardLayoutAPIResponse,
    DashboardLayoutDataResponse,
    UpdateDashboardLayoutAPIResponse,
    UpdateDashboardLayoutRequest,
)

router = APIRouter(prefix='/dashboard', tags=['dashboard'])


@router.get(
    '/layout',
    response_model=DashboardLayoutAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
    },
)
def get_dashboard_layout(
    current_user: User = Depends(get_current_user_from_cookie),
    dashboard_usecase: DashboardUsecase = Depends(get_dashboard_usecase),
) -> DashboardLayoutAPIResponse:
    """
    ダッシュボードレイアウトを取得

    自分のダッシュボードレイアウト設定を取得。
    未設定の場合は空のブロック一覧を返す（フロントエンドでデフォルトを適用）。
    """
    result = dashboard_usecase.get_layout(current_user_id=current_user.id)

    # レスポンス変換
    blocks_response = [
        DashboardBlockResponse(
            id=block.id,
            type=block.type,
            x=block.x,
            y=block.y,
            w=block.w,
            h=block.h,
        )
        for block in result.blocks
    ]

    return DashboardLayoutAPIResponse(
        data=DashboardLayoutDataResponse(blocks=blocks_response)
    )


@router.put(
    '/layout',
    response_model=UpdateDashboardLayoutAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def update_dashboard_layout(
    request: UpdateDashboardLayoutRequest,
    current_user: User = Depends(get_current_user_from_cookie),
    dashboard_usecase: DashboardUsecase = Depends(get_dashboard_usecase),
) -> UpdateDashboardLayoutAPIResponse:
    """
    ダッシュボードレイアウトを更新

    ダッシュボードのブロック配置を全体置換で更新。
    空のブロック一覧を送信すると全ブロックが削除される。
    """
    # リクエストをDTOに変換
    input_dto = UpdateDashboardLayoutInputDTO(
        blocks=[
            DashboardBlockDTO(
                id=block.id,
                type=block.type,
                x=block.x,
                y=block.y,
                w=block.w,
                h=block.h,
            )
            for block in request.blocks
        ]
    )

    result = dashboard_usecase.update_layout(
        current_user_id=current_user.id,
        input_dto=input_dto,
    )

    # レスポンス変換
    blocks_response = [
        DashboardBlockResponse(
            id=block.id,
            type=block.type,
            x=block.x,
            y=block.y,
            w=block.w,
            h=block.h,
        )
        for block in result.blocks
    ]

    return UpdateDashboardLayoutAPIResponse(
        data=DashboardLayoutDataResponse(blocks=blocks_response)
    )
