/**
 * Attendance Domain Types
 *
 * 参加ドメイン（ランキング）のAPI型定義
 */

// ========================================
// Ranking Types
// ========================================

/** ランキングユーザー */
export type RankingUser = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  tagline: string | null;
};

/** ランキングエントリ */
export type RankingEntry = {
  rank: number;
  user: RankingUser;
  currentTitleLevel: number;
  score: number;
};

/** ランキング一覧 */
export type RankingList = {
  entries: RankingEntry[];
  total: number;
};

/** 月間ランキング一覧 */
export type MonthlyRankingList = {
  year: number;
  month: number;
  entries: RankingEntry[];
  total: number;
};

/** 自分のランキング情報 */
export type CurrentUserRanking = {
  rank: number;
  score: number;
};

/** 自分の全ランキング */
export type CurrentUserRankings = {
  monthly: CurrentUserRanking;
  total: CurrentUserRanking;
  streak: CurrentUserRanking;
};

// ========================================
// GET /api/v1/rankings
// ========================================

/** 全ランキング取得リクエストパラメータ */
export type RankingsParams = {
  year?: number;
  month?: number;
  limit?: number;
};

/** 全ランキングレスポンス */
export type AllRankingsResponse = {
  data: {
    monthly: MonthlyRankingList;
    total: RankingList;
    streak: RankingList;
    currentUser: CurrentUserRankings;
  };
  message: string;
  timestamp: string;
};

// ========================================
// GET /api/v1/rankings/me
// ========================================

/** 自分のランキング取得リクエストパラメータ */
export type MyRankingsParams = {
  year?: number;
  month?: number;
};

/** 自分のランキングレスポンス */
export type MyRankingsResponse = {
  data: CurrentUserRankings;
  message: string;
  timestamp: string;
};

// ========================================
// Attendance Statistics Types
// ========================================

/** 参加統計 */
export type AttendanceStatistics = {
  totalAttendanceDays: number;
  currentStreakDays: number;
  maxStreakDays: number;
  thisMonthDays: number;
  thisWeekDays: number;
};

/** 参加統計レスポンス */
export type AttendanceStatisticsResponse = {
  data: AttendanceStatistics;
  message: string;
  timestamp: string;
};

// ========================================
// Attendance Summaries Types
// ========================================

/** 参加サマリーアイテム */
export type AttendanceSummaryItem = {
  date: string;
  isMorningActive: boolean;
};

/** 参加サマリー期間 */
export type AttendanceSummaryPeriod = {
  dateFrom: string;
  dateTo: string;
};

/** 参加サマリーデータ */
export type AttendanceSummariesData = {
  summaries: AttendanceSummaryItem[];
  period: AttendanceSummaryPeriod;
  total: number;
};

/** 参加サマリーレスポンス */
export type AttendanceSummariesResponse = {
  data: AttendanceSummariesData;
  message: string;
  timestamp: string;
};

/** 参加サマリークエリパラメータ */
export type AttendanceSummariesParams = {
  dateFrom?: string;
  dateTo?: string;
};
