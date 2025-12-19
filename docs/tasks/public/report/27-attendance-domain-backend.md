# Attendance Domain（ランキング）バックエンド実装レポート

## 概要

Attendanceドメインのランキング機能API（`GET /rankings`、`GET /rankings/me`）をオニオンアーキテクチャに従って実装。

月間・総合・連続日数の3種類のランキングを一括取得し、ログインユーザーの順位情報も含めて返却する。

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

## 実装詳細

### Domain層

**データクラス:**
- `RankingUser` - ランキング用ユーザー情報（id, display_name, avatar_url, tagline）
- `RankingEntry` - ランキングエントリ（rank, user, current_title_level, score）
- `RankingList` - ランキング一覧（entries, total）
- `MonthlyRankingList` - 月間ランキング（year, month, entries, total）
- `CurrentUserRanking` - 自分のランキング情報（rank, score）
- `CurrentUserRankings` - 自分の全ランキング（monthly, total, streak）
- `AllRankingsResult` - 全ランキング結果
- `RankingFilter` - 検索条件

**リポジトリインターフェース:**
- `get_monthly_ranking()` - 月間ランキング取得
- `get_total_ranking()` - 総合ランキング取得
- `get_streak_ranking()` - 連続日数ランキング取得
- `get_user_monthly_ranking()` - ユーザーの月間順位取得
- `get_user_total_ranking()` - ユーザーの総合順位取得
- `get_user_streak_ranking()` - ユーザーの連続順位取得

**ドメイン例外:**
- `InvalidMonthError` - 月が1-12の範囲外

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

### Application層

**DTO:**
- `RankingUserDTO` / `RankingEntryDTO` - ランキング情報
- `RankingListDTO` / `MonthlyRankingListDTO` - ランキング一覧
- `CurrentUserRankingDTO` / `CurrentUserRankingsDTO` - 自分のランキング
- `AllRankingsDTO` - 全ランキング

**Usecaseメソッド:**
- `get_all_rankings()` - 全ランキング一括取得
- `get_my_rankings()` - 自分のランキング情報取得

### Presentation層

**スキーマ:**
- `RankingUserResponse` / `RankingEntryResponse` - ランキング情報
- `RankingListResponse` / `MonthlyRankingListResponse` - ランキング一覧
- `CurrentUserRankingResponse` / `CurrentUserRankingsResponse` - 自分のランキング
- `AllRankingsDataResponse` / `AllRankingsAPIResponse` - 全ランキング
- `MyRankingsAPIResponse` - 自分のランキング

### DI層

- `get_ranking_usecase()` - RankingUsecaseの依存性注入

## 関連ドキュメント

- `docs/tasks/public/plan/ranking-api-design.md` - API設計書
- `docs/requirements/12-api.md` - API設計書（Attendance Management セクション）

## 備考

ファイル名は `attendance_*` だが、現在はランキング機能のみ実装。
将来的に以下のAPIが追加される予定：
- `GET /users/{userId}/attendance/summaries` - カレンダー表示用
- `GET /users/{userId}/attendance/statistics` - 参加統計
