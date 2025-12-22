"""参加関連リポジトリの実装"""

from calendar import monthrange
from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.domain.repositories.attendance_repository import (
    AttendanceStatisticsResult,
    AttendanceSummariesResult,
    AttendanceSummaryItem,
    CurrentUserRanking,
    DateRange,
    IAttendanceRepository,
    IRankingRepository,
    MonthlyRankingList,
    RankingEntry,
    RankingList,
    RankingUser,
)
from app.infrastructure.db.models.attendance_model import (
    AttendanceStatisticsModel,
    AttendanceSummaryModel,
)
from app.infrastructure.db.models.title_model import TitleAchievementModel
from app.infrastructure.db.models.user_model import UserMetadataModel, UserModel


class RankingRepositoryImpl(IRankingRepository):
    """ランキングリポジトリの実装"""

    def __init__(self, session: Session):
        """
        コンストラクタ

        Args:
            session: SQLAlchemyのセッション
        """
        self.session = session

    def get_monthly_ranking(
        self, year: int, month: int, limit: int
    ) -> MonthlyRankingList:
        """
        月間ランキングを取得

        attendance_summaries から対象月の is_morning_active = true の日数をCOUNT
        """
        # 月の開始日と終了日を計算
        month_start = date(year, month, 1)
        _, last_day = monthrange(year, month)
        month_end = date(year, month, last_day)

        # サブクエリ: ユーザーごとの月間参加日数
        monthly_score_subq = (
            self.session.query(
                AttendanceSummaryModel.user_id,
                func.count(AttendanceSummaryModel.date).label('score'),
            )
            .filter(
                AttendanceSummaryModel.date >= month_start,
                AttendanceSummaryModel.date <= month_end,
                AttendanceSummaryModel.is_morning_active.is_(True),
            )
            .group_by(AttendanceSummaryModel.user_id)
            .subquery()
        )

        # サブクエリ: ユーザーごとの最高称号レベル
        max_title_subq = (
            self.session.query(
                TitleAchievementModel.user_id,
                func.max(TitleAchievementModel.title_level).label('max_title_level'),
            )
            .group_by(TitleAchievementModel.user_id)
            .subquery()
        )

        # メインクエリ: ランキング取得
        query = (
            self.session.query(
                UserModel.id,
                UserModel.avatar_url,
                UserModel.created_at,
                UserMetadataModel.display_name,
                UserMetadataModel.tagline,
                monthly_score_subq.c.score,
                max_title_subq.c.max_title_level,
            )
            .join(monthly_score_subq, UserModel.id == monthly_score_subq.c.user_id)
            .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
            .outerjoin(max_title_subq, UserModel.id == max_title_subq.c.user_id)
            .filter(UserModel.is_active.is_(True))
            .order_by(monthly_score_subq.c.score.desc(), UserModel.created_at.asc())
            .limit(limit)
        )

        results = query.all()

        # 総件数を取得
        total = (
            self.session.query(func.count(monthly_score_subq.c.user_id))
            .scalar()
        )

        # RankingEntryに変換
        entries = [
            RankingEntry(
                rank=idx + 1,
                user=RankingUser(
                    id=row.id,
                    display_name=row.display_name,
                    avatar_url=row.avatar_url,
                    tagline=row.tagline,
                ),
                current_title_level=row.max_title_level,
                score=row.score or 0,
            )
            for idx, row in enumerate(results)
        ]

        return MonthlyRankingList(
            year=year,
            month=month,
            entries=entries,
            total=total or 0,
        )

    def get_total_ranking(self, limit: int) -> RankingList:
        """
        総合ランキングを取得

        attendance_statistics.total_attendance_days でソート
        """
        # サブクエリ: ユーザーごとの最高称号レベル
        max_title_subq = (
            self.session.query(
                TitleAchievementModel.user_id,
                func.max(TitleAchievementModel.title_level).label('max_title_level'),
            )
            .group_by(TitleAchievementModel.user_id)
            .subquery()
        )

        # メインクエリ
        query = (
            self.session.query(
                UserModel.id,
                UserModel.avatar_url,
                UserModel.created_at,
                UserMetadataModel.display_name,
                UserMetadataModel.tagline,
                AttendanceStatisticsModel.total_attendance_days,
                max_title_subq.c.max_title_level,
            )
            .join(
                AttendanceStatisticsModel,
                UserModel.id == AttendanceStatisticsModel.user_id,
            )
            .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
            .outerjoin(max_title_subq, UserModel.id == max_title_subq.c.user_id)
            .filter(
                UserModel.is_active.is_(True),
                AttendanceStatisticsModel.total_attendance_days > 0,
            )
            .order_by(
                AttendanceStatisticsModel.total_attendance_days.desc(),
                UserModel.created_at.asc(),
            )
            .limit(limit)
        )

        results = query.all()

        # 総件数を取得
        total = (
            self.session.query(func.count(AttendanceStatisticsModel.user_id))
            .filter(AttendanceStatisticsModel.total_attendance_days > 0)
            .scalar()
        )

        # RankingEntryに変換
        entries = [
            RankingEntry(
                rank=idx + 1,
                user=RankingUser(
                    id=row.id,
                    display_name=row.display_name,
                    avatar_url=row.avatar_url,
                    tagline=row.tagline,
                ),
                current_title_level=row.max_title_level,
                score=row.total_attendance_days or 0,
            )
            for idx, row in enumerate(results)
        ]

        return RankingList(
            entries=entries,
            total=total or 0,
        )

    def get_streak_ranking(self, limit: int) -> RankingList:
        """
        連続日数ランキングを取得

        attendance_statistics.current_streak_days でソート
        """
        # サブクエリ: ユーザーごとの最高称号レベル
        max_title_subq = (
            self.session.query(
                TitleAchievementModel.user_id,
                func.max(TitleAchievementModel.title_level).label('max_title_level'),
            )
            .group_by(TitleAchievementModel.user_id)
            .subquery()
        )

        # メインクエリ
        query = (
            self.session.query(
                UserModel.id,
                UserModel.avatar_url,
                UserModel.created_at,
                UserMetadataModel.display_name,
                UserMetadataModel.tagline,
                AttendanceStatisticsModel.current_streak_days,
                max_title_subq.c.max_title_level,
            )
            .join(
                AttendanceStatisticsModel,
                UserModel.id == AttendanceStatisticsModel.user_id,
            )
            .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
            .outerjoin(max_title_subq, UserModel.id == max_title_subq.c.user_id)
            .filter(
                UserModel.is_active.is_(True),
                AttendanceStatisticsModel.current_streak_days > 0,
            )
            .order_by(
                AttendanceStatisticsModel.current_streak_days.desc(),
                UserModel.created_at.asc(),
            )
            .limit(limit)
        )

        results = query.all()

        # 総件数を取得
        total = (
            self.session.query(func.count(AttendanceStatisticsModel.user_id))
            .filter(AttendanceStatisticsModel.current_streak_days > 0)
            .scalar()
        )

        # RankingEntryに変換
        entries = [
            RankingEntry(
                rank=idx + 1,
                user=RankingUser(
                    id=row.id,
                    display_name=row.display_name,
                    avatar_url=row.avatar_url,
                    tagline=row.tagline,
                ),
                current_title_level=row.max_title_level,
                score=row.current_streak_days or 0,
            )
            for idx, row in enumerate(results)
        ]

        return RankingList(
            entries=entries,
            total=total or 0,
        )

    def get_user_monthly_ranking(
        self, user_id: UUID, year: int, month: int
    ) -> CurrentUserRanking:
        """
        ユーザーの月間ランキング順位を取得
        """
        # 月の開始日と終了日を計算
        month_start = date(year, month, 1)
        _, last_day = monthrange(year, month)
        month_end = date(year, month, last_day)

        # ユーザーの月間スコアを取得
        user_score = (
            self.session.query(func.count(AttendanceSummaryModel.date))
            .filter(
                AttendanceSummaryModel.user_id == user_id,
                AttendanceSummaryModel.date >= month_start,
                AttendanceSummaryModel.date <= month_end,
                AttendanceSummaryModel.is_morning_active.is_(True),
            )
            .scalar()
        ) or 0

        if user_score == 0:
            return CurrentUserRanking(rank=0, score=0)

        # サブクエリ: 各ユーザーの月間スコア
        monthly_score_subq = (
            self.session.query(
                AttendanceSummaryModel.user_id,
                func.count(AttendanceSummaryModel.date).label('score'),
            )
            .filter(
                AttendanceSummaryModel.date >= month_start,
                AttendanceSummaryModel.date <= month_end,
                AttendanceSummaryModel.is_morning_active.is_(True),
            )
            .group_by(AttendanceSummaryModel.user_id)
            .subquery()
        )

        # ユーザーより上位のユーザー数をカウント
        higher_count = (
            self.session.query(func.count(monthly_score_subq.c.user_id))
            .join(UserModel, monthly_score_subq.c.user_id == UserModel.id)
            .filter(
                UserModel.is_active.is_(True),
                monthly_score_subq.c.score > user_score,
            )
            .scalar()
        ) or 0

        # 同スコアで先に登録したユーザー数をカウント
        user_created_at = (
            self.session.query(UserModel.created_at)
            .filter(UserModel.id == user_id)
            .scalar()
        )

        same_score_earlier = 0
        if user_created_at:
            same_score_earlier = (
                self.session.query(func.count(monthly_score_subq.c.user_id))
                .join(UserModel, monthly_score_subq.c.user_id == UserModel.id)
                .filter(
                    UserModel.is_active.is_(True),
                    monthly_score_subq.c.score == user_score,
                    UserModel.created_at < user_created_at,
                )
                .scalar()
            ) or 0

        rank = higher_count + same_score_earlier + 1

        return CurrentUserRanking(rank=rank, score=user_score)

    def get_user_total_ranking(self, user_id: UUID) -> CurrentUserRanking:
        """
        ユーザーの総合ランキング順位を取得
        """
        # ユーザーのスコアを取得
        user_stats = (
            self.session.query(AttendanceStatisticsModel)
            .filter(AttendanceStatisticsModel.user_id == user_id)
            .first()
        )

        if user_stats is None or user_stats.total_attendance_days == 0:
            return CurrentUserRanking(rank=0, score=0)

        user_score = user_stats.total_attendance_days

        # ユーザーより上位のユーザー数をカウント
        higher_count = (
            self.session.query(func.count(AttendanceStatisticsModel.user_id))
            .join(UserModel, AttendanceStatisticsModel.user_id == UserModel.id)
            .filter(
                UserModel.is_active.is_(True),
                AttendanceStatisticsModel.total_attendance_days > user_score,
            )
            .scalar()
        ) or 0

        # 同スコアで先に登録したユーザー数をカウント
        user_created_at = (
            self.session.query(UserModel.created_at)
            .filter(UserModel.id == user_id)
            .scalar()
        )

        same_score_earlier = 0
        if user_created_at:
            same_score_earlier = (
                self.session.query(func.count(AttendanceStatisticsModel.user_id))
                .join(UserModel, AttendanceStatisticsModel.user_id == UserModel.id)
                .filter(
                    UserModel.is_active.is_(True),
                    AttendanceStatisticsModel.total_attendance_days == user_score,
                    UserModel.created_at < user_created_at,
                )
                .scalar()
            ) or 0

        rank = higher_count + same_score_earlier + 1

        return CurrentUserRanking(rank=rank, score=user_score)

    def get_user_streak_ranking(self, user_id: UUID) -> CurrentUserRanking:
        """
        ユーザーの連続日数ランキング順位を取得
        """
        # ユーザーのスコアを取得
        user_stats = (
            self.session.query(AttendanceStatisticsModel)
            .filter(AttendanceStatisticsModel.user_id == user_id)
            .first()
        )

        if user_stats is None or user_stats.current_streak_days == 0:
            return CurrentUserRanking(rank=0, score=0)

        user_score = user_stats.current_streak_days

        # ユーザーより上位のユーザー数をカウント
        higher_count = (
            self.session.query(func.count(AttendanceStatisticsModel.user_id))
            .join(UserModel, AttendanceStatisticsModel.user_id == UserModel.id)
            .filter(
                UserModel.is_active.is_(True),
                AttendanceStatisticsModel.current_streak_days > user_score,
            )
            .scalar()
        ) or 0

        # 同スコアで先に登録したユーザー数をカウント
        user_created_at = (
            self.session.query(UserModel.created_at)
            .filter(UserModel.id == user_id)
            .scalar()
        )

        same_score_earlier = 0
        if user_created_at:
            same_score_earlier = (
                self.session.query(func.count(AttendanceStatisticsModel.user_id))
                .join(UserModel, AttendanceStatisticsModel.user_id == UserModel.id)
                .filter(
                    UserModel.is_active.is_(True),
                    AttendanceStatisticsModel.current_streak_days == user_score,
                    UserModel.created_at < user_created_at,
                )
                .scalar()
            ) or 0

        rank = higher_count + same_score_earlier + 1

        return CurrentUserRanking(rank=rank, score=user_score)


class AttendanceRepositoryImpl(IAttendanceRepository):
    """参加リポジトリの実装"""

    def __init__(self, session: Session):
        """
        コンストラクタ

        Args:
            session: SQLAlchemyのセッション
        """
        self.session = session

    def get_statistics(self, user_id: UUID) -> AttendanceStatisticsResult | None:
        """
        ユーザーの参加統計を取得
        """
        # 基本統計を取得
        stats = (
            self.session.query(AttendanceStatisticsModel)
            .filter(AttendanceStatisticsModel.user_id == user_id)
            .first()
        )

        if stats is None:
            return None

        # 今月の参加日数を動的計算
        today = date.today()
        month_start = date(today.year, today.month, 1)
        _, last_day = monthrange(today.year, today.month)
        month_end = date(today.year, today.month, last_day)

        this_month_days = (
            self.session.query(func.count(AttendanceSummaryModel.id))
            .filter(
                AttendanceSummaryModel.user_id == user_id,
                AttendanceSummaryModel.date >= month_start,
                AttendanceSummaryModel.date <= month_end,
                AttendanceSummaryModel.is_morning_active.is_(True),
            )
            .scalar()
        ) or 0

        # 今週の参加日数を動的計算（月曜日始まり）
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        this_week_days = (
            self.session.query(func.count(AttendanceSummaryModel.id))
            .filter(
                AttendanceSummaryModel.user_id == user_id,
                AttendanceSummaryModel.date >= week_start,
                AttendanceSummaryModel.date <= week_end,
                AttendanceSummaryModel.is_morning_active.is_(True),
            )
            .scalar()
        ) or 0

        return AttendanceStatisticsResult(
            total_attendance_days=stats.total_attendance_days,
            current_streak_days=stats.current_streak_days,
            max_streak_days=stats.max_streak_days,
            this_month_days=this_month_days,
            this_week_days=this_week_days,
        )

    def get_summaries(
        self, user_id: UUID, date_from: date, date_to: date
    ) -> AttendanceSummariesResult:
        """
        ユーザーの参加サマリーを取得
        """
        # サマリーを取得
        results = (
            self.session.query(AttendanceSummaryModel)
            .filter(
                AttendanceSummaryModel.user_id == user_id,
                AttendanceSummaryModel.date >= date_from,
                AttendanceSummaryModel.date <= date_to,
                AttendanceSummaryModel.is_morning_active.is_(True),
            )
            .order_by(AttendanceSummaryModel.date.asc())
            .all()
        )

        # AttendanceSummaryItemに変換
        summaries = [
            AttendanceSummaryItem(
                date=row.date,
                is_morning_active=row.is_morning_active,
            )
            for row in results
        ]

        return AttendanceSummariesResult(
            summaries=summaries,
            period=DateRange(date_from=date_from, date_to=date_to),
            total=len(summaries),
        )
