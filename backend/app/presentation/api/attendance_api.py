"""参加関連のAPIエンドポイント"""

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.application.use_cases.attendance_usecase import AttendanceUsecase, RankingUsecase
from app.di.attendance import get_attendance_usecase, get_ranking_usecase
from app.domain.exceptions.attendance import (
    InvalidDateRangeError,
    InvalidMonthError,
    NotOwnAttendanceError,
)
from app.infrastructure.security.security_service_impl import (
    User,
    get_current_user_from_cookie,
)
from app.presentation.schemas.attendance_schemas import (
    AllRankingsAPIResponse,
    AllRankingsDataResponse,
    AttendanceStatisticsAPIResponse,
    AttendanceStatisticsResponse,
    AttendanceSummariesAPIResponse,
    AttendanceSummariesDataResponse,
    AttendanceSummaryItemResponse,
    AttendanceSummaryPeriodResponse,
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

# ユーザー参加情報ルーター（/users/{userId}/attendance/...）
users_attendance_router = APIRouter(prefix='/users', tags=['attendance'])


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


# =============================================================================
# ユーザー参加情報API
# =============================================================================


@users_attendance_router.get(
    '/{user_id}/attendance/statistics',
    response_model=AttendanceStatisticsAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
    },
)
def get_attendance_statistics(
    user_id: str = Path(..., description='ユーザーID'),
    current_user: User = Depends(get_current_user_from_cookie),
    attendance_usecase: AttendanceUsecase = Depends(get_attendance_usecase),
) -> AttendanceStatisticsAPIResponse:
    """
    ユーザーの参加統計を取得

    本人のみアクセス可能。統計カードの表示に使用。
    """
    try:
        result = attendance_usecase.get_statistics(
            user_id=user_id,
            current_user_id=current_user.id,
        )
    except NotOwnAttendanceError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': str(e),
            },
        ) from e

    return AttendanceStatisticsAPIResponse(
        data=AttendanceStatisticsResponse(
            totalAttendanceDays=result.total_attendance_days,
            currentStreakDays=result.current_streak_days,
            maxStreakDays=result.max_streak_days,
            thisMonthDays=result.this_month_days,
            thisWeekDays=result.this_week_days,
        )
    )


@users_attendance_router.get(
    '/{user_id}/attendance/summaries',
    response_model=AttendanceSummariesAPIResponse,
    responses={
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
    },
)
def get_attendance_summaries(
    user_id: str = Path(..., description='ユーザーID'),
    date_from: str | None = Query(
        None,
        alias='date_from',
        description='開始日（YYYY-MM-DD）、省略時は当月1日',
    ),
    date_to: str | None = Query(
        None,
        alias='date_to',
        description='終了日（YYYY-MM-DD）、省略時は当月末日',
    ),
    current_user: User = Depends(get_current_user_from_cookie),
    attendance_usecase: AttendanceUsecase = Depends(get_attendance_usecase),
) -> AttendanceSummariesAPIResponse:
    """
    ユーザーの参加サマリーを取得

    本人のみアクセス可能。カレンダーのマーカー表示に使用。
    """
    try:
        result = attendance_usecase.get_summaries(
            user_id=user_id,
            current_user_id=current_user.id,
            date_from=date_from,
            date_to=date_to,
        )
    except NotOwnAttendanceError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': str(e),
            },
        ) from e
    except InvalidDateRangeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    return AttendanceSummariesAPIResponse(
        data=AttendanceSummariesDataResponse(
            summaries=[
                AttendanceSummaryItemResponse(
                    date=s.date,
                    isMorningActive=s.is_morning_active,
                )
                for s in result.summaries
            ],
            period=AttendanceSummaryPeriodResponse(
                dateFrom=result.period.date_from,
                dateTo=result.period.date_to,
            ),
            total=result.total,
        )
    )
