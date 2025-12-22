"""参加関連のPresentation層スキーマ（リクエスト/レスポンス）"""

from pydantic import BaseModel

from app.presentation.schemas.common import BaseAPIResponse

# ========================================
# 参加統計
# ========================================


class AttendanceStatisticsResponse(BaseModel):
    """参加統計レスポンス"""

    totalAttendanceDays: int
    currentStreakDays: int
    maxStreakDays: int
    thisMonthDays: int
    thisWeekDays: int


class AttendanceStatisticsAPIResponse(BaseAPIResponse[AttendanceStatisticsResponse]):
    """参加統計APIレスポンス"""

    pass


# ========================================
# 参加サマリー
# ========================================


class AttendanceSummaryItemResponse(BaseModel):
    """参加サマリーアイテムレスポンス"""

    date: str
    isMorningActive: bool


class AttendanceSummaryPeriodResponse(BaseModel):
    """参加サマリー期間レスポンス"""

    dateFrom: str
    dateTo: str


class AttendanceSummariesDataResponse(BaseModel):
    """参加サマリーデータレスポンス"""

    summaries: list[AttendanceSummaryItemResponse]
    period: AttendanceSummaryPeriodResponse
    total: int


class AttendanceSummariesAPIResponse(BaseAPIResponse[AttendanceSummariesDataResponse]):
    """参加サマリーAPIレスポンス"""

    pass


# ========================================
# ランキング共通
# ========================================


class RankingUserResponse(BaseModel):
    """ランキング用ユーザーレスポンス"""

    id: str
    displayName: str | None
    avatarUrl: str | None
    tagline: str | None


class RankingEntryResponse(BaseModel):
    """ランキングエントリレスポンス"""

    rank: int
    user: RankingUserResponse
    currentTitleLevel: int | None
    score: int


class RankingListResponse(BaseModel):
    """ランキング一覧レスポンス"""

    entries: list[RankingEntryResponse]
    total: int


class MonthlyRankingListResponse(BaseModel):
    """月間ランキングレスポンス"""

    year: int
    month: int
    entries: list[RankingEntryResponse]
    total: int


class CurrentUserRankingResponse(BaseModel):
    """自分のランキング情報レスポンス"""

    rank: int
    score: int


class CurrentUserRankingsResponse(BaseModel):
    """自分の全ランキング情報レスポンス"""

    monthly: CurrentUserRankingResponse
    total: CurrentUserRankingResponse
    streak: CurrentUserRankingResponse


# ========================================
# 全ランキング取得
# ========================================


class AllRankingsDataResponse(BaseModel):
    """全ランキングデータレスポンス"""

    monthly: MonthlyRankingListResponse
    total: RankingListResponse
    streak: RankingListResponse
    currentUser: CurrentUserRankingsResponse


class AllRankingsAPIResponse(BaseAPIResponse[AllRankingsDataResponse]):
    """全ランキングAPIレスポンス"""

    pass


# ========================================
# 自分のランキング取得
# ========================================


class MyRankingsAPIResponse(BaseAPIResponse[CurrentUserRankingsResponse]):
    """自分のランキングAPIレスポンス"""

    pass
