"""ユーザー関連のユースケース"""

import logging
from uuid import UUID

from app.application.interfaces.security_service import ISecurityService
from app.application.schemas.user_schemas import (
    LoginInputDTO,
    LoginOutputDTO,
    LogoutOutputDTO,
    MeOutputDTO,
    PaginationDTO,
    SocialLinkDTO,
    UpdateUserProfileInputDTO,
    UserDetailDTO,
    UserListItemDTO,
    UsersListDTO,
)
from app.domain.exceptions.auth import InvalidCredentialsError
from app.domain.exceptions.auth import UserNotFoundError as AuthUserNotFoundError
from app.domain.exceptions.user import (
    ForbiddenError,
    UsernameAlreadyExistsError,
    UserNotFoundError,
)
from app.domain.repositories.user_repository import (
    IUserRepository,
    SocialLinkInput,
    UserListItem,
    UserProfileUpdateData,
    UserSearchFilter,
    UserWithDetails,
)

logger = logging.getLogger(__name__)


class UserUsecase:
    """ユーザー関連のユースケース"""

    def __init__(
        self,
        user_repository: IUserRepository,
        security_service: ISecurityService | None = None,
    ):
        """
        コンストラクタ

        Args:
            user_repository: ユーザーリポジトリ
            security_service: セキュリティサービス（認証機能使用時に必要）
        """
        self.user_repository = user_repository
        self.security_service = security_service

    # ========================================
    # ユーザー一覧・詳細
    # ========================================

    def get_users(
        self,
        search: str | None = None,
        skills: list[str] | None = None,
        interests: list[str] | None = None,
        title_levels: list[int] | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> UsersListDTO:
        """ユーザー一覧を取得"""
        # バリデーション
        if limit < 1 or limit > 100:
            limit = 20
        if offset < 0:
            offset = 0

        # 称号レベルのバリデーション
        if title_levels:
            title_levels = [level for level in title_levels if 1 <= level <= 8]

        # フィルター作成
        filter = UserSearchFilter(
            search=search,
            skills=skills,
            interests=interests,
            title_levels=title_levels if title_levels else None,
            limit=limit,
            offset=offset,
        )

        # リポジトリからデータ取得（軽量版）
        paginated_users = self.user_repository.get_users_list(filter)

        # DTOに変換
        users_dto = [
            self._to_user_list_item_dto(user) for user in paginated_users.users
        ]

        pagination_dto = PaginationDTO(
            total=paginated_users.total,
            limit=paginated_users.limit,
            offset=paginated_users.offset,
            has_more=paginated_users.has_more,
        )

        return UsersListDTO(users=users_dto, pagination=pagination_dto)

    def _to_user_list_item_dto(self, user: UserListItem) -> UserListItemDTO:
        """UserListItemをUserListItemDTOに変換"""
        return UserListItemDTO(
            id=str(user.id),
            avatarUrl=user.avatar_url,
            displayName=user.display_name,
            tagline=user.tagline,
            currentTitleLevel=user.current_title_level,
        )

    def get_user_by_id(self, user_id: UUID) -> UserDetailDTO:
        """ユーザー詳細を取得"""
        user_detail = self.user_repository.get_user_detail_by_id(user_id)
        if user_detail is None:
            raise UserNotFoundError()

        return self._to_user_detail_dto(user_detail)

    def _to_user_detail_dto(self, user: UserWithDetails) -> UserDetailDTO:
        """UserWithDetailsをUserDetailDTOに変換"""
        social_links_dto = [
            SocialLinkDTO(
                id=link['id'],
                platform=link['platform'],
                url=link['url'],
                title=link['title'],
            )
            for link in user.social_links
        ]

        return UserDetailDTO(
            id=str(user.id),
            username=user.username,
            avatarUrl=user.avatar_url,
            displayName=user.display_name,
            tagline=user.tagline,
            bio=user.bio,
            skills=user.skills,
            interests=user.interests,
            vision=user.vision,
            isVisionPublic=user.is_vision_public,
            socialLinks=social_links_dto,
            totalAttendanceDays=user.total_attendance_days,
            currentStreakDays=user.current_streak_days,
            maxStreakDays=user.max_streak_days,
            currentTitleLevel=user.current_title_level,
            joinedAt=user.joined_at,
        )

    # ========================================
    # 認証
    # ========================================

    def login(self, input_dto: LoginInputDTO) -> LoginOutputDTO:
        """ログイン処理"""
        if self.security_service is None:
            raise RuntimeError('security_service is required for login')

        # DBからユーザーを取得
        user = self.user_repository.get_by_email(input_dto.email)

        if user is None:
            logger.warning('ログイン失敗（ユーザー不在）: %s', input_dto.email)
            raise InvalidCredentialsError()

        # パスワード検証
        is_valid = self.security_service.verify_password(
            input_dto.password, user.password_hash
        )

        if not is_valid:
            logger.warning('ログイン失敗（パスワード不一致）: %s', input_dto.email)
            raise InvalidCredentialsError()

        # トークン生成
        access_token = self.security_service.create_access_token(user_id=str(user.id))
        logger.info('ログイン成功: %s', input_dto.email)

        return LoginOutputDTO(access_token=access_token, user_id=str(user.id))

    def logout(self) -> LogoutOutputDTO:
        """ログアウト処理（Cookieはエンドポイント側で削除）"""
        logger.info('ログアウト成功')
        return LogoutOutputDTO(message='ログアウトしました')

    def get_me(self, user_id: str) -> MeOutputDTO:
        """現在のユーザー情報を取得"""
        user = self.user_repository.get_by_id(UUID(user_id))

        if user is None:
            raise AuthUserNotFoundError()

        return MeOutputDTO(
            id=str(user.id),
            email=user.email,
            username=user.username,
            avatar_url=user.avatar_url,
            discord_id=user.discord_id,
            is_active=user.is_active,
        )

    # ========================================
    # プロフィール更新
    # ========================================

    def update_user_profile(
        self,
        user_id: UUID,
        current_user_id: str,
        input_dto: UpdateUserProfileInputDTO,
    ) -> UserDetailDTO:
        """ユーザープロフィールを更新"""
        # 権限チェック: 本人のみ更新可能
        if str(user_id) != current_user_id:
            logger.warning(
                'プロフィール更新権限エラー: user_id=%s, current_user_id=%s',
                user_id,
                current_user_id,
            )
            raise ForbiddenError()

        # ユーザー存在確認
        user = self.user_repository.get_by_id(user_id)
        if user is None:
            raise UserNotFoundError()

        # ユーザー名の重複チェック
        if input_dto.username is not None:
            existing_user = self.user_repository.get_by_username(input_dto.username)
            if existing_user is not None and existing_user.id != user_id:
                raise UsernameAlreadyExistsError()

        # 更新データを作成
        social_links = None
        if input_dto.social_links is not None:
            social_links = [
                SocialLinkInput(
                    platform=link.platform,
                    url=link.url,
                    title=link.title,
                )
                for link in input_dto.social_links
            ]

        update_data = UserProfileUpdateData(
            username=input_dto.username,
            avatar_url=input_dto.avatar_url,
            display_name=input_dto.display_name,
            tagline=input_dto.tagline,
            bio=input_dto.bio,
            skills=input_dto.skills,
            interests=input_dto.interests,
            vision=input_dto.vision,
            is_vision_public=input_dto.is_vision_public,
            social_links=social_links,
        )

        # リポジトリで更新
        updated_user = self.user_repository.update_user_profile(user_id, update_data)
        if updated_user is None:
            raise UserNotFoundError()

        logger.info('プロフィール更新成功: user_id=%s', user_id)
        return self._to_user_detail_dto(updated_user)
