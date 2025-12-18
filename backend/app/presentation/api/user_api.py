"""ユーザー関連のAPIエンドポイント"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.schemas.user_schemas import (
    SocialLinkInputDTO,
    UpdateUserProfileInputDTO,
)
from app.application.use_cases.user_usecase import UserUsecase
from app.di.user import get_user_usecase
from app.domain.exceptions.user import (
    ForbiddenError,
    UsernameAlreadyExistsError,
    UserNotFoundError,
)
from app.infrastructure.security.security_service_impl import (
    User,
    get_current_user_from_cookie,
)
from app.presentation.schemas.user_schemas import (
    ErrorResponse,
    PaginationResponse,
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
