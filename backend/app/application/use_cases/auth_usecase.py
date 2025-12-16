import logging
import uuid

# from app.domain.repositories.user_repository import IUserRepository
from fastapi import HTTPException, status

from app.application.interfaces.security_service import ISecurityService
from app.application.schemas.auth_schemas import (
    LoginInputDTO,
    LoginOutputDTO,
    LogoutOutputDTO,
    MeOutputDTO,
)

logger = logging.getLogger(__name__)

# 暫定的なテストユーザー（DB実装後に削除）
TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000'
TEST_USER_EMAIL = 'admin@example.com'
TEST_USER_PASSWORD = 'password'


class AuthUsecase:
    """認証ユースケース"""

    def __init__(
        self,
        security_service: ISecurityService,
        # user_repository: IUserRepository  # 将来のDB認証用
    ):
        self.security_service = security_service
        # self.user_repository = user_repository

    def login(self, input_dto: LoginInputDTO) -> LoginOutputDTO:
        # ============================================================
        # 【暫定実装】ハードコーディングでの認証
        # ============================================================
        if input_dto.email == TEST_USER_EMAIL and input_dto.password == TEST_USER_PASSWORD:
            user_id = TEST_USER_ID
            access_token = self.security_service.create_access_token(user_id=user_id)
            logger.info('ログイン成功: %s', input_dto.email)

            return LoginOutputDTO(access_token=access_token, user_id=user_id)
        else:
            # 認証失敗
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='メールアドレスまたはパスワードが正しくありません',
            )

        # ============================================================
        # 【将来実装】DBを使用した認証（参考実装）
        # ============================================================
        # user_data = self.user_repository.get_by_email(input_dto.email)
        #
        # if user_data is None:
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="メールアドレスもしくはパスワードが違います。"
        #     )
        #
        # is_authenticated = self.security_service.verify_password(
        #     input_dto.password, user_data.password_hash
        # )
        # if not is_authenticated:
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="メールアドレスもしくはパスワードが違います。"
        #     )
        #
        # access_token = self.security_service.create_access_token(user_id=str(user_data.id))
        # return LoginOutputDTO(
        #     access_token=access_token,
        #     user_id=str(user_data.id)
        # )

    def logout(self) -> LogoutOutputDTO:
        """ログアウト処理（Cookieはエンドポイント側で削除）"""
        logger.info('ログアウト成功')
        return LogoutOutputDTO(message='ログアウトしました')

    def get_me(self, user_id: str) -> MeOutputDTO:
        """現在のユーザー情報を取得"""
        # ============================================================
        # 【暫定実装】ハードコーディングでのユーザー情報
        # ============================================================
        return MeOutputDTO(
            id=user_id,
            email=TEST_USER_EMAIL,
            username='Admin User',
            avatar_url=None,
            discord_id=None,
            is_active=True,
        )

        # ============================================================
        # 【将来実装】DBからユーザー情報を取得
        # ============================================================
        # user_data = self.user_repository.get_by_id(uuid.UUID(user_id))
        # if user_data is None:
        #     raise HTTPException(
        #         status_code=status.HTTP_404_NOT_FOUND,
        #         detail="ユーザーが見つかりません"
        #     )
        # return MeOutputDTO(
        #     id=str(user_data.id),
        #     email=user_data.email,
        #     username=user_data.username,
        #     avatar_url=user_data.avatar_url,
        #     discord_id=user_data.discord_id,
        #     is_active=user_data.is_active,
        # )
