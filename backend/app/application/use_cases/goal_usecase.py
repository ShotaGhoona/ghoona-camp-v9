"""目標関連のユースケース"""

import logging
from datetime import date
from uuid import UUID

from app.application.schemas.goal_schemas import (
    CreateGoalInputDTO,
    GoalItemDTO,
    MyGoalsListDTO,
    PublicGoalsListDTO,
    UpdateGoalInputDTO,
)
from app.domain.exceptions.goal import GoalForbiddenError, GoalNotFoundError
from app.domain.repositories.goal_repository import (
    GoalCreateData,
    GoalItem,
    GoalSearchFilter,
    GoalUpdateData,
    IGoalRepository,
    PublicGoalSearchFilter,
)

logger = logging.getLogger(__name__)


class GoalUsecase:
    """目標関連のユースケース"""

    def __init__(self, goal_repository: IGoalRepository):
        """
        コンストラクタ

        Args:
            goal_repository: 目標リポジトリ
        """
        self.goal_repository = goal_repository

    def get_my_goals(
        self,
        current_user_id: str,
        year: int,
        month: int,
        is_public: bool | None = None,
    ) -> MyGoalsListDTO:
        """
        自分の目標一覧を取得

        Args:
            current_user_id: 現在のユーザーID
            year: 表示対象の年
            month: 表示対象の月
            is_public: 公開設定フィルター（None=全て）

        Returns:
            MyGoalsListDTO: 目標一覧DTO
        """
        # バリデーション
        if month < 1 or month > 12:
            raise ValueError('月は1から12の範囲で指定してください')

        # フィルター作成
        filter = GoalSearchFilter(
            user_id=UUID(current_user_id),
            year=year,
            month=month,
            is_public=is_public,
        )

        # リポジトリからデータ取得
        result = self.goal_repository.get_my_goals(filter)

        # DTOに変換
        goals_dto = [self._to_goal_item_dto(goal) for goal in result.goals]

        logger.info(
            '目標一覧取得: user_id=%s, year=%d, month=%d, count=%d',
            current_user_id,
            year,
            month,
            result.total,
        )

        return MyGoalsListDTO(goals=goals_dto, total=result.total)

    def create_goal(
        self,
        current_user_id: str,
        input_dto: CreateGoalInputDTO,
    ) -> GoalItemDTO:
        """
        目標を作成

        Args:
            current_user_id: 現在のユーザーID
            input_dto: 目標作成入力DTO

        Returns:
            GoalItemDTO: 作成された目標DTO
        """
        # 日付のパース
        started_at = None
        if input_dto.started_at:
            started_at = date.fromisoformat(input_dto.started_at)

        ended_at = None
        if input_dto.ended_at:
            ended_at = date.fromisoformat(input_dto.ended_at)

        # 作成データ
        create_data = GoalCreateData(
            user_id=UUID(current_user_id),
            title=input_dto.title,
            description=input_dto.description,
            started_at=started_at,
            ended_at=ended_at,
            is_public=input_dto.is_public,
        )

        # リポジトリで作成
        goal = self.goal_repository.create(create_data)

        logger.info(
            '目標作成: user_id=%s, goal_id=%s, title=%s',
            current_user_id,
            goal.id,
            goal.title,
        )

        return self._to_goal_item_dto(goal)

    def get_public_goals(
        self,
        year: int,
        month: int,
        user_id: str | None = None,
    ) -> PublicGoalsListDTO:
        """
        公開目標一覧を取得

        Args:
            year: 表示対象の年
            month: 表示対象の月
            user_id: ユーザーIDでフィルタ（オプション）

        Returns:
            PublicGoalsListDTO: 公開目標一覧DTO
        """
        # バリデーション
        if month < 1 or month > 12:
            raise ValueError('月は1から12の範囲で指定してください')

        # フィルター作成
        filter = PublicGoalSearchFilter(
            year=year,
            month=month,
            user_id=UUID(user_id) if user_id else None,
        )

        # リポジトリからデータ取得
        result = self.goal_repository.get_public_goals(filter)

        # DTOに変換
        goals_dto = [self._to_goal_item_dto(goal) for goal in result.goals]

        logger.info(
            '公開目標一覧取得: year=%d, month=%d, user_id=%s, count=%d',
            year,
            month,
            user_id,
            result.total,
        )

        return PublicGoalsListDTO(goals=goals_dto, total=result.total)

    def update_goal(
        self,
        goal_id: str,
        current_user_id: str,
        input_dto: UpdateGoalInputDTO,
    ) -> GoalItemDTO:
        """
        目標を更新

        Args:
            goal_id: 目標ID
            current_user_id: 現在のユーザーID
            input_dto: 目標更新入力DTO

        Returns:
            GoalItemDTO: 更新された目標DTO
        """
        # 目標の存在確認
        goal = self.goal_repository.get_by_id(UUID(goal_id))
        if goal is None:
            raise GoalNotFoundError()

        # 権限チェック: 本人のみ更新可能
        if str(goal.user_id) != current_user_id:
            logger.warning(
                '目標更新権限エラー: goal_id=%s, owner_id=%s, current_user_id=%s',
                goal_id,
                goal.user_id,
                current_user_id,
            )
            raise GoalForbiddenError()

        # 日付のパース
        started_at = None
        if input_dto.started_at:
            started_at = date.fromisoformat(input_dto.started_at)

        ended_at = None
        if input_dto.ended_at:
            ended_at = date.fromisoformat(input_dto.ended_at)

        # 更新データ
        update_data = GoalUpdateData(
            title=input_dto.title,
            description=input_dto.description,
            started_at=started_at,
            ended_at=ended_at,
            is_public=input_dto.is_public,
        )

        # リポジトリで更新
        updated_goal = self.goal_repository.update(UUID(goal_id), update_data)
        if updated_goal is None:
            raise GoalNotFoundError()

        logger.info(
            '目標更新: user_id=%s, goal_id=%s',
            current_user_id,
            goal_id,
        )

        return self._to_goal_item_dto(updated_goal)

    def delete_goal(
        self,
        goal_id: str,
        current_user_id: str,
    ) -> bool:
        """
        目標を削除

        Args:
            goal_id: 目標ID
            current_user_id: 現在のユーザーID

        Returns:
            bool: 削除成功の場合True
        """
        # 目標の存在確認
        goal = self.goal_repository.get_by_id(UUID(goal_id))
        if goal is None:
            raise GoalNotFoundError()

        # 権限チェック: 本人のみ削除可能
        if str(goal.user_id) != current_user_id:
            logger.warning(
                '目標削除権限エラー: goal_id=%s, owner_id=%s, current_user_id=%s',
                goal_id,
                goal.user_id,
                current_user_id,
            )
            raise GoalForbiddenError()

        # リポジトリで削除
        deleted = self.goal_repository.delete(UUID(goal_id))
        if not deleted:
            raise GoalNotFoundError()

        logger.info(
            '目標削除: user_id=%s, goal_id=%s',
            current_user_id,
            goal_id,
        )

        return True

    def _to_goal_item_dto(self, goal: GoalItem) -> GoalItemDTO:
        """GoalItemをGoalItemDTOに変換"""
        return GoalItemDTO(
            id=str(goal.id),
            userId=str(goal.user_id),
            title=goal.title,
            description=goal.description,
            startedAt=goal.started_at.isoformat(),
            endedAt=goal.ended_at.isoformat() if goal.ended_at else None,
            isActive=goal.is_active,
            isPublic=goal.is_public,
            createdAt=goal.created_at.isoformat(),
            updatedAt=goal.updated_at.isoformat(),
        )
