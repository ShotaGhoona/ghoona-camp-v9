"""目標関連のAPIエンドポイント"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.schemas.goal_schemas import CreateGoalInputDTO, UpdateGoalInputDTO
from app.application.use_cases.goal_usecase import GoalUsecase
from app.di.goal import get_goal_usecase
from app.domain.exceptions.goal import GoalForbiddenError, GoalNotFoundError
from app.infrastructure.security.security_service_impl import (
    User,
    get_current_user_from_cookie,
)
from app.presentation.schemas.goal_schemas import (
    CreateGoalAPIResponse,
    CreateGoalDataResponse,
    CreateGoalRequest,
    DeleteGoalAPIResponse,
    DeleteGoalDataResponse,
    ErrorResponse,
    GoalItemResponse,
    MyGoalsListAPIResponse,
    MyGoalsListDataResponse,
    PublicGoalsListAPIResponse,
    PublicGoalsListDataResponse,
    UpdateGoalAPIResponse,
    UpdateGoalDataResponse,
    UpdateGoalRequest,
)

router = APIRouter(prefix='/goals', tags=['goals'])


@router.get(
    '/me',
    response_model=MyGoalsListAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def get_my_goals(
    year: int = Query(..., ge=2000, le=2100, description='表示対象の年（例: 2025）'),
    month: int = Query(..., ge=1, le=12, description='表示対象の月（1-12）'),
    is_public: bool | None = Query(
        None,
        description='公開設定でフィルタリング（true=公開のみ, false=プライベートのみ, 省略=全て）',
    ),
    current_user: User = Depends(get_current_user_from_cookie),
    goal_usecase: GoalUsecase = Depends(get_goal_usecase),
) -> MyGoalsListAPIResponse:
    """
    自分の目標一覧を取得

    指定した年月に「かかる」目標を返す。プライベート・パブリック両方を含む。
    - 開始日が月末以前 AND (終了日が月初以降 OR 終了日がnull)
    """
    try:
        result = goal_usecase.get_my_goals(
            current_user_id=current_user.id,
            year=year,
            month=month,
            is_public=is_public,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    # レスポンス変換
    goals_response = [
        GoalItemResponse(
            id=goal.id,
            userId=goal.user_id,
            title=goal.title,
            description=goal.description,
            startedAt=goal.started_at,
            endedAt=goal.ended_at,
            isActive=goal.is_active,
            isPublic=goal.is_public,
            createdAt=goal.created_at,
            updatedAt=goal.updated_at,
        )
        for goal in result.goals
    ]

    return MyGoalsListAPIResponse(
        data=MyGoalsListDataResponse(
            goals=goals_response,
            total=result.total,
        )
    )


@router.post(
    '',
    response_model=CreateGoalAPIResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def create_goal(
    request: CreateGoalRequest,
    current_user: User = Depends(get_current_user_from_cookie),
    goal_usecase: GoalUsecase = Depends(get_goal_usecase),
) -> CreateGoalAPIResponse:
    """
    新しい目標を作成

    タイトル（最大200文字）、説明、期間、公開設定を指定して目標を作成。
    """
    # リクエストをDTOに変換
    input_dto = CreateGoalInputDTO(
        title=request.title,
        description=request.description,
        startedAt=request.startedAt,
        endedAt=request.endedAt,
        isPublic=request.isPublic,
    )

    try:
        result = goal_usecase.create_goal(
            current_user_id=current_user.id,
            input_dto=input_dto,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    # レスポンス変換
    goal_response = GoalItemResponse(
        id=result.id,
        userId=result.user_id,
        title=result.title,
        description=result.description,
        startedAt=result.started_at,
        endedAt=result.ended_at,
        isActive=result.is_active,
        isPublic=result.is_public,
        createdAt=result.created_at,
        updatedAt=result.updated_at,
    )

    return CreateGoalAPIResponse(
        data=CreateGoalDataResponse(goal=goal_response)
    )


@router.get(
    '/public',
    response_model=PublicGoalsListAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def get_public_goals(
    year: int = Query(..., ge=2000, le=2100, description='表示対象の年（例: 2025）'),
    month: int = Query(..., ge=1, le=12, description='表示対象の月（1-12）'),
    user_id: str | None = Query(None, description='特定ユーザーIDでフィルタリング'),
    _current_user: User = Depends(get_current_user_from_cookie),
    goal_usecase: GoalUsecase = Depends(get_goal_usecase),
) -> PublicGoalsListAPIResponse:
    """
    公開目標一覧を取得

    指定した年月に「かかる」公開目標を返す。
    - 開始日が月末以前 AND (終了日が月初以降 OR 終了日がnull)
    """
    try:
        result = goal_usecase.get_public_goals(
            year=year,
            month=month,
            user_id=user_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    # レスポンス変換
    goals_response = [
        GoalItemResponse(
            id=goal.id,
            userId=goal.user_id,
            title=goal.title,
            description=goal.description,
            startedAt=goal.started_at,
            endedAt=goal.ended_at,
            isActive=goal.is_active,
            isPublic=goal.is_public,
            createdAt=goal.created_at,
            updatedAt=goal.updated_at,
        )
        for goal in result.goals
    ]

    return PublicGoalsListAPIResponse(
        data=PublicGoalsListDataResponse(
            goals=goals_response,
            total=result.total,
        )
    )


@router.put(
    '/{goal_id}',
    response_model=UpdateGoalAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
        404: {'model': ErrorResponse, 'description': '目標が見つからない'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def update_goal(
    goal_id: UUID,
    request: UpdateGoalRequest,
    current_user: User = Depends(get_current_user_from_cookie),
    goal_usecase: GoalUsecase = Depends(get_goal_usecase),
) -> UpdateGoalAPIResponse:
    """
    目標を更新

    タイトル、説明、期間、公開設定を部分更新可能。本人のみ更新可能。
    """
    # リクエストをDTOに変換
    input_dto = UpdateGoalInputDTO(
        title=request.title,
        description=request.description,
        startedAt=request.startedAt,
        endedAt=request.endedAt,
        isPublic=request.isPublic,
    )

    try:
        result = goal_usecase.update_goal(
            goal_id=str(goal_id),
            current_user_id=current_user.id,
            input_dto=input_dto,
        )
    except GoalNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定された目標が見つかりません',
            },
        ) from e
    except GoalForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': 'この目標を更新する権限がありません',
            },
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    # レスポンス変換
    goal_response = GoalItemResponse(
        id=result.id,
        userId=result.user_id,
        title=result.title,
        description=result.description,
        startedAt=result.started_at,
        endedAt=result.ended_at,
        isActive=result.is_active,
        isPublic=result.is_public,
        createdAt=result.created_at,
        updatedAt=result.updated_at,
    )

    return UpdateGoalAPIResponse(
        data=UpdateGoalDataResponse(goal=goal_response)
    )


@router.delete(
    '/{goal_id}',
    response_model=DeleteGoalAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
        404: {'model': ErrorResponse, 'description': '目標が見つからない'},
    },
)
def delete_goal(
    goal_id: UUID,
    current_user: User = Depends(get_current_user_from_cookie),
    goal_usecase: GoalUsecase = Depends(get_goal_usecase),
) -> DeleteGoalAPIResponse:
    """
    目標を削除

    本人のみ削除可能。
    """
    try:
        goal_usecase.delete_goal(
            goal_id=str(goal_id),
            current_user_id=current_user.id,
        )
    except GoalNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定された目標が見つかりません',
            },
        ) from e
    except GoalForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': 'この目標を削除する権限がありません',
            },
        ) from e

    return DeleteGoalAPIResponse(
        data=DeleteGoalDataResponse()
    )
