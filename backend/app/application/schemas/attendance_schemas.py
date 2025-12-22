"""参加関連のApplication層スキーマ（DTO）"""

from pydantic import BaseModel, Field


# =============================================================================
# 参加統計DTO
# =============================================================================
class AttendanceStatisticsDTO(BaseModel):
    """参加統計DTO"""

    total_attendance_days: int = Field(alias='totalAttendanceDays')
    current_streak_days: int = Field(alias='currentStreakDays')
    max_streak_days: int = Field(alias='maxStreakDays')
    this_month_days: int = Field(alias='thisMonthDays')
    this_week_days: int = Field(alias='thisWeekDays')

    class Config:
        populate_by_name = True


# =============================================================================
# 参加サマリーDTO
# =============================================================================
class AttendanceSummaryItemDTO(BaseModel):
    """参加サマリーアイテムDTO"""

    date: str
    is_morning_active: bool = Field(alias='isMorningActive')

    class Config:
        populate_by_name = True


class AttendanceSummaryPeriodDTO(BaseModel):
    """参加サマリー期間DTO"""

    date_from: str = Field(alias='dateFrom')
    date_to: str = Field(alias='dateTo')

    class Config:
        populate_by_name = True


class AttendanceSummariesDTO(BaseModel):
    """参加サマリー結果DTO"""

    summaries: list[AttendanceSummaryItemDTO]
    period: AttendanceSummaryPeriodDTO
    total: int


# =============================================================================
# ランキングDTO
# =============================================================================
class RankingUserDTO(BaseModel):
    """ランキング用ユーザーDTO"""

    id: str
    display_name: str | None = Field(alias='displayName')
    avatar_url: str | None = Field(alias='avatarUrl')
    tagline: str | None

    class Config:
        populate_by_name = True


class RankingEntryDTO(BaseModel):
    """ランキングエントリDTO"""

    rank: int
    user: RankingUserDTO
    current_title_level: int | None = Field(alias='currentTitleLevel')
    score: int

    class Config:
        populate_by_name = True


class RankingListDTO(BaseModel):
    """ランキング一覧DTO"""

    entries: list[RankingEntryDTO]
    total: int


class MonthlyRankingListDTO(BaseModel):
    """月間ランキングDTO"""

    year: int
    month: int
    entries: list[RankingEntryDTO]
    total: int


class CurrentUserRankingDTO(BaseModel):
    """自分のランキング情報DTO"""

    rank: int
    score: int


class CurrentUserRankingsDTO(BaseModel):
    """自分の全ランキング情報DTO"""

    monthly: CurrentUserRankingDTO
    total: CurrentUserRankingDTO
    streak: CurrentUserRankingDTO


class AllRankingsDTO(BaseModel):
    """全ランキングDTO"""

    monthly: MonthlyRankingListDTO
    total: RankingListDTO
    streak: RankingListDTO
    current_user: CurrentUserRankingsDTO = Field(alias='currentUser')

    class Config:
        populate_by_name = True
