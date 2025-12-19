# Title API 設計

## 概要

称号（タイトル）機能のAPI設計。称号マスターデータはフロントエンドで管理し、バックエンドは獲得実績・保持者情報のみを管理する。

**現在の称号は自動決定**: 獲得済みの最高レベルの称号が自動的に現在の称号となる。手動での変更機能は不要。

## データ責務分離

| データ | 保持場所 | 理由 |
|--------|----------|------|
| 称号マスター（名前、説明、必要日数、色テーマ等） | **フロントエンド** (`TITLE_MASTER`) | 静的データ、変更頻度低い |
| 誰が何を獲得したか（実績） | **バックエンド** (`title_achievements`) | 動的データ、認証が必要 |
| 参加日数（称号計算の元データ） | **バックエンド** (`attendance_statistics`) | Discord連携で自動記録 |

## DBテーブル

### title_achievements

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PRIMARY KEY | 実績ID |
| user_id | UUID | REFERENCES users(id) | ユーザーID |
| title_level | INTEGER | NOT NULL CHECK (1-8) | 称号レベル (1-8) |
| achieved_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 獲得日時 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新日時 |

**制約:**
- UNIQUE(user_id, title_level) - 同一称号の重複獲得を防ぐ

**備考:**
- `is_current`カラムは不要（最高レベルが自動的に現在の称号）

## APIエンドポイント

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/titles/{level}/holders` | 指定レベルの保持者一覧を取得 | 🔐 |
| GET | `/users/{userId}/title-achievements` | ユーザーの称号実績を取得 | 🔐 |

## API詳細

### GET /titles/{level}/holders

指定レベルの称号保持者一覧を取得。称号詳細モーダルで使用。

**パスパラメータ:**
- `level` (integer, 必須): 称号レベル (1-8)

**Response:**
```json
{
  "data": {
    "level": 5,
    "holders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "displayName": "山田太郎",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada",
        "achievedAt": "2024-06-20T00:00:00+00:00"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "displayName": "鈴木花子",
        "avatarUrl": null,
        "achievedAt": "2024-05-10T00:00:00+00:00"
      }
    ],
    "total": 5
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

### GET /users/{userId}/title-achievements

ユーザーの称号実績を取得。タイトルページのユーザー進捗表示に使用。

**パスパラメータ:**
- `userId` (string, 必須): ユーザーID

**Response:**
```json
{
  "data": {
    "currentTitleLevel": 5,
    "totalAttendanceDays": 134,
    "achievements": [
      {
        "titleLevel": 1,
        "achievedAt": "2024-01-01T00:00:00+00:00"
      },
      {
        "titleLevel": 2,
        "achievedAt": "2024-01-08T00:00:00+00:00"
      },
      {
        "titleLevel": 3,
        "achievedAt": "2024-02-01T00:00:00+00:00"
      },
      {
        "titleLevel": 4,
        "achievedAt": "2024-03-01T00:00:00+00:00"
      },
      {
        "titleLevel": 5,
        "achievedAt": "2024-05-10T00:00:00+00:00"
      }
    ]
  },
  "message": "success",
  "timestamp": "2025-01-21T10:00:00+00:00"
}
```

**備考:**
- `totalAttendanceDays`は`attendance_statistics`テーブルから取得
- `currentTitleLevel`は獲得済みの最高レベル（MAX(title_level)）
- フロントエンドでは`TITLE_MASTER`と組み合わせて以下を計算:
  - `currentTitle`: `TITLE_MASTER[currentTitleLevel - 1]`
  - `nextTitle`: `TITLE_MASTER[currentTitleLevel]` (level < 8の場合)
  - `daysToNextTitle`: `nextTitle.requiredDays - totalAttendanceDays`
  - `progressPercentage`: 進捗計算

## フロントエンド実装

### 必要なhooks

| hook | 用途 | React Query |
|------|------|-------------|
| `useTitleHolders` | 指定レベルの保持者一覧取得 | useQuery |
| `useUserTitleAchievements` | ユーザーの称号実績取得 | useQuery |

### 型定義

```typescript
// entities/domain/title/model/types.ts

/** 称号保持者 */
export type TitleHolder = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  achievedAt: string;
};

/** ユーザー称号実績 */
export type UserTitleAchievement = {
  titleLevel: TitleLevel;
  achievedAt: string;
};

/** ユーザー称号進捗（API Response） */
export type UserTitleAchievementsResponse = {
  data: {
    currentTitleLevel: TitleLevel;
    totalAttendanceDays: number;
    achievements: UserTitleAchievement[];
  };
  message: string;
  timestamp: string;
};
```

## 現行API設計（12-api.md）との差分

| 現行 | 提案 | 理由 |
|------|------|------|
| `GET /titles` | 削除 | マスターデータはフロント管理 |
| `GET /titles/{titleId}` | `GET /titles/{level}/holders` | titleIdではなくlevel(1-8)を使用、保持者一覧を返す |
| `GET /users/{userId}/achievements` | `GET /users/{userId}/title-achievements` | 明確な命名 |
| `PUT /users/{userId}/achievements/{titleId}` | 削除 | 現在の称号は自動決定のため不要 |

## 称号レベル対応表

フロントエンドの`TITLE_MASTER`で定義:

| Level | 日本語名 | 英語名 | 必要日数 |
|-------|---------|--------|---------|
| 1 | まどろみ見習い | Sleeper | 0 |
| 2 | 夜明けの旅人 | Dawn Wanderer | 7 |
| 3 | 朝焼け探検家 | Aurora Scout | 30 |
| 4 | サンライズ職人 | Sunrise Crafter | 60 |
| 5 | 太陽追い | Sun Chaser | 100 |
| 6 | 暁の達人 | Daybreak Master | 150 |
| 7 | 曙光の守護者 | Aurora Guardian | 250 |
| 8 | 太陽賢者 | Solar Sage | 365 |
