from fastapi import APIRouter, Depends, Response, status

from app.application.schemas.auth_schemas import LoginInputDTO
from app.application.use_cases.auth_usecase import AuthUsecase
from app.di.auth import get_auth_usecase
from app.infrastructure.security.security_service_impl import (
    User,  # これは後からuser entityのものに変更する必要あり
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
    auth_usecase: AuthUsecase = Depends(get_auth_usecase),
) -> LoginResponse:
    input_dto = LoginInputDTO(email=request.email, password=request.password)

    output_dto = auth_usecase.login(input_dto)

    # Cookieにアクセストークンを設定
    response.set_cookie(
        key='access_token',
        value=output_dto.access_token,
        httponly=True,  # JavaScriptからのアクセスを防ぐ
        secure=True,  # HTTPS接続でのみ送信
        samesite='lax',  # CSRF攻撃対策
        max_age=7 * 24 * 60 * 60,  # 7日間
    )

    # レスポンスを返す（access_tokenはCookieに設定されるためレスポンスボディには含めない）
    return LoginResponse(
        message='ログイン成功',
        user_id=output_dto.user_id,
    )


@router.post('/logout', response_model=LogoutResponse, status_code=status.HTTP_200_OK)
def logout(
    response: Response,
    current_user: User = Depends(get_current_user_from_cookie),
    auth_usecase: AuthUsecase = Depends(get_auth_usecase),
) -> LogoutResponse:
    """ログアウトエンドポイント"""
    output_dto = auth_usecase.logout()

    # Cookieを削除
    response.delete_cookie(key='access_token')

    return LogoutResponse(message=output_dto.message)


@router.get('/me', response_model=MeResponse, status_code=status.HTTP_200_OK)
def get_me(
    current_user: User = Depends(get_current_user_from_cookie),
    auth_usecase: AuthUsecase = Depends(get_auth_usecase),
) -> MeResponse:
    """現在のユーザー情報取得エンドポイント"""
    output_dto = auth_usecase.get_me(user_id=current_user.id)

    return MeResponse(
        id=output_dto.id,
        email=output_dto.email,
        username=output_dto.username,
        avatar_url=output_dto.avatar_url,
        discord_id=output_dto.discord_id,
        is_active=output_dto.is_active,
    )
