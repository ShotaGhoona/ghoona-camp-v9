# API Implementation Checklist

## Overview

Ghoona Camp アプリケーションのAPI実装進捗を追跡するためのチェックリストです。

- **Total APIs**: 39
- **Total Tasks**: 78 (Backend + Frontend)
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

## User Management (7 APIs)

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
| 13 | GET | `/goals/me` | [ ] | [ ] |
| 14 | GET | `/goals/public` | [ ] | [ ] |
| 15 | POST | `/goals` | [ ] | [ ] |
| 16 | PUT | `/goals/{goalId}` | [ ] | [ ] |
| 17 | DELETE | `/goals/{goalId}` | [ ] | [ ] |

---

## Event Management (7 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 18 | GET | `/events` | [ ] | [ ] |
| 19 | POST | `/events` | [ ] | [ ] |
| 20 | GET | `/events/{eventId}` | [ ] | [ ] |
| 21 | PUT | `/events/{eventId}` | [ ] | [ ] |
| 22 | DELETE | `/events/{eventId}` | [ ] | [ ] |
| 23 | POST | `/events/{eventId}/participants` | [ ] | [ ] |
| 24 | PUT | `/events/{eventId}/participants/{userId}` | [ ] | [ ] |

---

## Title Management (4 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 25 | GET | `/titles` | [ ] | [ ] |
| 26 | GET | `/titles/{titleId}` | [ ] | [ ] |
| 27 | GET | `/users/{userId}/achievements` | [ ] | [ ] |
| 28 | PUT | `/users/{userId}/achievements/{titleId}` | [ ] | [ ] |

---

## Attendance Management (5 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 29 | GET | `/users/{userId}/attendance/summaries` | [ ] | [ ] |
| 30 | GET | `/users/{userId}/attendance/statistics` | [ ] | [ ] |
| 31 | GET | `/ranking/monthly` | [ ] | [ ] |
| 32 | GET | `/ranking/total` | [ ] | [ ] |
| 33 | GET | `/ranking/streak` | [ ] | [ ] |

---

## Notification Management (5 APIs)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 34 | GET | `/users/{userId}/notifications` | [ ] | [ ] |
| 35 | PUT | `/notifications/{notificationId}` | [ ] | [ ] |
| 36 | DELETE | `/notifications/{notificationId}` | [ ] | [ ] |
| 37 | GET | `/users/{userId}/notification-settings` | [ ] | [ ] |
| 38 | PUT | `/users/{userId}/notification-settings` | [ ] | [ ] |

---

## System API (1 API)

| # | Method | Endpoint | Backend | Frontend |
|---|--------|----------|---------|----------|
| 39 | GET | `/health` | [ ] | [ ] |

---

## Progress Summary

| Category | APIs | Backend Done | Frontend Done |
|----------|------|--------------|---------------|
| Authentication | 4 | 3/4 | 3/4 |
| User Management | 7 | 7/7 | 7/7 |
| Goal Management | 5 | 0/5 | 0/5 |
| Event Management | 7 | 0/7 | 0/7 |
| Title Management | 4 | 0/4 | 0/4 |
| Attendance Management | 5 | 0/5 | 0/5 |
| Notification Management | 5 | 0/5 | 0/5 |
| System API | 1 | 0/1 | 0/1 |
| **Total** | **39** | **10/39** | **10/39** |

---

## Related Reports

- `docs/tasks/report/21-user-domain-backend.md` - User Domain バックエンド実装レポート
- `docs/tasks/report/22-user-domain-frontend.md` - User Domain フロントエンド実装レポート
