# Ranking API 設計

## 概要

ランキング機能のAPI設計。参加記録（Attendance）ドメインに属し、月間・総合・連続の3種類のランキングを提供する。

UIは3種類のランキングを同時に表示するため、**一括取得API**を採用しパフォーマンスを最適化する。

## データ責務分離

| データ | 保持場所 | テーブル |
|--------|----------|----------|
| 総参加日数 | **バックエンド** | `attendance_statistics.total_attendance_days` |
| 連続参加日数 | **バックエンド** | `attendance_statistics.current_streak_days` |
| 月間参加日数 | **バックエンド** | `attendance_summaries` から集計 |
| ユーザー情報 | **バックエンド** | `users`, `user_metadata` |
| 称号情報 | **バックエンド** | `title_achievements` |

## DBテーブル（既存）

### attendance_statistics

| カラム名 | 型 | 説明 |
|---------|---|------|
| user_id | UUID | ユーザーID |
| total_attendance_days | INTEGER | 総参加日数 |
| current_streak_days | INTEGER | 現在の連続日数 |
| max_streak_days | INTEGER | 最大連続日数 |
| last_attendance_date | DATE | 最終参加日 |

### attendance_summaries

| カラム名 | 型 | 説明 |
|---------|---|------|
| user_id | UUID | ユーザーID |
| date | DATE | 参加日 |
| is_morning_active | BOOLEAN | 朝活参加フラグ |

月間参加日数は `attendance_summaries` から対象月の `is_morning_active = true` の日数をCOUNTして算出。

## APIエンドポイント

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/rankings` | 3種類のランキングを一括取得 | 🔐 |
| GET | `/rankings/me` | 自分のランキング情報を取得 | 🔐 |

**備考:** 12-api.md では `/ranking/monthly`, `/ranking/total`, `/ranking/streak` と個別エンドポイントが定義されていたが、UIが3つ同時に表示するため一括取得APIに変更。

## API詳細

### GET /rankings

3種類のランキングを一括取得。ランキングページのメインAPI。

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | - | 月間ランキングの対象年（default: 現在年） |
| `month` | int | - | 月間ランキングの対象月（1-12、default: 現在月） |
| `limit` | int | - | 各ランキングの取得件数（default: 50, max: 100） |

**Response:**
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
            "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka"
          },
          "currentTitleLevel": 8,
          "score": 16
        },
        {
          "rank": 2,
          "user": {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "displayName": "清水凛",
            "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=shimizu"
          },
          "currentTitleLevel": 8,
          "score": 16
        }
      ],
      "total": 17
    },
    "total": {
      "entries": [
        {
          "rank": 1,
          "user": {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "displayName": "田中二郎",
            "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka"
          },
          "currentTitleLevel": 8,
          "score": 312
        }
      ],
      "total": 17
    },
    "streak": {
      "entries": [
        {
          "rank": 1,
          "user": {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "displayName": "清水凛",
            "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=shimizu"
          },
          "currentTitleLevel": 8,
          "score": 100
        }
      ],
      "total": 17
    },
    "currentUser": {
      "monthly": {
        "rank": 8,
        "score": 12
      },
      "total": {
        "rank": 8,
        "score": 156
      },
      "streak": {
        "rank": 10,
        "score": 23
      }
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**エラーレスポンス:**
- `401`: 未認証
- `400`: month が 1-12 の範囲外

### GET /rankings/me

ログインユーザー自身のランキング情報のみを取得。軽量API。

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `year` | int | - | 月間ランキングの対象年（default: 現在年） |
| `month` | int | - | 月間ランキングの対象月（1-12、default: 現在月） |

**Response:**
```json
{
  "data": {
    "monthly": {
      "rank": 8,
      "score": 12
    },
    "total": {
      "rank": 8,
      "score": 156
    },
    "streak": {
      "rank": 10,
      "score": 23
    }
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

## 実装詳細

### Domain層

**データクラス:**
- `RankingUser` - ランキング用ユーザー情報（id, display_name, avatar_url）
- `RankingEntry` - ランキングエントリ（rank, user, current_title_level, score）
- `RankingList` - ランキング一覧（entries, total）
- `MonthlyRankingList` - 月間ランキング（year, month, entries, total）
- `CurrentUserRanking` - 自分のランキング情報（rank, score）
- `CurrentUserRankings` - 自分の3種ランキング（monthly, total, streak）
- `AllRankingsResult` - 全ランキング結果（monthly, total, streak, current_user）
- `RankingFilter` - ランキング検索条件（year, month, limit）

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
```sql
-- attendance_summariesから月間参加日数を集計
SELECT
  u.id,
  um.display_name,
  u.avatar_url,
  MAX(ta.title_level) AS current_title_level,
  COUNT(DISTINCT s.date) AS score
FROM users u
LEFT JOIN user_metadata um ON u.id = um.user_id
LEFT JOIN title_achievements ta ON u.id = ta.user_id
LEFT JOIN attendance_summaries s ON u.id = s.user_id
  AND s.date >= :month_start
  AND s.date <= :month_end
  AND s.is_morning_active = true
WHERE u.is_active = true
GROUP BY u.id, um.display_name, u.avatar_url
HAVING COUNT(DISTINCT s.date) > 0
ORDER BY score DESC, u.created_at ASC
LIMIT :limit
```

**総合ランキングクエリ:**
```sql
SELECT
  u.id,
  um.display_name,
  u.avatar_url,
  MAX(ta.title_level) AS current_title_level,
  COALESCE(ast.total_attendance_days, 0) AS score
FROM users u
LEFT JOIN user_metadata um ON u.id = um.user_id
LEFT JOIN title_achievements ta ON u.id = ta.user_id
LEFT JOIN attendance_statistics ast ON u.id = ast.user_id
WHERE u.is_active = true
  AND COALESCE(ast.total_attendance_days, 0) > 0
ORDER BY score DESC, u.created_at ASC
LIMIT :limit
```

**連続日数ランキングクエリ:**
```sql
SELECT
  u.id,
  um.display_name,
  u.avatar_url,
  MAX(ta.title_level) AS current_title_level,
  COALESCE(ast.current_streak_days, 0) AS score
FROM users u
LEFT JOIN user_metadata um ON u.id = um.user_id
LEFT JOIN title_achievements ta ON u.id = ta.user_id
LEFT JOIN attendance_statistics ast ON u.id = ast.user_id
WHERE u.is_active = true
  AND COALESCE(ast.current_streak_days, 0) > 0
ORDER BY score DESC, u.created_at ASC
LIMIT :limit
```

**順位計算:**
順位はランキングリスト内の位置で決定。同スコアの場合は登録日順（先勝ち）。

### Application層

**DTO:**
- `RankingUserDTO` - ランキング用ユーザーDTO
- `RankingEntryDTO` - ランキングエントリDTO
- `RankingListDTO` - ランキング一覧DTO
- `MonthlyRankingListDTO` - 月間ランキングDTO
- `CurrentUserRankingDTO` - 自分のランキングDTO
- `AllRankingsDTO` - 全ランキングDTO

**Usecaseメソッド:**
- `get_all_rankings()` - 全ランキング一括取得
- `get_my_rankings()` - 自分のランキング情報取得

### Presentation層

**スキーマ:**
- `RankingUserResponse` - ユーザー情報レスポンス
- `RankingEntryResponse` - エントリレスポンス
- `RankingListResponse` - ランキング一覧レスポンス
- `MonthlyRankingListResponse` - 月間ランキングレスポンス
- `CurrentUserRankingResponse` - 自分のランキングレスポンス
- `AllRankingsAPIResponse` - 全ランキングレスポンス
- `MyRankingsAPIResponse` - 自分のランキングレスポンス

### DI層

- `get_ranking_usecase()` - RankingUsecaseの依存性注入

## 変更ファイル（予定）

```
backend/app/
├── domain/
│   ├── repositories/
│   │   └── ranking_repository.py            # リポジトリI/F・データクラス
│   └── exceptions/
│       └── ranking.py                       # ランキング例外
├── infrastructure/
│   └── db/
│       └── repositories/
│           └── ranking_repository_impl.py   # リポジトリ実装
├── application/
│   ├── schemas/
│   │   └── ranking_schemas.py               # DTO
│   └── use_cases/
│       └── ranking_usecase.py               # ユースケース
├── presentation/
│   ├── api/
│   │   └── ranking_api.py                   # ランキングAPI
│   └── schemas/
│       └── ranking_schemas.py               # リクエスト/レスポンス
├── di/
│   └── ranking.py                           # 依存性注入
└── main.py                                  # ルーター登録
```

## フロントエンド実装

### 必要なhooks

| hook | 用途 | React Query |
|------|------|-------------|
| `useRankings` | 全ランキング一括取得 | useQuery |
| `useMyRankings` | 自分のランキング取得（オプショナル） | useQuery |

### 型定義

```typescript
// entities/domain/ranking/model/types.ts

/** ランキングタイプ */
export type RankingType = 'monthly' | 'total' | 'streak';

/** ランキング用ユーザー情報 */
export type RankingUser = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};

/** ランキングエントリ */
export type RankingEntry = {
  rank: number;
  user: RankingUser;
  currentTitleLevel: number | null;
  score: number;
};

/** ランキング一覧 */
export type RankingList = {
  entries: RankingEntry[];
  total: number;
};

/** 月間ランキング */
export type MonthlyRankingList = RankingList & {
  year: number;
  month: number;
};

/** 自分のランキング情報 */
export type CurrentUserRanking = {
  rank: number;
  score: number;
};

/** 全ランキングレスポンス */
export type AllRankingsResponse = {
  data: {
    monthly: MonthlyRankingList;
    total: RankingList;
    streak: RankingList;
    currentUser: {
      monthly: CurrentUserRanking;
      total: CurrentUserRanking;
      streak: CurrentUserRanking;
    };
  };
  message: string;
  timestamp: string;
};
```

## 12-api.md との差分

| 現行（12-api.md） | 提案 | 理由 |
|------------------|------|------|
| `GET /ranking/monthly` | `GET /rankings` に統合 | UIが3種類同時表示するため |
| `GET /ranking/total` | `GET /rankings` に統合 | 同上 |
| `GET /ranking/streak` | `GET /rankings` に統合 | 同上 |
| - | `currentUser` をレスポンスに含める | ヘッダーに自分の順位表示のため |
| `month` パラメータのみ | `year`, `month` パラメータ | 年をまたぐ場合に対応 |

## UI連携ポイント

### ヘッダー表示（自分のスコア・順位）
- `currentUser.monthly.score` / `currentUser.monthly.rank`
- `currentUser.total.score` / `currentUser.total.rank`
- `currentUser.streak.score` / `currentUser.streak.rank`

### トップ3表示
- `entries.filter(e => e.rank <= 3)` で取得

### 4位以下表示
- `entries.filter(e => e.rank > 3)` で取得

### 自分のエントリ強調
- `entries.find(e => e.user.id === currentUserId)` で特定

### 称号表示
- `currentTitleLevel` を使用して `TITLE_MASTER[level - 1]` で称号情報取得
