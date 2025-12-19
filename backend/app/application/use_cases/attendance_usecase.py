"""ランキング関連のユースケース"""

import logging
from datetime import date
from uuid import UUID

from app.application.schemas.attendance_schemas import (
    AllRankingsDTO,
    CurrentUserRankingDTO,
    CurrentUserRankingsDTO,
    MonthlyRankingListDTO,
    RankingEntryDTO,
    RankingListDTO,
    RankingUserDTO,
)
from app.domain.exceptions.attendance import InvalidMonthError
from app.domain.repositories.attendance_repository import (
    CurrentUserRanking,
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
