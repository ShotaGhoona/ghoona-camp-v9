"""称号リポジトリの実装"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.domain.repositories.title_repository import (
    ITitleRepository,
    TitleHolder,
    TitleHoldersResult,
    UserTitleAchievement,
    UserTitleAchievementsResult,
)
from app.infrastructure.db.models.attendance_model import AttendanceStatisticsModel
from app.infrastructure.db.models.title_model import TitleAchievementModel
from app.infrastructure.db.models.user_model import UserMetadataModel, UserModel


class TitleRepositoryImpl(ITitleRepository):
    """称号リポジトリの実装"""

    def __init__(self, session: Session):
        """
        コンストラクタ

        Args:
            session: SQLAlchemyのセッション
        """
        self.session = session

    def get_title_holders(self, level: int) -> TitleHoldersResult:
        """
        指定レベルの称号保持者一覧を取得

        JOINクエリ: title_achievements + users + user_metadata
        """
        # 総件数を取得
        total = (
            self.session.query(func.count(TitleAchievementModel.id))
            .filter(TitleAchievementModel.title_level == level)
            .scalar()
        )

        # JOINクエリ: title_achievements + users + user_metadata
        query = (
            self.session.query(TitleAchievementModel, UserModel, UserMetadataModel)
            .join(UserModel, TitleAchievementModel.user_id == UserModel.id)
            .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
            .filter(TitleAchievementModel.title_level == level)
            .order_by(TitleAchievementModel.achieved_at.asc())
        )

        results = query.all()

        # TitleHolderに変換
        holders = [
            TitleHolder(
                id=achievement.user_id,
                display_name=metadata.display_name if metadata else None,
                avatar_url=user.avatar_url,
                achieved_at=achievement.achieved_at,
            )
            for achievement, user, metadata in results
        ]

        return TitleHoldersResult(
            level=level,
            holders=holders,
            total=total or 0,
        )

    def get_user_title_achievements(self, user_id) -> UserTitleAchievementsResult | None:
        """
        ユーザーの称号実績を取得

        - 称号実績: title_achievements テーブル
        - 参加日数: attendance_statistics テーブル
        - 現在の称号: 獲得済みの最高レベル（MAX(title_level)）
        """
        # ユーザーの存在確認
        user_exists = (
            self.session.query(UserModel.id)
            .filter(UserModel.id == user_id)
            .first()
        )
        if user_exists is None:
            return None

        # 参加日数を取得
        attendance_stats = (
            self.session.query(AttendanceStatisticsModel)
            .filter(AttendanceStatisticsModel.user_id == user_id)
            .first()
        )
        total_attendance_days = (
            attendance_stats.total_attendance_days if attendance_stats else 0
        )

        # 称号実績を取得
        achievements_query = (
            self.session.query(TitleAchievementModel)
            .filter(TitleAchievementModel.user_id == user_id)
            .order_by(TitleAchievementModel.title_level.asc())
        )
        achievement_models = achievements_query.all()

        # UserTitleAchievementに変換
        achievements = [
            UserTitleAchievement(
                title_level=achievement.title_level,
                achieved_at=achievement.achieved_at,
            )
            for achievement in achievement_models
        ]

        # 現在の称号レベル = 最高レベル（獲得済みがなければ0）
        current_title_level = 0
        if achievements:
            current_title_level = max(a.title_level for a in achievements)

        return UserTitleAchievementsResult(
            current_title_level=current_title_level,
            total_attendance_days=total_attendance_days,
            achievements=achievements,
        )
