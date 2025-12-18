# Test Implementation Checklist

## Overview

Ghoona Camp アプリケーションのテスト実装進捗を追跡するためのチェックリストです。

- **Backend**: pytest
- **Frontend**: Vitest / React Testing Library / Playwright

## Legend

- [ ] Not started
- [x] Completed
- [-] N/A (対象外)

---

## Backend Tests

### Unit Tests - Domain Layer

| # | Domain | Entity | Repository I/F | Exception | Status |
|---|--------|--------|----------------|-----------|--------|
| 1 | User | [ ] | [ ] | [ ] | 0/3 |
| 2 | Goal | [ ] | [ ] | [ ] | 0/3 |
| 3 | Event | [ ] | [ ] | [ ] | 0/3 |
| 4 | Title | [ ] | [ ] | [ ] | 0/3 |
| 5 | Attendance | [ ] | [ ] | [ ] | 0/3 |
| 6 | Notification | [ ] | [ ] | [ ] | 0/3 |

### Unit Tests - Application Layer

| # | Domain | UseCase | DTO/Schema | Status |
|---|--------|---------|------------|--------|
| 1 | Auth | [ ] | [ ] | 0/2 |
| 2 | User | [ ] | [ ] | 0/2 |
| 3 | Goal | [ ] | [ ] | 0/2 |
| 4 | Event | [ ] | [ ] | 0/2 |
| 5 | Title | [ ] | [ ] | 0/2 |
| 6 | Attendance | [ ] | [ ] | 0/2 |
| 7 | Notification | [ ] | [ ] | 0/2 |

### Integration Tests - Infrastructure Layer

| # | Domain | Repository Impl | External Service | Status |
|---|--------|-----------------|------------------|--------|
| 1 | User | [ ] | [-] | 0/1 |
| 2 | Goal | [ ] | [-] | 0/1 |
| 3 | Event | [ ] | [-] | 0/1 |
| 4 | Title | [ ] | [-] | 0/1 |
| 5 | Attendance | [ ] | [-] | 0/1 |
| 6 | Notification | [ ] | [-] | 0/1 |
| 7 | Security (JWT) | [ ] | [-] | 0/1 |

### API Tests - Presentation Layer

| # | Domain | Endpoint Tests | Auth Tests | Validation Tests | Status |
|---|--------|----------------|------------|------------------|--------|
| 1 | Auth | [ ] | [ ] | [ ] | 0/3 |
| 2 | User | [ ] | [ ] | [ ] | 0/3 |
| 3 | Goal | [ ] | [ ] | [ ] | 0/3 |
| 4 | Event | [ ] | [ ] | [ ] | 0/3 |
| 5 | Title | [ ] | [ ] | [ ] | 0/3 |
| 6 | Attendance | [ ] | [ ] | [ ] | 0/3 |
| 7 | Ranking | [ ] | [ ] | [ ] | 0/3 |
| 8 | Notification | [ ] | [ ] | [ ] | 0/3 |

---

## Frontend Tests

### Unit Tests - Entities

| # | Domain | Types | API Client | Status |
|---|--------|-------|------------|--------|
| 1 | User | [ ] | [ ] | 0/2 |
| 2 | Goal | [ ] | [ ] | 0/2 |
| 3 | Event | [ ] | [ ] | 0/2 |
| 4 | Title | [ ] | [ ] | 0/2 |
| 5 | Attendance | [ ] | [ ] | 0/2 |
| 6 | Notification | [ ] | [ ] | 0/2 |

### Unit Tests - Features (Hooks)

| # | Domain | Query Hooks | Mutation Hooks | Status |
|---|--------|-------------|----------------|--------|
| 1 | Auth | [ ] | [ ] | 0/2 |
| 2 | User | [ ] | [ ] | 0/2 |
| 3 | Goal | [ ] | [ ] | 0/2 |
| 4 | Event | [ ] | [ ] | 0/2 |
| 5 | Title | [ ] | [ ] | 0/2 |
| 6 | Attendance | [ ] | [ ] | 0/2 |
| 7 | Notification | [ ] | [ ] | 0/2 |

### Component Tests - Widgets

| # | Widget | Render Test | Interaction Test | Status |
|---|--------|-------------|------------------|--------|
| 1 | MemberDetailModal | [ ] | [ ] | 0/2 |
| 2 | TitleDetailModal | [ ] | [ ] | 0/2 |
| 3 | EventDetailModal | [ ] | [ ] | 0/2 |
| 4 | GoalDetailModal | [ ] | [ ] | 0/2 |
| 5 | CalendarViewWidget | [ ] | [ ] | 0/2 |
| 6 | TimelineViewWidget | [ ] | [ ] | 0/2 |
| 7 | GalleryViewWidget | [ ] | [ ] | 0/2 |
| 8 | ThemeSheet | [ ] | [ ] | 0/2 |

### Component Tests - Page Components

| # | Page | Render Test | Integration Test | Status |
|---|------|-------------|------------------|--------|
| 1 | Members | [ ] | [ ] | 0/2 |
| 2 | Ranking | [ ] | [ ] | 0/2 |
| 3 | Titles | [ ] | [ ] | 0/2 |
| 4 | Events | [ ] | [ ] | 0/2 |
| 5 | Goals | [ ] | [ ] | 0/2 |
| 6 | Activity | [ ] | [ ] | 0/2 |
| 7 | Dashboard | [ ] | [ ] | 0/2 |
| 8 | Settings | [ ] | [ ] | 0/2 |

---

## E2E Tests (Playwright)

### Authentication Flow

| # | Scenario | Status |
|---|----------|--------|
| 1 | ユーザー登録 | [ ] |
| 2 | ログイン | [ ] |
| 3 | ログアウト | [ ] |
| 4 | 認証状態の維持 | [ ] |
| 5 | 未認証リダイレクト | [ ] |

### User Journeys

| # | Scenario | Status |
|---|----------|--------|
| 1 | メンバー検索 → 詳細表示 → ライバル設定 | [ ] |
| 2 | ランキング閲覧 → メンバー詳細表示 | [ ] |
| 3 | 目標作成 → 編集 → 削除 | [ ] |
| 4 | イベント一覧 → 参加申込 → キャンセル | [ ] |
| 5 | 称号一覧 → 詳細表示 → 保持者確認 | [ ] |
| 6 | 参加履歴確認 → カレンダー操作 | [ ] |
| 7 | プロフィール編集 → 保存 | [ ] |
| 8 | テーマ変更 → 永続化確認 | [ ] |

### Cross-Browser Testing

| # | Browser | Status |
|---|---------|--------|
| 1 | Chrome | [ ] |
| 2 | Firefox | [ ] |
| 3 | Safari | [ ] |
| 4 | Mobile Chrome | [ ] |
| 5 | Mobile Safari | [ ] |

---

## Progress Summary

### Backend

| Category | Items | Done |
|----------|-------|------|
| Unit Tests - Domain | 18 | 0/18 |
| Unit Tests - Application | 14 | 0/14 |
| Integration Tests | 7 | 0/7 |
| API Tests | 24 | 0/24 |
| **Total** | **63** | **0/63** |

### Frontend

| Category | Items | Done |
|----------|-------|------|
| Unit Tests - Entities | 12 | 0/12 |
| Unit Tests - Features | 14 | 0/14 |
| Component Tests - Widgets | 16 | 0/16 |
| Component Tests - Pages | 16 | 0/16 |
| **Total** | **58** | **0/58** |

### E2E

| Category | Items | Done |
|----------|-------|------|
| Authentication | 5 | 0/5 |
| User Journeys | 8 | 0/8 |
| Cross-Browser | 5 | 0/5 |
| **Total** | **18** | **0/18** |

---

## Test Configuration Status

| Item | Backend | Frontend |
|------|---------|----------|
| Test Framework Setup | [ ] | [ ] |
| CI Integration | [ ] | [ ] |
| Coverage Report | [ ] | [ ] |
| Test DB Setup | [ ] | [-] |
| Mock Server | [-] | [ ] |
