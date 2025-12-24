"""ダッシュボード関連のユースケース"""

import logging
from uuid import UUID

from app.application.schemas.dashboard_schemas import (
    DashboardBlockDTO,
    DashboardLayoutDTO,
    UpdateDashboardLayoutInputDTO,
)
from app.domain.repositories.dashboard_repository import (
    DashboardBlock,
    DashboardLayout,
    DashboardLayoutCreateData,
    DashboardLayoutUpdateData,
    IDashboardRepository,
)

logger = logging.getLogger(__name__)


class DashboardUsecase:
    """ダッシュボード関連のユースケース"""

    def __init__(self, dashboard_repository: IDashboardRepository):
        """
        コンストラクタ

        Args:
            dashboard_repository: ダッシュボードリポジトリ
        """
        self.dashboard_repository = dashboard_repository

    # ========================================
    # レイアウト取得
    # ========================================

    def get_layout(self, current_user_id: str) -> DashboardLayoutDTO:
        """
        ダッシュボードレイアウトを取得

        Args:
            current_user_id: 現在のユーザーID

        Returns:
            DashboardLayoutDTO: レイアウトDTO（未設定時は空のブロック一覧）
        """
        layout = self.dashboard_repository.get_layout(UUID(current_user_id))

        if layout is None:
            # 未設定時は空のレイアウトを返す（フロントエンドでデフォルトを適用）
            logger.info(
                'ダッシュボードレイアウト取得（未設定）: user_id=%s',
                current_user_id,
            )
            return DashboardLayoutDTO(blocks=[])

        logger.info(
            'ダッシュボードレイアウト取得: user_id=%s, block_count=%d',
            current_user_id,
            len(layout.blocks),
        )

        return self._to_layout_dto(layout)

    # ========================================
    # レイアウト更新
    # ========================================

    def update_layout(
        self,
        current_user_id: str,
        input_dto: UpdateDashboardLayoutInputDTO,
    ) -> DashboardLayoutDTO:
        """
        ダッシュボードレイアウトを更新（存在しない場合は作成）

        Args:
            current_user_id: 現在のユーザーID
            input_dto: レイアウト更新入力DTO

        Returns:
            DashboardLayoutDTO: 更新後のレイアウトDTO
        """
        user_id = UUID(current_user_id)

        # DTOからドメインオブジェクトに変換
        blocks = self._to_domain_blocks(input_dto.blocks)

        # 既存レイアウトの存在確認
        existing_layout = self.dashboard_repository.get_layout(user_id)

        if existing_layout is None:
            # 新規作成
            layout = self.dashboard_repository.create(
                DashboardLayoutCreateData(
                    user_id=user_id,
                    blocks=blocks,
                )
            )
            logger.info(
                'ダッシュボードレイアウト作成: user_id=%s, block_count=%d',
                current_user_id,
                len(layout.blocks),
            )
        else:
            # 更新
            layout = self.dashboard_repository.update(
                user_id=user_id,
                data=DashboardLayoutUpdateData(blocks=blocks),
            )
            logger.info(
                'ダッシュボードレイアウト更新: user_id=%s, block_count=%d',
                current_user_id,
                len(layout.blocks),
            )

        return self._to_layout_dto(layout)

    # ========================================
    # プライベートメソッド
    # ========================================

    def _to_domain_blocks(
        self, blocks_dto: list[DashboardBlockDTO]
    ) -> list[DashboardBlock]:
        """DTOからドメインオブジェクトに変換"""
        return [
            DashboardBlock(
                id=block.id,
                block_type=block.type,
                x=block.x,
                y=block.y,
                w=block.w,
                h=block.h,
            )
            for block in blocks_dto
        ]

    def _to_layout_dto(self, layout: DashboardLayout) -> DashboardLayoutDTO:
        """DashboardLayoutをDashboardLayoutDTOに変換"""
        blocks_dto = [
            DashboardBlockDTO(
                id=block.id,
                type=block.block_type,
                x=block.x,
                y=block.y,
                w=block.w,
                h=block.h,
            )
            for block in layout.blocks
        ]
        return DashboardLayoutDTO(blocks=blocks_dto)
