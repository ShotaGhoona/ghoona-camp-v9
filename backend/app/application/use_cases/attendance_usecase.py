"""参加関連のユースケース"""

import logging
from calendar import monthrange
from datetime import date
from uuid import UUID

from app.application.schemas.attendance_schemas import (
    AllRankingsDTO,
    AttendanceStatisticsDTO,
    AttendanceSummariesDTO,
    AttendanceSummaryItemDTO,
    AttendanceSummaryPeriodDTO,
    CurrentUserRankingDTO,
    CurrentUserRankingsDTO,
    MonthlyRankingListDTO,
    RankingEntryDTO,
    RankingListDTO,
    RankingUserDTO,
)
from app.domain.exceptions.attendance import (
    InvalidDateRangeError,
    InvalidMonthError,
    NotOwnAttendanceError,
)
from app.domain.repositories.attendance_repository import (
    AttendanceStatisticsResult,
    AttendanceSummariesResult,
    CurrentUserRanking,
    IAttendanceRepository,
    IRankingRepository,
    MonthlyRankingList,
    RankingEntry,
    RankingList,
)

logger = logging.getLogger(__name__)


class RankingUsecase:
    """ランキング関連のユースケース"""

    def __init__(self, ranking_repository: IRankingRepository):
        """
        コンストラクタ

        Args:
            ranking_repository: ランキングリポジトリ
        """
        self.ranking_repository = ranking_repository

    def get_all_rankings(
        self,
        current_user_id: str,
        year: int | None = None,
        month: int | None = None,
        limit: int = 50,
    ) -> AllRankingsDTO:
        """
        全ランキングを一括取得

        Args:
            current_user_id: ログインユーザーID
            year: 月間ランキングの対象年（省略時は現在年）
            month: 月間ランキングの対象月（省略時は現在月）
            limit: 各ランキングの取得件数

        Returns:
            AllRankingsDTO: 全ランキング結果

        Raises:
            InvalidMonthError: 月が1-12の範囲外の場合
        """
        # デフォルト値を設定
        today = date.today()
        if year is None:
            year = today.year
        if month is None:
            month = today.month

        # バリデーション
        if month < 1 or month > 12:
            raise InvalidMonthError(month)

        # limit の上限チェック
        if limit > 100:
            limit = 100

        user_id = UUID(current_user_id)

        # 各ランキングを取得
        monthly_ranking = self.ranking_repository.get_monthly_ranking(year, month, limit)
        total_ranking = self.ranking_repository.get_total_ranking(limit)
        streak_ranking = self.ranking_repository.get_streak_ranking(limit)

        # ユーザーのランキング情報を取得
        user_monthly = self.ranking_repository.get_user_monthly_ranking(
            user_id, year, month
        )
        user_total = self.ranking_repository.get_user_total_ranking(user_id)
        user_streak = self.ranking_repository.get_user_streak_ranking(user_id)

        # DTOに変換
        result = AllRankingsDTO(
            monthly=self._to_monthly_ranking_dto(monthly_ranking),
            total=self._to_ranking_list_dto(total_ranking),
            streak=self._to_ranking_list_dto(streak_ranking),
            currentUser=CurrentUserRankingsDTO(
                monthly=self._to_current_user_ranking_dto(user_monthly),
                total=self._to_current_user_ranking_dto(user_total),
                streak=self._to_current_user_ranking_dto(user_streak),
            ),
        )

        logger.info(
            '全ランキング取得: year=%d, month=%d, user=%s',
            year,
            month,
            current_user_id,
        )

        return result

    def get_my_rankings(
        self,
        current_user_id: str,
        year: int | None = None,
        month: int | None = None,
    ) -> CurrentUserRankingsDTO:
        """
        自分のランキング情報のみを取得

        Args:
            current_user_id: ログインユーザーID
            year: 月間ランキングの対象年（省略時は現在年）
            month: 月間ランキングの対象月（省略時は現在月）

        Returns:
            CurrentUserRankingsDTO: 自分のランキング情報

        Raises:
            InvalidMonthError: 月が1-12の範囲外の場合
        """
        # デフォルト値を設定
        today = date.today()
        if year is None:
            year = today.year
        if month is None:
            month = today.month

        # バリデーション
        if month < 1 or month > 12:
            raise InvalidMonthError(month)

        user_id = UUID(current_user_id)

        # ユーザーのランキング情報を取得
        user_monthly = self.ranking_repository.get_user_monthly_ranking(
            user_id, year, month
        )
        user_total = self.ranking_repository.get_user_total_ranking(user_id)
        user_streak = self.ranking_repository.get_user_streak_ranking(user_id)

        result = CurrentUserRankingsDTO(
            monthly=self._to_current_user_ranking_dto(user_monthly),
            total=self._to_current_user_ranking_dto(user_total),
            streak=self._to_current_user_ranking_dto(user_streak),
        )

        logger.info(
            '自分のランキング取得: year=%d, month=%d, user=%s',
            year,
            month,
            current_user_id,
        )

        return result

    def _to_ranking_entry_dto(self, entry: RankingEntry) -> RankingEntryDTO:
        """RankingEntryをRankingEntryDTOに変換"""
        return RankingEntryDTO(
            rank=entry.rank,
            user=RankingUserDTO(
                id=str(entry.user.id),
                displayName=entry.user.display_name,
                avatarUrl=entry.user.avatar_url,
                tagline=entry.user.tagline,
            ),
            currentTitleLevel=entry.current_title_level,
            score=entry.score,
        )

    def _to_ranking_list_dto(self, ranking: RankingList) -> RankingListDTO:
        """RankingListをRankingListDTOに変換"""
        return RankingListDTO(
            entries=[self._to_ranking_entry_dto(e) for e in ranking.entries],
            total=ranking.total,
        )

    def _to_monthly_ranking_dto(
        self, ranking: MonthlyRankingList
    ) -> MonthlyRankingListDTO:
        """MonthlyRankingListをMonthlyRankingListDTOに変換"""
        return MonthlyRankingListDTO(
            year=ranking.year,
            month=ranking.month,
            entries=[self._to_ranking_entry_dto(e) for e in ranking.entries],
            total=ranking.total,
        )

    def _to_current_user_ranking_dto(
        self, ranking: CurrentUserRanking
    ) -> CurrentUserRankingDTO:
        """CurrentUserRankingをCurrentUserRankingDTOに変換"""
        return CurrentUserRankingDTO(
            rank=ranking.rank,
            score=ranking.score,
        )


class AttendanceUsecase:
    """参加関連のユースケース"""

    def __init__(self, attendance_repository: IAttendanceRepository):
        """
        コンストラクタ

        Args:
            attendance_repository: 参加リポジトリ
        """
        self.attendance_repository = attendance_repository

    def get_statistics(
        self,
        user_id: str,
        current_user_id: str,
    ) -> AttendanceStatisticsDTO:
        """
        ユーザーの参加統計を取得

        Args:
            user_id: 対象ユーザーID
            current_user_id: 現在のユーザーID

        Returns:
            AttendanceStatisticsDTO: 参加統計DTO

        Raises:
            NotOwnAttendanceError: 他人の参加データにアクセス
        """
        # 本人のみアクセス可能
        if user_id != current_user_id:
            raise NotOwnAttendanceError()

        # リポジトリから取得
        result = self.attendance_repository.get_statistics(UUID(user_id))

        # 統計が存在しない場合はゼロ値を返す
        if result is None:
            result = AttendanceStatisticsResult(
                total_attendance_days=0,
                current_streak_days=0,
                max_streak_days=0,
                this_month_days=0,
                this_week_days=0,
            )

        logger.info(
            '参加統計取得: user_id=%s',
            user_id,
        )

        return self._to_statistics_dto(result)

    def get_summaries(
        self,
        user_id: str,
        current_user_id: str,
        date_from: str | None = None,
        date_to: str | None = None,
    ) -> AttendanceSummariesDTO:
        """
        ユーザーの参加サマリーを取得

        Args:
            user_id: 対象ユーザーID
            current_user_id: 現在のユーザーID
            date_from: 開始日（YYYY-MM-DD）
            date_to: 終了日（YYYY-MM-DD）

        Returns:
            AttendanceSummariesDTO: 参加サマリーDTO

        Raises:
            NotOwnAttendanceError: 他人の参加データにアクセス
            InvalidDateRangeError: 日付範囲が不正
        """
        # 本人のみアクセス可能
        if user_id != current_user_id:
            raise NotOwnAttendanceError()

        # デフォルト値を設定（当月）
        today = date.today()
        if date_from is None:
            date_from_parsed = date(today.year, today.month, 1)
        else:
            date_from_parsed = date.fromisoformat(date_from)

        if date_to is None:
            _, last_day = monthrange(today.year, today.month)
            date_to_parsed = date(today.year, today.month, last_day)
        else:
            date_to_parsed = date.fromisoformat(date_to)

        # 日付範囲のバリデーション
        if date_from_parsed > date_to_parsed:
            raise InvalidDateRangeError(str(date_from_parsed), str(date_to_parsed))

        # リポジトリから取得
        result = self.attendance_repository.get_summaries(
            UUID(user_id),
            date_from_parsed,
            date_to_parsed,
        )

        logger.info(
            '参加サマリー取得: user_id=%s, date_from=%s, date_to=%s, count=%d',
            user_id,
            date_from_parsed,
            date_to_parsed,
            result.total,
        )

        return self._to_summaries_dto(result)

    def _to_statistics_dto(
        self, result: AttendanceStatisticsResult
    ) -> AttendanceStatisticsDTO:
        """AttendanceStatisticsResultをAttendanceStatisticsDTOに変換"""
        return AttendanceStatisticsDTO(
            totalAttendanceDays=result.total_attendance_days,
            currentStreakDays=result.current_streak_days,
            maxStreakDays=result.max_streak_days,
            thisMonthDays=result.this_month_days,
            thisWeekDays=result.this_week_days,
        )

    def _to_summaries_dto(
        self, result: AttendanceSummariesResult
    ) -> AttendanceSummariesDTO:
        """AttendanceSummariesResultをAttendanceSummariesDTOに変換"""
        summaries = [
            AttendanceSummaryItemDTO(
                date=item.date.isoformat(),
                isMorningActive=item.is_morning_active,
            )
            for item in result.summaries
        ]
        period = AttendanceSummaryPeriodDTO(
            dateFrom=result.period.date_from.isoformat(),
            dateTo=result.period.date_to.isoformat(),
        )
        return AttendanceSummariesDTO(
            summaries=summaries,
            period=period,
            total=result.total,
        )
