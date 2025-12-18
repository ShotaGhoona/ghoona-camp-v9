"""ユーザー関連のユースケース"""

from uuid import UUID

from app.application.schemas.user_schemas import (
    PaginationDTO,
    SocialLinkDTO,
    UserDetailDTO,
    UserListItemDTO,
    UsersListDTO,
)
from app.domain.repositories.user_repository import (
    IUserRepository,
    UserListItem,
    UserSearchFilter,
    UserWithDetails,
)


class UserUsecase:
    """ユーザー関連のユースケース"""

    def __init__(self, user_repository: IUserRepository):
        """
        コンストラクタ

        Args:
            user_repository: ユーザーリポジトリ
        """
        self.user_repository = user_repository

    def get_users(
        self,
        search: str | None = None,
        skills: list[str] | None = None,
        interests: list[str] | None = None,
        title_levels: list[int] | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> UsersListDTO:
        """
        ユーザー一覧を取得

        Args:
            search: キーワード検索
            skills: スキルフィルター
            interests: 興味・関心フィルター
            title_levels: 称号レベルフィルター
            limit: 取得件数
            offset: オフセット

        Returns:
            UsersListDTO: ユーザー一覧
        """
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

    def get_user_by_id(self, user_id: UUID) -> UserDetailDTO | None:
        """
        ユーザー詳細を取得

        Args:
            user_id: ユーザーID

        Returns:
            UserDetailDTO: ユーザー詳細（存在しない場合はNone）
        """
        user_detail = self.user_repository.get_user_detail_by_id(user_id)
        if user_detail is None:
            return None

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
