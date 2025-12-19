"""称号関連のユースケース"""

import logging
from uuid import UUID

from app.application.schemas.title_schemas import (
    TitleHolderDTO,
    TitleHoldersListDTO,
    UserTitleAchievementDTO,
    UserTitleAchievementsDTO,
)
from app.domain.exceptions.title import TitleLevelInvalidError
from app.domain.exceptions.user import UserNotFoundError
from app.domain.repositories.title_repository import (
    ITitleRepository,
    TitleHoldersResult,
    UserTitleAchievementsResult,
)

logger = logging.getLogger(__name__)


class TitleUsecase:
    """称号関連のユースケース"""

    def __init__(self, title_repository: ITitleRepository):
        """
        コンストラクタ

        Args:
            title_repository: 称号リポジトリ
        """
        self.title_repository = title_repository

    def get_title_holders(self, level: int) -> TitleHoldersListDTO:
        """
        指定レベルの称号保持者一覧を取得

        Args:
            level: 称号レベル (1-8)

        Returns:
            TitleHoldersListDTO: 保持者一覧DTO

        Raises:
            TitleLevelInvalidError: レベルが1-8の範囲外の場合
        """
        # バリデーション
        if level < 1 or level > 8:
            raise TitleLevelInvalidError(level)

        # リポジトリからデータ取得
        result = self.title_repository.get_title_holders(level)

        # DTOに変換
        holders_dto = self._to_title_holders_dto(result)

        logger.info(
            '称号保持者一覧取得: level=%d, count=%d',
            level,
            result.total,
        )

        return holders_dto

    def get_user_title_achievements(self, user_id: str) -> UserTitleAchievementsDTO:
        """
        ユーザーの称号実績を取得

        Args:
            user_id: ユーザーID

        Returns:
            UserTitleAchievementsDTO: 称号実績DTO

        Raises:
            UserNotFoundError: ユーザーが存在しない場合
        """
        # リポジトリからデータ取得
        result = self.title_repository.get_user_title_achievements(UUID(user_id))

        if result is None:
            raise UserNotFoundError()

        # DTOに変換
        achievements_dto = self._to_user_achievements_dto(result)

        logger.info(
            'ユーザー称号実績取得: user_id=%s, current_level=%d, achievements=%d',
            user_id,
            result.current_title_level,
            len(result.achievements),
        )

        return achievements_dto

    def _to_title_holders_dto(self, result: TitleHoldersResult) -> TitleHoldersListDTO:
        """TitleHoldersResultをTitleHoldersListDTOに変換"""
        holders_dto = [
            TitleHolderDTO(
                id=str(holder.id),
                displayName=holder.display_name,
                avatarUrl=holder.avatar_url,
                achievedAt=holder.achieved_at.isoformat(),
            )
            for holder in result.holders
        ]
        return TitleHoldersListDTO(
            level=result.level,
            holders=holders_dto,
            total=result.total,
        )

    def _to_user_achievements_dto(
        self, result: UserTitleAchievementsResult
    ) -> UserTitleAchievementsDTO:
        """UserTitleAchievementsResultをUserTitleAchievementsDTOに変換"""
        achievements_dto = [
            UserTitleAchievementDTO(
                titleLevel=achievement.title_level,
                achievedAt=achievement.achieved_at.isoformat(),
            )
            for achievement in result.achievements
        ]
        return UserTitleAchievementsDTO(
            currentTitleLevel=result.current_title_level,
            totalAttendanceDays=result.total_attendance_days,
            achievements=achievements_dto,
        )
