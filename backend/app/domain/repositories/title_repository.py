"""称号リポジトリインターフェース"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class TitleHolder:
    """称号保持者"""

    id: UUID
    display_name: str | None
    avatar_url: str | None
    achieved_at: datetime


@dataclass
class TitleHoldersResult:
    """称号保持者一覧結果"""

    level: int
    holders: list[TitleHolder]
    total: int


@dataclass
class UserTitleAchievement:
    """ユーザー称号実績"""

    title_level: int
    achieved_at: datetime


@dataclass
class UserTitleAchievementsResult:
    """ユーザー称号実績結果"""

    current_title_level: int
    total_attendance_days: int
    achievements: list[UserTitleAchievement]


class ITitleRepository(ABC):
    """称号リポジトリのインターフェース"""

    @abstractmethod
    def get_title_holders(self, level: int) -> TitleHoldersResult:
        """
        指定レベルの称号保持者一覧を取得

        Args:
            level: 称号レベル (1-8)

        Returns:
            TitleHoldersResult: 保持者一覧結果
        """
        pass

    @abstractmethod
    def get_user_title_achievements(self, user_id: UUID) -> UserTitleAchievementsResult | None:
        """
        ユーザーの称号実績を取得

        Args:
            user_id: ユーザーID

        Returns:
            UserTitleAchievementsResult | None: 称号実績結果（ユーザーが存在しない場合はNone）
        """
        pass
