"""ランキング関連のAPIエンドポイント"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.use_cases.attendance_usecase import RankingUsecase
from app.di.attendance import get_ranking_usecase
from app.domain.exceptions.attendance import InvalidMonthError
from app.infrastructure.security.security_service_impl import (
    User,
    get_current_user_from_cookie,
)
from app.presentation.schemas.attendance_schemas import (
    AllRankingsAPIResponse,
    AllRankingsDataResponse,
    CurrentUserRankingResponse,
    CurrentUserRankingsResponse,
    MonthlyRankingListResponse,
    MyRankingsAPIResponse,
    RankingEntryResponse,
    RankingListResponse,
    RankingUserResponse,
)
from app.presentation.schemas.common import ErrorResponse

router = APIRouter(prefix='/rankings', tags=['rankings'])


@router.get(
    '',
    response_model=AllRankingsAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def get_all_rankings(
    year: int | None = Query(
        None,
        ge=2000,
        le=2100,
        description='月間ランキングの対象年（省略時は現在年）',
    ),
    month: int | None = Query(
        None,
        ge=1,
        le=12,
        description='月間ランキングの対象月（省略時は現在月）',
    ),
    limit: int = Query(
        50,
        ge=1,
        le=100,
        description='各ランキングの取得件数',
    ),
    current_user: User = Depends(get_current_user_from_cookie),
    ranking_usecase: RankingUsecase = Depends(get_ranking_usecase),
) -> AllRankingsAPIResponse:
    """
    3種類のランキングを一括取得

    ランキングページのメインAPI。月間・総合・連続日数の3種類のランキングを
    一度に取得し、ログインユーザー自身のランキング情報も含める。
    """
    try:
        result = ranking_usecase.get_all_rankings(
            current_user_id=current_user.id,
            year=year,
            month=month,
            limit=limit,
        )
    except InvalidMonthError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    # DTOからレスポンスに変換
    return AllRankingsAPIResponse(
        data=AllRankingsDataResponse(
            monthly=MonthlyRankingListResponse(
                year=result.monthly.year,
                month=result.monthly.month,
                entries=[
                    RankingEntryResponse(
                        rank=e.rank,
                        user=RankingUserResponse(
                            id=e.user.id,
                            displayName=e.user.display_name,
                            avatarUrl=e.user.avatar_url,
                            tagline=e.user.tagline,
                        ),
                        currentTitleLevel=e.current_title_level,
                        score=e.score,
                    )
                    for e in result.monthly.entries
                ],
                total=result.monthly.total,
            ),
            total=RankingListResponse(
                entries=[
                    RankingEntryResponse(
                        rank=e.rank,
                        user=RankingUserResponse(
                            id=e.user.id,
                            displayName=e.user.display_name,
                            avatarUrl=e.user.avatar_url,
                            tagline=e.user.tagline,
                        ),
                        currentTitleLevel=e.current_title_level,
                        score=e.score,
                    )
                    for e in result.total.entries
                ],
                total=result.total.total,
            ),
            streak=RankingListResponse(
                entries=[
                    RankingEntryResponse(
                        rank=e.rank,
                        user=RankingUserResponse(
                            id=e.user.id,
                            displayName=e.user.display_name,
                            avatarUrl=e.user.avatar_url,
                            tagline=e.user.tagline,
                        ),
                        currentTitleLevel=e.current_title_level,
                        score=e.score,
                    )
                    for e in result.streak.entries
                ],
                total=result.streak.total,
            ),
            currentUser=CurrentUserRankingsResponse(
                monthly=CurrentUserRankingResponse(
                    rank=result.current_user.monthly.rank,
                    score=result.current_user.monthly.score,
                ),
                total=CurrentUserRankingResponse(
                    rank=result.current_user.total.rank,
                    score=result.current_user.total.score,
                ),
                streak=CurrentUserRankingResponse(
                    rank=result.current_user.streak.rank,
                    score=result.current_user.streak.score,
                ),
            ),
        )
    )


@router.get(
    '/me',
    response_model=MyRankingsAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def get_my_rankings(
    year: int | None = Query(
        None,
        ge=2000,
        le=2100,
        description='月間ランキングの対象年（省略時は現在年）',
    ),
    month: int | None = Query(
        None,
        ge=1,
        le=12,
        description='月間ランキングの対象月（省略時は現在月）',
    ),
    current_user: User = Depends(get_current_user_from_cookie),
    ranking_usecase: RankingUsecase = Depends(get_ranking_usecase),
) -> MyRankingsAPIResponse:
    """
    ログインユーザー自身のランキング情報のみを取得

    軽量API。各ランキングでの順位とスコアのみを返す。
    """
    try:
        result = ranking_usecase.get_my_rankings(
            current_user_id=current_user.id,
            year=year,
            month=month,
        )
    except InvalidMonthError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    return MyRankingsAPIResponse(
        data=CurrentUserRankingsResponse(
            monthly=CurrentUserRankingResponse(
                rank=result.monthly.rank,
                score=result.monthly.score,
            ),
            total=CurrentUserRankingResponse(
                rank=result.total.rank,
                score=result.total.score,
            ),
            streak=CurrentUserRankingResponse(
                rank=result.streak.rank,
                score=result.streak.score,
            ),
        )
    )
