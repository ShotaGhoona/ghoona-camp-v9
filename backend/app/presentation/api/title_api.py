"""称号関連のAPIエンドポイント"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.application.use_cases.title_usecase import TitleUsecase
from app.di.title import get_title_usecase
from app.domain.exceptions.title import TitleLevelInvalidError
from app.domain.exceptions.user import UserNotFoundError
from app.infrastructure.security.security_service_impl import (
    User,
    get_current_user_from_cookie,
)
from app.presentation.schemas.common import ErrorResponse
from app.presentation.schemas.title_schemas import (
    TitleHolderResponse,
    TitleHoldersAPIResponse,
    TitleHoldersDataResponse,
    UserTitleAchievementResponse,
    UserTitleAchievementsAPIResponse,
    UserTitleAchievementsDataResponse,
)

# /titles プレフィックス用ルーター
router = APIRouter(prefix='/titles', tags=['titles'])

# /users プレフィックス用ルーター（称号実績取得）
users_title_router = APIRouter(tags=['titles'])


@router.get(
    '/{level}/holders',
    response_model=TitleHoldersAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def get_title_holders(
    level: int = Path(..., ge=1, le=8, description='称号レベル (1-8)'),
    _current_user: User = Depends(get_current_user_from_cookie),
    title_usecase: TitleUsecase = Depends(get_title_usecase),
) -> TitleHoldersAPIResponse:
    """
    指定レベルの称号保持者一覧を取得

    称号詳細モーダルで使用。保持者の一覧と総数を返す。
    """
    try:
        result = title_usecase.get_title_holders(level=level)
    except TitleLevelInvalidError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    # レスポンス変換
    holders_response = [
        TitleHolderResponse(
            id=holder.id,
            displayName=holder.display_name,
            avatarUrl=holder.avatar_url,
            achievedAt=holder.achieved_at,
        )
        for holder in result.holders
    ]

    return TitleHoldersAPIResponse(
        data=TitleHoldersDataResponse(
            level=result.level,
            holders=holders_response,
            total=result.total,
        )
    )


@users_title_router.get(
    '/users/{user_id}/title-achievements',
    response_model=UserTitleAchievementsAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        404: {'model': ErrorResponse, 'description': 'ユーザーが見つからない'},
    },
)
def get_user_title_achievements(
    user_id: UUID = Path(..., description='ユーザーID'),
    _current_user: User = Depends(get_current_user_from_cookie),
    title_usecase: TitleUsecase = Depends(get_title_usecase),
) -> UserTitleAchievementsAPIResponse:
    """
    ユーザーの称号実績を取得

    タイトルページのユーザー進捗表示に使用。
    現在の称号レベル、総参加日数、獲得済み称号一覧を返す。
    """
    try:
        result = title_usecase.get_user_title_achievements(user_id=str(user_id))
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたユーザーが見つかりません',
            },
        ) from e

    # レスポンス変換
    achievements_response = [
        UserTitleAchievementResponse(
            titleLevel=achievement.title_level,
            achievedAt=achievement.achieved_at,
        )
        for achievement in result.achievements
    ]

    return UserTitleAchievementsAPIResponse(
        data=UserTitleAchievementsDataResponse(
            currentTitleLevel=result.current_title_level,
            totalAttendanceDays=result.total_attendance_days,
            achievements=achievements_response,
        )
    )
