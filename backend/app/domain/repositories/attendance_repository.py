"""参加関連リポジトリインターフェース"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date
from uuid import UUID


# =============================================================================
# データクラス: 参加統計
# =============================================================================
@dataclass
class AttendanceStatisticsResult:
    """参加統計結果"""

    total_attendance_days: int
    current_streak_days: int
    max_streak_days: int
    this_month_days: int
    this_week_days: int


# =============================================================================
# データクラス: 参加サマリー
# =============================================================================
@dataclass
class AttendanceSummaryItem:
    """参加サマリーアイテム"""

    date: date
    is_morning_active: bool


@dataclass
class DateRange:
    """日付範囲"""

    date_from: date
    date_to: date


@dataclass
class AttendanceSummariesResult:
    """参加サマリー結果"""

    summaries: list[AttendanceSummaryItem]
    period: DateRange
    total: int


# =============================================================================
# データクラス: ランキング
# =============================================================================
@dataclass
class RankingUser:
    """ランキング用ユーザー情報"""

    id: UUID
    display_name: str | None
    avatar_url: str | None
    tagline: str | None


@dataclass
class RankingEntry:
    """ランキングエントリ"""

    rank: int
    user: RankingUser
    current_title_level: int | None
    score: int


@dataclass
class RankingList:
    """ランキング一覧"""

    entries: list[RankingEntry]
    total: int


@dataclass
class MonthlyRankingList:
    """月間ランキング一覧"""

    year: int
    month: int
    entries: list[RankingEntry]
    total: int


@dataclass
class CurrentUserRanking:
    """自分のランキング情報"""

    rank: int
    score: int


@dataclass
class CurrentUserRankings:
    """自分の全ランキング情報"""

    monthly: CurrentUserRanking
    total: CurrentUserRanking
    streak: CurrentUserRanking


@dataclass
class AllRankingsResult:
    """全ランキング結果"""

    monthly: MonthlyRankingList
    total: RankingList
    streak: RankingList
    current_user: CurrentUserRankings


@dataclass
class RankingFilter:
    """ランキング検索条件"""

    year: int
    month: int
    limit: int = 50


class IRankingRepository(ABC):
    """ランキングリポジトリのインターフェース"""

    @abstractmethod
    def get_monthly_ranking(
        self, year: int, month: int, limit: int
    ) -> MonthlyRankingList:
        """
        月間ランキングを取得

        Args:
            year: 対象年
            month: 対象月 (1-12)
            limit: 取得件数

        Returns:
            MonthlyRankingList: 月間ランキング
        """
        pass

    @abstractmethod
    def get_total_ranking(self, limit: int) -> RankingList:
        """
        総合ランキングを取得

        Args:
            limit: 取得件数

        Returns:
            RankingList: 総合ランキング
        """
        pass

    @abstractmethod
    def get_streak_ranking(self, limit: int) -> RankingList:
        """
        連続日数ランキングを取得

        Args:
            limit: 取得件数

        Returns:
            RankingList: 連続日数ランキング
        """
        pass

    @abstractmethod
    def get_user_monthly_ranking(
        self, user_id: UUID, year: int, month: int
    ) -> CurrentUserRanking:
        """
        ユーザーの月間ランキング順位を取得

        Args:
            user_id: ユーザーID
            year: 対象年
            month: 対象月

        Returns:
            CurrentUserRanking: 順位とスコア
        """
        pass

    @abstractmethod
    def get_user_total_ranking(self, user_id: UUID) -> CurrentUserRanking:
        """
        ユーザーの総合ランキング順位を取得

        Args:
            user_id: ユーザーID

        Returns:
            CurrentUserRanking: 順位とスコア
        """
        pass

    @abstractmethod
    def get_user_streak_ranking(self, user_id: UUID) -> CurrentUserRanking:
        """
        ユーザーの連続日数ランキング順位を取得

        Args:
            user_id: ユーザーID

        Returns:
            CurrentUserRanking: 順位とスコア
        """
        pass


# =============================================================================
# 参加リポジトリインターフェース
# =============================================================================
class IAttendanceRepository(ABC):
    """参加リポジトリのインターフェース"""

    @abstractmethod
    def get_statistics(self, user_id: UUID) -> AttendanceStatisticsResult | None:
        """
        ユーザーの参加統計を取得

        Args:
            user_id: ユーザーID

        Returns:
            AttendanceStatisticsResult | None: 参加統計（存在しない場合はNone）
        """
        pass

    @abstractmethod
    def get_summaries(
        self, user_id: UUID, date_from: date, date_to: date
    ) -> AttendanceSummariesResult:
        """
        ユーザーの参加サマリーを取得

        Args:
            user_id: ユーザーID
            date_from: 開始日
            date_to: 終了日

        Returns:
            AttendanceSummariesResult: 参加サマリー結果
        """
        pass
