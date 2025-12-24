"""ダッシュボードリポジトリインターフェース"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class DashboardBlock:
    """ダッシュボードブロック"""

    id: str
    block_type: str
    x: int
    y: int
    w: int
    h: int


@dataclass
class DashboardLayout:
    """ダッシュボードレイアウト"""

    user_id: UUID
    blocks: list[DashboardBlock]
    created_at: datetime
    updated_at: datetime


@dataclass
class DashboardLayoutCreateData:
    """ダッシュボードレイアウト作成データ"""

    user_id: UUID
    blocks: list[DashboardBlock]


@dataclass
class DashboardLayoutUpdateData:
    """ダッシュボードレイアウト更新データ"""

    blocks: list[DashboardBlock]


class IDashboardRepository(ABC):
    """ダッシュボードリポジトリのインターフェース"""

    @abstractmethod
    def get_layout(self, user_id: UUID) -> DashboardLayout | None:
        """
        ユーザーのダッシュボードレイアウトを取得

        Args:
            user_id: ユーザーID

        Returns:
            DashboardLayout | None: レイアウト（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def create(self, data: DashboardLayoutCreateData) -> DashboardLayout:
        """
        ダッシュボードレイアウトを作成

        Args:
            data: レイアウト作成データ

        Returns:
            DashboardLayout: 作成されたレイアウト
        """
        pass

    @abstractmethod
    def update(self, user_id: UUID, data: DashboardLayoutUpdateData) -> DashboardLayout | None:
        """
        ダッシュボードレイアウトを更新

        Args:
            user_id: ユーザーID
            data: レイアウト更新データ

        Returns:
            DashboardLayout | None: 更新後のレイアウト（存在しない場合はNone）
        """
        pass
