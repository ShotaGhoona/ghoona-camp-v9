"""ダッシュボードリポジトリの実装"""

from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.repositories.dashboard_repository import (
    DashboardBlock,
    DashboardLayout,
    DashboardLayoutCreateData,
    DashboardLayoutUpdateData,
    IDashboardRepository,
)
from app.infrastructure.db.models.dashboard_model import DashboardLayoutModel


class DashboardRepositoryImpl(IDashboardRepository):
    """ダッシュボードリポジトリの実装"""

    def __init__(self, session: Session):
        """
        コンストラクタ

        Args:
            session: SQLAlchemyのセッション
        """
        self.session = session

    def get_layout(self, user_id: UUID) -> DashboardLayout | None:
        """ユーザーのダッシュボードレイアウトを取得"""
        model = (
            self.session.query(DashboardLayoutModel)
            .filter(DashboardLayoutModel.user_id == user_id)
            .first()
        )

        if model is None:
            return None

        return self._to_dashboard_layout(model)

    def create(self, data: DashboardLayoutCreateData) -> DashboardLayout:
        """ダッシュボードレイアウトを作成"""
        blocks_json = self._blocks_to_json(data.blocks)

        model = DashboardLayoutModel(
            user_id=data.user_id,
            blocks=blocks_json,
        )
        self.session.add(model)
        self.session.flush()

        return self._to_dashboard_layout(model)

    def update(
        self, user_id: UUID, data: DashboardLayoutUpdateData
    ) -> DashboardLayout | None:
        """ダッシュボードレイアウトを更新"""
        model = (
            self.session.query(DashboardLayoutModel)
            .filter(DashboardLayoutModel.user_id == user_id)
            .first()
        )

        if model is None:
            return None

        model.blocks = self._blocks_to_json(data.blocks)
        self.session.flush()

        return self._to_dashboard_layout(model)

    def _blocks_to_json(self, blocks: list[DashboardBlock]) -> list[dict]:
        """ブロック一覧をJSON形式に変換"""
        return [
            {
                'id': block.id,
                'type': block.block_type,
                'x': block.x,
                'y': block.y,
                'w': block.w,
                'h': block.h,
            }
            for block in blocks
        ]

    def _to_dashboard_layout(self, model: DashboardLayoutModel) -> DashboardLayout:
        """DBモデルをDashboardLayoutに変換"""
        blocks = [
            DashboardBlock(
                id=block['id'],
                block_type=block['type'],
                x=block['x'],
                y=block['y'],
                w=block['w'],
                h=block['h'],
            )
            for block in model.blocks
        ]

        return DashboardLayout(
            user_id=model.user_id,
            blocks=blocks,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
