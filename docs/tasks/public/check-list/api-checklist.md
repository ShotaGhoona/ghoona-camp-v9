# API Implementation Checklist

## Overview

Ghoona Camp アプリケーションのAPI実装進捗を追跡するためのチェックリストです。

- **Total APIs**: 37
- **Total Tasks**: 74 (Backend + Frontend)
- **Reference**: `docs/requirements/12-api.md`

## Legend

- [ ] Not started
- [x] Completed

---

## Authentication (4 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 1 | POST | `/auth/register` | [ ] | [ ] |
| 2 | POST | `/auth/login` | [x] | [x] |
| 3 | POST | `/auth/logout` | [x] | [x] |
| 4 | GET | `/auth/me` | [x] | [x] |

---

## User Management (8 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 5 | GET | `/users` | [x] | [x] |
| 6 | GET | `/users/skills` | [x] | [x] |
| 7 | GET | `/users/interests` | [x] | [x] |
| 8 | GET | `/users/{userId}` | [x] | [x] |
| 9 | PUT | `/users/{userId}` | [x] | [x] |
| 10 | GET | `/users/{userId}/rivals` | [x] | [x] |
| 11 | POST | `/users/{userId}/rivals` | [x] | [x] |
| 12 | DELETE | `/users/{userId}/rivals/{rivalId}` | [x] | [x] |

---

## Goal Management (5 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 13 | GET | `/goals/me` | [x] | [x] |
| 14 | GET | `/goals/public` | [x] | [x] |
| 15 | POST | `/goals` | [x] | [x] |
| 16 | PUT | `/goals/{goalId}` | [x] | [x] |
| 17 | DELETE | `/goals/{goalId}` | [x] | [x] |

---

## Event Management (7 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 18 | GET | `/events` | [x] | [x] |
| 19 | POST | `/events` | [x] | [x] |
| 20 | GET | `/events/{eventId}` | [x] | [x] |
| 21 | PUT | `/events/{eventId}` | [x] | [x] |
| 22 | DELETE | `/events/{eventId}` | [x] | [x] |
| 23 | POST | `/events/{eventId}/participants` | [x] | [x] |
| 24 | DELETE | `/events/{eventId}/participants` | [x] | [x] |

---

## Title Management (2 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 25 | GET | `/titles/{level}/holders` | [x] | [x] |
| 26 | GET | `/users/{userId}/title-achievements` | [x] | [x] |

---

## Attendance Management (4 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 27 | GET | `/rankings` | [x] | [x] |
| 28 | GET | `/rankings/me` | [x] | [x] |
| 29 | GET | `/users/{userId}/attendance/summaries` | [ ] | [ ] |
| 30 | GET | `/users/{userId}/attendance/statistics` | [ ] | [ ] |

---

## Notification Management (5 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 31 | GET | `/users/{userId}/notifications` | [ ] | [ ] |
| 32 | PUT | `/notifications/{notificationId}` | [ ] | [ ] |
| 33 | DELETE | `/notifications/{notificationId}` | [ ] | [ ] |
| 34 | GET | `/users/{userId}/notification-settings` | [ ] | [ ] |
| 35 | PUT | `/users/{userId}/notification-settings` | [ ] | [ ] |

---

## System API (2 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 36 | GET | `/health` | [ ] | [ ] |
| 37 | GET | `/version` | [ ] | [ ] |

---

## Progress Summary

| Category | APIs | Backend Done | Frontend Done |
|----------|------|--------------|---------------|
| Authentication | 4 | 3/4 | 3/4 |
| User Management | 8 | 8/8 | 8/8 |
| Goal Management | 5 | 5/5 | 5/5 |
| Event Management | 7 | 7/7 | 7/7 |
| Title Management | 2 | 2/2 | 2/2 |
| Attendance Management | 4 | 2/4 | 2/4 |
| Notification Management | 5 | 0/5 | 0/5 |
| System API | 2 | 0/2 | 0/2 |
| **Total** | **37** | **27/37** | **27/37** |

---

## Related Reports

- `docs/tasks/public/report/21-user-domain-backend.md` - User Domain バックエンド実装レポート
- `docs/tasks/public/report/22-user-domain-frontend.md` - User Domain フロントエンド実装レポート
- `docs/tasks/public/report/23-goal-domain-backend.md` - Goal Domain バックエンド実装レポート
- `docs/tasks/public/report/24-goal-domain-frontend.md` - Goal Domain フロントエンド実装レポート
- `docs/tasks/public/report/25-title-domain-backend.md` - Title Domain バックエンド実装レポート
- `docs/tasks/public/report/26-title-domain-frontend.md` - Title Domain フロントエンド実装レポート
- `docs/tasks/public/report/27-attendance-domain-backend.md` - Attendance Domain バックエンド実装レポート
- `docs/tasks/public/report/28-attendance-domain-frontend.md` - Attendance Domain フロントエンド実装レポート
- `docs/tasks/public/report/29-event-domain-backend.md` - Event Domain バックエンド実装レポート
- `docs/tasks/public/report/30-event-domain-frontend.md` - Event Domain フロントエンド実装レポート
