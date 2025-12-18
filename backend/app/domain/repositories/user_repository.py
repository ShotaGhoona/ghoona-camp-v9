"""ユーザーリポジトリインターフェース"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from uuid import UUID

from app.domain.entities.user import User


@dataclass
class UserSearchFilter:
    """ユーザー検索フィルター"""

    search: str | None = None
    skills: list[str] | None = None
    interests: list[str] | None = None
    title_levels: list[int] | None = None
    limit: int = 20
    offset: int = 0


@dataclass
class UserListItem:
    """ユーザー一覧用の軽量データ（カード表示用）"""

    id: UUID
    avatar_url: str | None
    display_name: str | None
    tagline: str | None
    current_title_level: int


@dataclass
class PaginatedUserList:
    """ページネーション付きユーザー一覧（軽量版）"""

    users: list[UserListItem]
    total: int
    limit: int
    offset: int
    has_more: bool


@dataclass
class UserWithDetails:
    """ユーザー詳細情報（結合結果）"""

    id: UUID
    username: str | None
    avatar_url: str | None
    display_name: str | None
    tagline: str | None
    bio: str | None
    skills: list[str]
    interests: list[str]
    vision: str | None
    is_vision_public: bool
    social_links: list[dict]
    total_attendance_days: int
    current_streak_days: int
    max_streak_days: int
    current_title_level: int
    joined_at: str


@dataclass
class SocialLinkInput:
    """ソーシャルリンク入力データ"""

    platform: str
    url: str
    title: str | None = None


@dataclass
class UserProfileUpdateData:
    """ユーザープロフィール更新データ（部分更新用）"""

    username: str | None = None
    avatar_url: str | None = None
    display_name: str | None = None
    tagline: str | None = None
    bio: str | None = None
    skills: list[str] | None = None
    interests: list[str] | None = None
    vision: str | None = None
    is_vision_public: bool | None = None
    social_links: list[SocialLinkInput] | None = None


class IUserRepository(ABC):
    """ユーザーリポジトリのインターフェース"""

    @abstractmethod
    def get_by_email(self, email: str) -> User | None:
        """
        メールアドレスでユーザーを取得

        Args:
            email: メールアドレス

        Returns:
            Optional[User]: ユーザーエンティティ（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def get_by_id(self, user_id: UUID) -> User | None:
        """
        IDでユーザーを取得

        Args:
            user_id: ユーザーID

        Returns:
            Optional[User]: ユーザーエンティティ（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def get_users_list(
        self, filter: UserSearchFilter
    ) -> PaginatedUserList:
        """
        フィルター条件に基づいてユーザー一覧を取得（軽量版）

        Args:
            filter: 検索フィルター条件

        Returns:
            PaginatedUserList: ページネーション付きユーザー一覧（軽量版）
        """
        pass

    @abstractmethod
    def get_user_detail_by_id(self, user_id: UUID) -> UserWithDetails | None:
        """
        IDでユーザー詳細情報を取得

        Args:
            user_id: ユーザーID

        Returns:
            Optional[UserWithDetails]: ユーザー詳細情報（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def create(self, user: User) -> User:
        """
        ユーザーを作成

        Args:
            user: ユーザーエンティティ

        Returns:
            User: 作成されたユーザーエンティティ
        """
        pass

    @abstractmethod
    def update(self, user: User) -> User:
        """
        ユーザーを更新

        Args:
            user: ユーザーエンティティ

        Returns:
            User: 更新されたユーザーエンティティ
        """
        pass

    @abstractmethod
    def delete(self, user_id: UUID) -> bool:
        """
        ユーザーを削除

        Args:
            user_id: ユーザーID

        Returns:
            bool: 削除成功の場合True
        """
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> User | None:
        """
        ユーザー名でユーザーを取得

        Args:
            username: ユーザー名

        Returns:
            Optional[User]: ユーザーエンティティ（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def update_user_profile(
        self, user_id: UUID, update_data: UserProfileUpdateData
    ) -> UserWithDetails | None:
        """
        ユーザープロフィールを更新（部分更新対応）

        Args:
            user_id: ユーザーID
            update_data: 更新データ

        Returns:
            Optional[UserWithDetails]: 更新後のユーザー詳細情報（存在しない場合はNone）
        """
        pass
