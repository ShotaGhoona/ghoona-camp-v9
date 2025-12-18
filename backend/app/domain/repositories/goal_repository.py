"""目標リポジトリインターフェース"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID


@dataclass
class GoalSearchFilter:
    """目標検索フィルター"""

    user_id: UUID
    year: int
    month: int
    is_public: bool | None = None


@dataclass
class GoalCreator:
    """目標作成者情報"""

    id: UUID
    display_name: str | None
    avatar_url: str | None


@dataclass
class GoalItem:
    """目標アイテム"""

    id: UUID
    user_id: UUID
    title: str
    description: str | None
    started_at: date
    ended_at: date | None
    is_active: bool
    is_public: bool
    created_at: datetime
    updated_at: datetime
    creator: GoalCreator


@dataclass
class GoalListResult:
    """目標一覧結果"""

    goals: list[GoalItem]
    total: int


@dataclass
class GoalCreateData:
    """目標作成データ"""

    user_id: UUID
    title: str
    description: str | None = None
    started_at: date | None = None
    ended_at: date | None = None
    is_public: bool = False


@dataclass
class GoalUpdateData:
    """目標更新データ（部分更新用）"""

    title: str | None = None
    description: str | None = None
    started_at: date | None = None
    ended_at: date | None = None
    is_public: bool | None = None


@dataclass
class PublicGoalSearchFilter:
    """公開目標検索フィルター"""

    year: int
    month: int
    user_id: UUID | None = None


class IGoalRepository(ABC):
    """目標リポジトリのインターフェース"""

    @abstractmethod
    def get_my_goals(self, filter: GoalSearchFilter) -> GoalListResult:
        """
        自分の目標一覧を取得

        指定月に「かかる」目標を返す:
        - 開始日が月末以前 AND (終了日が月初以降 OR 終了日がnull)

        Args:
            filter: 検索フィルター条件

        Returns:
            GoalListResult: 目標一覧結果
        """
        pass

    @abstractmethod
    def create(self, data: GoalCreateData) -> GoalItem:
        """
        目標を作成

        Args:
            data: 目標作成データ

        Returns:
            GoalItem: 作成された目標
        """
        pass

    @abstractmethod
    def get_public_goals(self, filter: PublicGoalSearchFilter) -> GoalListResult:
        """
        公開目標一覧を取得

        指定月に「かかる」公開目標を返す:
        - 開始日が月末以前 AND (終了日が月初以降 OR 終了日がnull)

        Args:
            filter: 検索フィルター条件

        Returns:
            GoalListResult: 目標一覧結果
        """
        pass

    @abstractmethod
    def get_by_id(self, goal_id: UUID) -> GoalItem | None:
        """
        IDで目標を取得

        Args:
            goal_id: 目標ID

        Returns:
            GoalItem | None: 目標（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def update(self, goal_id: UUID, data: GoalUpdateData) -> GoalItem | None:
        """
        目標を更新（部分更新対応）

        Args:
            goal_id: 目標ID
            data: 更新データ

        Returns:
            GoalItem | None: 更新後の目標（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def delete(self, goal_id: UUID) -> bool:
        """
        目標を削除

        Args:
            goal_id: 目標ID

        Returns:
            bool: 削除成功の場合True
        """
        pass
