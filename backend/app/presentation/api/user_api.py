"""ユーザー関連のAPIエンドポイント"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.schemas.user_schemas import (
    AddRivalInputDTO,
    SocialLinkInputDTO,
    UpdateUserProfileInputDTO,
)
from app.application.use_cases.user_usecase import UserUsecase
from app.di.user import get_user_usecase
from app.domain.exceptions.user import (
    ForbiddenError,
    RivalAlreadyExistsError,
    RivalLimitExceededError,
    RivalNotFoundError,
    SelfRivalError,
    UsernameAlreadyExistsError,
    UserNotFoundError,
)
from app.infrastructure.security.security_service_impl import (
    User,
    get_current_user_from_cookie,
)
from app.presentation.schemas.user_schemas import (
    AddRivalAPIResponse,
    AddRivalDataResponse,
    AddRivalRequest,
    DeleteRivalAPIResponse,
    DeleteRivalDataResponse,
    ErrorResponse,
    PaginationResponse,
    RivalResponse,
    RivalsListAPIResponse,
    RivalsListDataResponse,
    RivalUserResponse,
    SocialLinkResponse,
    UpdateUserProfileAPIResponse,
    UpdateUserProfileRequest,
    UserDetailAPIResponse,
    UserDetailDataResponse,
    UserDetailResponse,
    UserListItemResponse,
    UsersListDataResponse,
    UsersListResponse,
)

router = APIRouter(prefix='/users', tags=['users'])


@router.get(
    '',
    response_model=UsersListResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def get_users(
    search: str | None = Query(None, description='キーワード検索（displayName, taglineを対象）'),
    skills: str | None = Query(None, description='スキルでフィルタ（カンマ区切りで複数指定可）'),
    interests: str | None = Query(None, description='興味・関心でフィルタ（カンマ区切りで複数指定可）'),
    title_levels: str | None = Query(None, description='称号レベルでフィルタ（カンマ区切りで複数指定可、1-8）'),
    limit: int = Query(20, ge=1, le=100, description='取得件数（最大100）'),
    offset: int = Query(0, ge=0, description='オフセット'),
    user_usecase: UserUsecase = Depends(get_user_usecase),
) -> UsersListResponse:
    """
    メンバー一覧を取得

    検索・フィルタリング・ページネーションに対応。
    """
    # カンマ区切りの文字列をリストに変換
    skills_list = [s.strip() for s in skills.split(',')] if skills else None
    interests_list = [i.strip() for i in interests.split(',')] if interests else None

    # title_levelsをint型のリストに変換
    title_levels_list = None
    if title_levels:
        try:
            title_levels_list = [int(t.strip()) for t in title_levels.split(',')]
            # 1-8の範囲外の値を除外
            title_levels_list = [t for t in title_levels_list if 1 <= t <= 8]
            if not title_levels_list:
                title_levels_list = None
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail={
                    'code': 'VALIDATION_ERROR',
                    'message': '無効なパラメータです',
                    'details': {'title_levels': '1から8の整数で指定してください'},
                },
            ) from e

    # ユースケース呼び出し
    result = user_usecase.get_users(
        search=search,
        skills=skills_list,
        interests=interests_list,
        title_levels=title_levels_list,
        limit=limit,
        offset=offset,
    )

    # レスポンス変換（軽量版）
    users_response = [
        UserListItemResponse(
            id=user.id,
            avatarUrl=user.avatar_url,
            displayName=user.display_name,
            tagline=user.tagline,
            currentTitleLevel=user.current_title_level,
        )
        for user in result.users
    ]

    pagination_response = PaginationResponse(
        total=result.pagination.total,
        limit=result.pagination.limit,
        offset=result.pagination.offset,
        hasMore=result.pagination.has_more,
    )

    return UsersListResponse(
        data=UsersListDataResponse(
            users=users_response,
            pagination=pagination_response,
        )
    )


@router.get(
    '/{user_id}',
    response_model=UserDetailAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        404: {'model': ErrorResponse, 'description': 'ユーザーが見つからない'},
    },
)
def get_user_by_id(
    user_id: UUID,
    user_usecase: UserUsecase = Depends(get_user_usecase),
) -> UserDetailAPIResponse:
    """
    指定したユーザーの詳細情報を取得

    メタデータ・SNSリンク・参加統計・称号情報を含む。
    """
    try:
        result = user_usecase.get_user_by_id(user_id)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたユーザーが見つかりません',
            },
        ) from e

    user_response = UserDetailResponse(
        id=result.id,
        username=result.username,
        avatarUrl=result.avatar_url,
        displayName=result.display_name,
        tagline=result.tagline,
        bio=result.bio,
        skills=result.skills,
        interests=result.interests,
        vision=result.vision,
        isVisionPublic=result.is_vision_public,
        socialLinks=[
            SocialLinkResponse(
                id=link.id,
                platform=link.platform,
                url=link.url,
                title=link.title,
            )
            for link in result.social_links
        ],
        totalAttendanceDays=result.total_attendance_days,
        currentStreakDays=result.current_streak_days,
        maxStreakDays=result.max_streak_days,
        currentTitleLevel=result.current_title_level,
        joinedAt=result.joined_at,
    )

    return UserDetailAPIResponse(
        data=UserDetailDataResponse(user=user_response)
    )


@router.put(
    '/{user_id}',
    response_model=UpdateUserProfileAPIResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
        404: {'model': ErrorResponse, 'description': 'ユーザーが見つからない'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
        409: {'model': ErrorResponse, 'description': 'ユーザー名の重複'},
    },
)
def update_user_profile(
    user_id: UUID,
    request: UpdateUserProfileRequest,
    current_user: User = Depends(get_current_user_from_cookie),
    user_usecase: UserUsecase = Depends(get_user_usecase),
) -> UpdateUserProfileAPIResponse:
    """
    ユーザープロフィールを更新

    本人のみ更新可能。指定されたフィールドのみ部分更新される。
    """
    # リクエストをDTOに変換
    social_links_dto = None
    if request.socialLinks is not None:
        social_links_dto = [
            SocialLinkInputDTO(
                platform=link.platform,
                url=link.url,
                title=link.title,
            )
            for link in request.socialLinks
        ]

    input_dto = UpdateUserProfileInputDTO(
        username=request.username,
        avatar_url=request.avatarUrl,
        display_name=request.displayName,
        tagline=request.tagline,
        bio=request.bio,
        skills=request.skills,
        interests=request.interests,
        vision=request.vision,
        is_vision_public=request.isVisionPublic,
        social_links=social_links_dto,
    )

    try:
        result = user_usecase.update_user_profile(
            user_id=user_id,
            current_user_id=current_user.id,
            input_dto=input_dto,
        )
    except ForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': 'このユーザーのプロフィールを更新する権限がありません',
            },
        ) from e
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたユーザーが見つかりません',
            },
        ) from e
    except UsernameAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                'code': 'CONFLICT',
                'message': 'このユーザー名は既に使用されています',
            },
        ) from e

    user_response = UserDetailResponse(
        id=result.id,
        username=result.username,
        avatarUrl=result.avatar_url,
        displayName=result.display_name,
        tagline=result.tagline,
        bio=result.bio,
        skills=result.skills,
        interests=result.interests,
        vision=result.vision,
        isVisionPublic=result.is_vision_public,
        socialLinks=[
            SocialLinkResponse(
                id=link.id,
                platform=link.platform,
                url=link.url,
                title=link.title,
            )
            for link in result.social_links
        ],
        totalAttendanceDays=result.total_attendance_days,
        currentStreakDays=result.current_streak_days,
        maxStreakDays=result.max_streak_days,
        currentTitleLevel=result.current_title_level,
        joinedAt=result.joined_at,
    )

    return UpdateUserProfileAPIResponse(
        data=UserDetailDataResponse(user=user_response)
    )


# ========================================
# ライバル関連
# ========================================


def _to_rival_response(rival_dto) -> RivalResponse:
    """ライバルDTOをレスポンスに変換"""
    return RivalResponse(
        id=rival_dto.id,
        rivalUser=RivalUserResponse(
            id=rival_dto.rival_user.id,
            username=rival_dto.rival_user.username,
            avatarUrl=rival_dto.rival_user.avatar_url,
            displayName=rival_dto.rival_user.display_name,
            tagline=rival_dto.rival_user.tagline,
            totalAttendanceDays=rival_dto.rival_user.total_attendance_days,
            currentStreakDays=rival_dto.rival_user.current_streak_days,
            maxStreakDays=rival_dto.rival_user.max_streak_days,
            currentTitleLevel=rival_dto.rival_user.current_title_level,
        ),
        createdAt=rival_dto.created_at,
    )


@router.get(
    '/{user_id}/rivals',
    response_model=RivalsListAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
    },
)
def get_rivals(
    user_id: UUID,
    current_user: User = Depends(get_current_user_from_cookie),
    user_usecase: UserUsecase = Depends(get_user_usecase),
) -> RivalsListAPIResponse:
    """
    ユーザーのライバル一覧を取得

    本人のみ取得可能。最大3人まで。
    """
    try:
        result = user_usecase.get_rivals(
            user_id=user_id,
            current_user_id=current_user.id,
        )
    except ForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': 'このユーザーのライバル一覧を取得する権限がありません',
            },
        ) from e
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたユーザーが見つかりません',
            },
        ) from e

    rivals_response = [_to_rival_response(rival) for rival in result.rivals]

    return RivalsListAPIResponse(
        data=RivalsListDataResponse(
            rivals=rivals_response,
            maxRivals=result.max_rivals,
            remainingSlots=result.remaining_slots,
        )
    )


@router.post(
    '/{user_id}/rivals',
    response_model=AddRivalAPIResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
        404: {'model': ErrorResponse, 'description': 'ユーザーが見つからない'},
        409: {'model': ErrorResponse, 'description': '重複または上限超過'},
    },
)
def add_rival(
    user_id: UUID,
    request: AddRivalRequest,
    current_user: User = Depends(get_current_user_from_cookie),
    user_usecase: UserUsecase = Depends(get_user_usecase),
) -> AddRivalAPIResponse:
    """
    ライバルを追加

    本人のみ追加可能。最大3人まで。
    """
    input_dto = AddRivalInputDTO(rival_user_id=request.rivalUserId)

    try:
        result = user_usecase.add_rival(
            user_id=user_id,
            current_user_id=current_user.id,
            input_dto=input_dto,
        )
    except SelfRivalError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': '自分自身をライバルに設定することはできません',
            },
        ) from e
    except ForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': 'このユーザーのライバルを追加する権限がありません',
            },
        ) from e
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたユーザーが見つかりません',
            },
        ) from e
    except RivalAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                'code': 'CONFLICT',
                'message': 'このユーザーは既にライバルに設定されています',
            },
        ) from e
    except RivalLimitExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                'code': 'RIVAL_LIMIT_EXCEEDED',
                'message': 'ライバルは最大3人までです',
            },
        ) from e

    return AddRivalAPIResponse(
        data=AddRivalDataResponse(
            rival=_to_rival_response(result.rival),
            remainingSlots=result.remaining_slots,
        )
    )


@router.delete(
    '/{user_id}/rivals/{rival_id}',
    response_model=DeleteRivalAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
        404: {'model': ErrorResponse, 'description': 'ライバル関係が見つからない'},
    },
)
def delete_rival(
    user_id: UUID,
    rival_id: UUID,
    current_user: User = Depends(get_current_user_from_cookie),
    user_usecase: UserUsecase = Depends(get_user_usecase),
) -> DeleteRivalAPIResponse:
    """
    ライバル関係を削除

    本人のみ削除可能。
    """
    try:
        result = user_usecase.delete_rival(
            user_id=user_id,
            rival_id=rival_id,
            current_user_id=current_user.id,
        )
    except ForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': 'このライバル関係を解除する権限がありません',
            },
        ) from e
    except RivalNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたライバル関係が見つかりません',
            },
        ) from e

    return DeleteRivalAPIResponse(
        data=DeleteRivalDataResponse(
            remainingSlots=result.remaining_slots,
        )
    )
