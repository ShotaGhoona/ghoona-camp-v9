# Attendance Domain バックエンド実装レポート

## 概要

AttendanceドメインのバックエンドAPI（ランキング機能 + 参加統計/サマリー）をオニオンアーキテクチャに従って実装。

**ランキング機能:**
- `GET /rankings` - 3種類のランキング一括取得
- `GET /rankings/me` - ログインユーザーの順位情報

**参加統計/サマリー機能:**
- `GET /users/{userId}/attendance/statistics` - 参加統計（統計カード表示用）
- `GET /users/{userId}/attendance/summaries` - 参加サマリー（カレンダーマーカー表示用）

## 変更ファイル

```
backend/app/
├── domain/
│   ├── repositories/
│   │   └── attendance_repository.py            # リポジトリI/F・データクラス
│   └── exceptions/
│       └── attendance.py                       # 参加関連例外
├── infrastructure/
│   └── db/
│       └── repositories/
│           └── attendance_repository_impl.py   # リポジトリ実装
├── application/
│   ├── schemas/
│   │   └── attendance_schemas.py               # DTO
│   └── use_cases/
│       └── attendance_usecase.py               # ユースケース
├── presentation/
│   ├── api/
│   │   └── attendance_api.py                   # 参加関連API
│   └── schemas/
│       └── attendance_schemas.py               # リクエスト/レスポンス
├── di/
│   └── attendance.py                           # 依存性注入
└── main.py                                     # ルーター登録
```

## APIエンドポイント

### GET /api/v1/rankings

3種類のランキングを一括取得。ランキングページのメインAPI。

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | - | 月間ランキングの対象年（default: 現在年, 2000-2100） |
| `month` | int | - | 月間ランキングの対象月（default: 現在月, 1-12） |
| `limit` | int | - | 各ランキングの取得件数（default: 50, max: 100） |

**認証:** JWT Cookie認証必須（🔐 認証済み）

**レスポンス例:**
```json
{
  "data": {
    "monthly": {
      "year": 2025,
      "month": 1,
      "entries": [
        {
          "rank": 1,
          "user": {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "displayName": "田中二郎",
            "avatarUrl": "https://...",
            "tagline": "毎朝5時起き！継続は力なり"
          },
          "currentTitleLevel": 8,
          "score": 16
        }
      ],
      "total": 17
    },
    "total": { "entries": [...], "total": 17 },
    "streak": { "entries": [...], "total": 17 },
    "currentUser": {
      "monthly": { "rank": 8, "score": 12 },
      "total": { "rank": 8, "score": 156 },
      "streak": { "rank": 10, "score": 23 }
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### GET /api/v1/rankings/me

ログインユーザー自身のランキング情報のみを取得（軽量API）。

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | - | 月間ランキングの対象年（default: 現在年） |
| `month` | int | - | 月間ランキングの対象月（default: 現在月） |

**認証:** JWT Cookie認証必須（🔐 認証済み）

**レスポンス例:**
```json
{
  "data": {
    "monthly": { "rank": 8, "score": 12 },
    "total": { "rank": 8, "score": 156 },
    "streak": { "rank": 10, "score": 23 }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

---

### GET /api/v1/users/{userId}/attendance/statistics

ユーザーの参加統計を取得。統計カードの表示に使用。

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `userId` | UUID | ユーザーID |

**認証:** JWT Cookie認証必須（👤 本人のみ）

**レスポンス例:**
```json
{
  "data": {
    "totalAttendanceDays": 47,
    "currentStreakDays": 12,
    "maxStreakDays": 21,
    "thisMonthDays": 14,
    "thisWeekDays": 5
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**フィールド説明:**

| フィールド | 説明 | 計算方法 |
|-----------|------|----------|
| `totalAttendanceDays` | 総参加日数 | DBから取得 |
| `currentStreakDays` | 現在の連続日数 | DBから取得 |
| `maxStreakDays` | 最大連続日数 | DBから取得 |
| `thisMonthDays` | 今月の参加日数 | 動的計算（attendance_summariesから当月分をCOUNT） |
| `thisWeekDays` | 今週の参加日数 | 動的計算（attendance_summariesから今週分をCOUNT） |

**エラーレスポンス:**
- `401`: 未認証
- `403`: 他人のデータにアクセス

---

### GET /api/v1/users/{userId}/attendance/summaries

日単位の参加サマリーを取得。カレンダーのマーカー表示用。

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `userId` | UUID | ユーザーID |

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `date_from` | string | - | 開始日（YYYY-MM-DD）、省略時は当月1日 |
| `date_to` | string | - | 終了日（YYYY-MM-DD）、省略時は当月末日 |

**認証:** JWT Cookie認証必須（👤 本人のみ）

**レスポンス例:**
```json
{
  "data": {
    "summaries": [
      { "date": "2025-01-06", "isMorningActive": true },
      { "date": "2025-01-07", "isMorningActive": true },
      { "date": "2025-01-08", "isMorningActive": true }
    ],
    "period": {
      "dateFrom": "2025-01-01",
      "dateTo": "2025-01-31"
    },
    "total": 14
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `400`: date_from > date_to（期間が不正）
- `401`: 未認証
- `403`: 他人のデータにアクセス

## 実装詳細

### Domain層

**データクラス（ランキング）:**
- `RankingUser` - ランキング用ユーザー情報（id, display_name, avatar_url, tagline）
- `RankingEntry` - ランキングエントリ（rank, user, current_title_level, score）
- `RankingList` - ランキング一覧（entries, total）
- `MonthlyRankingList` - 月間ランキング（year, month, entries, total）
- `CurrentUserRanking` - 自分のランキング情報（rank, score）
- `CurrentUserRankings` - 自分の全ランキング（monthly, total, streak）
- `AllRankingsResult` - 全ランキング結果
- `RankingFilter` - 検索条件

**データクラス（参加統計/サマリー）:**
- `AttendanceStatisticsResult` - 参加統計結果（total_attendance_days, current_streak_days, max_streak_days, this_month_days, this_week_days）
- `AttendanceSummaryItem` - 参加サマリーアイテム（date, is_morning_active）
- `DateRange` - 日付範囲（date_from, date_to）
- `AttendanceSummariesResult` - 参加サマリー結果（summaries, period, total）

**リポジトリインターフェース（IRankingRepository）:**
- `get_monthly_ranking()` - 月間ランキング取得
- `get_total_ranking()` - 総合ランキング取得
- `get_streak_ranking()` - 連続日数ランキング取得
- `get_user_monthly_ranking()` - ユーザーの月間順位取得
- `get_user_total_ranking()` - ユーザーの総合順位取得
- `get_user_streak_ranking()` - ユーザーの連続順位取得

**リポジトリインターフェース（IAttendanceRepository）:**
- `get_statistics()` - ユーザーの参加統計取得
- `get_summaries()` - ユーザーの参加サマリー取得

**ドメイン例外:**
- `InvalidMonthError` - 月が1-12の範囲外
- `InvalidDateRangeError` - 日付範囲が不正（date_from > date_to）
- `NotOwnAttendanceError` - 他人の参加データにアクセス

### Infrastructure層

**月間ランキングクエリ:**
- `attendance_summaries` から対象月の `is_morning_active = true` 日数をCOUNT
- `users`, `user_metadata`, `title_achievements` をJOIN

**総合ランキングクエリ:**
- `attendance_statistics.total_attendance_days` でソート
- `users`, `user_metadata`, `title_achievements` をJOIN

**連続日数ランキングクエリ:**
- `attendance_statistics.current_streak_days` でソート
- `users`, `user_metadata`, `title_achievements` をJOIN

**順位計算:**
- 同スコアの場合は登録日順（先勝ち）
- スコアが0の場合はrank=0（ランキング外）

**参加統計クエリ（AttendanceRepositoryImpl）:**
- 基本統計: `attendance_statistics` テーブルから取得
- 今月参加日数: `attendance_summaries` から当月 + `is_morning_active = true` をCOUNT
- 今週参加日数: `attendance_summaries` から今週（月曜始まり）+ `is_morning_active = true` をCOUNT

**参加サマリークエリ:**
- `attendance_summaries` から指定期間 + `is_morning_active = true` を取得
- 日付昇順でソート

### Application層

**DTO（ランキング）:**
- `RankingUserDTO` / `RankingEntryDTO` - ランキング情報
- `RankingListDTO` / `MonthlyRankingListDTO` - ランキング一覧
- `CurrentUserRankingDTO` / `CurrentUserRankingsDTO` - 自分のランキング
- `AllRankingsDTO` - 全ランキング

**DTO（参加統計/サマリー）:**
- `AttendanceStatisticsDTO` - 参加統計DTO
- `AttendanceSummaryItemDTO` - 参加サマリーアイテムDTO
- `AttendanceSummaryPeriodDTO` - 参加サマリー期間DTO
- `AttendanceSummariesDTO` - 参加サマリー結果DTO

**Usecaseメソッド（RankingUsecase）:**
- `get_all_rankings()` - 全ランキング一括取得
- `get_my_rankings()` - 自分のランキング情報取得

**Usecaseメソッド（AttendanceUsecase）:**
- `get_statistics()` - 参加統計取得（本人チェック + ゼロ値フォールバック）
- `get_summaries()` - 参加サマリー取得（本人チェック + 日付バリデーション）

### Presentation層

**スキーマ（ランキング）:**
- `RankingUserResponse` / `RankingEntryResponse` - ランキング情報
- `RankingListResponse` / `MonthlyRankingListResponse` - ランキング一覧
- `CurrentUserRankingResponse` / `CurrentUserRankingsResponse` - 自分のランキング
- `AllRankingsDataResponse` / `AllRankingsAPIResponse` - 全ランキング
- `MyRankingsAPIResponse` - 自分のランキング

**スキーマ（参加統計/サマリー）:**
- `AttendanceStatisticsResponse` / `AttendanceStatisticsAPIResponse` - 参加統計
- `AttendanceSummaryItemResponse` / `AttendanceSummaryPeriodResponse` - サマリーアイテム・期間
- `AttendanceSummariesDataResponse` / `AttendanceSummariesAPIResponse` - 参加サマリー

**APIルーター:**
- `router` (`/rankings`) - ランキング関連API
- `users_attendance_router` (`/users`) - ユーザー参加情報API

### DI層

- `get_ranking_usecase()` - RankingUsecaseの依存性注入
- `get_attendance_usecase()` - AttendanceUsecaseの依存性注入

## 関連ドキュメント

- `docs/tasks/public/plan/ranking-api-design.md` - ランキングAPI設計書
- `docs/tasks/public/plan/attendance-activity-api-design.md` - 参加統計/サマリーAPI設計書
- `docs/requirements/12-api.md` - API設計書（Attendance Management セクション）
