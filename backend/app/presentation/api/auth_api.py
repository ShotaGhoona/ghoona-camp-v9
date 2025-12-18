from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.application.schemas.user_schemas import LoginInputDTO
from app.application.use_cases.user_usecase import UserUsecase
from app.di.user import get_user_usecase_with_auth
from app.domain.exceptions.auth import InvalidCredentialsError, UserNotFoundError
from app.infrastructure.security.security_service_impl import (
    User,
    get_current_user_from_cookie,
)
from app.presentation.schemas.auth_schemas import (
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
)

router = APIRouter(prefix='/auth', tags=['認証'])


@router.post('/login', response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(
    request: LoginRequest,
    response: Response,
    user_usecase: UserUsecase = Depends(get_user_usecase_with_auth),
) -> LoginResponse:
    """ログインエンドポイント"""
    input_dto = LoginInputDTO(email=request.email, password=request.password)

    try:
        output_dto = user_usecase.login(input_dto)
    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='メールアドレスまたはパスワードが正しくありません',
        ) from e

    # Cookieにアクセストークンを設定
    response.set_cookie(
        key='access_token',
        value=output_dto.access_token,
        httponly=True,
        secure=True,
        samesite='lax',
        max_age=7 * 24 * 60 * 60,
    )

    return LoginResponse(
        message='ログイン成功',
        user_id=output_dto.user_id,
    )


@router.post('/logout', response_model=LogoutResponse, status_code=status.HTTP_200_OK)
def logout(
    response: Response,
    current_user: User = Depends(get_current_user_from_cookie),
    user_usecase: UserUsecase = Depends(get_user_usecase_with_auth),
) -> LogoutResponse:
    """ログアウトエンドポイント"""
    output_dto = user_usecase.logout()

    response.delete_cookie(key='access_token')

    return LogoutResponse(message=output_dto.message)


@router.get('/me', response_model=MeResponse, status_code=status.HTTP_200_OK)
def get_me(
    current_user: User = Depends(get_current_user_from_cookie),
    user_usecase: UserUsecase = Depends(get_user_usecase_with_auth),
) -> MeResponse:
    """現在のユーザー情報取得エンドポイント"""
    try:
        output_dto = user_usecase.get_me(user_id=current_user.id)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='ユーザーが見つかりません',
        ) from e

    return MeResponse(
        id=output_dto.id,
        email=output_dto.email,
        username=output_dto.username,
        avatar_url=output_dto.avatar_url,
        discord_id=output_dto.discord_id,
        is_active=output_dto.is_active,
    )
