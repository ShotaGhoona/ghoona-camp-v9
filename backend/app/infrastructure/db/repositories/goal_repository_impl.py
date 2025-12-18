"""目標リポジトリの実装"""

import calendar
from datetime import date

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.domain.repositories.goal_repository import (
    GoalCreateData,
    GoalItem,
    GoalListResult,
    GoalSearchFilter,
    GoalUpdateData,
    IGoalRepository,
    PublicGoalSearchFilter,
)
from app.infrastructure.db.models.goal_model import GoalModel


class GoalRepositoryImpl(IGoalRepository):
    """目標リポジトリの実装"""

    def __init__(self, session: Session):
        """
        コンストラクタ

        Args:
            session: SQLAlchemyのセッション
        """
        self.session = session

    def get_my_goals(self, filter: GoalSearchFilter) -> GoalListResult:
        """
        自分の目標一覧を取得

        指定月に「かかる」目標を返す:
        - 開始日が月末以前 AND (終了日が月初以降 OR 終了日がnull)
        """
        # 月初と月末を計算
        month_start = date(filter.year, filter.month, 1)
        _, last_day = calendar.monthrange(filter.year, filter.month)
        month_end = date(filter.year, filter.month, last_day)

        # ベースクエリ: 指定ユーザーの目標
        query = self.session.query(GoalModel).filter(
            GoalModel.user_id == filter.user_id
        )

        # 月にかかる目標をフィルタリング
        # 開始日が月末以前 AND (終了日が月初以降 OR 終了日がnull)
        query = query.filter(
            GoalModel.started_at <= month_end,
            or_(
                GoalModel.ended_at >= month_start,
                GoalModel.ended_at.is_(None),
            ),
        )

        # is_public フィルター
        if filter.is_public is not None:
            query = query.filter(GoalModel.is_public == filter.is_public)

        # 総件数を取得
        total = query.count()

        # 開始日順でソート
        results = query.order_by(GoalModel.started_at.asc()).all()

        # GoalItemに変換
        goals = [self._to_goal_item(goal) for goal in results]

        return GoalListResult(goals=goals, total=total)

    def create(self, data: GoalCreateData) -> GoalItem:
        """目標を作成"""
        goal_model = GoalModel(
            user_id=data.user_id,
            title=data.title,
            description=data.description,
            started_at=data.started_at if data.started_at else date.today(),
            ended_at=data.ended_at,
            is_public=data.is_public,
        )
        self.session.add(goal_model)
        self.session.flush()
        return self._to_goal_item(goal_model)

    def get_public_goals(self, filter: PublicGoalSearchFilter) -> GoalListResult:
        """
        公開目標一覧を取得

        指定月に「かかる」公開目標を返す:
        - 開始日が月末以前 AND (終了日が月初以降 OR 終了日がnull)
        """
        # 月初と月末を計算
        month_start = date(filter.year, filter.month, 1)
        _, last_day = calendar.monthrange(filter.year, filter.month)
        month_end = date(filter.year, filter.month, last_day)

        # ベースクエリ: 公開目標のみ
        query = self.session.query(GoalModel).filter(GoalModel.is_public == True)

        # user_id フィルター（オプション）
        if filter.user_id is not None:
            query = query.filter(GoalModel.user_id == filter.user_id)

        # 月にかかる目標をフィルタリング
        query = query.filter(
            GoalModel.started_at <= month_end,
            or_(
                GoalModel.ended_at >= month_start,
                GoalModel.ended_at.is_(None),
            ),
        )

        # 総件数を取得
        total = query.count()

        # 開始日順でソート
        results = query.order_by(GoalModel.started_at.asc()).all()

        # GoalItemに変換
        goals = [self._to_goal_item(goal) for goal in results]

        return GoalListResult(goals=goals, total=total)

    def get_by_id(self, goal_id) -> GoalItem | None:
        """IDで目標を取得"""
        goal_model = (
            self.session.query(GoalModel).filter(GoalModel.id == goal_id).first()
        )
        if goal_model is None:
            return None
        return self._to_goal_item(goal_model)

    def update(self, goal_id, data: GoalUpdateData) -> GoalItem | None:
        """目標を更新（部分更新対応）"""
        goal_model = (
            self.session.query(GoalModel).filter(GoalModel.id == goal_id).first()
        )
        if goal_model is None:
            return None

        # 部分更新
        if data.title is not None:
            goal_model.title = data.title
        if data.description is not None:
            goal_model.description = data.description
        if data.started_at is not None:
            goal_model.started_at = data.started_at
        if data.ended_at is not None:
            goal_model.ended_at = data.ended_at
        if data.is_public is not None:
            goal_model.is_public = data.is_public

        self.session.flush()
        return self._to_goal_item(goal_model)

    def delete(self, goal_id) -> bool:
        """目標を削除"""
        deleted_count = (
            self.session.query(GoalModel).filter(GoalModel.id == goal_id).delete()
        )
        self.session.flush()
        return deleted_count > 0

    def _to_goal_item(self, goal_model: GoalModel) -> GoalItem:
        """DBモデルをGoalItemに変換"""
        return GoalItem(
            id=goal_model.id,
            user_id=goal_model.user_id,
            title=goal_model.title,
            description=goal_model.description,
            started_at=goal_model.started_at,
            ended_at=goal_model.ended_at,
            is_active=goal_model.is_active,
            is_public=goal_model.is_public,
            created_at=goal_model.created_at,
            updated_at=goal_model.updated_at,
        )
