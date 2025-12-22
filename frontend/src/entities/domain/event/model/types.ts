/**
 * Event Entity - 型定義
 * バックエンドAPIレスポンスに基づく
 */

// 基本型はshared/domainから再エクスポート
import type {
  EventType,
  RecurrencePattern,
} from '@/shared/domain/event/model/types';

export type { EventType, RecurrencePattern };

// ========================================
// イベント関連エンティティ
// ========================================

/** イベント主催者 */
export type EventCreator = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};

/** イベント参加者 */
export type EventParticipant = {
  id: string;
  userId: string;
  userName: string | null;
  avatarUrl: string | null;
  status: 'registered' | 'cancelled';
};

// ========================================
// イベントアイテム
// ========================================

/** イベント一覧アイテム（APIレスポンス） */
export type EventListItem = {
  id: string;
  title: string;
  eventType: EventType;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  maxParticipants: number | null;
  participantCount: number;
  isParticipating: boolean;
  isRecurring: boolean;
  creator: EventCreator;
};

/** イベント詳細（APIレスポンス） */
export type EventDetail = EventListItem & {
  description: string | null;
  recurrencePattern: RecurrencePattern | null;
  participants: EventParticipant[];
  isOwner: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

// ========================================
// APIレスポンス
// ========================================

/** イベント一覧レスポンス */
export type EventListResponse = {
  data: {
    events: EventListItem[];
  };
  message: string;
  timestamp: string;
};

/** イベント詳細レスポンス */
export type EventDetailResponse = {
  data: {
    event: EventDetail;
  };
  message: string;
  timestamp: string;
};

/** イベント作成レスポンス */
export type CreateEventResponse = {
  data: {
    event: EventDetail;
  };
  message: string;
  timestamp: string;
};

/** イベント更新レスポンス */
export type UpdateEventResponse = {
  data: {
    event: EventDetail;
  };
  message: string;
  timestamp: string;
};

/** イベント削除レスポンス */
export type DeleteEventResponse = {
  data: Record<string, never>;
  message: string;
  timestamp: string;
};

/** イベント参加レスポンス */
export type JoinEventResponse = {
  data: {
    eventId: string;
    participantCount: number;
  };
  message: string;
  timestamp: string;
};

/** 参加キャンセルレスポンス */
export type LeaveEventResponse = {
  data: Record<string, never>;
  message: string;
  timestamp: string;
};

// ========================================
// 検索パラメータ
// ========================================

/** イベント検索パラメータ */
export type EventSearchParams = {
  year: number;
  month: number;
  event_type?: string; // カンマ区切り（例: "study,exercise"）
  participated?: boolean;
};

// ========================================
// リクエスト
// ========================================

/** イベント作成リクエスト */
export type CreateEventRequest = {
  title: string;
  description?: string | null;
  eventType: EventType;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  maxParticipants?: number | null;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
};

/** イベント更新リクエスト */
export type UpdateEventRequest = {
  title?: string;
  description?: string | null;
  eventType?: EventType;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number | null;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
};
